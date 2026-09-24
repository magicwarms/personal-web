import { onMounted, onUnmounted } from 'vue'
import type { Ref } from 'vue'
import { ScrollTrigger, gsap } from '@/motion/gsap'

export interface MotionConditions {
  isDesktop: boolean
  isMobile: boolean
  /** True when the OS asks for reduced motion — build the static end state. */
  reduceMotion: boolean
}

export type MotionBuilder = (conditions: MotionConditions) => void | (() => void)

/** Runs synchronously before the first paint. Hide what is about to animate. */
export type MotionPrep = (root: HTMLElement) => void

/**
 * The lifecycle every animated section would otherwise repeat: hide, wait for
 * fonts, open a scoped matchMedia context, build, then revert it all on
 * unmount.
 *
 * Three details worth not losing:
 *
 * - **`prep` runs synchronously in `onMounted`, before the browser paints.**
 *   Everything else here waits on fonts, and without a pre-paint pass the
 *   content would be visible at its final position for a few hundred
 *   milliseconds and then snap back to hidden to animate in. Because `prep`
 *   has already set the hidden state, builders must animate *to* the visible
 *   state (`gsap.to`) rather than `gsap.from` — a `from()` tween would read
 *   the already-hidden current value as its destination and animate 0 to 0.
 *   `prep` is JS, so if the bundle never loads nothing is hidden and the page
 *   degrades to plain static content.
 * - Fonts are awaited before anything is built. The web fonts load from
 *   Google Fonts at runtime, and ScrollTrigger measures trigger positions
 *   when it is created; measuring against the fallback font puts every start
 *   point in the wrong place the moment the real font lands.
 * - `root` is passed to matchMedia as the scope, so selector strings inside
 *   the builder only ever match inside this component. Without it, `.role`
 *   in one section would happily animate `.role` in another.
 */
export function useSectionMotion(
  root: Ref<HTMLElement | null>,
  build: MotionBuilder,
  prep?: MotionPrep,
) {
  let matchMedia: ReturnType<typeof gsap.matchMedia> | undefined
  let prepContext: ReturnType<typeof gsap.context> | undefined
  let disposed = false

  onMounted(async () => {
    if (!root.value) return

    // Reduced motion never hides anything, so there is nothing to flash.
    const wantsMotion = !window.matchMedia('(prefers-reduced-motion: reduce)').matches
    if (prep && wantsMotion) {
      const el = root.value
      prepContext = gsap.context(() => prep(el), el)
    }

    if (document.fonts) await document.fonts.ready

    // The component can unmount while we're waiting on fonts. Undo the hide,
    // otherwise the content would be stranded invisible.
    if (disposed || !root.value) {
      prepContext?.revert()
      return
    }

    matchMedia = gsap.matchMedia()
    matchMedia.add(
      {
        isDesktop: '(min-width: 60rem)',
        isMobile: '(max-width: 59.99rem)',
        reduceMotion: '(prefers-reduced-motion: reduce)',
      },
      (context) => build(context.conditions as unknown as MotionConditions),
      root.value,
    )

    // Revealing elements and swapping in web fonts changes layout; every trigger
    // created before this point measured the pre-split page.
    ScrollTrigger.refresh()
  })

  onUnmounted(() => {
    disposed = true
    // matchMedia creates a gsap.context() internally, so reverting it kills
    // every tween and ScrollTrigger created inside the builder.
    matchMedia?.revert()
    prepContext?.revert()
  })
}
