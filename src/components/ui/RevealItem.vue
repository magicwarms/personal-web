<script setup lang="ts">
import { ref } from 'vue'
import { gsap } from '@/motion/gsap'
import { useSectionMotion } from '@/composables/useSectionMotion'

/**
 * The baseline scroll reveal — a settle, not a performance. Sections with
 * their own choreography (headings, work, experience, stack, credentials)
 * build it directly; this is for everything that just needs to arrive
 * without ceremony.
 */
const props = withDefaults(
  defineProps<{
    /** Seconds to hold back, for hand-tuned cascades. */
    delay?: number
  }>(),
  { delay: 0 },
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
      duration: 0.6,
      delay: props.delay,
      scrollTrigger: { trigger: el, start: 'top 88%', once: true },
    })
  },
  (el) => gsap.set(el, { autoAlpha: 0, y: 10 }),
)
</script>

<template>
  <div ref="root">
    <slot />
  </div>
</template>
