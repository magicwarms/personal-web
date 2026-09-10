<script setup lang="ts">
import { ref } from 'vue'
import SectionHeading from './ui/SectionHeading.vue'
import { REVEAL_START, SplitText, gsap } from '@/motion/gsap'
import { useSectionMotion } from '@/composables/useSectionMotion'
import { profile } from '@/data/portfolio'

const root = ref<HTMLElement | null>(null)

const PHOTO_CLIP_HIDDEN = 'inset(0% 0% 100% 0% round 24px)'
const PHOTO_CLIP_SHOWN = 'inset(0% 0% 0% 0% round 24px)'

useSectionMotion(
  root,
  ({ isDesktop, reduceMotion }) => {
    const el = root.value
    if (!el) return

    const q = gsap.utils.selector(el)
    const photo = q('.about__photo')
    const identity = q('.about__name, .about__role, .about__location')

    if (reduceMotion) {
      gsap.set([...photo, ...identity, ...q('.about__copy, .about__languages')], {
        autoAlpha: 1,
        clearProps: 'transform,clipPath',
      })
      return
    }

    const timeline = gsap.timeline({
      scrollTrigger: { trigger: q('.about'), start: REVEAL_START, once: true },
    })

    timeline
      // The `round 24px` is load-bearing: without it the wipe squares off the
      // corner radius the portrait is supposed to keep.
      .to(photo, { clipPath: PHOTO_CLIP_SHOWN, scale: 1, autoAlpha: 1, duration: 0.9 }, 0)
      .to(identity, { autoAlpha: 1, y: 0, duration: 0.6, stagger: 0.06 }, 0.25)
      .to(q('.about__languages'), { autoAlpha: 1, y: 0, duration: 0.6 }, 0.7)

    q<HTMLElement>('.about__copy').forEach((paragraph, index) => {
      SplitText.create(paragraph, {
        type: 'lines',
        mask: 'lines',
        autoSplit: true,
        onSplit(self) {
          gsap.set(paragraph, { autoAlpha: 1 })
          return timeline.fromTo(
            self.lines,
            { yPercent: 100 },
            { yPercent: 0, duration: 0.7, stagger: 0.05 },
            0.3 + index * 0.12,
          )
        },
      })
    })

    if (!isDesktop) return

    // A slow counter-drift inside the frame, so the portrait sits in the page
    // rather than on it.
    gsap.fromTo(
      photo,
      { y: -14 },
      {
        y: 14,
        ease: 'none',
        scrollTrigger: {
          trigger: q('.about'),
          start: 'top bottom',
          end: 'bottom top',
          scrub: 0.8,
        },
      },
    )
  },
  (el) => {
    const q = gsap.utils.selector(el)
    gsap.set(q('.about__photo'), { clipPath: PHOTO_CLIP_HIDDEN, scale: 1.12, autoAlpha: 0 })
    gsap.set(q('.about__name, .about__role, .about__location, .about__languages'), {
      autoAlpha: 0,
      y: 12,
    })
    gsap.set(q('.about__copy'), { autoAlpha: 0 })
  },
)
</script>

<template>
  <section ref="root" id="about" class="section" aria-labelledby="about-heading">
    <SectionHeading id="about-heading" title="About" />

    <div class="about">
      <div class="about__identity">
        <img
          class="about__photo"
          :src="profile.photo"
          :alt="`Portrait of ${profile.name}`"
          width="116"
          height="116"
          loading="lazy"
          decoding="async"
        />
        <div>
          <p class="about__name">{{ profile.name }}</p>
          <p class="about__role">{{ profile.title }}</p>
          <p class="about__location">{{ profile.location }}</p>
        </div>
      </div>

      <div>
        <p v-for="(paragraph, position) in profile.about" :key="position" class="about__copy">
          {{ paragraph }}
        </p>
        <p class="about__languages">{{ profile.languages }}</p>
      </div>
    </div>
  </section>
</template>

<style scoped>
.section {
  padding-top: var(--section-pad);
}

.about {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(min(300px, 100%), 1fr));
  gap: clamp(32px, 5vw, 64px);
  margin-top: 44px;
  align-items: start;
}

.about__identity {
  display: flex;
  gap: 24px;
  align-items: center;
}

.about__photo {
  width: 116px;
  height: 116px;
  /* Team Member Card (DESIGN.md): rounded rectangle, no border/frame. */
  border-radius: var(--radius-3xl);
  object-fit: cover;
  flex: none;
}

.about__name {
  font-family: var(--font-display);
  font-size: var(--text-heading-xs);
  font-weight: var(--font-weight-regular);
  letter-spacing: var(--tracking-tight);
  color: var(--color-ink);
  line-height: 1.2;
}

.about__role {
  margin-top: 8px;
  font-family: var(--font-display);
  font-weight: var(--font-weight-semibold);
  font-size: var(--text-caption);
  color: var(--color-accent-bright);
  letter-spacing: var(--tracking-label);
  text-transform: uppercase;
  line-height: 1.5;
}

.about__location {
  margin-top: 6px;
  font-size: 0.75rem;
  color: var(--color-ink-3);
  line-height: 1.5;
}

.about__copy {
  color: var(--color-ink-2);
  font-weight: var(--font-weight-extralight);
  font-size: var(--text-body);
  line-height: 1.6;
}

.about__copy + .about__copy {
  margin-top: 18px;
}

.about__languages {
  margin-top: 18px;
  font-size: 0.8125rem;
  line-height: 1.8;
  color: var(--color-ink-3);
}
</style>
