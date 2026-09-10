<script setup lang="ts">
import { ref } from 'vue'
import SectionHeading from './ui/SectionHeading.vue'
import { REVEAL_START, SplitText, gsap } from '@/motion/gsap'
import { useSectionMotion } from '@/composables/useSectionMotion'
import { certifications, education } from '@/data/portfolio'

const root = ref<HTMLElement | null>(null)

useSectionMotion(
  root,
  ({ reduceMotion }) => {
    const el = root.value
    if (!el) return

    const q = gsap.utils.selector(el)

    if (reduceMotion) {
      gsap.set(q('.credentials__label, .credentials__title, .credentials__meta, .credentials__detail'), {
        autoAlpha: 1,
        clearProps: 'transform',
      })
      q<HTMLElement>('.credentials__index').forEach((index) => {
        index.textContent = index.dataset.value ?? ''
        gsap.set(index, { autoAlpha: 1 })
      })
      return
    }

    q<HTMLElement>('.credentials__column').forEach((column, columnIndex) => {
      const at = columnIndex * 0.08

      const timeline = gsap.timeline({
        scrollTrigger: { trigger: column, start: REVEAL_START, once: true },
      })

      timeline.to(column.querySelector('.credentials__label'), {
        autoAlpha: 1,
        y: 0,
        duration: 0.5,
      }, at)

      // Mono, tabular, fixed width — the figure can scramble in place without
      // nudging a single pixel of the layout. It also borrows the code
      // panel's own language for the one part of the page that is literally
      // a list of numbered records.
      column.querySelectorAll<HTMLElement>('.credentials__index').forEach((index, position) => {
        timeline.to(index, { autoAlpha: 1, duration: 0.2 }, at + 0.1 + position * 0.08)
        timeline.to(
          index,
          {
            duration: 0.6,
            scrambleText: {
              text: index.dataset.value ?? '',
              chars: '0123456789',
              speed: 0.4,
            },
          },
          at + 0.1 + position * 0.08,
        )
      })

      timeline.to(column.querySelectorAll('.credentials__meta, .credentials__detail'), {
        autoAlpha: 1,
        y: 0,
        duration: 0.5,
        stagger: 0.05,
      }, at + 0.4)

      column.querySelectorAll<HTMLElement>('.credentials__title').forEach((title, position) => {
        SplitText.create(title, {
          type: 'lines',
          mask: 'lines',
          autoSplit: true,
          onSplit(self) {
            gsap.set(title, { autoAlpha: 1 })
            return timeline.fromTo(
              self.lines,
              { yPercent: 100 },
              { yPercent: 0, duration: 0.6, stagger: 0.05 },
              at + 0.18 + position * 0.08,
            )
          },
        })
      })
    })
  },
  (el) => {
    const q = gsap.utils.selector(el)
    gsap.set(q('.credentials__label'), { autoAlpha: 0, y: 10 })
    gsap.set(q('.credentials__title'), { autoAlpha: 0 })
    gsap.set(q('.credentials__index'), { autoAlpha: 0 })
    gsap.set(q('.credentials__meta, .credentials__detail'), { autoAlpha: 0, y: 8 })
  },
)
</script>

<template>
  <section ref="root" id="credentials" class="section" aria-labelledby="credentials-heading">
    <SectionHeading id="credentials-heading" title="Credentials" />

    <div class="credentials">
      <div class="credentials__column">
        <h3 class="eyebrow credentials__label">Education</h3>
        <div class="credentials__entry">
          <p class="credentials__index" :data-value="education.index" aria-hidden="true">
            {{ education.index }}
          </p>
          <p class="credentials__title">{{ education.school }}</p>
          <p class="credentials__meta">{{ education.meta }}</p>
          <p class="credentials__detail">{{ education.detail }}</p>
        </div>
      </div>

      <div class="credentials__column">
        <h3 class="eyebrow credentials__label">Certifications</h3>
        <ul class="credentials__list">
          <li v-for="(item, position) in certifications" :key="item.id" class="credentials__entry">
            <p
              class="credentials__index"
              :data-value="String(position + 1).padStart(2, '0')"
              aria-hidden="true"
            >
              {{ String(position + 1).padStart(2, '0') }}
            </p>
            <p class="credentials__title credentials__title--small">{{ item.title }}</p>
            <p class="credentials__meta">{{ item.meta }}</p>
          </li>
        </ul>
      </div>
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
  padding-bottom: 16px;
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
  font-family: var(--font-mono);
  font-size: 0.75rem;
  color: var(--color-ink-3);
  line-height: 1.6;
  font-variant-numeric: tabular-nums;
}

.credentials__title {
  margin-top: 8px;
  font-family: var(--font-display);
  font-size: var(--text-heading-2xs);
  font-weight: var(--font-weight-regular);
  color: var(--color-ink);
  letter-spacing: var(--tracking-tight);
  line-height: 1.3;
}

.credentials__title--small {
  font-family: var(--font-mono);
  font-size: 0.875rem;
  font-weight: 400;
  letter-spacing: 0;
  line-height: 1.6;
}

.credentials__meta {
  margin-top: 8px;
  font-family: var(--font-mono);
  font-size: 0.75rem;
  color: var(--color-warn);
  letter-spacing: 0.02em;
  line-height: 1.6;
}

.credentials__detail {
  margin-top: 8px;
  font-size: 0.875rem;
  line-height: 1.75;
  color: var(--color-ink-2);
}
</style>
