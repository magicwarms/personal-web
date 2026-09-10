<script setup lang="ts">
import { ref } from 'vue'
import RoleCycler from './RoleCycler.vue'
import CodePanel from './CodePanel.vue'
import ParticleField from './ui/ParticleField.vue'
import { SCRUB, SplitText, gsap } from '@/motion/gsap'
import { useSectionMotion } from '@/composables/useSectionMotion'
import { profile } from '@/data/portfolio'

const root = ref<HTMLElement | null>(null)

/**
 * The page's opening statement. Two independent pieces:
 *
 * 1. A load timeline that plays once, on absolute times rather than relative
 *    offsets — SplitText re-splits on resize and re-inserts its tween, and a
 *    chain of `'-='` offsets would land it somewhere different each time.
 * 2. A pinned scrub that drifts the copy and the panel in opposite
 *    directions as the hero leaves. Counter-motion is what sells depth;
 *    moving both the same way just reads as lag.
 */
useSectionMotion(
  root,
  ({ isDesktop, reduceMotion }) => {
    const el = root.value
    if (!el) return

    const q = gsap.utils.selector(el)
    const copy = q('.hero__copy')
    const panel = q('.hero__panel')
    const animated = q('.hero__status, .hero__kicker, .hero__role, .hero__intro, .hero__actions, .hero__meta')

    if (reduceMotion) {
      gsap.set([...animated, ...q('.panel'), ...q('.particle-field')], {
        autoAlpha: 1,
        clearProps: 'transform,filter',
      })
      return
    }

    const timeline = gsap.timeline()

    timeline
      .to(q('.hero__status'), { autoAlpha: 1, y: 0, duration: 0.5 }, 0)
      // The panel arrives out of depth: it resolves from blur while the copy
      // is still writing itself in. Blur is applied to `.panel` and never to
      // `.hero__panel` — that box also contains the particle canvas, and
      // filtering a layer that repaints every frame is the most expensive
      // thing available on this page.
      .to(q('.panel'), { autoAlpha: 1, scale: 1, filter: 'blur(0px)', duration: 1.1 }, 0.15)
      .to(q('.particle-field'), { autoAlpha: 1, duration: 1.2 }, 0.15)
      .to(q('.hero__role'), { autoAlpha: 1, y: 0, duration: 0.7 }, 0.5)
      .to(q('.hero__actions'), { autoAlpha: 1, y: 0, duration: 0.6 }, 1.05)
      .to(q('.hero__meta'), { autoAlpha: 1, y: 0, duration: 0.6 }, 1.15)

    SplitText.create(q('.hero__kicker'), {
      type: 'words,chars',
      mask: 'chars',
      autoSplit: true,
      onSplit(self) {
        gsap.set(q('.hero__kicker'), { autoAlpha: 1 })
        return timeline.fromTo(
          self.chars,
          { yPercent: 100 },
          { yPercent: 0, duration: 0.6, stagger: 0.02 },
          0.25,
        )
      },
    })

    SplitText.create(q('.hero__intro'), {
      type: 'lines',
      mask: 'lines',
      autoSplit: true,
      onSplit(self) {
        gsap.set(q('.hero__intro'), { autoAlpha: 1 })
        return timeline.fromTo(
          self.lines,
          { yPercent: 100 },
          { yPercent: 0, duration: 0.8, stagger: 0.07 },
          0.7,
        )
      },
    })

    // Pinning costs the reader 70% of a viewport before they reach anything
    // new, which is a fair trade on a desktop canvas and a bad one on a
    // phone. Mobile keeps the load timeline and skips the pin entirely.
    if (!isDesktop) return

    gsap
      .timeline({
        scrollTrigger: {
          trigger: el,
          start: 'top top',
          end: '+=70%',
          pin: true,
          pinSpacing: true,
          scrub: SCRUB,
        },
      })
      .to(copy, { y: -60, autoAlpha: 0.15, ease: 'none' }, 0)
      .to(panel, { y: 40, scale: 0.92, autoAlpha: 0.3, ease: 'none' }, 0)
  },
  (el) => {
    const q = gsap.utils.selector(el)
    gsap.set(q('.hero__status, .hero__role, .hero__actions, .hero__meta'), {
      autoAlpha: 0,
      y: 12,
    })
    gsap.set(q('.hero__kicker, .hero__intro'), { autoAlpha: 0 })
    // Deliberately hides the panel's *contents*, never `.hero__panel` itself.
    // The pinned scrub below animates `.hero__panel` with `to()` tweens, which
    // capture their start values from whatever the element reads as at
    // creation time — and creation happens while this hidden state is still
    // in force. Hiding the wrapper here left the scrub convinced that
    // "opacity 0" was the panel's resting state, and pinned it invisible.
    gsap.set(q('.panel'), { autoAlpha: 0, scale: 0.94, filter: 'blur(14px)' })
    gsap.set(q('.particle-field'), { autoAlpha: 0 })
  },
)
</script>

