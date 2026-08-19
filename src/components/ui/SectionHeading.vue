<script setup lang="ts">
import RevealItem from './RevealItem.vue'

defineProps<{
  /** Wired to the section's `aria-labelledby`. */
  id: string
  title: string
}>()
</script>

<template>
  <RevealItem class="heading">
    <span class="heading__mark" aria-hidden="true"></span>
    <h2 :id="id" class="heading__title">{{ title }}</h2>
  </RevealItem>
</template>

<style scoped>
.heading {
  padding-top: var(--space-2xs);
}

.heading__mark {
  display: block;
  width: 0.5rem;
  height: 0.5rem;
  margin-bottom: var(--space-sm);
  background: var(--color-accent);
  border-radius: 2px;
}

.heading__title {
  font-family: var(--font-display);
  font-weight: 700;
  font-size: var(--text-heading);
  letter-spacing: -0.03em;
  line-height: 1.05;
  color: var(--color-ink);
  overflow-wrap: anywhere;
}
</style>
