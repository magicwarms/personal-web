<script setup lang="ts">
import { profile } from '@/data/portfolio'
</script>

<template>
  <footer class="footer">
    <div class="shell footer__inner">
      <span>{{ profile.name }} — Senior Backend Engineer</span>
      <span class="footer__status">
        <span class="footer__pulse" aria-hidden="true"></span>
        {{ profile.availability }}
      </span>
    </div>
  </footer>
</template>

<style scoped>
.footer {
  position: relative;
  border-top: 1px solid var(--color-rule);
}

.footer__inner {
  padding-block: 32px;
  display: flex;
  flex-wrap: wrap;
  gap: 16px;
  justify-content: space-between;
  align-items: center;
  font-family: var(--font-mono);
  font-size: 0.75rem;
  letter-spacing: 0.02em;
  color: var(--color-ink-4);
}

.footer__status {
  display: flex;
  align-items: center;
  gap: 8px;
}

.footer__pulse {
  width: 6px;
  height: 6px;
  border-radius: 50%;
  background: var(--color-accent);
  animation: caret-blink 2.4s ease-in-out infinite;
}
</style>
