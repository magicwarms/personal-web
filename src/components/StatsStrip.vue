<script setup lang="ts">
import { motion } from 'motion-v'
import { revealViewport, staggerContainer, staggerItem } from '@/motion/presets'
import { stats } from '@/data/portfolio'

// Two motion children per cell (value and label), so the stagger is halved to
// keep the whole strip inside the same beat as the other reveals.
const container = staggerContainer(0.04)
</script>

<template>
  <motion.dl
    class="stats"
    aria-label="Career metrics"
    :variants="container"
    initial="hidden"
    whileInView="visible"
    :inViewOptions="revealViewport"
  >
    <!-- The cells own the hairline grid and stay put; only their text rises,
         so the 1px seams never open up mid-animation. -->
    <div v-for="stat in stats" :key="stat.label" class="stats__cell">
      <motion.dt class="stats__value" :variants="staggerItem">{{ stat.value }}</motion.dt>
      <motion.dd class="stats__label" :variants="staggerItem">{{ stat.label }}</motion.dd>
    </div>
  </motion.dl>
</template>

<style scoped>
.stats {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(min(180px, 100%), 1fr));
  gap: 1px;
  margin: 0;
  background: var(--color-rule);
  border-inline: 1px solid var(--color-rule);
  border-top: 3px double var(--color-rule);
  border-bottom: 1px solid var(--color-rule);
  border-radius: var(--radius-lg);
  overflow: hidden;
}

.stats__cell {
  background: var(--color-paper-2);
  padding: 28px 24px;
}

.stats__value {
  font-family: var(--font-display);
  font-size: 2.25rem;
  font-weight: 700;
  color: var(--color-ink);
  letter-spacing: -0.03em;
  line-height: 1.2;
  font-variant-numeric: tabular-nums;
}

.stats__label {
  margin: 8px 0 0;
  font-family: var(--font-mono);
  font-size: 0.6875rem;
  letter-spacing: 0.08em;
  text-transform: uppercase;
  color: var(--color-ink-3);
}
</style>
