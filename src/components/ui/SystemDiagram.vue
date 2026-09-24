<script setup lang="ts">
import { computed, onBeforeUnmount, onMounted, ref } from 'vue'
import { ariaLabelFor, captionFor, edges, litFor, nodes } from '@/data/diagram'
import { reduceActive } from '@/composables/diagramActive'
import type { ActiveAction } from '@/composables/diagramActive'
import { useDiagramTrace } from '@/composables/useDiagramTrace'

/**
 * The Kirimfresh.id backend, simplified, as the hero visual. The graph lives
 * in src/data/diagram.ts.
 *
 * Idle, motion has one job: show traffic moving through an event-driven
 * system. Edges draw in once, then a pulse travels each edge in request
 * order, all in CSS, so `prefers-reduced-motion` in base.css collapses it to
 * the finished drawing. Hover, keyboard focus, or a tap on a node lights it
 * and its neighbors and puts the node's note in the caption.
 */
const DEFAULT_CAPTION =
  'Kirimfresh.id backend, simplified. RabbitMQ carries order events, delivery tracking, and notifications.'

const root = ref<HTMLElement | null>(null)
const paused = ref(false)
const activeId = ref<string | null>(null)
const svg = ref<SVGSVGElement | null>(null)
const trace = useDiagramTrace(svg)
let observer: IntersectionObserver | undefined

/**
 * Written on pointerdown and consumed by the click that follows. A mouse
 * click comes after a hover that already lit the node; anything else (touch,
 * pen, or an assistive-technology click with no pointerdown) is a tap.
 */
let lastPointer = ''

/** The trace owns the lighting while it plays; otherwise the active node does. */
const lit = computed(() => {
  if (trace.tracing.value) return trace.lit.value
  return activeId.value ? litFor(activeId.value) : null
})

const caption = computed(
  () => trace.caption.value ?? (activeId.value ? captionFor(activeId.value) : DEFAULT_CAPTION),
)

function dispatch(action: ActiveAction) {
  const next = reduceActive(activeId.value, action)
  // Lighting a node is the reader taking over: stop the trace.
  if (next !== null && trace.tracing.value) trace.cancel()
  activeId.value = next
}

const isNodeDim = (id: string) => lit.value !== null && !lit.value.nodes.has(id)
const isEdgeDim = (id: string) => lit.value !== null && !lit.value.edges.has(id)

function onPointerEnter(event: PointerEvent, id: string) {
  if (event.pointerType === 'mouse') dispatch({ type: 'hover', id })
}

function onPointerLeave(event: PointerEvent, id: string) {
  if (event.pointerType === 'mouse') dispatch({ type: 'unhover', id })
}

function onPointerDown(event: PointerEvent) {
  lastPointer = event.pointerType
}

function onNodeClick(id: string) {
  if (lastPointer !== 'mouse') dispatch({ type: 'tap', id })
  lastPointer = ''
}

function onFocus(event: FocusEvent, id: string) {
  dispatch({ type: 'focus', id, keyboard: (event.target as Element).matches(':focus-visible') })
}

// A looping animation nobody can see is wasted work; stop it offscreen.
onMounted(() => {
  if (!root.value || typeof IntersectionObserver === 'undefined') return
  observer = new IntersectionObserver(([entry]) => {
    paused.value = !entry?.isIntersecting
  })
  observer.observe(root.value)
})

onBeforeUnmount(() => observer?.disconnect())
</script>

<template>
  <figure
    ref="root"
    class="diagram"
    :class="{ 'diagram--paused': paused, 'diagram--tracing': trace.tracing.value }"
    @keydown.esc="dispatch({ type: 'clear' })"
  >
    <svg
      ref="svg"
      class="diagram__svg"
      viewBox="0 0 340 356"
      role="group"
      aria-labelledby="diagram-title"
      aria-describedby="diagram-desc"
      @click="dispatch({ type: 'clear' })"
    >
      <title id="diagram-title">Kirimfresh.id backend architecture, simplified</title>
      <desc id="diagram-desc">
        Customers and the AI assistant call a Go (Fiber) API. The API reads and writes PostgreSQL, Redis,
        and Meilisearch, calls payment gateways, and publishes events to RabbitMQ, which sends
        notifications through Firebase FCM.
      </desc>

      <g class="diagram__edges">
        <path
          v-for="edge in edges"
          :key="edge.id"
          class="diagram__edge"
          :class="{ 'diagram__edge--dim': isEdgeDim(edge.id) }"
          :d="edge.d"
          pathLength="100"
          :style="{ '--phase': edge.phase }"
        />
      </g>

      <g class="diagram__pulses" aria-hidden="true">
        <path
          v-for="edge in edges"
          :key="edge.id"
          class="diagram__pulse"
          :class="{ 'diagram__pulse--off': isEdgeDim(edge.id) }"
          :d="edge.d"
          pathLength="100"
          :style="{ '--phase': edge.phase }"
        />
      </g>

      <g class="diagram__traces" aria-hidden="true">
        <path
          v-for="edge in edges"
          :key="edge.id"
          class="diagram__trace"
          :data-trace="edge.id"
          :d="edge.d"
          pathLength="100"
        />
      </g>

      <g
        v-for="node in nodes"
        :key="node.id"
        class="diagram__node"
        :class="{
          'diagram__node--core': node.id === 'api',
          'diagram__node--active': activeId === node.id,
          'diagram__node--dim': isNodeDim(node.id),
        }"
        :style="{ '--phase': node.phase }"
        role="button"
        tabindex="0"
        :aria-label="ariaLabelFor(node.id)"
        :aria-pressed="activeId === node.id"
        @pointerenter="onPointerEnter($event, node.id)"
        @pointerleave="onPointerLeave($event, node.id)"
        @pointerdown="onPointerDown"
        @click.stop="onNodeClick(node.id)"
        @focus="onFocus($event, node.id)"
        @blur="dispatch({ type: 'blur', id: node.id })"
        @keydown.enter.prevent="dispatch({ type: 'press', id: node.id })"
        @keydown.space.prevent="dispatch({ type: 'press', id: node.id })"
      >
        <!-- Invisible 4px bleed, so a node stays at least 36px tall to a
             finger at the diagram's 375px-viewport size. -->
        <rect class="diagram__hit" :x="node.x - 4" :y="node.y - 4" :width="node.w + 8" :height="node.h + 8" />
        <rect class="diagram__box" :x="node.x" :y="node.y" :width="node.w" :height="node.h" rx="5" />
        <template v-if="node.sub">
          <text :x="node.x + node.w / 2" :y="node.y + 20" class="diagram__label">{{ node.label }}</text>
          <text :x="node.x + node.w / 2" :y="node.y + 36" class="diagram__sub">{{ node.sub }}</text>
        </template>
        <text v-else :x="node.x + node.w / 2" :y="node.y + node.h / 2 + 4" class="diagram__label">
          {{ node.label }}
        </text>
      </g>
    </svg>

    <button type="button" class="link mono diagram__trace-button" @click="trace.play()">
      Trace a request
    </button>

    <figcaption class="diagram__caption mono" aria-live="polite">{{ caption }}</figcaption>
  </figure>
