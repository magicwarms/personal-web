<script setup lang="ts">
import SectionHeading from './ui/SectionHeading.vue'
import RevealItem from './ui/RevealItem.vue'
import { profile } from '@/data/portfolio'
</script>

<template>
  <section id="about" class="section" aria-labelledby="about-heading">
    <SectionHeading id="about-heading" title="About" />

    <div class="about">
      <RevealItem class="about__identity" :delay="0.05">
        <img
          class="about__photo"
          :src="profile.photo"
          :alt="`Portrait of ${profile.name}`"
          width="116"
          height="116"
          loading="lazy"
          decoding="async"
        />
        <div>
          <p class="about__name">{{ profile.name }}</p>
          <p class="about__role">{{ profile.title }}</p>
          <p class="about__location">{{ profile.location }}</p>
        </div>
      </RevealItem>

      <RevealItem :delay="0.12">
        <p v-for="(paragraph, position) in profile.about" :key="position" class="about__copy">
          {{ paragraph }}
        </p>
        <p class="about__languages">{{ profile.languages }}</p>
      </RevealItem>
    </div>
  </section>
</template>

<style scoped>
.section {
  padding-top: var(--section-pad);
}

.about {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(min(300px, 100%), 1fr));
  gap: clamp(32px, 5vw, 64px);
  margin-top: 44px;
  align-items: start;
}

.about__identity {
  display: flex;
  gap: 24px;
  align-items: center;
}

.about__photo {
  width: 116px;
  height: 116px;
  border-radius: 50%;
  object-fit: cover;
  flex: none;
  border: 1px solid rgba(61, 219, 196, 0.3);
  filter: saturate(0.85);
}

.about__name {
  font-family: var(--font-display);
  font-size: 20px;
  font-weight: 700;
  letter-spacing: -0.4px;
  color: var(--text);
  line-height: 1.3;
}

.about__role {
  margin-top: 6px;
  font-size: 12px;
  color: var(--accent);
  letter-spacing: 1.2px;
  line-height: 1.5;
}

.about__location {
  margin-top: 6px;
  font-size: 12px;
  color: var(--text-dimmer);
  line-height: 1.5;
}

.about__copy {
  color: var(--text-muted);
  line-height: 1.9;
  text-wrap: pretty;
}

.about__copy + .about__copy {
  margin-top: 18px;
}

.about__languages {
  margin-top: 18px;
  font-size: 12px;
  line-height: 1.9;
  color: var(--text-dimmer);
}
</style>
