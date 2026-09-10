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
}

.footer__inner {
  padding-block: 48px 32px;
  display: flex;
  flex-wrap: wrap;
  gap: 16px;
  justify-content: space-between;
  align-items: center;
  font-family: var(--font-display);
  font-weight: var(--font-weight-regular);
  font-size: 0.8125rem;
  letter-spacing: var(--tracking-tight);
  color: var(--color-ink-3);
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
