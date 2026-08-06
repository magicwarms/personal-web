<script setup lang="ts">
import { navItems } from '@/data/portfolio'
</script>

<template>
  <header class="header">
    <div class="shell header__inner">
      <a class="header__mark" href="#top" aria-label="Andhana Utama — back to top">
        AU<span class="header__dot" aria-hidden="true"></span>
      </a>

      <nav class="header__nav" aria-label="Primary">
        <a v-for="item in navItems" :key="item.id" class="header__link" :href="`#${item.id}`">
          {{ item.label }}
        </a>
        <a class="header__link header__link--cta" href="#contact">Contact</a>
      </nav>
    </div>
  </header>
</template>

<style scoped>
.header {
  position: sticky;
  top: 0;
  z-index: 40;
  background: rgba(6, 16, 15, 0.78);
  backdrop-filter: blur(14px);
  -webkit-backdrop-filter: blur(14px);
  border-bottom: 1px solid var(--accent-12);
}

.header__inner {
  display: flex;
  align-items: center;
  gap: 28px;
  flex-wrap: wrap;
  padding-block: 14px;
}

.header__mark {
  display: flex;
  align-items: baseline;
  gap: 5px;
  font-family: var(--font-display);
  font-weight: 700;
  font-size: 22px;
  letter-spacing: -0.5px;
  color: var(--accent);
}

.header__dot {
  width: 5px;
  height: 5px;
  border-radius: 50%;
  background: var(--accent);
  margin-bottom: 3px;
}

.header__nav {
  display: flex;
  align-items: center;
  gap: clamp(14px, 2.4vw, 30px);
  margin-left: auto;
  flex-wrap: wrap;
  font-size: 12px;
  letter-spacing: 1.4px;
  text-transform: uppercase;
}

.header__link {
  color: var(--text-dim);
}

.header__link:hover {
  color: var(--accent);
}

.header__link--cta {
  border: 1px solid var(--accent-40);
  border-radius: var(--radius-sm);
  padding: 8px 16px;
  color: var(--accent);
  transition:
    background-color 0.25s ease,
    color 0.25s ease;
}

.header__link--cta:hover {
  background: var(--accent-12);
  color: var(--accent-bright);
}
</style>
