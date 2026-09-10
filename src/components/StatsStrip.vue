<script setup lang="ts">
import { ref } from 'vue'
import { REVEAL_START, gsap } from '@/motion/gsap'
import { useSectionMotion } from '@/composables/useSectionMotion'
import { stats } from '@/data/portfolio'

const root = ref<HTMLElement | null>(null)

/** `"8+"` and `"30%"` both count; the suffix is carried through untouched. */
function parseStat(raw: string) {
  const match = /^([\d.]+)(.*)$/.exec(raw)
  if (!match) return null
  return { target: Number(match[1]), suffix: match[2] ?? '' }
}

useSectionMotion(
  root,
  ({ reduceMotion }) => {
    const el = root.value
    if (!el) return

    const cells = gsap.utils.toArray<HTMLElement>(el.querySelectorAll('.stats__cell'))

    if (reduceMotion) {
      // The real figures are already in the markup — nothing to restore.
      gsap.set(el.querySelectorAll('.stats__value, .stats__label'), {
        autoAlpha: 1,
        clearProps: 'transform',
      })
      return
    }

    const timeline = gsap.timeline({
      scrollTrigger: { trigger: el, start: REVEAL_START, once: true },
    })

    cells.forEach((cell, index) => {
      const valueEl = cell.querySelector<HTMLElement>('.stats__value')
      const labelEl = cell.querySelector<HTMLElement>('.stats__label')
      if (!valueEl || !labelEl) return

      const at = index * 0.08
      timeline.to(valueEl, { autoAlpha: 1, y: 0, duration: 0.5 }, at)
      timeline.to(labelEl, { autoAlpha: 1, y: 0, duration: 0.5 }, at + 0.2)

      const parsed = parseStat(valueEl.dataset.value ?? '')
      if (!parsed) return

      // `.stats__value` is already `font-variant-numeric: tabular-nums`, so
      // every digit is the same width and the ticking figure cannot reflow
      // the grid around it.
      const counter = { value: 0 }
      timeline.to(
        counter,
        {
          value: parsed.target,
          duration: 1.2,
          ease: 'power2.out',
          snap: { value: 1 },
          onUpdate: () => {
            valueEl.textContent = `${counter.value}${parsed.suffix}`
          },
        },
        at,
      )
    })
  },
  (el) => {
    gsap.set(el.querySelectorAll('.stats__value, .stats__label'), { autoAlpha: 0, y: 12 })
  },
)
</script>

<template>
  <dl ref="root" class="stats" aria-label="Career metrics">
    <!-- The cells own the grid and stay put; only their text moves, so the
         column rhythm never shifts mid-animation. -->
    <div v-for="stat in stats" :key="stat.label" class="stats__cell">
      <dt class="stats__value" :data-value="stat.value">{{ stat.value }}</dt>
      <dd class="stats__label">{{ stat.label }}</dd>
    </div>
  </dl>
</template>

<style scoped>
.stats {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(min(180px, 100%), 1fr));
  gap: var(--spacing-36);
  margin: 0;
}

.stats__cell {
  padding: 0;
}

.stats__value {
  font-family: var(--font-display);
  font-size: var(--text-heading);
  font-weight: var(--font-weight-regular);
  color: var(--color-ink);
  letter-spacing: var(--tracking-display);
  line-height: 1.1;
  font-variant-numeric: tabular-nums;
}

.stats__label {
  margin: 10px 0 0;
  font-family: var(--font-display);
  font-weight: var(--font-weight-semibold);
  font-size: var(--text-caption);
  letter-spacing: var(--tracking-label);
  text-transform: uppercase;
  color: var(--color-ink-3);
}
</style>
