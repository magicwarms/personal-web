import { stagger } from 'motion-v'
import type { Options } from 'motion-v'

/**
 * Motion for Vue types its own `variants`/`transition` props (they differ
 * slightly from the framer-motion DOM types), so alias them from the component
 * options rather than importing look-alikes.
 */
export type Variants = NonNullable<Options['variants']>
export type Transition = NonNullable<Options['transition']>

/** The three named easings, matching `--ease-out` / `--ease-in-out` in base.css. */
export const easeOut: [number, number, number, number] = [0.16, 1, 0.3, 1]
const easeInOut: [number, number, number, number] = [0.65, 0, 0.35, 1]

export const enterTransition: Transition = {
  duration: 0.6,
  ease: easeOut,
}

/**
 * Reveals are deliberately quiet: an opacity-only settle, no spatial rise.
 * The hero's staggered entrance is the page's one orchestrated moment —
 * everything below it should just *be there*, not perform on scroll.
 */
export const revealTransition: Transition = {
  duration: 0.35,
  ease: easeInOut,
}

/**
 * Viewport config for scroll reveals: fire once, as soon as a sliver of the
 * element is on screen. Re-animating on every scroll-by reads as noise.
 */
export const revealViewport = {
  once: true,
  amount: 0.15,
  margin: '0px 0px -6% 0px',
} as const

/**
 * The reveal as a bag of props, for motion components that need to render a
 * different element than `RevealItem`'s div (article, li, dl).
 */
export const revealProps = {
  initial: { opacity: 0 },
  whileInView: { opacity: 1 },
  inViewOptions: revealViewport,
  transition: revealTransition,
}

/**
 * Parent variant that leaves its own box alone and only orchestrates children.
 * `delayChildren: stagger(...)` is the Motion 12+ replacement for
 * `staggerChildren`.
 */
export function staggerContainer(gap = 0.06, startDelay = 0): Variants {
  return {
    hidden: {},
    visible: {
      transition: { delayChildren: stagger(gap, { startDelay }) },
    },
  }
}

/** Child variant for staggered groups — opacity only, see `revealTransition`. */
export const staggerItem: Variants = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: revealTransition },
}

/** Hero copy: the one orchestrated entrance — a slightly fuller rise + fade. */
export const heroItem: Variants = {
  hidden: { opacity: 0, y: 14 },
  visible: { opacity: 1, y: 0, transition: enterTransition },
}

/** Role headline swap — blur-in/out, mirroring the source design. */
export const roleVariants: Variants = {
  hidden: { opacity: 0, y: 16, filter: 'blur(7px)' },
  visible: (opacity: number) => ({
    opacity,
    y: 0,
    filter: 'blur(0px)',
    transition: { duration: 0.75, ease: easeOut },
  }),
  exit: { opacity: 0, y: -12, filter: 'blur(7px)', transition: { duration: 0.2, ease: easeOut } },
}

/** Code lines slide in from the left, one after another. */
export const codeLineVariants: Variants = {
  hidden: { opacity: 0, x: -8 },
  visible: { opacity: 1, x: 0, transition: { duration: 0.32, ease: easeOut } },
  exit: { opacity: 0, transition: { duration: 0.12 } },
}
