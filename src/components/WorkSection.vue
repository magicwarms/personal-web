<script setup lang="ts">
import { ref } from 'vue'
import SectionHeading from './ui/SectionHeading.vue'
import { SplitText, gsap } from '@/motion/gsap'
import { useSectionMotion } from '@/composables/useSectionMotion'
import { projects } from '@/data/portfolio'

const root = ref<HTMLElement | null>(null)

useSectionMotion(
  root,
  ({ isDesktop, reduceMotion }) => {
    const el = root.value
    if (!el) return

    const q = gsap.utils.selector(el)
    const rows = q<HTMLElement>('.work__row')

    if (reduceMotion) {
      gsap.set(
        q('.work__index-inner, .work__title, .work__org, .work__stack, .work__bullets li'),
        { autoAlpha: 1, clearProps: 'transform' },
      )
      gsap.set(q('.work__glyph'), { autoAlpha: 0 })
      return
    }

    /** DOM listeners are not GSAP's to clean up, so we unwind them by hand. */
    const teardown: Array<() => void> = []

    rows.forEach((row) => {
      const title = row.querySelector<HTMLElement>('.work__title')
      const indexInner = row.querySelector<HTMLElement>('.work__index-inner')
      if (!title) return

      const timeline = gsap.timeline({
        scrollTrigger: { trigger: row, start: 'top 78%', once: true },
      })

      timeline
        .to(indexInner, { yPercent: 0, autoAlpha: 1, duration: 0.6 }, 0)
        .to(row.querySelectorAll('.work__org, .work__stack'), {
          autoAlpha: 1,
          x: 0,
          duration: 0.5,
          stagger: 0.05,
        }, 0.45)
        .to(row.querySelectorAll('.work__bullets li'), {
          autoAlpha: 1,
          y: 0,
          duration: 0.5,
          stagger: 0.05,
        }, 0.55)

      // The signature move: the title wipes up character by character from
      // behind per-character masks.
      SplitText.create(title, {
        type: 'words,chars',
        mask: 'chars',
        autoSplit: true,
        onSplit(self) {
          gsap.set(title, { autoAlpha: 1 })

          if (isDesktop) attachHover(row, self.chars, indexInner, teardown)

          return timeline.fromTo(
            self.chars,
            { yPercent: 110 },
            { yPercent: 0, duration: 0.7, ease: 'power3.out', stagger: { each: 0.014, from: 'start' } },
            0.1,
          )
        },
      })
    })

    if (isDesktop) {
      // Reading-line focus: rows brighten as they reach the middle of the
      // viewport and recede again on the way out, so the page reads one
      // project at a time instead of presenting all of them at once.
      //
      // The floor is 0.8, not something more dramatic: this dims real body
      // copy, and anything lower drops white text under the contrast ratio
      // it needs to stay readable. Depth is not worth an unreadable
      // paragraph.
      rows.forEach((row) => {
        gsap
          .timeline({
            scrollTrigger: { trigger: row, start: 'top bottom', end: 'bottom top', scrub: 0.5 },
          })
          .fromTo(row, { autoAlpha: 0.8 }, { autoAlpha: 1, ease: 'none', duration: 1 })
          .to(row, { autoAlpha: 0.8, ease: 'none', duration: 1 })
      })

      // A single satellite tracking down the margin — the constellation
      // language again, and a moving mark rather than a rule, so it stays
      // clear of DESIGN.md's no-dividers constraint.
      const glyph = q('.work__glyph')
      gsap.set(glyph, { autoAlpha: 1 })
      gsap.fromTo(
        glyph,
        { yPercent: 0 },
        {
          yPercent: 100,
          ease: 'none',
          scrollTrigger: {
            trigger: q('.work'),
            start: 'top 60%',
            end: 'bottom 80%',
            scrub: 0.5,
          },
        },
      )
    }

    return () => teardown.forEach((off) => off())
  },
  (el) => {
    const q = gsap.utils.selector(el)
    gsap.set(q('.work__index-inner'), { yPercent: 110, autoAlpha: 0 })
    gsap.set(q('.work__title'), { autoAlpha: 0 })
    gsap.set(q('.work__org, .work__stack'), { autoAlpha: 0, x: -8 })
    gsap.set(q('.work__bullets li'), { autoAlpha: 0, y: 10 })
    gsap.set(q('.work__glyph'), { autoAlpha: 0 })
  },
)

