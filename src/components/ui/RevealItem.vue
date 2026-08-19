<script setup lang="ts">
import { motion } from 'motion-v'
import { easeOut, revealViewport } from '@/motion/presets'

/**
 * Scroll reveal used across the site: a quiet opacity-only settle, once, on
 * entry — no spatial rise. The hero's staggered entrance is the page's one
 * orchestrated moment; everything below it should just be there, not perform
 * on scroll. Wrapping it here keeps the viewport config in one place instead
 * of being copy-pasted onto three dozen elements. Sections that need a
 * different element (article, li) bind `revealProps` onto their own motion
 * component.
 */
withDefaults(
  defineProps<{
    /** Seconds to hold back, for hand-tuned cascades. */
    delay?: number
  }>(),
  { delay: 0 },
)
</script>

<template>
  <motion.div
    :initial="{ opacity: 0 }"
    :whileInView="{ opacity: 1 }"
    :inViewOptions="revealViewport"
    :transition="{ duration: 0.35, ease: easeOut, delay }"
  >
    <slot />
  </motion.div>
</template>
