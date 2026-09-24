/**
 * The signal field: a fixed dot grid behind the page whose density bands
 * drift like a signal. Adapted from the "Signal Particles" background on
 * thegamechangers.id, keeping its look and removing its per-dot cost.
 *
 * Framework-free on purpose: the math is exported for the unit tests, and
 * nothing here knows about Vue. SignalField.vue owns the page wiring.
 */

/** Dots are drawn only above this summed wave value. */
const THRESHOLD = 0.1
/** Peak dot alpha, the reference's visible strength. */
const MAX_ALPHA = 0.6
/** Alpha is quantized into this many levels, one fill call each. */
export const LEVELS = 6

export interface AxisTerms {
  /** Per column i: sin(0.1i + 0.5t). */
  sinA: Float64Array
  /** Per column i: sin and cos of (0.05i + 0.8t). */
  sinC: Float64Array
  cosC: Float64Array
  /** Per row j, with j' = j + rowOffset: cos(0.1j' - 0.3t). */
  cosB: Float64Array
  /** Per row j: cos and sin of 0.05j'. */
  cosD: Float64Array
  sinD: Float64Array
}

/** The reference's per-dot formula. Kept for the tests; the draw loop never calls it. */
export function waveReference(i: number, jPrime: number, t: number): number {
  const nx = 0.1 * i
  const ny = 0.1 * jPrime
  return Math.sin(nx + 0.5 * t) * Math.cos(ny - 0.3 * t) + Math.sin(0.5 * nx - 0.5 * ny + 0.8 * t)
}

/**
 * Both waves split into column and row factors (the second through
 * sin(c - d) = sin c cos d - cos c sin d), so a frame costs about
 * 3 x (cols + rows) trig calls instead of 3 x cols x rows.
 */
export function buildAxisTerms(cols: number, rows: number, t: number, rowOffset: number): AxisTerms {
  const sinA = new Float64Array(cols + 1)
  const sinC = new Float64Array(cols + 1)
  const cosC = new Float64Array(cols + 1)
  for (let i = 0; i <= cols; i++) {
    sinA[i] = Math.sin(0.1 * i + 0.5 * t)
    const c = 0.05 * i + 0.8 * t
    sinC[i] = Math.sin(c)
    cosC[i] = Math.cos(c)
  }

  const cosB = new Float64Array(rows + 1)
  const cosD = new Float64Array(rows + 1)
  const sinD = new Float64Array(rows + 1)
  for (let j = 0; j <= rows; j++) {
    const jPrime = j + rowOffset
    cosB[j] = Math.cos(0.1 * jPrime - 0.3 * t)
    const d = 0.05 * jPrime
    cosD[j] = Math.cos(d)
    sinD[j] = Math.sin(d)
  }

  return { sinA, sinC, cosC, cosB, cosD, sinD }
}

export function valueAt(terms: AxisTerms, i: number, j: number): number {
  return terms.sinA[i] * terms.cosB[j] + terms.sinC[i] * terms.cosD[j] - terms.cosC[i] * terms.sinD[j]
}

/**
 * 0 for a skipped dot, otherwise 1..LEVELS. The epsilon keeps float noise
 * (0.30000000000000004 / 0.1) from bumping a dot up a level.
 */
export function alphaLevel(value: number): number {
  if (value <= THRESHOLD) return 0
  const alpha = Math.min(MAX_ALPHA, (value - THRESHOLD) * 0.8)
  return Math.min(LEVELS, Math.max(1, Math.ceil(alpha / 0.1 - 1e-9)))
}

/** The reference's hash, about 1.5% of dots. Screen indices, so a highlight never moves. */
export function isHighlight(i: number, j: number): boolean {
  return Math.abs(Math.sin(i * 12.34) * Math.cos(j * 56.78)) > 0.98
}

export interface SignalFieldColors {
  dot: string
  accent: string
}

/** The light-theme values of --color-ink-3 and --color-accent in base.css. */
export const FALLBACK_COLORS: SignalFieldColors = { dot: '#666666', accent: '#1a7f37' }

/** An empty custom property must never turn into invisible dots. */
export function resolveColors(read: (name: string) => string): SignalFieldColors {
  return {
    dot: read('--color-ink-3').trim() || FALLBACK_COLORS.dot,
    accent: read('--color-accent').trim() || FALLBACK_COLORS.accent,
  }
}

/** 16 px from the 60rem breakpoint up, 20 px below it: fewer dots where CPUs are weaker. */
export function spacingFor(width: number): number {
  return width >= 960 ? 16 : 20
}

export interface Size {
  width: number
  height: number
}

/**
 * Mobile browsers change the viewport height as their toolbar slides in and
 * out. Resizing the backing store clears it, so only rebuild when the width
 * changes or the height grows past what the grid already covers.
 */
export function shouldResize(prev: Size, next: Size): boolean {
  return next.width !== prev.width || next.height > prev.height
}

export interface SignalFieldOptions {
  colors: SignalFieldColors
  /** Returns window.scrollY. Read once per frame; no scroll listener. */
  getScroll: () => number
  /** Called once, after the first frame is on the canvas (the fade-in hook). */
  onFirstFrame?: () => void
}

