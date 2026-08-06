<script setup lang="ts">
import { motion } from 'motion-v'
import RoleCycler from './RoleCycler.vue'
import CodePanel from './CodePanel.vue'
import { heroItem, staggerContainer } from '@/motion/presets'
import { profile } from '@/data/portfolio'

// The one orchestrated moment on the page: everything above the fold rises in
// sequence on load, rather than each element fading in on its own timer.
const container = staggerContainer(0.12, 0.05)
</script>

<template>
  <section class="hero" aria-label="Introduction">
    <motion.div class="hero__copy" :variants="container" initial="hidden" animate="visible">
      <motion.p class="hero__kicker" :variants="heroItem">
        I'm {{ profile.name }}<span class="caret" aria-hidden="true"></span>
      </motion.p>

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
  grid-template-columns: repeat(auto-fit, minmax(min(330px, 100%), 1fr));
  gap: clamp(36px, 5vw, 72px);
  align-items: center;
  padding: clamp(64px, 10vh, 128px) 0 clamp(48px, 7vh, 88px);
}

.hero__kicker {
  margin-bottom: 22px;
  font-size: 12px;
  letter-spacing: 3px;
  color: var(--text-dim);
  text-transform: uppercase;
}

.hero__intro {
  margin-top: 26px;
  max-width: 46ch;
  color: var(--text-muted);
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
  font-size: 12px;
  color: var(--text-dimmer);
}

.hero__meta a {
  color: var(--text-dimmer);
}

.hero__meta a:hover {
  color: var(--accent);
}
</style>
