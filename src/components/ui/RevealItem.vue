<script setup lang="ts">
import { ref } from 'vue'
import { REVEAL_START, gsap } from '@/motion/gsap'
import { useSectionMotion } from '@/composables/useSectionMotion'

/**
 * The one scroll reveal on the page: a short settle as a block comes into
 * view, so the eye lands on new content. Nothing else moves on scroll.
 */
const props = withDefaults(
  defineProps<{
    /** Seconds to hold back, for small cascades inside one section. */
    delay?: number
    /** Rendered element, so a reveal can be a list item or an article. */
    as?: string
  }>(),
  { delay: 0, as: 'div' },
)

const root = ref<HTMLElement | null>(null)

useSectionMotion(
  root,
  ({ reduceMotion }) => {
    const el = root.value
    if (!el) return

    if (reduceMotion) {
      gsap.set(el, { autoAlpha: 1, clearProps: 'transform' })
      return
    }

    gsap.to(el, {
      autoAlpha: 1,
      y: 0,
      delay: props.delay,
      scrollTrigger: { trigger: el, start: REVEAL_START, once: true },
    })
  },
  // The page is prerendered, so a block already on screen at mount has been
  // painted; hiding it now would make it blink. Only blocks still below the
  // fold get the entrance.
  (el) => {
    if (el.getBoundingClientRect().top < window.innerHeight) return
    gsap.set(el, { autoAlpha: 0, y: 8 })
  },
)
</script>

<template>
  <component :is="as" ref="root">
    <slot />
  </component>
</template>
