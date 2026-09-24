<script setup lang="ts">
import { onBeforeUnmount, onMounted, ref } from 'vue'
import { createSignalField, resolveColors } from '@/motion/signalField'
import type { SignalField } from '@/motion/signalField'

/**
 * The page's background layer (DESIGN.md motif 5). The server renders an
 * empty canvas; drawing starts on the client once the page is idle, so it
 * never competes with hydration or the first contentful paint.
 */
const canvas = ref<HTMLCanvasElement | null>(null)
const ready = ref(false)

let field: SignalField | null = null
let hasIdle = false
let idleHandle: number | undefined
let resizeTimer: number | undefined
let resizeObserver: ResizeObserver | undefined
let themeObserver: MutationObserver | undefined
let reducedQuery: MediaQueryList | undefined
let schemeQuery: MediaQueryList | undefined

function readColors() {
  const style = getComputedStyle(document.documentElement)
  return resolveColors((name) => style.getPropertyValue(name))
}

/** Loop when motion is allowed and the tab is visible; otherwise one static frame. */
function run() {
  if (!field) return
  if (reducedQuery?.matches) {
    field.stop()
    field.drawOnce()
  } else if (!document.hidden) {
    field.start()
  }
}

function onVisibility() {
  if (document.hidden) field?.stop()
  else run()
}

function onThemeChange() {
  field?.setColors(readColors())
}

function onResize() {
  window.clearTimeout(resizeTimer)
  resizeTimer = window.setTimeout(() => field?.resize(), 150)
}

function begin(el: HTMLCanvasElement) {
  idleHandle = undefined
  field = createSignalField(el, {
    colors: readColors(),
    getScroll: () => window.scrollY,
    onFirstFrame: () => {
      ready.value = true
    },
  })
  // No 2D context: render nothing, the page stays plain paper.
  if (!field) return

  reducedQuery = window.matchMedia('(prefers-reduced-motion: reduce)')
  reducedQuery.addEventListener('change', run)

  // useTheme() keeps its state per call, so the header's toggle is only
  // visible here through the attribute it writes on <html>.
  themeObserver = new MutationObserver(onThemeChange)
  themeObserver.observe(document.documentElement, { attributes: true, attributeFilter: ['data-theme'] })
  schemeQuery = window.matchMedia('(prefers-color-scheme: dark)')
  schemeQuery.addEventListener('change', onThemeChange)

  document.addEventListener('visibilitychange', onVisibility)

  if (typeof ResizeObserver !== 'undefined') {
    resizeObserver = new ResizeObserver(onResize)
    resizeObserver.observe(el)
  } else {
    window.addEventListener('resize', onResize)
  }

  run()
}

onMounted(() => {
  const el = canvas.value
  if (!el) return
  hasIdle = typeof window.requestIdleCallback === 'function'
  idleHandle = hasIdle
    ? window.requestIdleCallback(() => begin(el), { timeout: 1000 })
    : window.setTimeout(() => begin(el), 200)
})

onBeforeUnmount(() => {
  if (idleHandle !== undefined) {
    if (hasIdle) window.cancelIdleCallback(idleHandle)
    else window.clearTimeout(idleHandle)
  }
  window.clearTimeout(resizeTimer)
  resizeObserver?.disconnect()
  window.removeEventListener('resize', onResize)
  themeObserver?.disconnect()
  schemeQuery?.removeEventListener('change', onThemeChange)
  reducedQuery?.removeEventListener('change', run)
  document.removeEventListener('visibilitychange', onVisibility)
  field?.destroy()
  field = null
})
</script>

<template>
  <canvas
    ref="canvas"
    class="signal-field"
    :class="{ 'signal-field--ready': ready }"
    aria-hidden="true"
  ></canvas>
</template>

<style scoped>
.signal-field {
  position: fixed;
  top: 0;
  left: 0;
  z-index: 0;
  display: block;
  /* 100%, not 100vw: vw includes a desktop scrollbar and would overflow. */
  width: 100%;
  height: 100vh;
  /* The large viewport height does not change as a mobile toolbar slides. */
  height: 100lvh;
  pointer-events: none;
  opacity: 0;
  transition: opacity 600ms var(--ease-out);
}

.signal-field--ready {
  opacity: 1;
}
</style>
