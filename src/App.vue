<script setup lang="ts">
import { onMounted, onUnmounted } from 'vue'
import AppHeader from './components/AppHeader.vue'
import AppFooter from './components/AppFooter.vue'
import HeroSection from './components/HeroSection.vue'
import SystemMark from './components/ui/SystemMark.vue'
import ParticleField from './components/ui/ParticleField.vue'
import StatsStrip from './components/StatsStrip.vue'
import AboutSection from './components/AboutSection.vue'
import WorkSection from './components/WorkSection.vue'
import ExperienceSection from './components/ExperienceSection.vue'
import StackSection from './components/StackSection.vue'
import CredentialsSection from './components/CredentialsSection.vue'
import ContactSection from './components/ContactSection.vue'
import { ScrollTrigger, gsap } from './motion/gsap'
import { writeEnergy } from './motion/scrollEnergy'

/**
 * One page-level ScrollTrigger with no animation attached, purely to publish
 * scroll velocity to the particle field. Normalised to roughly -1..1 so the
 * canvas can treat it as a dimensionless "how hard are we moving" number
 * rather than pixels per second.
 */
let velocityFeed: ScrollTrigger | undefined

onMounted(() => {
  velocityFeed = ScrollTrigger.create({
    onUpdate: (self) => writeEnergy(gsap.utils.clamp(-1, 1, self.getVelocity() / 3000)),
  })
})

onUnmounted(() => {
  velocityFeed?.kill()
  writeEnergy(0)
})
</script>

<template>
  <!-- Reduced motion is honoured per-section by `useSectionMotion`, which
       builds the static end state instead of the animation; the CSS-only
       ambient effects are handled in base.css. -->
  <a class="skip-link" href="#main">Skip to content</a>

  <div class="page">
    <ParticleField variant="ambient" />

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
</template>

<style scoped>
.page {
  position: relative;
  /* Own stacking context, so the fixed ambient ParticleField (z-index -1)
     resolves against this boundary instead of the document root. */
  isolation: isolate;
  min-height: 100dvh;
  background: var(--color-paper);
}

.page__main {
  position: relative;
}
</style>
