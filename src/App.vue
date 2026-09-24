<script setup lang="ts">
import AppHeader from './components/AppHeader.vue'
import AppFooter from './components/AppFooter.vue'
import SignalField from './components/ui/SignalField.vue'
import { ref } from 'vue'
import { useRuleDraw } from './composables/useRuleDraw'
import HeroSection from './components/HeroSection.vue'
import WorkSection from './components/WorkSection.vue'
import ExperienceSection from './components/ExperienceSection.vue'
import AboutSection from './components/AboutSection.vue'
import StackSection from './components/StackSection.vue'
import CredentialsSection from './components/CredentialsSection.vue'
import ContactSection from './components/ContactSection.vue'

const main = ref<HTMLElement | null>(null)
useRuleDraw(main)
</script>

<template>
  <!-- Reading order follows what a recruiter checks: who and whether
       available, proof of work, role history, logistics, keywords,
       credentials, then how to reach him. Reduced motion is honoured by
       `useSectionMotion` for scroll reveals and by base.css for the CSS
       animations. -->
  <SignalField />
  <a class="skip-link" href="#main">Skip to content</a>

  <div id="top" class="page">
    <AppHeader />

    <main id="main" ref="main" class="shell">
      <HeroSection />
      <WorkSection />
      <ExperienceSection />
      <AboutSection />
      <StackSection />
      <CredentialsSection />
      <ContactSection />
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
