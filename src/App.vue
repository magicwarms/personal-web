<script setup lang="ts">
import { MotionConfig } from 'motion-v'
import AppHeader from './components/AppHeader.vue'
import AppFooter from './components/AppFooter.vue'
import HeroSection from './components/HeroSection.vue'
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
      <div class="page__glow" aria-hidden="true"></div>
      <div class="page__grid" aria-hidden="true"></div>

      <AppHeader />

      <main id="main" class="shell page__main">
        <div id="top"></div>
        <HeroSection />
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
  min-height: 100vh;
  background: var(--bg);
  /* `clip` rather than `hidden`: it contains stray horizontal overflow without
     turning the page into a scroll container, which would break the sticky
     header. */
  overflow-x: clip;
}

.page__glow,
.page__grid {
  position: fixed;
  inset: 0;
  pointer-events: none;
  z-index: 0;
}

.page__glow {
  background:
    radial-gradient(900px 700px at 78% 8%, rgba(61, 219, 196, 0.13), transparent 60%),
    radial-gradient(700px 600px at 8% 62%, rgba(61, 219, 196, 0.06), transparent 62%);
}

.page__grid {
  opacity: 0.5;
  background-image:
    linear-gradient(rgba(61, 219, 196, 0.05) 1px, transparent 1px),
    linear-gradient(90deg, rgba(61, 219, 196, 0.05) 1px, transparent 1px);
  background-size: 88px 88px;
  mask-image: radial-gradient(1100px 800px at 70% 0%, #000 0%, transparent 75%);
  -webkit-mask-image: radial-gradient(1100px 800px at 70% 0%, #000 0%, transparent 75%);
}

.page__main {
  position: relative;
  z-index: 1;
}
</style>
