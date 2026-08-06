<script setup lang="ts">
import { motion } from 'motion-v'
import SectionHeading from './ui/SectionHeading.vue'
import { revealProps } from '@/motion/presets'
import { projects } from '@/data/portfolio'
</script>

<template>
  <section id="work" class="section" aria-labelledby="work-heading">
    <SectionHeading id="work-heading" title="Selected work" />

    <div class="work">
      <article
        v-for="project in projects"
        :key="project.id"
        class="work__item"
        :aria-labelledby="`${project.id}-title`"
      >
        <!-- The reveal moves the row's contents, not the row itself, so the
             1px hairlines between rows never open up mid-animation. -->
        <motion.div v-bind="revealProps" class="work__row">
          <div class="work__index" aria-hidden="true">{{ project.index }}</div>

          <div>
            <h3 :id="`${project.id}-title`" class="work__title">{{ project.title }}</h3>

            <p class="work__meta">
              <span class="work__org">{{ project.org }}</span>
              <span class="work__stack">{{ project.stack }}</span>
            </p>

            <ul class="bullets work__bullets">
              <li v-for="highlight in project.highlights" :key="highlight">{{ highlight }}</li>
            </ul>
          </div>
        </motion.div>
      </article>
    </div>
  </section>
</template>

<style scoped>
.section {
  padding-top: var(--section-pad);
}

.work {
  display: flex;
  flex-direction: column;
  gap: 1px;
  margin-top: 48px;
  background: var(--accent-12);
}

.work__item {
  background: var(--bg);
  padding: 32px clamp(4px, 2vw, 28px);
  transition: background-color 0.35s ease;
}

.work__row {
  display: grid;
  grid-template-columns: 48px 1fr;
  gap: clamp(12px, 3vw, 32px);
}

.work__item:hover {
  background: var(--surface-hover);
}

.work__index {
  font-size: 12px;
  color: var(--accent-50);
  letter-spacing: 1px;
  padding-top: 4px;
}

.work__title {
  font-family: var(--font-display);
  font-size: clamp(18px, 2.2vw, 24px);
  font-weight: 700;
  letter-spacing: -0.5px;
  color: var(--text);
  line-height: 1.3;
}

.work__meta {
  margin-top: 10px;
  display: flex;
  flex-wrap: wrap;
  gap: 14px;
  font-size: 11px;
  letter-spacing: 1.2px;
  line-height: 1.6;
}

.work__org {
  color: var(--rose);
}

.work__stack {
  color: var(--text-dimmer);
}

.work__bullets {
  margin-top: 18px;
}
</style>
