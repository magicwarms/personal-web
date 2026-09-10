<script setup lang="ts">
import { ref } from 'vue'
import { SplitText, gsap } from '@/motion/gsap'
import { useSectionMotion } from '@/composables/useSectionMotion'

defineProps<{
  /** Wired to the section's `aria-labelledby`. */
  id: string
  title: string
}>()

const root = ref<HTMLElement | null>(null)

/**
 * The page's connective motif: the amber dot lands first and the title rises
 * out from behind a clipped mask a beat later. Every section opens this way,
 * so the reader learns the rhythm once and it carries the whole page.
 */
useSectionMotion(
  root,
  ({ reduceMotion }) => {
    const el = root.value
    if (!el) return

    const mark = el.querySelector('.heading__mark')
    const title = el.querySelector<HTMLElement>('.heading__title')
    if (!mark || !title) return

    if (reduceMotion) {
      gsap.set([mark, title], { autoAlpha: 1, clearProps: 'transform' })
      return
    }

    const timeline = gsap.timeline({
      scrollTrigger: { trigger: el, start: 'top 82%', once: true },
    })

    timeline.to(mark, { scale: 1, autoAlpha: 1, duration: 0.5, ease: 'back.out(2)' })

    SplitText.create(title, {
      type: 'lines',
      mask: 'lines',
      // Re-split when the font finishes loading or the element is resized,
      // so the mask boxes never disagree with where the lines actually break.
      autoSplit: true,
      linesClass: 'heading__line',
      onSplit(self) {
        // The title itself is only hidden to stop it flashing pre-split; the
        // lines are what actually animate, from behind their masks.
        gsap.set(title, { autoAlpha: 1 })
        // Returned so SplitText can revert and time-sync it across re-splits.
        return timeline.fromTo(
          self.lines,
          { yPercent: 100 },
          { yPercent: 0, duration: 0.8, stagger: 0.08 },
          // Overlap: the dot is still settling when the title starts to rise.
          '-=0.28',
        )
      },
    })
  },
  (el) => {
    gsap.set(el.querySelector('.heading__mark'), { scale: 0, autoAlpha: 0 })
    gsap.set(el.querySelector('.heading__title'), { autoAlpha: 0 })
  },
)
</script>

<template>
  <div ref="root" class="heading">
    <span class="heading__mark" aria-hidden="true"></span>
    <h2 :id="id" class="heading__title">{{ title }}</h2>
  </div>
</template>

<style scoped>
.heading {
  padding-top: var(--spacing-6);
}

.heading__mark {
  display: block;
  width: 0.5rem;
  height: 0.5rem;
  margin-bottom: var(--spacing-18);
  background: var(--color-saffron-spark);
  border-radius: var(--radius-full);
}

.heading__title {
  font-family: var(--font-display);
  /* Never bold — hierarchy is scale + tracking, not weight. 42px matches
     DESIGN.md's own worked example for this exact pattern (left-aligned
     section heading + body, no boxes); 78-113px is reserved for the
     hero-scale headline. */
  font-weight: var(--font-weight-regular);
  font-size: var(--text-heading-sm);
  letter-spacing: var(--tracking-display);
  line-height: 1.2;
  color: var(--color-ink);
  overflow-wrap: anywhere;
}
</style>
