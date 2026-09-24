<script setup lang="ts">
import { onBeforeUnmount, onMounted, ref } from 'vue'

/**
 * The Kirimfresh.id backend, simplified, as the hero visual. Every node is a
 * component the CV names; nothing here is decorative invention.
 *
 * Motion has one job: show traffic moving through an event-driven system,
 * which is the work itself. Edges draw in once, then a pulse travels each
 * edge in request order (callers, then the API's dependencies, then the
 * push notification). All of it is CSS, so `prefers-reduced-motion` in
 * base.css collapses it to the finished, static drawing.
 */

interface DiagramNode {
  id: string
  x: number
  y: number
  w: number
  h: number
  label: string
  sub?: string
  /** 0 = callers, 1 = API dependencies, 2 = downstream of the queue. */
  phase: number
}

interface DiagramEdge {
  id: string
  d: string
  phase: number
}

const nodes: DiagramNode[] = [
  { id: 'customers', x: 16, y: 16, w: 140, h: 36, label: 'Customers', phase: 0 },
  { id: 'assistant', x: 184, y: 16, w: 140, h: 36, label: 'AI assistant', phase: 0 },
  { id: 'api', x: 80, y: 92, w: 180, h: 48, label: 'API', sub: 'Go · Fiber', phase: 0 },
  { id: 'postgres', x: 16, y: 184, w: 94, h: 36, label: 'PostgreSQL', phase: 1 },
  { id: 'redis', x: 16, y: 240, w: 94, h: 36, label: 'Redis', phase: 1 },
  { id: 'meilisearch', x: 16, y: 296, w: 94, h: 36, label: 'Meilisearch', phase: 1 },
  { id: 'payments', x: 230, y: 184, w: 94, h: 36, label: 'Payments', phase: 1 },
  { id: 'rabbitmq', x: 230, y: 240, w: 94, h: 36, label: 'RabbitMQ', phase: 1 },
  { id: 'fcm', x: 230, y: 304, w: 94, h: 36, label: 'Firebase FCM', phase: 2 },
]

/** Orthogonal routes, drawn from caller to callee so pulses flow forward. */
const edges: DiagramEdge[] = [
  { id: 'customers-api', d: 'M86 52 V72 H150 V92', phase: 0 },
  { id: 'assistant-api', d: 'M254 52 V72 H190 V92', phase: 0 },
  { id: 'api-postgres', d: 'M130 140 V202 H110', phase: 1 },
  { id: 'api-redis', d: 'M130 140 V258 H110', phase: 1 },
  { id: 'api-meilisearch', d: 'M130 140 V314 H110', phase: 1 },
  { id: 'api-payments', d: 'M210 140 V202 H230', phase: 1 },
  { id: 'api-rabbitmq', d: 'M210 140 V258 H230', phase: 1 },
  { id: 'rabbitmq-fcm', d: 'M277 276 V304', phase: 2 },
]

const root = ref<HTMLElement | null>(null)
const paused = ref(false)
let observer: IntersectionObserver | undefined

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
  <figure ref="root" class="diagram" :class="{ 'diagram--paused': paused }">
    <svg
      class="diagram__svg"
      viewBox="0 0 340 356"
      role="img"
      aria-labelledby="diagram-title diagram-desc"
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
          :d="edge.d"
          pathLength="100"
          :style="{ '--phase': edge.phase }"
        />
      </g>

      <g
        v-for="node in nodes"
        :key="node.id"
        class="diagram__node"
        :class="{ 'diagram__node--core': node.id === 'api' }"
        :style="{ '--phase': node.phase }"
      >
        <rect :x="node.x" :y="node.y" :width="node.w" :height="node.h" rx="5" />
        <template v-if="node.sub">
          <text :x="node.x + node.w / 2" :y="node.y + 20" class="diagram__label">{{ node.label }}</text>
          <text :x="node.x + node.w / 2" :y="node.y + 36" class="diagram__sub">{{ node.sub }}</text>
        </template>
        <text v-else :x="node.x + node.w / 2" :y="node.y + node.h / 2 + 4" class="diagram__label">
          {{ node.label }}
        </text>
      </g>
    </svg>

    <figcaption class="diagram__caption mono">
      Kirimfresh.id backend, simplified. RabbitMQ carries order events, delivery tracking, and notifications.
    </figcaption>
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

.diagram__node {
  animation: diagram-fade 0.5s var(--ease-out) both;
  animation-delay: calc(var(--phase) * 150ms);
}

.diagram__node rect {
  fill: var(--color-surface);
  stroke: var(--color-rule-strong);
  stroke-width: 1;
}

.diagram__node--core rect {
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
