<script setup lang="ts">
import { computed, ref } from 'vue'
import { gsap } from '@/motion/gsap'
import { useCycle } from '@/composables/useCycle'
import { usePrefersReducedMotion } from '@/composables/usePrefersReducedMotion'
import { snippets } from '@/data/snippets'

const INTERVAL_MS = 7000

const prefersReducedMotion = usePrefersReducedMotion()

const { index, select, pause, resume } = useCycle({
  length: snippets.length,
  intervalMs: INTERVAL_MS,
  enabled: computed(() => !prefersReducedMotion.value),
})

const snippet = computed(() => snippets[index.value]!)

/**
 * Shared enter/leave for both swapping blocks: lines and badges arrive the
 * same way, only at different rhythms.
 */
function slideIn(selector: string, stagger: number) {
  return (element: Element, done: () => void) => {
    gsap.fromTo(
      element.querySelectorAll(selector),
      { autoAlpha: 0, x: -8 },
      { autoAlpha: 1, x: 0, duration: 0.32, stagger, onComplete: done },
    )
  }
}

function fadeOut(element: Element, done: () => void) {
  gsap.to(element, { autoAlpha: 0, duration: 0.12, onComplete: done })
}

const onLinesEnter = slideIn('.panel__line', 0.055)
const onBadgesEnter = slideIn('.panel__badge', 0.05)

const tabRefs = ref<HTMLButtonElement[]>([])

function setTabRef(el: unknown, position: number) {
  if (el instanceof HTMLButtonElement) tabRefs.value[position] = el
}

/** Roving focus, per the WAI-ARIA tabs pattern. */
function onTabKeydown(event: KeyboardEvent, position: number) {
  const lastIndex = snippets.length - 1
  let next: number | null = null

  if (event.key === 'ArrowRight') next = position === lastIndex ? 0 : position + 1
  else if (event.key === 'ArrowLeft') next = position === 0 ? lastIndex : position - 1
  else if (event.key === 'Home') next = 0
  else if (event.key === 'End') next = lastIndex

  if (next === null) return
  event.preventDefault()
  select(next)
  tabRefs.value[next]?.focus()
}
</script>

<template>
  <div class="panel" @mouseenter="pause" @mouseleave="resume" @focusin="pause" @focusout="resume">
    <div class="panel__bar">
      <span class="panel__file">{{ snippet.file }}</span>

      <div class="panel__tabs" role="tablist" aria-label="Code sample language">
        <button
          v-for="(item, position) in snippets"
          :key="item.id"
          :ref="(el) => setTabRef(el, position)"
          type="button"
          role="tab"
          :id="`code-tab-${item.id}`"
          :aria-controls="`code-panel-${item.id}`"
          :aria-selected="position === index"
          :tabindex="position === index ? 0 : -1"
          class="panel__tab"
          :class="{ 'panel__tab--active': position === index }"
          @click="select(position)"
          @keydown="onTabKeydown($event, position)"
        >
          {{ item.lang }}
        </button>
      </div>
    </div>

    <div
      :id="`code-panel-${snippet.id}`"
      class="panel__code"
      role="tabpanel"
      :aria-labelledby="`code-tab-${snippet.id}`"
      tabindex="0"
    >
      <Transition mode="out-in" :css="false" @enter="onLinesEnter" @leave="fadeOut">
        <div :key="snippet.id">
          <div
            v-for="(line, lineNumber) in snippet.lines"
            :key="lineNumber"
            class="panel__line"
          >
            <span v-for="(token, position) in line" :key="position" :class="`tok tok--${token.kind}`">{{ token.text }}</span>
            <span v-if="lineNumber === snippet.lines.length - 1" class="panel__caret" aria-hidden="true"></span>
          </div>
        </div>
      </Transition>
    </div>

    <div class="panel__badges">
      <Transition mode="out-in" :css="false" @enter="onBadgesEnter" @leave="fadeOut">
        <div :key="snippet.id" class="panel__badge-row">
          <span
            v-for="(badge, position) in snippet.badges"
            :key="badge"
            class="panel__badge"
            :class="{ 'panel__badge--lead': position === 0 }"
          >
            {{ badge }}
          </span>
        </div>
      </Transition>
    </div>
  </div>
</template>

<style scoped>
.panel {
  position: relative;
  /* No border, no card fill, no shadow (DESIGN.md: elements float on
     black with whitespace alone). A soft radial scrim keeps the code
     legible against the particle cloud sitting behind it. */
  padding: 22px 4px;
}

.panel::before {
  content: '';
  position: absolute;
  inset: -10%;
  z-index: -1;
  background: radial-gradient(ellipse at center, color-mix(in oklch, var(--color-void) 88%, transparent) 55%, transparent 100%);
}

.panel__bar {
  display: flex;
  align-items: center;
  flex-wrap: wrap;
  gap: 8px;
  padding: 0 16px 14px;
}

.panel__file {
  font-family: var(--font-mono);
  font-size: 0.6875rem;
  color: var(--color-ink-3);
  letter-spacing: 0.04em;
}

.panel__tabs {
  margin-left: auto;
  display: flex;
  gap: 18px;
}

.panel__tab {
  border: none;
  background: transparent;
  color: var(--color-ink-3);
  font-family: var(--font-mono);
  font-size: 0.625rem;
  letter-spacing: 0.08em;
  text-transform: uppercase;
  padding: 0;
  transition: color var(--dur-short) var(--ease-out);
}

.panel__tab:hover {
  color: var(--color-ink-2);
}

.panel__tab--active {
  color: var(--color-accent-bright);
}

.panel__code {
  padding: 8px 16px 22px;
  min-height: 302px;
  font-family: var(--font-mono);
  font-size: 0.8125rem;
  line-height: 1.85;
  color: var(--color-ink-2);
  overflow-x: auto;
}

.panel__line {
  white-space: pre;
  min-height: 1.85em;
}

.panel__caret {
  display: inline-block;
  width: 7px;
  height: 0.95em;
  margin-left: 3px;
  vertical-align: -2px;
  background: var(--color-accent);
  animation: caret-blink 1.1s step-end infinite;
}

/* Syntax palette drawn from the particle field's own chromatic spectrum,
   not the neutral grays a code theme would normally reach for. */
.tok--keyword {
  color: #c26bff;
}

.tok--fn {
  color: var(--color-accent-bright);
}

.tok--string {
  /* Lighter than --color-deep-verdant (4.56:1, right at the AA floor for
     13px text) so the token stays comfortably readable. */
  color: #1fa88c;
}

.tok--const {
  color: var(--color-warn);
}

.tok--comment {
  color: var(--color-ink-3);
}

.panel__badges {
  padding: 14px 16px 0;
}

.panel__badge-row {
  display: flex;
  flex-wrap: wrap;
  gap: 18px;
  font-family: var(--font-mono);
  font-size: 0.6875rem;
  letter-spacing: 0.02em;
  color: var(--color-ink-4);
}

.panel__badge--lead {
  color: var(--color-accent);
}
</style>
