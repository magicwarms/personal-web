<script setup lang="ts">
import { motion } from 'motion-v'
import { easeOut, revealViewport } from '@/motion/presets'

/**
 * Scroll reveal used across the site: fade and rise, once, on entry.
 * Wrapping it here keeps the viewport config in one place instead of being
 * copy-pasted onto three dozen elements. Sections that need a different
 * element (article, li) bind `revealProps` onto their own motion component.
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
    :initial="{ opacity: 0, y: 22 }"
    :whileInView="{ opacity: 1, y: 0 }"
    :inViewOptions="revealViewport"
    :transition="{ duration: 0.7, ease: easeOut, delay }"
  >
    <slot />
  </motion.div>
</template>
