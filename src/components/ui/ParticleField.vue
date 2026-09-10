<script setup lang="ts">
/**
 * The site's signature visual — thousands of tiny outlined triangles in a
 * full chromatic spectrum (DESIGN.md: "Hero Constellation Visualization" /
 * "Ambient Particle Field"). Two variants share one canvas implementation:
 *
 * - `cloud`   — dense organic blob (hero backdrop, sits behind CodePanel).
 * - `ambient` — sparse page-wide drift, mounted once in App.vue.
 *
 * Perf notes (this is the one heavy visual on the page, so it has to earn
 * its keep):
 * - Each (color x size) triangle is rendered ONCE to an offscreen sprite
 *   canvas and then blitted with drawImage. Stroking ~1000 live paths a
 *   frame is what makes this pattern jank; blitting sprites does not.
 * - Particle count scales with viewport area, not a fixed number.
 * - The rAF loop only runs when the field is on-screen, the tab is
 *   visible, and the user has not asked for reduced motion — otherwise a
 *   single static frame is drawn once and the loop never starts.
 */
import { computed, onBeforeUnmount, onMounted, ref, watch } from 'vue'
import { usePrefersReducedMotion } from '@/composables/usePrefersReducedMotion'
import { readEnergy } from '@/motion/scrollEnergy'

const props = withDefaults(
  defineProps<{
    variant?: 'cloud' | 'ambient'
  }>(),
  { variant: 'cloud' },
)

const PALETTE = ['#8052ff', '#ffb829', '#15846e', '#c26bff', '#5b8dff'] as const
const SPRITE_SIZES = [3, 5, 7] as const

interface Particle {
  x: number // 0..1, fraction of canvas width
  y: number // 0..1, fraction of canvas height
  size: number // index into SPRITE_SIZES
  color: number // index into PALETTE
  baseOpacity: number
  driftX: number
  driftY: number
  driftPhase: number
  driftSpeed: number
  rotation: number
  rotationSpeed: number
}

const canvasRef = ref<HTMLCanvasElement | null>(null)
const rootRef = ref<HTMLDivElement | null>(null)
const prefersReducedMotion = usePrefersReducedMotion()

let ctx: CanvasRenderingContext2D | null = null
let sprites: HTMLCanvasElement[][] = [] // sprites[colorIndex][sizeIndex]
let particles: Particle[] = []
let width = 0
let height = 0
let dpr = 1
let rafId: number | null = null
let running = false
let visible = false
let resizeObserver: ResizeObserver | null = null
let intersectionObserver: IntersectionObserver | null = null
let lastTimestamp = 0
let elapsedSeconds = 0
/**
 * Scroll velocity, eased toward the live value so the field leans into a
 * flick and coasts back rather than snapping between frames.
 */
let smoothEnergy = 0

const isCloud = computed(() => props.variant === 'cloud')

function buildSprites() {
  sprites = PALETTE.map((color) =>
    SPRITE_SIZES.map((size) => {
      // Padding keeps the stroke from clipping at the sprite edge.
      const pad = 3
      const dim = size * 2 + pad * 2
      const sprite = document.createElement('canvas')
      sprite.width = dim
      sprite.height = dim
      const sctx = sprite.getContext('2d')!
      sctx.translate(dim / 2, dim / 2)
      sctx.beginPath()
      sctx.moveTo(0, -size)
      sctx.lineTo(size * 0.87, size * 0.5)
      sctx.lineTo(-size * 0.87, size * 0.5)
      sctx.closePath()
      sctx.strokeStyle = color
      sctx.lineWidth = size > 5 ? 1.5 : 1
      sctx.stroke()
      return sprite
    }),
  )
}

/**
 * Organic blob radius: sum of a few sine harmonics so the silhouette reads
 * as a cloud/brain shape rather than a perfect circle.
 */
function blobRadius(angle: number) {
  return (
    1 +
    0.22 * Math.sin(angle * 2.3 + 0.6) +
    0.14 * Math.sin(angle * 4.1 + 1.8) +
    0.09 * Math.sin(angle * 6.7 + 0.3)
  )
}

