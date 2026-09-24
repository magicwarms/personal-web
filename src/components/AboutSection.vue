<script setup lang="ts">
import SectionHeading from './ui/SectionHeading.vue'
import RevealItem from './ui/RevealItem.vue'
import { profile, workDetails } from '@/data/portfolio'
</script>

<template>
  <section id="about" class="section" aria-labelledby="about-heading">
    <SectionHeading id="about-heading" index="03" title="About" />

    <div class="about">
      <RevealItem class="about__intro">
        <img
          class="about__photo"
          :src="profile.photo"
          :alt="`Portrait of ${profile.name}`"
          width="112"
          height="112"
          loading="lazy"
          decoding="async"
        />
        <div class="about__copy">
          <p v-for="paragraph in profile.about" :key="paragraph">{{ paragraph }}</p>
        </div>
      </RevealItem>

      <!-- The logistics recruiters ask about first, in one scannable table. -->
      <RevealItem>
        <h3 class="about__label mono">Working details</h3>
        <dl class="spec">
          <div v-for="detail in workDetails" :key="detail.label" class="spec__row">
            <dt class="spec__key">{{ detail.label }}</dt>
            <dd class="spec__value">{{ detail.value }}</dd>
          </div>
        </dl>
      </RevealItem>
    </div>
  </section>
</template>

<style scoped>
.about {
  display: flex;
  flex-direction: column;
  gap: 36px;
}

.about__intro {
  display: grid;
  grid-template-columns: minmax(0, 1fr);
  gap: 20px;
}

@media (min-width: 40rem) {
  .about__intro {
    grid-template-columns: 112px minmax(0, 1fr);
    gap: 28px;
  }
}

.about__photo {
  width: 112px;
  height: 112px;
  object-fit: cover;
  border-radius: var(--radius);
  border: 1px solid var(--color-rule);
}

.about__copy {
  display: flex;
  flex-direction: column;
  gap: 14px;
  max-width: 62ch;
}

.about__label {
  margin-bottom: 12px;
  font-weight: var(--weight-medium);
  color: var(--color-ink);
}
</style>
