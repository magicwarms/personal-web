<script setup lang="ts">
/**
 * A small hand-built signature mark — a core service with a handful of
 * satellites, the shape a distributed backend actually has. Redrawn in the
 * particle field's own visual language (DESIGN.md: outlined, sharp-edged
 * triangles in chromatic colors) so it reads as one system with the hero
 * constellation rather than a second, competing network graphic. Pure
 * inline SVG (Tier B), no external asset, decorative only.
 *
 * On scroll it assembles the way the thing it depicts comes up: the core
 * first, then the links out, then the satellites they reach.
 */
import { ref } from 'vue'
import { gsap } from '@/motion/gsap'
import { useSectionMotion } from '@/composables/useSectionMotion'

const CORE = { cx: 160, cy: 100, size: 30 }

const edges = [
  { x1: 160, y1: 100, x2: 55, y2: 45, opacity: 0.4 },
  { x1: 160, y1: 100, x2: 255, y2: 30, opacity: 0.28 },
  { x1: 160, y1: 100, x2: 275, y2: 145, opacity: 0.34 },
  { x1: 160, y1: 100, x2: 60, y2: 160, opacity: 0.22 },
]

const nodes = [
  { cx: 55, cy: 45, size: 11, color: '#ffb829', opacity: 0.75 },
  { cx: 255, cy: 30, size: 8, color: '#5b8dff', opacity: 0.55 },
  { cx: 275, cy: 145, size: 14, color: '#15846e', opacity: 0.65 },
  { cx: 60, cy: 160, size: 9, color: '#c26bff', opacity: 0.45 },
]

function trianglePoints(cx: number, cy: number, size: number) {
  const top = `${cx},${cy - size}`
  const right = `${cx + size * 0.87},${cy + size * 0.5}`
  const left = `${cx - size * 0.87},${cy + size * 0.5}`
  return `${top} ${right} ${left}`
}

const root = ref<HTMLElement | null>(null)

useSectionMotion(
  root,
  ({ reduceMotion }) => {
    const el = root.value
    if (!el) return

    const q = gsap.utils.selector(el)
    const core = q('.system-mark__core')
    const edgeEls = q('.system-mark__edge')
    const nodeEls = q<SVGPolygonElement>('.system-mark__node')

    if (reduceMotion) {
      gsap.set([...core, ...edgeEls, ...nodeEls], { drawSVG: '0% 100%', clearProps: 'transform' })
      return
    }

    const timeline = gsap.timeline({
      scrollTrigger: { trigger: el, start: 'top 80%', once: true },
    })

    timeline
      .to(core, {
        drawSVG: '0% 100%',
        scale: 1,
        duration: 0.7,
        svgOrigin: `${CORE.cx} ${CORE.cy}`,
      })
      .to(edgeEls, { drawSVG: '0% 100%', duration: 0.5, stagger: 0.08 }, '-=0.3')
      .to(
        nodeEls,
        {
          drawSVG: '0% 100%',
          scale: 1,
          duration: 0.5,
          ease: 'back.out(2)',
          stagger: 0.06,
          // Each triangle has to scale about its own centre, not the SVG's.
          svgOrigin: (_index, target: SVGPolygonElement) => target.dataset.origin ?? '160 100',
        },
        '-=0.35',
      )
      // Idle shimmer, so the mark keeps breathing rather than freezing solid
      // the moment it finishes drawing.
      .to(
        nodeEls,
        {
          opacity: (_index, target: SVGPolygonElement) =>
            Number(target.dataset.opacity ?? 0.5) * 0.45,
          duration: 3,
          ease: 'sine.inOut',
          repeat: -1,
          yoyo: true,
          stagger: { each: 0.4, from: 'random' },
        },
        '+=0.2',
      )
  },
  (el) => {
    const q = gsap.utils.selector(el)
    // DrawSVG needs a visible stroke to work with; every element here already
    // carries one, so the whole mark can start fully un-drawn.
    gsap.set(q('.system-mark__core, .system-mark__edge, .system-mark__node'), { drawSVG: '0% 0%' })
    gsap.set(q('.system-mark__core'), { scale: 0.8, svgOrigin: `${CORE.cx} ${CORE.cy}` })
    gsap.set(q<SVGPolygonElement>('.system-mark__node'), {
      scale: 0,
      svgOrigin: (_index, target: SVGPolygonElement) => target.dataset.origin ?? '160 100',
    })
  },
)
</script>

<template>
  <div ref="root" class="system-mark" aria-hidden="true">
    <svg viewBox="0 0 320 200" fill="none" xmlns="http://www.w3.org/2000/svg">
      <g class="system-mark__edges" stroke="var(--color-accent)" stroke-linecap="round" stroke-width="1.5">
        <line
          v-for="(edge, position) in edges"
          :key="position"
          class="system-mark__edge"
          :x1="edge.x1"
          :y1="edge.y1"
          :x2="edge.x2"
          :y2="edge.y2"
          :opacity="edge.opacity"
        />
      </g>
      <g class="system-mark__nodes" fill="none" stroke-linejoin="round">
        <polygon
          v-for="(node, position) in nodes"
          :key="position"
          class="system-mark__node"
          :points="trianglePoints(node.cx, node.cy, node.size)"
          :stroke="node.color"
          :opacity="node.opacity"
          :data-origin="`${node.cx} ${node.cy}`"
          :data-opacity="node.opacity"
          stroke-width="1.5"
        />
        <polygon
          class="system-mark__core"
          :points="trianglePoints(CORE.cx, CORE.cy, CORE.size)"
          stroke="var(--color-accent)"
          stroke-width="2"
        />
      </g>
    </svg>
  </div>
</template>

<style scoped>
.system-mark {
  display: flex;
  justify-content: center;
  padding-block: var(--spacing-36);
}

.system-mark svg {
  width: min(320px, 70vw);
  height: auto;
}
</style>
