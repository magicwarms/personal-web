<script setup lang="ts">
import AppHeader from './components/AppHeader.vue'
import AppFooter from './components/AppFooter.vue'
import SignalField from './components/ui/SignalField.vue'
import { ref } from 'vue'
import { useRuleDraw } from './composables/useRuleDraw'
import HomePage from './pages/HomePage.vue'
import CaseStudyPage from './pages/CaseStudyPage.vue'
import { resolvePage } from './seo/pages'

const props = defineProps<{ path: string }>()

// One prerendered HTML file per page, all from this bundle. Moving between
// pages is a normal page load, so GSAP, ScrollTrigger and the section
// observer only ever see one mount.
const page = resolvePage(props.path)

const main = ref<HTMLElement | null>(null)
useRuleDraw(main)
</script>

<template>
  <!-- Reduced motion is honoured by `useSectionMotion` for scroll reveals and
       by base.css for the CSS animations. -->
  <SignalField />
  <a class="skip-link" href="#main">Skip to content</a>

  <div id="top" class="page">
    <AppHeader />

    <main id="main" ref="main" class="shell">
      <HomePage v-if="page.kind === 'home'" />
      <CaseStudyPage v-else :project="page.project" />
    </main>

    <AppFooter />
  </div>
</template>

<style scoped>
/* Transparent so the fixed signal field shows through; body keeps the paper
   color underneath. The page sits one layer above the canvas. */
.page {
  position: relative;
  z-index: 1;
  min-height: 100dvh;
}
</style>
