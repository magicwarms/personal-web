<script setup lang="ts">
import SectionHeading from './ui/SectionHeading.vue'
import RevealItem from './ui/RevealItem.vue'
import { stackGroups } from '@/data/portfolio'
</script>

<template>
  <section id="stack" class="section" aria-labelledby="stack-heading">
    <SectionHeading id="stack-heading" title="Stack" />

    <div class="stack">
      <RevealItem
        v-for="(group, position) in stackGroups"
        :key="group.id"
        class="stack__card"
        :delay="position * 0.05"
      >
        <h3 class="eyebrow stack__label">{{ group.label }}</h3>
        <ul class="stack__items">
          <li v-for="item in group.items" :key="item" class="pill">{{ item }}</li>
        </ul>
      </RevealItem>
    </div>
  </section>
</template>

<style scoped>
.section {
  padding-top: var(--section-pad);
}

.stack {
  margin-top: 44px;
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(min(260px, 100%), 1fr));
  gap: 16px;
}

.stack__card {
  border: 1px solid var(--color-rule);
  border-radius: var(--radius-lg);
  padding: 26px;
  background: var(--color-paper-2);
  transition: border-color var(--dur-short) var(--ease-out);
}

.stack__card:hover {
  border-color: var(--color-accent);
}

.stack__label {
  font-weight: 400;
  line-height: 1.6;
  color: var(--color-ink-2);
}

.stack__items {
  margin: 16px 0 0;
  padding: 0;
  list-style: none;
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
}
</style>
