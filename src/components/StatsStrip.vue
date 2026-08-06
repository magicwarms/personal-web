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
  background: var(--accent-14);
  border: 1px solid var(--accent-14);
  border-radius: var(--radius-lg);
  overflow: hidden;
}

.stats__cell {
  background: var(--surface);
  padding: 28px 24px;
}

.stats__value {
  font-family: var(--font-display);
  font-size: 40px;
  font-weight: 700;
  color: var(--accent);
  letter-spacing: -1.5px;
  line-height: 1.2;
}

.stats__label {
  margin: 8px 0 0;
  font-size: 11px;
  letter-spacing: 1.6px;
  text-transform: uppercase;
  color: var(--text-dim);
}
</style>
