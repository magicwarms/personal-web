<script setup lang="ts">
import { computed, ref } from 'vue'
import { AnimatePresence, motion } from 'motion-v'
import { useCycle } from '@/composables/useCycle'
import { usePrefersReducedMotion } from '@/composables/usePrefersReducedMotion'
import { codeLineVariants, staggerContainer } from '@/motion/presets'
import { snippets } from '@/data/snippets'

const INTERVAL_MS = 7000
const DRIFT_SECONDS = 11

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
  <motion.div
    class="panel"
    :animate="{ y: [0, -18, 0] }"
    :transition="{ duration: DRIFT_SECONDS, repeat: Infinity, ease: 'easeInOut' }"
    @mouseenter="pause"
    @mouseleave="resume"
    @focusin="pause"
    @focusout="resume"
  >
    <div class="panel__bar">
      <span class="panel__dot panel__dot--rose" aria-hidden="true"></span>
      <span class="panel__dot panel__dot--amber" aria-hidden="true"></span>
      <span class="panel__dot panel__dot--accent" aria-hidden="true"></span>

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
  </motion.div>
</template>

<style scoped>
.panel {
  border: 1px solid var(--accent-16);
  border-radius: var(--radius-lg);
  background: linear-gradient(180deg, rgba(14, 31, 30, 0.95), rgba(8, 20, 19, 0.95));
  box-shadow: 0 40px 90px -50px rgba(61, 219, 196, 0.35);
  overflow: hidden;
  will-change: transform;
}

.panel__bar {
  display: flex;
  align-items: center;
  flex-wrap: wrap;
  gap: 8px;
  padding: 12px 16px;
  border-bottom: 1px solid var(--accent-12);
}

.panel__dot {
  width: 9px;
  height: 9px;
  border-radius: 50%;
}

.panel__dot--rose {
  background: rgba(216, 138, 166, 0.75);
}

.panel__dot--amber {
  background: rgba(232, 197, 120, 0.6);
}

.panel__dot--accent {
  background: var(--accent-60);
}

.panel__file {
  margin-left: 8px;
  font-size: 11px;
  color: var(--text-dimmer);
  letter-spacing: 1px;
}

.panel__tabs {
  margin-left: auto;
  display: flex;
  gap: 6px;
}

.panel__tab {
  border: 1px solid var(--accent-14);
  border-radius: 5px;
  background: transparent;
  color: var(--text-dimmer);
  font-size: 10px;
  letter-spacing: 1.2px;
  text-transform: uppercase;
  padding: 5px 10px;
  transition:
    background-color 0.25s ease,
    border-color 0.25s ease,
    color 0.25s ease;
}

.panel__tab--active {
  border-color: rgba(61, 219, 196, 0.45);
  background: var(--accent-12);
  color: var(--accent);
}

.panel__code {
  padding: 22px 20px;
  min-height: 302px;
  font-size: 12.5px;
  line-height: 1.9;
  color: var(--text-muted);
  overflow-x: auto;
}

.panel__line {
  white-space: pre;
  min-height: 1.9em;
}

.panel__caret {
  display: inline-block;
  width: 7px;
  height: 0.95em;
  margin-left: 3px;
  vertical-align: -2px;
  background: var(--accent);
  animation: caret-blink 1.1s step-end infinite;
}

.tok--keyword {
  color: var(--rose);
}

.tok--fn {
  color: var(--accent);
}

.tok--string {
  color: var(--accent-bright);
}

.tok--const {
  color: var(--amber);
}

.tok--comment {
  color: var(--text-dimmer);
}

.panel__badges {
  padding: 12px 20px;
  border-top: 1px solid var(--accent-12);
}

.panel__badge-row {
  display: flex;
  flex-wrap: wrap;
  gap: 18px;
  font-size: 11px;
  letter-spacing: 1px;
  color: var(--text-dimmer);
}

.panel__badge--lead {
  color: var(--accent);
}
</style>
