<script setup lang="ts">
import { motion } from 'motion-v'
import RoleCycler from './RoleCycler.vue'
import CodePanel from './CodePanel.vue'
import { heroItem, staggerContainer } from '@/motion/presets'
import { profile } from '@/data/portfolio'

// The one orchestrated moment on the page: everything above the fold rises in
// sequence on load, rather than each element fading in on its own timer.
const container = staggerContainer(0.08, 0.05)
</script>

<template>
  <section class="hero" aria-label="Introduction">
    <motion.div class="hero__copy" :variants="container" initial="hidden" animate="visible">
      <motion.div class="hero__status" :variants="heroItem">
        <span class="hero__status-dot" aria-hidden="true"></span>
        {{ profile.availability }}
      </motion.div>

      <motion.p class="hero__kicker" :variants="heroItem">I'm {{ profile.name }}</motion.p>

      <motion.div :variants="heroItem">
        <RoleCycler />
      </motion.div>

      <motion.p class="hero__intro" :variants="heroItem">{{ profile.intro }}</motion.p>

      <motion.div class="hero__actions" :variants="heroItem">
        <a class="btn btn--solid" href="#work">View work</a>
        <a class="btn btn--ghost" :href="profile.cv" download>Download CV</a>
      </motion.div>

      <motion.div class="hero__meta" :variants="heroItem">
        <a :href="profile.github" target="_blank" rel="noopener noreferrer">GitHub</a>
        <a :href="profile.linkedin" target="_blank" rel="noopener noreferrer">LinkedIn</a>
        <span>{{ profile.timezone }}</span>
      </motion.div>
    </motion.div>

    <div class="hero__panel">
      <CodePanel />
    </div>
  </section>
</template>

<style scoped>
.hero {
  display: grid;
  grid-template-columns: minmax(0, 1fr);
  gap: clamp(36px, 5vw, 64px);
  align-items: center;
  padding: clamp(104px, 16vh, 152px) 0 clamp(48px, 7vh, 88px);
}

@media (min-width: 60rem) {
  .hero {
    grid-template-columns: minmax(0, 7fr) minmax(0, 5fr);
  }
}

.hero__status {
  display: inline-flex;
  align-items: center;
  gap: 8px;
  margin-bottom: 20px;
  padding: 0.4rem 0.8rem;
  border: 1px solid var(--color-rule);
  border-radius: var(--radius-full);
  font-family: var(--font-mono);
  font-size: 0.6875rem;
  letter-spacing: 0.08em;
  text-transform: uppercase;
  color: var(--color-ink-2);
}

.hero__status-dot {
  width: 6px;
  height: 6px;
  border-radius: 50%;
  background: var(--color-accent);
  animation: caret-blink 2.4s ease-in-out infinite;
}

.hero__kicker {
  margin-bottom: 22px;
  font-family: var(--font-mono);
  font-size: 0.75rem;
  letter-spacing: 0.16em;
  color: var(--color-ink-3);
  text-transform: uppercase;
}

.hero__intro {
  margin-top: 26px;
  max-width: 46ch;
  font-size: 1.0625rem;
  line-height: 1.7;
  color: var(--color-ink-2);
}

.hero__actions {
  display: flex;
  flex-wrap: wrap;
  gap: 14px;
  margin-top: 36px;
}

.hero__meta {
  display: flex;
  flex-wrap: wrap;
  gap: 22px;
  margin-top: 40px;
  font-family: var(--font-mono);
  font-size: 0.75rem;
  color: var(--color-ink-4);
}

.hero__meta a {
  color: var(--color-ink-4);
}

.hero__meta a:hover {
  color: var(--color-accent);
}
</style>
