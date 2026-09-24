<script setup lang="ts">
import AppHeader from './components/AppHeader.vue'
import AppFooter from './components/AppFooter.vue'
import HeroSection from './components/HeroSection.vue'
import WorkSection from './components/WorkSection.vue'
import ExperienceSection from './components/ExperienceSection.vue'
import AboutSection from './components/AboutSection.vue'
import StackSection from './components/StackSection.vue'
import CredentialsSection from './components/CredentialsSection.vue'
import ContactSection from './components/ContactSection.vue'
</script>

<template>
  <!-- Reading order follows what a recruiter checks: who and whether
       available, proof of work, role history, logistics, keywords,
       credentials, then how to reach him. Reduced motion is honoured by
       `useSectionMotion` for scroll reveals and by base.css for the CSS
       animations. -->
  <a class="skip-link" href="#main">Skip to content</a>

  <div id="top" class="page">
    <AppHeader />

    <main id="main" class="shell">
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
.page {
  min-height: 100dvh;
  background: var(--color-paper);
}
</style>
