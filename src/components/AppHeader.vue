<script setup lang="ts">
import { computed, onBeforeUnmount, onMounted, ref } from 'vue'
import { useTheme } from '@/composables/useTheme'
import { navItems, profile } from '@/data/portfolio'

const menuOpen = ref(false)
const { theme, toggle: toggleTheme } = useTheme()

/**
 * The hairline only appears once content is scrolling underneath. Starts
 * false and is read after mount, so the prerendered markup and the hydrated
 * markup agree even when the browser restores a scroll position on reload.
 */
const scrolled = ref(false)

function onScroll() {
  scrolled.value = window.scrollY > 8
}

const themeAction = computed(() =>
  theme.value === 'dark' ? 'Switch to light theme' : 'Switch to dark theme',
)

function closeMenu() {
  menuOpen.value = false
}

function onKeydown(event: KeyboardEvent) {
  if (event.key === 'Escape') closeMenu()
}

onMounted(() => {
  onScroll()
  window.addEventListener('scroll', onScroll, { passive: true })
  window.addEventListener('keydown', onKeydown)
})

onBeforeUnmount(() => {
  window.removeEventListener('scroll', onScroll)
  window.removeEventListener('keydown', onKeydown)
})
</script>

<template>
  <!-- Sticky with a solid paper background, so content never shows through
       or collides with the links while scrolling. -->
  <header class="nav" :class="{ 'nav--scrolled': scrolled || menuOpen }">
    <div class="shell nav__inner">
      <a class="nav__mark" href="#top" @click="closeMenu">
        {{ profile.name }}<span class="sr-only">, back to top</span>
      </a>

      <nav class="nav__links" aria-label="Sections">
        <a v-for="item in navItems" :key="item.id" :href="`#${item.id}`">{{ item.label }}</a>
      </nav>

      <!-- Shows the current theme; the hidden text names the action, and the
           accessible name still contains the visible word (WCAG 2.5.3). -->
      <button type="button" class="nav__theme mono" @click="toggleTheme">
        <span class="nav__theme-swatch" aria-hidden="true"></span>
        <span class="sr-only">Theme: </span>{{ theme === 'dark' ? 'Dark' : 'Light' }}<span class="sr-only">. {{ themeAction }}</span>
      </button>

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

    <Transition name="sheet">
      <nav v-if="menuOpen" id="nav-sheet" class="nav-sheet" aria-label="Sections">
        <a
          v-for="item in navItems"
          :key="item.id"
          :href="`#${item.id}`"
          class="nav-sheet__link"
          @click="closeMenu"
        >
          {{ item.label }}
        </a>
        <a class="btn btn--outline nav-sheet__cv" :href="profile.cv" download @click="closeMenu">
          Download CV (PDF)
        </a>
      </nav>
    </Transition>
  </header>
</template>

<style scoped>
.nav {
  position: sticky;
  top: 0;
  z-index: 40;
  background: var(--color-paper);
  border-bottom: 1px solid transparent;
  transition: border-color var(--dur-short) var(--ease-out);
}

.nav--scrolled {
  border-bottom-color: var(--color-rule);
}

.nav__inner {
  display: flex;
  align-items: center;
  gap: 8px;
  height: var(--header-h);
}

.nav__mark {
  margin-right: auto;
  padding-block: 10px;
  font-family: var(--font-display);
  font-size: 1.0625rem;
  font-weight: var(--weight-semibold);
  letter-spacing: -0.01em;
  color: var(--color-ink);
  white-space: nowrap;
}

.nav__links {
  display: none;
  align-items: center;
  gap: 4px;
  margin-right: 8px;
}

.nav__links a {
  display: inline-flex;
  align-items: center;
  min-height: 44px;
  padding-inline: 10px;
  font-size: var(--text-sm);
  color: var(--color-ink-2);
  white-space: nowrap;
}

.nav__links a:hover {
  color: var(--color-ink);
}

.nav__theme {
  display: inline-flex;
  align-items: center;
  gap: 8px;
  min-height: 44px;
  min-width: 44px;
  padding: 0 12px;
  background: none;
  border: 1px solid var(--color-rule);
  border-radius: var(--radius);
  color: var(--color-ink-2);
  transition:
    border-color var(--dur-short) var(--ease-out),
    color var(--dur-short) var(--ease-out);
}

.nav__theme:hover {
  border-color: var(--color-rule-strong);
  color: var(--color-ink);
}

/* Half-filled disc: the current theme's ink and paper side by side. */
.nav__theme-swatch {
  width: 12px;
  height: 12px;
  border-radius: 50%;
  border: 1px solid var(--color-ink);
  background: linear-gradient(90deg, var(--color-ink) 50%, transparent 50%);
}

.nav__toggle {
  display: grid;
  place-items: center;
  width: 44px;
  height: 44px;
  background: transparent;
  border: none;
  border-radius: var(--radius);
}

.nav__toggle-bars,
.nav__toggle-bars::before,
.nav__toggle-bars::after {
  width: 18px;
  height: 1.5px;
  background: var(--color-ink);
  transition:
    transform var(--dur-short) var(--ease-out),
    background-color var(--dur-short) var(--ease-out);
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
  top: -6px;
}

.nav__toggle-bars::after {
  top: 6px;
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
  inset: var(--header-h) 0 0 0;
  z-index: 39;
  display: flex;
  flex-direction: column;
  padding: 8px var(--shell-pad) 32px;
  background: var(--color-paper);
  overflow-y: auto;
}

.nav-sheet__link {
  display: flex;
  align-items: center;
  min-height: 56px;
  border-bottom: 1px solid var(--color-rule);
  font-family: var(--font-display);
  font-size: 1.375rem;
  font-weight: var(--weight-medium);
  color: var(--color-ink);
}

.nav-sheet__cv {
  margin-top: 24px;
  align-self: flex-start;
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

  .nav__toggle {
    display: none;
  }

  .nav-sheet {
    display: none;
  }
}
</style>