<template>
  <section ref="root" class="hero" aria-label="Introduction">
    <div class="hero__copy">
      <div class="hero__status">
        <span class="hero__status-dot" aria-hidden="true"></span>
        {{ profile.availability }}
      </div>

      <p class="hero__kicker eyebrow">I'm {{ profile.name }}</p>

      <div class="hero__role">
        <RoleCycler />
      </div>

      <p class="hero__intro">{{ profile.intro }}</p>

      <!-- One filled violet pill per view (DESIGN.md Don'ts): the second
           action is a ghost text link, not a second solid button. -->
      <div class="hero__actions">
        <a class="btn btn--solid" href="#work">View work</a>
        <a class="btn btn--ghost" :href="profile.cv" download>Download CV</a>
      </div>

      <div class="hero__meta">
        <a :href="profile.github" target="_blank" rel="noopener noreferrer">GitHub</a>
        <a :href="profile.linkedin" target="_blank" rel="noopener noreferrer">LinkedIn</a>
        <span>{{ profile.timezone }}</span>
      </div>
    </div>

    <div class="hero__panel">
      <!-- Hero Constellation Visualization (DESIGN.md): the particle cloud
           sits behind the code panel as a backdrop, not in place of it. -->
      <ParticleField variant="cloud" />
      <CodePanel />
    </div>
  </section>
</template>

<style scoped>
.hero {
  display: grid;
  grid-template-columns: minmax(0, 1fr);
  gap: clamp(36px, 5vw, 64px);
  align-items: center;
  padding: clamp(104px, 16vh, 152px) 0 clamp(48px, 7vh, 88px);
}

@media (min-width: 60rem) {
  .hero {
    grid-template-columns: minmax(0, 7fr) minmax(0, 5fr);
  }
}

.hero__status {
  display: inline-flex;
  align-items: center;
  gap: 8px;
  margin-bottom: 20px;
  font-family: var(--font-mono);
  font-size: 0.6875rem;
  letter-spacing: 0.08em;
  text-transform: uppercase;
  color: var(--color-ink-2);
}

.hero__status-dot {
  width: 6px;
  height: 6px;
  border-radius: 50%;
  background: var(--color-accent);
  animation: caret-blink 2.4s ease-in-out infinite;
}

.hero__kicker {
  margin-bottom: 22px;
}

.hero__intro {
  margin-top: 26px;
  max-width: 46ch;
  font-size: var(--text-body);
  line-height: 1.6;
  color: var(--color-ink-2);
}

.hero__actions {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  gap: var(--spacing-24);
  margin-top: 36px;
}

.hero__meta {
  display: flex;
  flex-wrap: wrap;
  gap: 22px;
  margin-top: 40px;
  font-family: var(--font-mono);
  font-size: 0.75rem;
  color: var(--color-ink-3);
}

.hero__meta a {
  color: var(--color-ink-3);
}

.hero__meta a:hover {
  color: var(--color-accent-bright);
}

.hero__panel {
  position: relative;
  /* Own stacking context, so the cloud ParticleField (z-index -1) sits
     behind CodePanel here without reaching outside this box. */
  isolation: isolate;
  /* The intro tween drives this; declared so the compositor promotes the
     layer before the first frame rather than during it. */
  will-change: transform, opacity;
}
</style>
