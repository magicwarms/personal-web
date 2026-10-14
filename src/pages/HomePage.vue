<script setup lang="ts">
import HeroSection from '../components/HeroSection.vue'
import WorkSection from '../components/WorkSection.vue'
import ExperienceSection from '../components/ExperienceSection.vue'
import AboutSection from '../components/AboutSection.vue'
import StackSection from '../components/StackSection.vue'
import CredentialsSection from '../components/CredentialsSection.vue'
import ContactSection from '../components/ContactSection.vue'
</script>

<template>
  <!-- Reading order follows what a recruiter checks: who and whether
       available, proof of work, role history, logistics, keywords,
       credentials, then how to reach him. -->
  <HeroSection />
  <WorkSection />
  <ExperienceSection />
  <AboutSection />
  <StackSection />
  <CredentialsSection />
  <ContactSection />
</template>
