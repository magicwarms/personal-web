<script setup lang="ts">
import ProofStrip from './ProofStrip.vue'
import SystemDiagram from './ui/SystemDiagram.vue'
import { profile } from '@/data/portfolio'
</script>

<template>
  <!-- Answers a recruiter's first three questions in one screen: who, whether
       he is available, and what he has actually built. The load sequence is
       a short CSS stagger (.rise); nothing is pinned or scrubbed. -->
  <section class="hero" aria-labelledby="hero-title">
    <div class="hero__grid">
      <div class="hero__copy">
        <p class="hero__status rise" :style="{ '--i': 0 }">
          <span class="status-dot" aria-hidden="true"></span>
          <span>
            <strong class="hero__status-lead">{{ profile.availability }}</strong>
            · {{ profile.workModes }}
          </span>
        </p>

        <h1 id="hero-title" class="hero__title rise" :style="{ '--i': 1 }">{{ profile.headline }}</h1>

        <p class="hero__intro rise" :style="{ '--i': 2 }">{{ profile.intro }}</p>

        <div class="hero__actions rise" :style="{ '--i': 3 }">
          <a class="btn btn--solid" :href="`mailto:${profile.email}`">Email me</a>
          <a class="btn btn--outline" :href="profile.cv" download>Download CV (PDF)</a>
        </div>

        <ul class="hero__meta mono rise" :style="{ '--i': 4 }">
          <li><a class="link" :href="profile.github" target="_blank" rel="noopener noreferrer">GitHub</a></li>
          <li><a class="link" :href="profile.linkedin" target="_blank" rel="noopener noreferrer">LinkedIn</a></li>
          <li>{{ profile.location }} ({{ profile.timezone }})</li>
        </ul>
      </div>

      <div class="hero__visual rise" :style="{ '--i': 3 }">
        <SystemDiagram />
      </div>
    </div>

    <ProofStrip />
  </section>
</template>

<style scoped>
.hero {
  padding-top: clamp(40px, 8vh, 88px);
  padding-bottom: clamp(48px, 8vh, 80px);
}

.hero__grid {
  display: grid;
  grid-template-columns: minmax(0, 1fr);
  gap: 40px;
  align-items: center;
  margin-bottom: clamp(40px, 7vh, 64px);
}

@media (min-width: 60rem) {
  .hero__grid {
    grid-template-columns: minmax(0, 7fr) minmax(0, 5fr);
    gap: 56px;
  }
}

.hero__status {
  display: flex;
  align-items: baseline;
  gap: 10px;
  font-size: var(--text-sm);
  line-height: 1.5;
  color: var(--color-ink-2);
}

.hero__status .status-dot {
  transform: translateY(-1px);
}

.hero__status-lead {
  font-weight: var(--weight-semibold);
  color: var(--color-accent);
}

.hero__title {
  margin-top: 20px;
  max-width: 14ch;
  font-size: var(--text-display);
  letter-spacing: var(--tracking-display);
  line-height: 1.02;
  text-wrap: balance;
}

.hero__intro {
  margin-top: 24px;
  max-width: 54ch;
  font-size: var(--text-lead);
  line-height: 1.6;
}

.hero__actions {
  display: flex;
  flex-wrap: wrap;
  gap: 12px;
  margin-top: 32px;
}

.hero__meta {
  display: flex;
  flex-wrap: wrap;
  gap: 8px 20px;
  margin-top: 28px;
  padding: 0;
  list-style: none;
  color: var(--color-ink-3);
}

.hero__meta .link {
  color: var(--color-ink-2);
}

.hero__visual {
  display: flex;
  justify-content: center;
}

@media (min-width: 60rem) {
  .hero__visual {
    justify-content: flex-end;
  }
}
</style>
