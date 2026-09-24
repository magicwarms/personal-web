<script setup lang="ts">
import SectionHeading from './ui/SectionHeading.vue'
import RevealItem from './ui/RevealItem.vue'
import { certifications, education } from '@/data/portfolio'
</script>

<template>
  <section id="credentials" class="section" aria-labelledby="credentials-heading">
    <SectionHeading id="credentials-heading" index="05" title="Credentials" />

    <div class="credentials paper-fill">
      <RevealItem>
        <h3 class="credentials__label mono">Education</h3>
        <div class="spec">
          <div class="spec__row">
            <span class="spec__key">{{ education.period }}</span>
            <span class="spec__value">
              {{ education.school }}
              <span class="credentials__detail">{{ education.degree }}, {{ education.note }}</span>
            </span>
          </div>
        </div>
      </RevealItem>

      <RevealItem>
        <h3 class="credentials__label mono">Certifications</h3>
        <ul class="spec">
          <li v-for="cert in certifications" :key="cert.id" class="spec__row">
            <span class="spec__key">{{ cert.date }}</span>
            <span class="spec__value">
              {{ cert.title }}
              <span class="credentials__detail">
                {{ cert.issuer }}<template v-if="cert.href">
                  ·
                  <a class="link" :href="cert.href" target="_blank" rel="noopener noreferrer">
                    Verify certificate<span class="sr-only"> for {{ cert.title }}</span>
                  </a>
                </template>
              </span>
            </span>
          </li>
        </ul>
      </RevealItem>
    </div>
  </section>
</template>

<style scoped>
.credentials {
  display: flex;
  flex-direction: column;
  gap: 32px;
}

.credentials__label {
  margin-bottom: 12px;
  font-weight: var(--weight-medium);
  color: var(--color-ink);
}

.credentials__detail {
  display: block;
  margin-top: 2px;
  font-size: var(--text-sm);
  color: var(--color-ink-2);
}
</style>