export interface SignalField {
  start(): void
  stop(): void
  /** One frame at t = 0 and no scroll offset: the reduced-motion field. */
  drawOnce(): void
  resize(): void
  setColors(colors: SignalFieldColors): void
  destroy(): void
}

const DOT_RADIUS = 1.5
const TAU = Math.PI * 2
/** The bands move at this fraction of scroll speed: the page's parallax. */
const SCROLL_FACTOR = 0.3
/** The reference advances t by 0.02 per frame at 60 fps, 1.2 per second. */
const TIME_SCALE = 1.2
/** About 30 fps, with slack so rAF jitter on a 60 Hz display does not drop it to 20. */
const MIN_FRAME_GAP_MS = 29
const HIGHLIGHT_ALPHA = 0.9

export function createSignalField(canvas: HTMLCanvasElement, options: SignalFieldOptions): SignalField | null {
  const context = canvas.getContext('2d')
  if (!context) return null
  // Re-bound with an explicit type: narrowing from the null check does not
  // carry into the closures below.
  const ctx: CanvasRenderingContext2D = context

  let colors = options.colors
  let size: Size = { width: 0, height: 0 }
  let spacing = 16
  let cols = 0
  let rows = 0
  /** isHighlight per dot, computed once per grid instead of twice per dot per frame. */
  let highlights = new Uint8Array(0)
  let running = false
  let raf = 0
  let startedAt = 0
  let lastDrawAt = -Infinity
  let lastT = 0
  let lastScroll = 0
  let firstFrameDone = false

  function rebuild(next: Size) {
    size = next
    const dpr = Math.min(window.devicePixelRatio || 1, 2)
    canvas.width = Math.round(next.width * dpr)
    canvas.height = Math.round(next.height * dpr)
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0)

    spacing = spacingFor(next.width)
    cols = Math.floor(next.width / spacing)
    rows = Math.floor(next.height / spacing)
    highlights = new Uint8Array((cols + 1) * (rows + 1))
    for (let i = 0; i <= cols; i++) {
      for (let j = 0; j <= rows; j++) {
        highlights[i * (rows + 1) + j] = isHighlight(i, j) ? 1 : 0
      }
    }
  }

  function paint(t: number, scroll: number) {
    lastT = t
    lastScroll = scroll
    const { width, height } = size
    ctx.clearRect(0, 0, width, height)

    const offsetX = (width - cols * spacing) / 2
    const offsetY = (height - rows * spacing) / 2
    const terms = buildAxisTerms(cols, rows, t, (scroll * SCROLL_FACTOR) / spacing)
    const levels = Array.from({ length: LEVELS }, () => new Path2D())
    const accent = new Path2D()

    for (let i = 0; i <= cols; i++) {
      const x = offsetX + i * spacing
      for (let j = 0; j <= rows; j++) {
        const level = alphaLevel(valueAt(terms, i, j))
        if (level === 0) continue
        const y = offsetY + j * spacing
        const path = highlights[i * (rows + 1) + j] ? accent : levels[level - 1]
        // moveTo first, or each arc would be joined to the previous one by a line.
        path.moveTo(x + DOT_RADIUS, y)
        path.arc(x, y, DOT_RADIUS, 0, TAU)
      }
    }

    // One fill per alpha level instead of a fillStyle change per dot.
    ctx.fillStyle = colors.dot
    levels.forEach((path, index) => {
      ctx.globalAlpha = (index + 1) / 10
      ctx.fill(path)
    })
    ctx.globalAlpha = HIGHLIGHT_ALPHA
    ctx.fillStyle = colors.accent
    ctx.fill(accent)
    ctx.globalAlpha = 1

    if (!firstFrameDone) {
      firstFrameDone = true
      options.onFirstFrame?.()
    }
  }

  function frame(now: number) {
    raf = requestAnimationFrame(frame)
    if (now - lastDrawAt < MIN_FRAME_GAP_MS) return
    lastDrawAt = now
    paint(((now - startedAt) / 1000) * TIME_SCALE, options.getScroll())
  }

  function measure(): Size {
    return { width: canvas.clientWidth, height: canvas.clientHeight }
  }

  function stop() {
    running = false
    cancelAnimationFrame(raf)
  }

  rebuild(measure())

  return {
    start() {
      if (running) return
      running = true
      // Resume from the last frame's time, so a tab coming back does not jump the bands.
      startedAt = performance.now() - (lastT / TIME_SCALE) * 1000
      raf = requestAnimationFrame(frame)
    },
    stop,
    drawOnce() {
      paint(0, 0)
    },
    resize() {
      const next = measure()
      if (!shouldResize(size, next)) return
      rebuild(next)
      // Resizing cleared the canvas. A running loop repaints on its next frame;
      // a stopped one (reduced motion, hidden tab) has to repaint now.
      if (!running && firstFrameDone) paint(lastT, lastScroll)
    },
    setColors(next) {
      colors = next
      if (!running && firstFrameDone) paint(lastT, lastScroll)
    },
    destroy: stop,
  }
}
