<script setup lang="ts">
defineProps<{
  /** Wired to the section's `aria-labelledby`. */
  id: string
  /** Two-digit section number, shown in mono above the title. */
  index: string
  title: string
}>()
</script>

<template>
  <!-- The page's connective motif: a numbered margin label, like the
       sections of a design doc. It stays in view while its section scrolls
       past on wide screens, so the reader always knows where they are. -->
  <div class="heading">
    <span class="heading__index mono" aria-hidden="true">{{ index }}</span>
    <h2 :id="id" class="heading__title">{{ title }}</h2>
  </div>
</template>

<style scoped>
.heading {
  display: flex;
  flex-direction: column;
  gap: 6px;
  align-self: start;
}

@media (min-width: 60rem) {
  .heading {
    position: sticky;
    top: calc(var(--header-h) + 24px);
  }
}

.heading__index {
  color: var(--color-ink-3);
}

.heading__title {
  font-size: var(--text-h2);
  letter-spacing: var(--tracking-heading);
  line-height: 1.15;
  overflow-wrap: anywhere;
}
</style>
