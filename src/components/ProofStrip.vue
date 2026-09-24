<script setup lang="ts">
import { proof } from '@/data/portfolio'
</script>

<template>
  <!-- A ruled table, not cards: each number carries its source underneath so
       a recruiter can see where it came from without opening the CV. -->
  <dl class="proof">
    <div v-for="(point, position) in proof" :key="point.id" class="proof__cell rise" :style="{ '--i': position + 6 }">
      <dt class="proof__label">{{ point.label }}</dt>
      <dd class="proof__value">{{ point.value }}</dd>
      <dd class="proof__source mono">{{ point.source }}</dd>
    </div>
  </dl>
</template>

<style scoped>
.proof {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  border-top: 1px solid var(--color-rule);
}

@media (min-width: 60rem) {
  .proof {
    grid-template-columns: repeat(4, minmax(0, 1fr));
  }
}

.proof__cell {
  display: flex;
  flex-direction: column;
  padding: 20px 16px 18px 0;
  border-bottom: 1px solid var(--color-rule);
}

/* The value reads first even though the label comes first in the markup,
   so screen readers hear "less downtime: ~30%" and sighted readers see the
   number on top. */
.proof__value {
  order: -1;
  font-family: var(--font-display);
  font-size: var(--text-stat);
  font-weight: var(--weight-medium);
  letter-spacing: var(--tracking-heading);
  line-height: 1.1;
  color: var(--color-ink);
}

.proof__label {
  margin-top: 6px;
  font-size: var(--text-sm);
  line-height: 1.4;
  color: var(--color-ink-2);
}

.proof__source {
  margin-top: 4px;
  font-size: var(--text-xs);
  color: var(--color-ink-3);
}

@media (min-width: 60rem) {
  .proof__cell + .proof__cell {
    padding-left: 20px;
    border-left: 1px solid var(--color-rule);
  }
}

@media (max-width: 59.99rem) {
  .proof__cell:nth-child(even) {
    padding-left: 16px;
    border-left: 1px solid var(--color-rule);
  }
}
</style>
