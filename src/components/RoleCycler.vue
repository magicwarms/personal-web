<script setup lang="ts">
import { computed } from 'vue'
import { AnimatePresence, motion } from 'motion-v'
import { useCycle } from '@/composables/useCycle'
import { usePrefersReducedMotion } from '@/composables/usePrefersReducedMotion'
import { roleVariants, staggerContainer } from '@/motion/presets'
import { roleTitles } from '@/data/portfolio'

const INTERVAL_MS = 2600

const prefersReducedMotion = usePrefersReducedMotion()

const { index, isRunning } = useCycle({
  length: roleTitles.length,
  intervalMs: INTERVAL_MS,
  enabled: computed(() => !prefersReducedMotion.value),
})

const containerVariants = staggerContainer(0.08)

/** The three roles, rotated so the current one leads. */
const visibleRoles = computed(() =>
  roleTitles.map((_, offset) => {
    const role = roleTitles[(index.value + offset) % roleTitles.length]
    return {
      role,
      // Depth cue: the upcoming roles sit further back.
      opacity: offset === 0 ? 1 : offset === 1 ? 0.45 : 0.2,
    }
  }),
)

const allRoles = roleTitles.join(', ')
</script>

<template>
  <h1 class="roles">
    <!-- Stable accessible name: the visible stack re-renders every few
         seconds and would otherwise churn the accessibility tree. -->
    <span class="sr-only">{{ allRoles }}</span>

    <AnimatePresence mode="wait">
      <motion.span
        :key="index"
        class="roles__stack"
        aria-hidden="true"
        :variants="containerVariants"
        initial="hidden"
        animate="visible"
        exit="exit"
      >
        <motion.span
          v-for="entry in visibleRoles"
          :key="entry.role"
          class="roles__line"
          :variants="roleVariants"
          :custom="entry.opacity"
        >
          {{ entry.role }}
        </motion.span>
      </motion.span>
    </AnimatePresence>
  </h1>

  <div class="roles__track">
    <motion.div
      v-if="isRunning"
      :key="index"
      class="roles__progress"
      :initial="{ scaleX: 0 }"
      :animate="{ scaleX: 1 }"
      :transition="{ duration: INTERVAL_MS / 1000, ease: 'linear' }"
    />
  </div>
</template>

<style scoped>
.roles {
  margin: 0;
  font-family: var(--font-display);
  font-weight: 700;
  font-size: clamp(38px, 6vw, 78px);
  line-height: 1.02;
  letter-spacing: -2.4px;
}

.roles__stack {
  display: block;
}

.roles__line {
  display: block;
  color: var(--accent);
  will-change: transform, opacity, filter;
}

.roles__track {
  margin-top: 22px;
  height: 2px;
  width: min(320px, 100%);
  background: var(--accent-14);
  overflow: hidden;
}

.roles__progress {
  height: 100%;
  background: var(--accent);
  transform-origin: left center;
}
</style>