</template>

<style scoped>
.diagram {
  display: flex;
  flex-direction: column;
  gap: 14px;
  width: 100%;
  max-width: 420px;
  padding: 16px 16px 14px;
  background: var(--color-surface);
  border: 1px solid var(--color-rule);
  border-radius: var(--radius);
}

.diagram__svg {
  display: block;
  width: 100%;
  height: auto;
  overflow: visible;
}

.diagram__edge {
  fill: none;
  stroke: var(--color-rule-strong);
  stroke-width: 1;
  stroke-dasharray: 100;
  animation: diagram-draw 0.7s var(--ease-out) both;
  animation-delay: calc(var(--phase) * 150ms + 250ms);
}

/* One short dash per edge with a gap longer than the path, so exactly one
   pulse is ever visible. Dash offset 8 hides it before the start. */
.diagram__pulse {
  fill: none;
  stroke: var(--color-accent);
  stroke-width: 2;
  stroke-dasharray: 8 100;
  stroke-dashoffset: 8;
  animation: diagram-pulse 3.2s linear infinite both;
  animation-delay: calc(var(--phase) * 0.8s + 1.3s);
}

.diagram--paused .diagram__pulse {
  animation-play-state: paused;
}

.diagram__edge,
.diagram__pulse,
.diagram__box,
.diagram__label,
.diagram__sub {
  transition: opacity var(--dur-short) var(--ease-out);
}

/* Dimming goes on the children: the node <g> holds the diagram-fade
   animation with fill-mode both, which would fight an opacity set on it. */
.diagram__edge--dim,
.diagram__node--dim .diagram__box,
.diagram__node--dim .diagram__label,
.diagram__node--dim .diagram__sub {
  opacity: 0.35;
}

.diagram__pulse--off {
  opacity: 0;
}

.diagram__node {
  cursor: pointer;
}

.diagram__hit {
  fill: transparent;
  stroke: none;
}

/* The global outline does not follow an SVG group's shape; the box stroke does. */
.diagram__node:focus-visible {
  outline: none;
}

.diagram__node:focus-visible .diagram__box {
  stroke: var(--color-ink);
  stroke-width: 2;
}

.diagram__node--active .diagram__box {
  stroke: var(--color-accent);
}

/* Same dash geometry as the pulses; hidden at offset 8 until the trace
   timeline moves it. */
.diagram__trace {
  fill: none;
  stroke: var(--color-accent);
  stroke-width: 2;
  stroke-dasharray: 8 100;
  stroke-dashoffset: 8;
}

.diagram--tracing .diagram__pulse {
  opacity: 0;
  animation-play-state: paused;
}

.diagram__trace-button {
  align-self: flex-start;
  padding: 0;
  background: none;
  border: 0;
}

.diagram__node {
  animation: diagram-fade 0.5s var(--ease-out) both;
  animation-delay: calc(var(--phase) * 150ms);
}

.diagram__box {
  fill: var(--color-surface);
  stroke: var(--color-rule-strong);
  stroke-width: 1;
}

.diagram__node--core .diagram__box {
  stroke: var(--color-ink);
  stroke-width: 1.5;
}

.diagram__label,
.diagram__sub {
  font-family: var(--font-mono);
  text-anchor: middle;
}

.diagram__label {
  font-size: 11px;
  font-weight: 500;
  fill: var(--color-ink);
}

.diagram__sub {
  font-size: 10px;
  fill: var(--color-ink-3);
}

.diagram__caption {
  font-size: var(--text-xs);
  line-height: 1.5;
  color: var(--color-ink-3);
}

@keyframes diagram-draw {
  from {
    stroke-dashoffset: 100;
  }
  to {
    stroke-dashoffset: 0;
  }
}

@keyframes diagram-pulse {
  0% {
    stroke-dashoffset: 8;
  }
  30%,
  100% {
    stroke-dashoffset: -100;
  }
}

@keyframes diagram-fade {
  from {
    opacity: 0;
  }
}
</style>
