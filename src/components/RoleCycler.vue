<script setup lang="ts">
import { computed, ref, watch } from 'vue'
import { gsap } from '@/motion/gsap'
import { useCycle } from '@/composables/useCycle'
import { usePrefersReducedMotion } from '@/composables/usePrefersReducedMotion'
import { roleTitles } from '@/data/portfolio'

const INTERVAL_MS = 2600

const prefersReducedMotion = usePrefersReducedMotion()

const { index, isRunning } = useCycle({
  length: roleTitles.length,
  intervalMs: INTERVAL_MS,
  enabled: computed(() => !prefersReducedMotion.value),
})

/** The three roles, rotated so the current one leads. */
const visibleRoles = computed(() =>
  roleTitles.map((_, offset) => {
    const role = roleTitles[(index.value + offset) % roleTitles.length]
    return {
      role,
      // Depth cue: the upcoming roles sit further back.
      opacity: offset === 0 ? 1 : offset === 1 ? 0.45 : 0.2,
    }
  }),
)

const allRoles = roleTitles.join(', ')

const progress = ref<HTMLElement | null>(null)

function onEnter(element: Element, done: () => void) {
  const lines = element.querySelectorAll<HTMLElement>('.roles__line')
  gsap.fromTo(
    lines,
    { autoAlpha: 0, y: 16, filter: 'blur(7px)' },
    {
      // Each line settles at its own depth opacity, so one tween covers all
      // three rather than three tweens covering one line each.
      autoAlpha: (_i, target: HTMLElement) => Number(target.dataset.opacity ?? 1),
      y: 0,
      filter: 'blur(0px)',
      duration: 0.75,
      stagger: 0.08,
      onComplete: done,
    },
  )
}

function onLeave(element: Element, done: () => void) {
  gsap.to(element.querySelectorAll('.roles__line'), {
    autoAlpha: 0,
    y: -12,
    filter: 'blur(7px)',
    duration: 0.2,
    onComplete: done,
  })
}

// Restart the meter whenever the role changes, so it always measures a full
// interval rather than whatever is left of the current one.
watch([index, isRunning], () => {
  if (!progress.value) return
  gsap.killTweensOf(progress.value)
  if (!isRunning.value) {
    gsap.set(progress.value, { scaleX: 0 })
    return
  }
  gsap.fromTo(
    progress.value,
    { scaleX: 0 },
    { scaleX: 1, duration: INTERVAL_MS / 1000, ease: 'none' },
  )
}, { immediate: true })
</script>

<template>
  <h1 class="roles">
    <!-- Stable accessible name: the visible stack re-renders every few
         seconds and would otherwise churn the accessibility tree. -->
    <span class="sr-only">{{ allRoles }}</span>

    <Transition mode="out-in" :css="false" @enter="onEnter" @leave="onLeave">
      <span :key="index" class="roles__stack" aria-hidden="true">
        <span
          v-for="entry in visibleRoles"
          :key="entry.role"
          class="roles__line"
          :data-opacity="entry.opacity"
        >
          {{ entry.role }}
        </span>
      </span>
    </Transition>
  </h1>

  <div class="roles__track">
    <div ref="progress" class="roles__progress"></div>
  </div>
</template>

<style scoped>
.roles {
  margin: 0;
  min-width: 0;
  overflow-wrap: anywhere;
  font-family: var(--font-display);
  /* Never bold — DESIGN.md's headlines are weight 400 at every scale;
     hierarchy comes from size and tracking, not weight. */
  font-weight: var(--font-weight-regular);
  /* Deliberately smaller than --text-display (48-113px): this heading
     shares a narrow copy column with the code panel, not a full-bleed
     row, and the longest role ("Systems Architect") wraps to two lines
     at --text-display across the whole desktop range. Three roles are
     stacked simultaneously (see visibleRoles below) for the depth cue,
     so a two-line wrap per role tripled the section's height and pushed
     the intro, CTAs and meta links below the fold. Measured against the
     narrowest (960px) and widest (1280px shell-max) two-column widths,
     this clamp keeps every role on one line with margin to spare. */
  font-size: clamp(2rem, 4.4vw, 3.75rem);
  line-height: 1.1;
  letter-spacing: var(--tracking-display);
}

.roles__stack {
  display: block;
}

.roles__line {
  display: block;
  /* Headlines are white, never the accent color (DESIGN.md: violet is a
     fill/button color). The receding lines keep their depth purely via
     the existing opacity custom prop. */
  color: var(--color-bone-white);
  will-change: transform, opacity, filter;
}

.roles__track {
  margin-top: 22px;
  height: 2px;
  width: min(320px, 100%);
  /* A faint wash, not a rule — this is a functional progress meter, not a
     structural divider, so it stays under the no-borders rule. */
  background: color-mix(in oklch, var(--color-bone-white) 12%, transparent);
  overflow: hidden;
}

.roles__progress {
  height: 100%;
  background: var(--color-accent);
  transform-origin: left center;
  transform: scaleX(0);
}
</style>
