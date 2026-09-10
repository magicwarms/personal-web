<script setup lang="ts">
import { ref } from 'vue'
import SectionHeading from './ui/SectionHeading.vue'
import { ScrollTrigger, gsap } from '@/motion/gsap'
import { useSectionMotion } from '@/composables/useSectionMotion'
import { stackGroups } from '@/data/portfolio'

const root = ref<HTMLElement | null>(null)

useSectionMotion(
  root,
  ({ reduceMotion }) => {
    const el = root.value
    if (!el) return

    const q = gsap.utils.selector(el)

    if (reduceMotion) {
      gsap.set(q('.stack__label, .stack__items .pill'), { autoAlpha: 1, clearProps: 'transform' })
      return
    }

    gsap.to(q('.stack__label'), {
      autoAlpha: 1,
      y: 0,
      duration: 0.6,
      stagger: 0.06,
      scrollTrigger: { trigger: q('.stack'), start: 'top 82%', once: true },
    })

    // Batched rather than one trigger per pill: whichever pills cross the
    // line together animate together, so the cascade follows the reader
    // instead of a hard-coded per-group delay.
    ScrollTrigger.batch(q('.stack__items .pill'), {
      start: 'top 88%',
      once: true,
      onEnter: (batch) =>
        gsap.to(batch, {
          autoAlpha: 1,
          y: 0,
          scale: 1,
          duration: 0.5,
          ease: 'back.out(1.4)',
          stagger: { each: 0.025, from: 'start' },
          overwrite: true,
        }),
    })
  },
  (el) => {
    const q = gsap.utils.selector(el)
    gsap.set(q('.stack__label'), { autoAlpha: 0, y: 10 })
    gsap.set(q('.stack__items .pill'), { autoAlpha: 0, y: 14, scale: 0.94 })
  },
)
</script>

<template>
  <section ref="root" id="stack" class="section" aria-labelledby="stack-heading">
    <SectionHeading id="stack-heading" title="Stack" />

    <div class="stack">
      <div v-for="group in stackGroups" :key="group.id">
        <h3 class="eyebrow stack__label">{{ group.label }}</h3>
        <ul class="stack__items">
          <li v-for="item in group.items" :key="item" class="pill">{{ item }}</li>
        </ul>
      </div>
    </div>
  </section>
</template>

<style scoped>
.section {
  padding-top: var(--section-pad);
}

.stack {
  margin-top: 44px;
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(min(260px, 100%), 1fr));
  gap: var(--spacing-60) var(--spacing-36);
}

.stack__items {
  margin: 18px 0 0;
  padding: 0;
  list-style: none;
  display: flex;
  flex-wrap: wrap;
  gap: 12px 20px;
}
</style>