function buildParticles() {
  const area = width * height
  const isSmall = width < 720
  const coreCount = isCloud.value
    ? Math.round((isSmall ? 0.00055 : 0.00075) * area)
    : Math.round((isSmall ? 0.00006 : 0.00012) * area)
  const haloCount = isCloud.value ? Math.round(coreCount * 0.35) : 0

  const next: Particle[] = []

  const makeParticle = (x: number, y: number, weightToward: number): Particle => ({
    x,
    y,
    size: Math.random() < weightToward ? 0 : Math.random() < 0.6 ? 1 : 2,
    color: Math.floor(Math.random() * PALETTE.length),
    baseOpacity: 0.35 + Math.random() * 0.55,
    driftX: (Math.random() - 0.5) * 0.02,
    driftY: (Math.random() - 0.5) * 0.02,
    driftPhase: Math.random() * Math.PI * 2,
    driftSpeed: 0.15 + Math.random() * 0.25,
    rotation: Math.random() * Math.PI * 2,
    rotationSpeed: (Math.random() - 0.5) * 0.3,
  })

  if (isCloud.value) {
    // Core: organic blob centered right-of-frame (this variant fills the
    // hero's right column), filling most of the canvas height.
    const cx = 0.58
    const cy = 0.5
    const maxR = 0.46

    for (let i = 0; i < coreCount; i++) {
      const angle = Math.random() * Math.PI * 2
      // Bias toward the center so density is highest at the core, per
      // DESIGN.md's "forming an organic brain or cloud shape".
      const t = Math.pow(Math.random(), 0.55)
      const r = t * maxR * blobRadius(angle)
      const x = cx + Math.cos(angle) * r * (height / width)
      const y = cy + Math.sin(angle) * r
      if (x < -0.05 || x > 1.05 || y < -0.05 || y > 1.05) continue
      next.push(makeParticle(x, y, 0.5))
    }

    // Halo: scattered low-density particles outside the core, per
    // "Ambient Particle Field... outside the main constellation".
    for (let i = 0; i < haloCount; i++) {
      const p = makeParticle(Math.random(), Math.random(), 0.75)
      p.baseOpacity *= 0.4
      next.push(p)
    }
  } else {
    for (let i = 0; i < coreCount; i++) {
      const p = makeParticle(Math.random(), Math.random(), 0.8)
      p.baseOpacity *= 0.5
      next.push(p)
    }
  }

  particles = next
}

function resize() {
  const canvas = canvasRef.value
  const root = rootRef.value
  if (!canvas || !root) return

  const rect = root.getBoundingClientRect()
  width = Math.max(1, Math.round(rect.width))
  height = Math.max(1, Math.round(rect.height))
  dpr = Math.min(window.devicePixelRatio || 1, 2)

  canvas.width = Math.round(width * dpr)
  canvas.height = Math.round(height * dpr)
  canvas.style.width = `${width}px`
  canvas.style.height = `${height}px`

  ctx = canvas.getContext('2d')
  ctx?.setTransform(dpr, 0, 0, dpr, 0, 0)

  buildParticles()
  drawFrame(0)
}

function drawFrame(elapsedSeconds: number) {
  if (!ctx) return
  ctx.clearRect(0, 0, width, height)

  for (const p of particles) {
    const wobble = Math.sin(elapsedSeconds * p.driftSpeed + p.driftPhase)
    // Sprite size doubles as a depth cue: the larger triangles read as
    // nearer, so they lag further behind a scroll than the small ones.
    const depth = 0.4 + p.size * 0.45
    const px = (p.x + p.driftX * wobble) * width
    const py = (p.y + p.driftY * wobble) * height + smoothEnergy * 26 * depth
    const rotation = p.rotation + elapsedSeconds * p.rotationSpeed + smoothEnergy * 0.6 * depth
    const twinkle = 0.75 + 0.25 * Math.sin(elapsedSeconds * p.driftSpeed * 1.7 + p.driftPhase)

    const sprite = sprites[p.color]![p.size]!
    const half = sprite.width / 2

    ctx.save()
    ctx.globalAlpha = p.baseOpacity * twinkle
    ctx.translate(px, py)
    ctx.rotate(rotation)
    ctx.drawImage(sprite, -half, -half)
    ctx.restore()
  }
}

