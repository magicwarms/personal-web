<script setup lang="ts">
import { MotionConfig } from 'motion-v'
import AppHeader from './components/AppHeader.vue'
import AppFooter from './components/AppFooter.vue'
import HeroSection from './components/HeroSection.vue'
import SystemMark from './components/ui/SystemMark.vue'
import StatsStrip from './components/StatsStrip.vue'
import AboutSection from './components/AboutSection.vue'
import WorkSection from './components/WorkSection.vue'
import ExperienceSection from './components/ExperienceSection.vue'
import StackSection from './components/StackSection.vue'
import CredentialsSection from './components/CredentialsSection.vue'
import ContactSection from './components/ContactSection.vue'
import { revealTransition } from './motion/presets'
</script>

<template>
  <!-- `reducedMotion: user` makes every Motion transform animation honour the
       OS setting; the CSS-only ambient effects are handled in base.css. -->
  <MotionConfig :transition="revealTransition" reducedMotion="user">
    <a class="skip-link" href="#main">Skip to content</a>

    <div class="page">
      <AppHeader />

      <main id="main" class="shell page__main">
        <div id="top"></div>
        <HeroSection />
        <SystemMark />
        <StatsStrip />
        <AboutSection />
        <WorkSection />
        <ExperienceSection />
        <StackSection />
        <CredentialsSection />
        <ContactSection />
      </main>

      <AppFooter />
    </div>
  </MotionConfig>
</template>

<style scoped>
.page {
  position: relative;
  min-height: 100dvh;
  background: var(--color-paper);
}

.page__main {
  position: relative;
}
</style>
