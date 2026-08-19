<script setup lang="ts">
import { onBeforeUnmount, onMounted, ref } from 'vue'
import { navItems } from '@/data/portfolio'

const menuOpen = ref(false)

function closeMenu() {
  menuOpen.value = false
}

function onKeydown(event: KeyboardEvent) {
  if (event.key === 'Escape') closeMenu()
}

onMounted(() => window.addEventListener('keydown', onKeydown))
onBeforeUnmount(() => window.removeEventListener('keydown', onKeydown))
</script>

<template>
  <div class="nav-wrap">
    <nav class="nav-pill" aria-label="Primary">
      <a class="nav-pill__mark" href="#top" aria-label="Andhana Utama — back to top" @click="closeMenu">
        AU<span class="nav-pill__dot" aria-hidden="true"></span>
      </a>

      <ul class="nav-pill__links">
        <li v-for="item in navItems" :key="item.id">
          <a :href="`#${item.id}`">{{ item.label }}</a>
        </li>
      </ul>

      <a class="btn btn--solid nav-pill__cta" href="#contact" @click="closeMenu">Contact</a>

      <button
        type="button"
        class="nav-pill__toggle"
        :aria-expanded="menuOpen"
        aria-controls="nav-sheet"
        @click="menuOpen = !menuOpen"
      >
        <span class="sr-only">{{ menuOpen ? 'Close menu' : 'Open menu' }}</span>
        <span class="nav-pill__toggle-bars" :class="{ 'nav-pill__toggle-bars--open': menuOpen }" aria-hidden="true"></span>
      </button>
    </nav>

    <Transition name="sheet">
      <div v-if="menuOpen" id="nav-sheet" class="nav-sheet">
        <a
          v-for="item in navItems"
          :key="item.id"
          :href="`#${item.id}`"
          class="nav-sheet__link"
          @click="closeMenu"
        >
          {{ item.label }}
        </a>
        <a class="nav-sheet__link nav-sheet__link--cta" href="#contact" @click="closeMenu">Contact</a>
      </div>
    </Transition>
  </div>
</template>

<style scoped>
.nav-wrap {
  position: fixed;
  inset: 0 0 auto 0;
  z-index: 40;
  display: flex;
  justify-content: center;
  pointer-events: none;
}

.nav-pill {
  pointer-events: auto;
  margin-top: var(--space-sm);
  display: inline-flex;
  align-items: center;
  gap: var(--space-md);
  padding: 0.5rem 0.5rem 0.5rem 1.1rem;
  background: color-mix(in oklch, var(--color-paper) 80%, transparent);
  backdrop-filter: blur(14px) saturate(140%);
  -webkit-backdrop-filter: blur(14px) saturate(140%);
  border: 1px solid var(--color-rule);
  border-radius: var(--radius-full);
  box-shadow: 0 12px 28px -18px oklch(0% 0 0 / 0.6);
  max-width: calc(100vw - 2 * var(--shell-pad));
}

.nav-pill__mark {
  display: flex;
  align-items: baseline;
  gap: 5px;
  font-family: var(--font-display);
  font-weight: 700;
  font-size: 1.0625rem;
  letter-spacing: -0.02em;
  color: var(--color-ink);
  white-space: nowrap;
}

.nav-pill__mark:hover {
  color: var(--color-ink);
}

.nav-pill__dot {
  width: 5px;
  height: 5px;
  border-radius: 50%;
  background: var(--color-accent);
  margin-bottom: 3px;
}

.nav-pill__links {
  display: none;
  align-items: center;
  gap: var(--space-md);
  margin: 0;
  padding: 0;
  list-style: none;
  font-size: 0.875rem;
  color: var(--color-ink-2);
}

.nav-pill__links a {
  color: var(--color-ink-2);
  white-space: nowrap;
}

.nav-pill__links a:hover {
  color: var(--color-ink);
}

.nav-pill__cta {
  padding: 0.55rem 1.1rem;
  min-height: 0;
  font-size: 0.8125rem;
}

.nav-pill__toggle {
  display: grid;
  place-items: center;
  width: 36px;
  height: 36px;
  background: transparent;
  border: none;
  border-radius: var(--radius-full);
}

.nav-pill__toggle-bars,
.nav-pill__toggle-bars::before,
.nav-pill__toggle-bars::after {
  width: 16px;
  height: 1.5px;
  background: var(--color-ink);
  transition: transform var(--dur-short) var(--ease-out), opacity var(--dur-short) var(--ease-out);
}

.nav-pill__toggle-bars {
  position: relative;
  display: block;
}

.nav-pill__toggle-bars::before,
.nav-pill__toggle-bars::after {
  content: '';
  position: absolute;
  left: 0;
}

.nav-pill__toggle-bars::before {
  top: -5px;
}

.nav-pill__toggle-bars::after {
  top: 5px;
}

.nav-pill__toggle-bars--open {
  background: transparent;
}

.nav-pill__toggle-bars--open::before {
  top: 0;
  transform: rotate(45deg);
}

.nav-pill__toggle-bars--open::after {
  top: 0;
  transform: rotate(-45deg);
}

.nav-sheet {
  pointer-events: auto;
  position: fixed;
  top: calc(var(--space-sm) + 58px);
  left: 50%;
  transform: translateX(-50%);
  z-index: 39;
  display: flex;
  flex-direction: column;
  min-width: 200px;
  padding: var(--space-xs);
  background: var(--color-paper-2);
  border: 1px solid var(--color-rule);
  border-radius: var(--radius-lg);
  box-shadow: 0 16px 36px -18px oklch(0% 0 0 / 0.6);
}

.nav-sheet__link {
  padding: 0.65rem 0.75rem;
  border-radius: var(--radius-sm);
  color: var(--color-ink-2);
  font-size: 0.9375rem;
}

.nav-sheet__link:hover {
  color: var(--color-ink);
  background: var(--color-paper-3);
}

.nav-sheet__link--cta {
  margin-top: var(--space-3xs);
  color: var(--color-accent);
}

.sheet-enter-active,
.sheet-leave-active {
  transition: opacity var(--dur-short) var(--ease-out), transform var(--dur-short) var(--ease-out);
}

.sheet-enter-from,
.sheet-leave-to {
  opacity: 0;
  transform: translate(-50%, -6px);
}

@media (min-width: 60rem) {
  .nav-pill__links {
    display: flex;
  }

  .nav-pill__toggle {
    display: none;
  }

  .nav-sheet {
    display: none;
  }
}
</style>