function tick(timestamp: number) {
  if (!running) return
  if (lastTimestamp) elapsedSeconds += (timestamp - lastTimestamp) / 1000
  lastTimestamp = timestamp
  // Read once per frame, not once per particle — this is a plain module
  // variable precisely so the hot loop pays nothing for it.
  smoothEnergy += (readEnergy() - smoothEnergy) * 0.06
  drawFrame(elapsedSeconds)
  rafId = requestAnimationFrame(tick)
}

function startLoop() {
  if (running || prefersReducedMotion.value) return
  running = true
  lastTimestamp = 0
  rafId = requestAnimationFrame(tick)
}

function stopLoop() {
  running = false
  if (rafId !== null) cancelAnimationFrame(rafId)
  rafId = null
}

function evaluateLoop() {
  if (visible && !document.hidden && !prefersReducedMotion.value) startLoop()
  else stopLoop()
}

function onVisibilityChange() {
  evaluateLoop()
}

let resizeTimer: number | null = null
function onContainerResize() {
  // Debounced: ResizeObserver can fire in bursts during an active drag-resize,
  // and rebuilding every particle on each tick is wasted work.
  if (resizeTimer !== null) window.clearTimeout(resizeTimer)
  resizeTimer = window.setTimeout(resize, 150)
}

onMounted(() => {
  buildSprites()
  resize()

  if (rootRef.value) {
    // Covers both container-driven resizes (cloud, nested in a flexible
    // layout) and viewport-driven ones (ambient, fixed to the viewport) —
    // no separate window resize listener needed.
    resizeObserver = new ResizeObserver(onContainerResize)
    resizeObserver.observe(rootRef.value)

    intersectionObserver = new IntersectionObserver(
      (entries) => {
        visible = entries.some((entry) => entry.isIntersecting)
        evaluateLoop()
      },
      { threshold: 0.01 },
    )
    intersectionObserver.observe(rootRef.value)
  }

  document.addEventListener('visibilitychange', onVisibilityChange)

  evaluateLoop()
})

// A live OS-level toggle of prefers-reduced-motion should stop/start the
// loop immediately, same as usePrefersReducedMotion does for RoleCycler
// and CodePanel's auto-advance.
watch(prefersReducedMotion, () => {
  if (prefersReducedMotion.value) drawFrame(elapsedSeconds)
  evaluateLoop()
})

onBeforeUnmount(() => {
  stopLoop()
  resizeObserver?.disconnect()
  intersectionObserver?.disconnect()
  document.removeEventListener('visibilitychange', onVisibilityChange)
  if (resizeTimer !== null) window.clearTimeout(resizeTimer)
})
</script>

<template>
  <div ref="rootRef" class="particle-field" :class="`particle-field--${variant}`" aria-hidden="true">
    <canvas ref="canvasRef"></canvas>
  </div>
</template>

<style scoped>
.particle-field {
  position: absolute;
  inset: 0;
  /* Negative, not 0/auto: a positioned decorative layer with z-index 0
     paints ABOVE ordinary static content (CSS2.1 painting order puts
     positioned z-index:0 descendants after in-flow ones), which would
     cover the section text it's meant to sit behind. The parent gives
     this its own stacking context (`isolation: isolate`), so -1 only
     reaches back to that boundary, not the whole document. */
  z-index: -1;
  pointer-events: none;
}

.particle-field--cloud {
  /* Bleeds past CodePanel's own box, so the cloud reads as surrounding
     it rather than being cropped to its exact rectangle. */
  inset: -20% -12%;
}

.particle-field--ambient {
  position: fixed;
}

.particle-field canvas {
  display: block;
}
</style>
