<script setup lang="ts">
import SectionHeading from './ui/SectionHeading.vue'
import RevealItem from './ui/RevealItem.vue'
import { earlierProjects, projects } from '@/data/portfolio'
</script>

<template>
  <section id="work" class="section" aria-labelledby="work-heading">
    <SectionHeading id="work-heading" index="01" title="Selected work" />

    <div class="work paper-fill">
      <!-- The most recent, most senior project leads on a raised surface;
           the rest are denser rows. Hierarchy follows recency and scope. -->
      <RevealItem
        v-for="project in projects"
        :key="project.id"
        as="article"
        class="case"
        :class="{ 'case--featured': project.featured }"
        :aria-labelledby="`${project.id}-title`"
      >
        <p class="case__meta mono">
          <span>{{ project.index }}</span>
          <span>{{ project.org }}</span>
          <span>{{ project.period }}</span>
          <span>{{ project.role }}</span>
        </p>

        <h3 :id="`${project.id}-title`" class="case__title">{{ project.title }}</h3>
        <p class="case__summary">{{ project.summary }}</p>

        <div class="case__lists">
          <div v-if="project.did?.length">
            <h4 class="case__label mono">What I did</h4>
            <ul class="list case__list" :class="{ 'case__list--split': project.did.length >= 4 }">
              <li v-for="item in project.did" :key="item">{{ item }}</li>
            </ul>
          </div>

          <div v-if="project.results?.length">
            <h4 class="case__label mono">Result</h4>
            <ul class="list case__list" :class="{ 'case__list--split': project.results.length >= 4 }">
              <li v-for="item in project.results" :key="item">{{ item }}</li>
            </ul>
          </div>
        </div>

        <p v-if="project.stack?.length" class="case__stack mono">
          <span class="sr-only">Stack: </span>{{ project.stack.join(' · ') }}
        </p>
      </RevealItem>

      <RevealItem class="earlier">
        <h3 class="case__label mono">Earlier projects</h3>
        <ul class="spec">
          <li v-for="item in earlierProjects" :key="item.id" class="spec__row">
            <span class="spec__key">{{ item.period }}</span>
            <span class="spec__value">
              {{ item.title }}
              <span class="earlier__client">for {{ item.client }}</span>
            </span>
          </li>
        </ul>
      </RevealItem>
    </div>
  </section>
</template>

<style scoped>
.work {
  display: flex;
  flex-direction: column;
}

.case {
  padding-block: 24px;
  border-bottom: 1px solid var(--color-rule);
}

.case:first-child {
  padding-top: 0;
}

.case--featured {
  padding: 24px;
  margin-bottom: 8px;
  background: var(--color-surface);
  border: 1px solid var(--color-rule);
  border-radius: var(--radius);
}

.case--featured:first-child {
  padding-top: 24px;
}

.case__meta {
  display: flex;
  flex-wrap: wrap;
  gap: 4px 14px;
  color: var(--color-ink-3);
}

.case__meta span:first-child {
  color: var(--color-ink);
}

.case__title {
  margin-top: 10px;
  font-size: var(--text-h3);
  letter-spacing: -0.01em;
  line-height: 1.3;
}

.case--featured .case__title {
  font-size: clamp(1.375rem, 2.2vw, 1.625rem);
  letter-spacing: var(--tracking-heading);
}

.case__summary {
  margin-top: 8px;
  max-width: 60ch;
}

.case__lists {
  display: grid;
  grid-template-columns: minmax(0, 1fr);
  gap: 20px;
  margin-top: 20px;
}

.case__label {
  margin-bottom: 10px;
  font-weight: var(--weight-medium);
  color: var(--color-ink);
}

.case__list {
  font-size: var(--text-sm);
  line-height: 1.55;
}

/* Long lists read as two short columns on wide screens instead of one tall
   stack, which keeps each case study within about one screen. */
@media (min-width: 48rem) {
  .case__list--split {
    display: grid;
    grid-template-columns: repeat(2, minmax(0, 1fr));
    gap: 8px 28px;
  }
}

.case__stack {
  margin-top: 20px;
  color: var(--color-ink-3);
}

.earlier {
  padding-top: 28px;
}

.earlier__client {
  color: var(--color-ink-2);
}
</style>
