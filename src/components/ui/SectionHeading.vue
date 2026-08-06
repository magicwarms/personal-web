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
    <h2 :id="id" class="heading__title">{{ title }}</h2>
    <!-- Decorative echo of the title; hidden from assistive tech. -->
    <div class="heading__echo" aria-hidden="true">{{ title }}</div>
  </RevealItem>
</template>

<style scoped>
.heading__title,
.heading__echo {
  font-family: var(--font-display);
  font-weight: 700;
  font-size: clamp(32px, 4.6vw, 56px);
  letter-spacing: -1.6px;
  line-height: 1;
}

.heading__title {
  color: var(--accent);
}

.heading__echo {
  margin-top: 2px;
  color: var(--accent-16);
  user-select: none;
}
</style>
