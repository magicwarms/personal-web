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
  <!-- Navigation Bar (DESIGN.md): transparent, sitting directly on the void,
       no border, no backdrop blur — a flat top bar, not a floating pill. -->
  <header class="nav">
    <div class="shell nav__inner">
      <a class="nav__mark" href="#top" aria-label="Andhana Utama — back to top" @click="closeMenu">
        <!-- Logo Lockup: small triangular violet mark fading to teal. -->
        <svg class="nav__mark-icon" viewBox="0 0 24 22" aria-hidden="true">
          <path d="M12 1 L23 21 L1 21 Z" fill="url(#nav-mark-gradient)" />
          <defs>
            <linearGradient id="nav-mark-gradient" x1="12" y1="1" x2="12" y2="21" gradientUnits="userSpaceOnUse">
              <stop offset="0" stop-color="#8052ff" />
              <stop offset="1" stop-color="#15846e" />
            </linearGradient>
          </defs>
        </svg>
        AU
      </a>

      <ul class="nav__links">
        <li v-for="item in navItems" :key="item.id">
          <a :href="`#${item.id}`">{{ item.label }}</a>
        </li>
      </ul>

      <a class="btn btn--solid nav__cta" href="#contact" @click="closeMenu">Contact</a>

      <button
        type="button"
        class="nav__toggle"
        :aria-expanded="menuOpen"
        aria-controls="nav-sheet"
        @click="menuOpen = !menuOpen"
      >
        <span class="sr-only">{{ menuOpen ? 'Close menu' : 'Open menu' }}</span>
        <span class="nav__toggle-bars" :class="{ 'nav__toggle-bars--open': menuOpen }" aria-hidden="true"></span>
      </button>
    </div>

    <!-- Mobile menu: a floating card would need a border to read against
         black, so this is a full-screen void overlay instead — no edge
         required, and it stays true to "the void is the design". -->
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
        <a class="btn btn--solid nav-sheet__cta" href="#contact" @click="closeMenu">Contact</a>
      </div>
    </Transition>
  </header>
</template>

<style scoped>
.nav {
  position: fixed;
  inset: 0 0 auto 0;
  z-index: 40;
  background: transparent;
}

.nav__inner {
  display: flex;
  align-items: center;
  gap: var(--spacing-24);
  padding-block: var(--spacing-18);
}

.nav__mark {
  display: flex;
  align-items: center;
  gap: 8px;
  font-family: var(--font-display);
  font-weight: var(--font-weight-regular);
  font-size: 1.0625rem;
  letter-spacing: var(--tracking-tight);
  color: var(--color-bone-white);
  white-space: nowrap;
}

.nav__mark:hover {
  color: var(--color-bone-white);
}

.nav__mark-icon {
  width: 20px;
  height: 19px;
  flex: none;
}

.nav__links {
  display: none;
  align-items: center;
  gap: var(--spacing-30);
  margin: 0 0 0 auto;
  padding: 0;
  list-style: none;
  font-family: var(--font-display);
  font-weight: var(--font-weight-semibold);
  font-size: var(--text-nav-label);
  letter-spacing: var(--tracking-label);
  text-transform: uppercase;
}

.nav__links a {
  color: var(--color-ash-gray);
  white-space: nowrap;
}

.nav__links a:hover {
  color: var(--color-bone-white);
}

.nav__cta {
  display: none;
  margin-left: var(--spacing-18);
}

.nav__toggle {
  margin-left: auto;
  display: grid;
  place-items: center;
  width: 36px;
  height: 36px;
  background: transparent;
  border: none;
  border-radius: var(--radius-full);
}

.nav__toggle-bars,
.nav__toggle-bars::before,
.nav__toggle-bars::after {
  width: 16px;
  height: 1.5px;
  background: var(--color-bone-white);
  transition: transform var(--dur-short) var(--ease-out), opacity var(--dur-short) var(--ease-out);
}

.nav__toggle-bars {
  position: relative;
  display: block;
}

.nav__toggle-bars::before,
.nav__toggle-bars::after {
  content: '';
  position: absolute;
  left: 0;
}

.nav__toggle-bars::before {
  top: -5px;
}

.nav__toggle-bars::after {
  top: 5px;
}

.nav__toggle-bars--open {
  background: transparent;
}

.nav__toggle-bars--open::before {
  top: 0;
  transform: rotate(45deg);
}

.nav__toggle-bars--open::after {
  top: 0;
  transform: rotate(-45deg);
}

.nav-sheet {
  position: fixed;
  inset: 0;
  z-index: 39;
  background: var(--color-void);
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  justify-content: center;
  gap: var(--spacing-24);
  padding: var(--shell-pad);
}

.nav-sheet__link {
  font-family: var(--font-display);
  font-weight: var(--font-weight-regular);
  font-size: var(--text-heading-sm);
  letter-spacing: var(--tracking-tight);
  color: var(--color-bone-white);
}

.nav-sheet__link:hover {
  color: var(--color-saffron-spark);
}

.nav-sheet__cta {
  margin-top: var(--spacing-12);
}

.sheet-enter-active,
.sheet-leave-active {
  transition: opacity var(--dur-short) var(--ease-out);
}

.sheet-enter-from,
.sheet-leave-to {
  opacity: 0;
}

@media (min-width: 60rem) {
  .nav__links {
    display: flex;
  }

  .nav__cta {
    display: inline-flex;
  }

  .nav__toggle {
    display: none;
  }

  .nav-sheet {
    display: none;
  }
}
</style>
