<script setup lang="ts">
import SectionHeading from './ui/SectionHeading.vue'
import RevealItem from './ui/RevealItem.vue'
import { certifications, education } from '@/data/portfolio'
</script>

<template>
  <section id="credentials" class="section" aria-labelledby="credentials-heading">
    <SectionHeading id="credentials-heading" title="Credentials" />

    <div class="credentials">
      <RevealItem>
        <h3 class="eyebrow credentials__label">Education</h3>
        <div class="credentials__entry">
          <p class="credentials__index" aria-hidden="true">{{ education.index }}</p>
          <p class="credentials__title">{{ education.school }}</p>
          <p class="credentials__meta">{{ education.meta }}</p>
          <p class="credentials__detail">{{ education.detail }}</p>
        </div>
      </RevealItem>

      <RevealItem :delay="0.08">
        <h3 class="eyebrow credentials__label">Certifications</h3>
        <ul class="credentials__list">
          <li v-for="(item, position) in certifications" :key="item.id" class="credentials__entry">
            <p class="credentials__index" aria-hidden="true">
              {{ String(position + 1).padStart(2, '0') }}
            </p>
            <p class="credentials__title credentials__title--small">{{ item.title }}</p>
            <p class="credentials__meta">{{ item.meta }}</p>
          </li>
        </ul>
      </RevealItem>
    </div>
  </section>
</template>

<style scoped>
.section {
  padding-top: var(--section-pad);
}

.credentials {
  margin-top: 44px;
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(min(300px, 100%), 1fr));
  gap: clamp(32px, 5vw, 64px);
}

.credentials__label {
  font-weight: 400;
  padding-bottom: 16px;
  border-bottom: 1px solid var(--accent-14);
}

.credentials__list {
  margin: 0;
  padding: 0;
  list-style: none;
  display: flex;
  flex-direction: column;
  gap: 24px;
}

.credentials__entry {
  margin-top: 22px;
}

.credentials__list .credentials__entry {
  margin-top: 0;
}

.credentials__index {
  font-size: 12px;
  color: var(--accent-50);
  line-height: 1.6;
}

.credentials__title {
  margin-top: 8px;
  font-family: var(--font-display);
  font-size: 17px;
  font-weight: 700;
  color: var(--text);
  letter-spacing: -0.2px;
  line-height: 1.4;
}

.credentials__title--small {
  font-family: var(--font-mono);
  font-size: 14px;
  font-weight: 400;
  letter-spacing: 0;
  line-height: 1.6;
}

.credentials__meta {
  margin-top: 8px;
  font-size: 12px;
  color: var(--rose);
  letter-spacing: 1.2px;
  line-height: 1.6;
}

.credentials__detail {
  margin-top: 8px;
  font-size: 13px;
  line-height: 1.8;
  color: var(--text-muted);
}
</style>