/**
 * Built once and paused, then played and reversed — creating tweens inside
 * the pointer handler is what makes this pattern stutter.
 */
function attachHover(
  row: HTMLElement,
  chars: Element[],
  indexInner: HTMLElement | null,
  teardown: Array<() => void>,
) {
  const hover = gsap.timeline({ paused: true })
  if (indexInner) hover.to(indexInner, { x: 4, duration: 0.3 }, 0)
  hover.to(chars, { y: -3, duration: 0.3, stagger: { each: 0.012, from: 'start' } }, 0)

  const enter = () => hover.play()
  const leave = () => hover.reverse()

  row.addEventListener('mouseenter', enter)
  row.addEventListener('mouseleave', leave)
  teardown.push(() => {
    row.removeEventListener('mouseenter', enter)
    row.removeEventListener('mouseleave', leave)
    hover.kill()
  })
}
</script>

<template>
  <section ref="root" id="work" class="section" aria-labelledby="work-heading">
    <SectionHeading id="work-heading" title="Selected work" />

    <div class="work">
      <span class="work__glyph" aria-hidden="true">
        <svg viewBox="0 0 12 12" fill="none" xmlns="http://www.w3.org/2000/svg">
          <polygon points="6,1 11,10 1,10" stroke="var(--color-accent)" stroke-width="1.5" stroke-linejoin="round" />
        </svg>
      </span>

      <article
        v-for="project in projects"
        :key="project.id"
        class="work__item"
        :aria-labelledby="`${project.id}-title`"
      >
        <!-- The reveal moves the row's contents, not the row itself, so the
             grid rhythm between rows never shifts mid-animation. -->
        <div class="work__row">
          <div class="work__index" aria-hidden="true">
            <span class="work__index-inner">{{ project.index }}</span>
          </div>

          <div>
            <h3 :id="`${project.id}-title`" class="work__title">{{ project.title }}</h3>

            <p class="work__meta">
              <span class="work__org">{{ project.org }}</span>
              <span class="work__stack">{{ project.stack }}</span>
            </p>

            <ul class="bullets work__bullets">
              <li v-for="highlight in project.highlights" :key="highlight">{{ highlight }}</li>
            </ul>
          </div>
        </div>
      </article>
    </div>
  </section>
</template>

<style scoped>
.section {
  padding-top: var(--section-pad);
}

.work {
  position: relative;
  display: flex;
  flex-direction: column;
  gap: var(--spacing-96);
  margin-top: 48px;
}

.work__glyph {
  display: none;
}

/* Only shown once the shell has real margin outside it to place the glyph
   in; below this width there is nowhere for it to go that isn't content. */
@media (min-width: 75rem) {
  .work__glyph {
    display: block;
    position: absolute;
    top: 0;
    left: -34px;
    width: 12px;
    height: calc(100% - 12px);
    pointer-events: none;
  }

  .work__glyph svg {
    width: 12px;
    height: 12px;
    opacity: 0.7;
  }
}

.work__item {
  padding: 0 clamp(4px, 2vw, 28px);
}

.work__row {
  display: grid;
  grid-template-columns: 48px minmax(0, 1fr);
  gap: clamp(12px, 3vw, 32px);
}

.work__index {
  /* Clips the index while it slides up into place. */
  overflow: clip;
  padding-top: 6px;
}

.work__index-inner {
  display: block;
  font-family: var(--font-display);
  font-weight: var(--font-weight-semibold);
  font-size: var(--text-caption);
  color: var(--color-saffron-spark);
  letter-spacing: var(--tracking-label);
}

.work__title {
  font-family: var(--font-display);
  font-size: var(--text-heading-sm);
  font-weight: var(--font-weight-regular);
  letter-spacing: var(--tracking-tight);
  color: var(--color-ink);
  line-height: 1.15;
}

.work__meta {
  margin-top: 14px;
  display: flex;
  flex-wrap: wrap;
  gap: 14px;
  font-family: var(--font-mono);
  font-size: 0.75rem;
  letter-spacing: 0.02em;
  line-height: 1.6;
}

.work__org {
  color: var(--color-warn);
}

.work__stack {
  color: var(--color-ink-3);
}

.work__bullets {
  margin-top: 22px;
}
</style>
