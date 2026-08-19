<script setup lang="ts">
import { computed, ref } from 'vue'
import { AnimatePresence, motion } from 'motion-v'
import { useCycle } from '@/composables/useCycle'
import { usePrefersReducedMotion } from '@/composables/usePrefersReducedMotion'
import { codeLineVariants, staggerContainer } from '@/motion/presets'
import { snippets } from '@/data/snippets'

const INTERVAL_MS = 7000

const prefersReducedMotion = usePrefersReducedMotion()

const { index, select, pause, resume } = useCycle({
  length: snippets.length,
  intervalMs: INTERVAL_MS,
  enabled: computed(() => !prefersReducedMotion.value),
})

const snippet = computed(() => snippets[index.value]!)
const lineVariants = staggerContainer(0.055)
const badgeVariants = staggerContainer(0.05)

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
      <AnimatePresence mode="wait">
        <motion.div
          :key="snippet.id"
          :variants="lineVariants"
          initial="hidden"
          animate="visible"
          exit="exit"
        >
          <motion.div
            v-for="(line, lineNumber) in snippet.lines"
            :key="lineNumber"
            class="panel__line"
            :variants="codeLineVariants"
          >
            <span v-for="(token, position) in line" :key="position" :class="`tok tok--${token.kind}`">{{ token.text }}</span>
            <span v-if="lineNumber === snippet.lines.length - 1" class="panel__caret" aria-hidden="true"></span>
          </motion.div>
        </motion.div>
      </AnimatePresence>
    </div>

    <div class="panel__badges">
      <AnimatePresence mode="wait">
        <motion.div
          :key="snippet.id"
          class="panel__badge-row"
          :variants="badgeVariants"
          initial="hidden"
          animate="visible"
          exit="exit"
        >
          <motion.span
            v-for="(badge, position) in snippet.badges"
            :key="badge"
            class="panel__badge"
            :class="{ 'panel__badge--lead': position === 0 }"
            :variants="codeLineVariants"
          >
            {{ badge }}
          </motion.span>
        </motion.div>
      </AnimatePresence>
    </div>
  </div>
</template>

<style scoped>
.panel {
  border: 1px solid var(--color-rule);
  border-radius: var(--radius-lg);
  background: var(--color-paper-2);
  box-shadow: 0 24px 48px -32px oklch(8% 0.01 230 / 0.7);
  overflow: hidden;
}

.panel__bar {
  display: flex;
  align-items: center;
  flex-wrap: wrap;
  gap: 8px;
  padding: 12px 16px;
  border-bottom: 1px solid var(--color-rule);
}

.panel__file {
  font-family: var(--font-mono);
  font-size: 0.6875rem;
  color: var(--color-ink-4);
  letter-spacing: 0.04em;
}

.panel__tabs {
  margin-left: auto;
  display: flex;
  gap: 6px;
}

.panel__tab {
  border: 1px solid var(--color-rule);
  border-radius: var(--radius-xs);
  background: transparent;
  color: var(--color-ink-4);
  font-family: var(--font-mono);
  font-size: 0.625rem;
  letter-spacing: 0.08em;
  text-transform: uppercase;
  padding: 5px 10px;
  transition:
    background-color var(--dur-short) var(--ease-out),
    border-color var(--dur-short) var(--ease-out),
    color var(--dur-short) var(--ease-out);
}

.panel__tab:hover {
  color: var(--color-ink-2);
}

.panel__tab--active {
  border-color: var(--color-accent);
  background: var(--color-accent-a08);
  color: var(--color-accent);
}

.panel__code {
  padding: 22px 20px;
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

.tok--keyword {
  color: var(--color-alert);
}

.tok--fn {
  color: var(--color-accent);
}

.tok--string {
  color: var(--color-accent-bright);
}

.tok--const {
  color: var(--color-warn);
}

.tok--comment {
  color: var(--color-ink-4);
}

.panel__badges {
  padding: 12px 20px;
  border-top: 1px solid var(--color-rule);
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
