# Motion Layer Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Add a crafted motion layer to the portfolio: a whole-page Canvas 2D dot-wave background, an interactive system diagram with a request trace, active-section tracking in the nav and margin labels, hairline draw-in, and subtle hero depth.

**Architecture:** Pure, framework-free logic (wave math, diagram graph, highlight reducer, active-section picker) lives in small `.ts` modules with Node unit tests. Vue components only wire that logic to the DOM. Every GSAP effect goes through the existing `useSectionMotion` composable, which already handles scoping, font loading, reduced motion, and cleanup.

**Tech Stack:** Vue 3.5 (prerendered and hydrated), GSAP 3.15 with ScrollTrigger (registered in `src/motion/gsap.ts`), Canvas 2D, Node's built-in test runner through the already-installed `tsx`.

**Spec:** `docs/superpowers/specs/2026-09-24-motion-layer-design.md`

## Global Constraints

- No new runtime or dev dependencies. Tests use `node:test` plus the installed `tsx`. Lighthouse runs through `npx --yes lighthouse@12` as a one-off tool, never added to `package.json`.
- Node `>=22.12.0` (`package.json` engines); CI and Docker use Node 22.
- Import GSAP only from `@/motion/gsap`, never from `gsap` directly in components.
- The signal field uses only `--color-ink-3` and `--color-accent`. One accent color. No glows, gradients, or second accent.
- Prerender and hydration must match: any state that differs on the client (`activeId`, `ready`, `sectionId`, indicator position) starts at the same default on server and client and changes only in `onMounted` or later. Never touch `window` or `document` during `setup`.
- `prefers-reduced-motion: reduce`: one static frame of the field, nothing scroll-linked, everything rendered in its finished state.
- CSP in `server/index.ts` stays unchanged. No inline scripts.
- Every rendered claim comes from the CV or `src/data/portfolio.ts`. No em dashes in rendered copy.
- Verify both themes and a 375 px viewport for every visual change.
- Shell commands are prefixed with `rtk` (Andhana's global instruction).
- Every commit message ends with the line `Claude-Session: https://claude.ai/code/session_01J3y9YTqYkRowiXU6Ri1yGe`.
- Work on branch `andhana/feat/motion-layer`. Do not push or open a PR without Andhana's go-ahead.

## Review Focus

1. **A touch tap on a diagram node** fires focus and then click; the node must end highlighted, not toggle straight back off. Pinned by the `reduceActive` tap-sequence tests in Task 4.
2. **A mobile browser toolbar sliding in and out** changes the viewport height mid-scroll; the canvas must not rebuild or blank. Pinned by the `shouldResize` tests in Task 2.
3. **A theme toggle while the field is running or frozen (reduced motion)** must recolor the dots, and an empty custom property must never produce invisible dots. Pinned by the `resolveColors` test and the manual theme-toggle step in Task 2.
4. **A page opened mid-scroll** (reload restore, or a link to `/#contact`) and **a resize across 60rem after scrolling** must leave every rule that is on screen or above it drawn. Pinned by the manual deep-link and breakpoint steps in Task 7.
5. **"Trace a request" pressed repeatedly, or a node hovered mid-trace**, must never stack timelines or leave nodes dimmed. Pinned by the manual rapid-press step in Task 5.

Items 3 to 5 need a real browser; the repo has no DOM test harness and the spec rules out adding one, so their pins are explicit manual steps with expected results.

## File Structure

| File | Status | Responsibility |
|---|---|---|
| `tsconfig.test.json` | create | Type-checks test files with Node types, kept out of the browser config |
| `tsconfig.json` | modify | Excludes `src/**/*.test.ts` |
| `package.json` | modify | `test` script; `typecheck` also checks tests |
| `.github/workflows/deploy.yml` | modify | Runs `npm test` before the build |
| `src/motion/signalField.ts` | create | Wave math, sizing and color rules, and the Canvas 2D renderer |
| `src/motion/signalField.test.ts` | create | Math, sizing, and color tests |
| `src/components/ui/SignalField.vue` | create | Mounts the canvas; theme, visibility, resize, reduced motion |
| `src/App.vue` | modify | Mounts `SignalField`, layers `.page` above it, calls `useRuleDraw` |
| `src/styles/base.css` | modify | `.paper-fill`, `@property --draw`, pseudo-element rules |
| `src/components/*Section.vue`, `ProofStrip.vue`, `AppFooter.vue`, `ui/SectionHeading.vue` | modify | Paper fills; heading active state and progress hairline |
| `src/data/diagram.ts` | create | Diagram nodes, edges, neighbor map, captions, trace steps |
| `src/data/diagram.test.ts` | create | Graph, caption, sourcing, and trace tests |
| `src/composables/diagramActive.ts` | create | Pure highlight reducer |
| `src/composables/diagramActive.test.ts` | create | Reducer tests, including the tap sequence |
| `src/components/ui/SystemDiagram.vue` | modify | Highlight, caption, trace button, accessibility |
| `src/composables/useDiagramTrace.ts` | create | The trace timeline |
| `src/composables/useActiveSection.ts` | create | Shared active-section observer and `pickActive` |
| `src/composables/useActiveSection.test.ts` | create | `pickActive` tests |
| `src/components/AppHeader.vue` | modify | `aria-current` and the sliding indicator |
| `src/composables/useRuleDraw.ts` | create | Hairline draw-in |
| `src/components/ui/RevealItem.vue` | modify | Comment only (no longer "the only thing that moves on scroll") |
| `src/components/HeroSection.vue` | modify | Depth wrapper and scrub |
| `src/motion/gsap.ts` | modify | Comment only (what GSAP drives now) |
| `DESIGN.md` | modify | Dial, motif 5, Motion, Shape, Don't |

---

### Task 1: Test harness and signal field math

**Files:**
- Create: `tsconfig.test.json`
- Modify: `tsconfig.json` (add `exclude`)
- Modify: `package.json` (`scripts.test`, `scripts.typecheck`)
- Modify: `.github/workflows/deploy.yml` (test step after `npm ci`)
- Create: `src/motion/signalField.ts`
- Test: `src/motion/signalField.test.ts`

**Interfaces:**
- Consumes: nothing.
- Produces (`src/motion/signalField.ts`):
  - `const LEVELS = 6`
  - `interface AxisTerms { sinA: Float64Array; sinC: Float64Array; cosC: Float64Array; cosB: Float64Array; cosD: Float64Array; sinD: Float64Array }`
  - `waveReference(i: number, jPrime: number, t: number): number`
  - `buildAxisTerms(cols: number, rows: number, t: number, rowOffset: number): AxisTerms` (arrays of length `cols + 1` and `rows + 1`)
  - `valueAt(terms: AxisTerms, i: number, j: number): number`
  - `alphaLevel(value: number): number` (0 = skip, else 1..6)
  - `isHighlight(i: number, j: number): boolean`
  - npm script `test`

- [ ] **Step 1: Record the Lighthouse baseline (before any code change)**

The branch only holds docs so far, so this equals `main`. Run from the repo root in Git Bash:

```bash
rtk npm run build
```

Start the preview server in the background (keep it running for this step):

```bash
npm run preview -- --port 4173 --strictPort
```

Then, with `LH` pointing at the session scratchpad:

```bash
LH="C:/Users/ANDHAN~1/AppData/Local/Temp/claude/C--Users-Andhana-Utama-Documents-PROJECTS-personal-web/ff076220-6c36-43b3-b160-7bbdad7e564c/scratchpad/lighthouse"
mkdir -p "$LH"
for n in 1 2 3; do
  npx --yes lighthouse@12 http://localhost:4173/ --quiet --only-categories=performance --chrome-flags="--headless=new" --output=json --output-path="$LH/baseline-mobile-$n.json"
  npx --yes lighthouse@12 http://localhost:4173/ --quiet --only-categories=performance --preset=desktop --chrome-flags="--headless=new" --output=json --output-path="$LH/baseline-desktop-$n.json"
done
for f in "$LH"/baseline-*.json; do node -e "const r=require(process.argv[1]);console.log(process.argv[1].split('/').pop(), Math.round(r.categories.performance.score*100), 'CLS', r.audits['cumulative-layout-shift'].numericValue)" "$f"; done | tee "$LH/baseline.txt"
```

Expected: six lines of scores. Write the median mobile and median desktop score into `$LH/baseline.txt` as a last line, e.g. `median mobile 97 desktop 100`. Stop the preview server.

- [ ] **Step 2: Wire up the test runner**

Create `tsconfig.test.json`:

```json
{
  "extends": "./tsconfig.json",
  "compilerOptions": {
    "types": ["node"]
  },
  "include": ["src/**/*.test.ts"],
  "exclude": []
}
```

In `tsconfig.json`, add an `exclude` after `include`, so the browser config never sees `node:test`:

```json
  "include": ["src/**/*.ts", "src/**/*.vue", "vite.config.ts"],
  "exclude": ["src/**/*.test.ts"]
```

In `package.json` `scripts`, change `typecheck` and add `test`:

```json
    "typecheck": "vue-tsc --noEmit && tsc -p tsconfig.server.json --noEmit && tsc -p tsconfig.test.json --noEmit",
    "test": "node --import tsx --test \"src/**/*.test.ts\""
```

In `.github/workflows/deploy.yml`, directly after `- run: npm ci`, add:

```yaml
      # Unit tests for the pure motion and diagram logic (node:test via tsx).
      - run: npm test
```

- [ ] **Step 3: Write the failing tests**

Create `src/motion/signalField.test.ts`:

```ts
import { test } from 'node:test'
import assert from 'node:assert/strict'
import { alphaLevel, buildAxisTerms, isHighlight, valueAt, waveReference } from './signalField'

test('separable terms reproduce the reference wave', () => {
  const cols = 90
  const rows = 60
  const cases: Array<[number, number]> = [
    [0, 0],
    [3.7, 12.5],
    [812.4, 431.9],
  ]
  for (const [t, rowOffset] of cases) {
    const terms = buildAxisTerms(cols, rows, t, rowOffset)
    for (let i = 0; i <= cols; i += 7) {
      for (let j = 0; j <= rows; j += 5) {
        const diff = Math.abs(valueAt(terms, i, j) - waveReference(i, j + rowOffset, t))
        assert.ok(diff < 1e-9, `i=${i} j=${j} t=${t} diff=${diff}`)
      }
    }
  }
})

test('axis terms cover both grid edges', () => {
  const terms = buildAxisTerms(4, 3, 0, 0)
  assert.equal(terms.sinA.length, 5)
  assert.equal(terms.cosC.length, 5)
  assert.equal(terms.cosB.length, 4)
  assert.equal(terms.sinD.length, 4)
})

test('alphaLevel skips values at or below the threshold', () => {
  assert.equal(alphaLevel(0.1), 0)
  assert.equal(alphaLevel(-2), 0)
})

test('alphaLevel buckets alpha into six levels', () => {
  assert.equal(alphaLevel(0.1000001), 1)
  assert.equal(alphaLevel(0.225), 1) // alpha is exactly 0.1
  assert.equal(alphaLevel(0.35), 2)
  assert.equal(alphaLevel(0.475), 3) // alpha 0.30000000000000004 must not round up to 4
  assert.equal(alphaLevel(0.85), 6)
  assert.equal(alphaLevel(2), 6) // clamped at the 0.6 peak
})

test('highlights are rare', () => {
  let hits = 0
  let total = 0
  for (let i = 0; i <= 120; i++) {
    for (let j = 0; j <= 68; j++) {
      total++
      if (isHighlight(i, j)) hits++
    }
  }
  // 1.47% on a 1920 x 1080 grid at 16 px spacing.
  assert.ok(hits / total > 0.005 && hits / total < 0.03, `rate ${hits / total}`)
})
```

- [ ] **Step 4: Run the tests to verify they fail**

Run: `rtk npm run test`
Expected: FAIL, `Cannot find module` for `./signalField`.

- [ ] **Step 5: Write the math**

Create `src/motion/signalField.ts`:

```ts
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
```

- [ ] **Step 6: Run the tests to verify they pass**

Run: `rtk npm run test`
Expected: PASS, 5 tests.

Run: `rtk npm run typecheck`
Expected: no errors (all three configs).

- [ ] **Step 7: Commit**

```bash
rtk git add tsconfig.json tsconfig.test.json package.json .github/workflows/deploy.yml src/motion/signalField.ts src/motion/signalField.test.ts
rtk git commit -F - <<'EOF'
feat: add signal field wave math and a node:test harness

Separable form of the reference dot-wave formula, alpha levels, and
the highlight hash, with unit tests run by node --test through tsx.
CI runs the tests before the build.

Claude-Session: https://claude.ai/code/session_01J3y9YTqYkRowiXU6Ri1yGe
EOF
```

---

### Task 2: Signal field renderer, component, and layering

**Files:**
- Modify: `src/motion/signalField.ts` (sizing and color helpers, renderer)
- Test: `src/motion/signalField.test.ts` (append)
- Create: `src/components/ui/SignalField.vue`
- Modify: `src/App.vue`

**Interfaces:**
- Consumes: everything Task 1 produced.
- Produces (`src/motion/signalField.ts`):
  - `interface SignalFieldColors { dot: string; accent: string }`
  - `const FALLBACK_COLORS: SignalFieldColors` (`#666666`, `#1a7f37`)
  - `resolveColors(read: (name: string) => string): SignalFieldColors`
  - `spacingFor(width: number): number` (16 at 960 px and up, else 20)
  - `interface Size { width: number; height: number }`
  - `shouldResize(prev: Size, next: Size): boolean`
  - `interface SignalFieldOptions { colors: SignalFieldColors; getScroll: () => number; onFirstFrame?: () => void }`
  - `interface SignalField { start(): void; stop(): void; drawOnce(): void; resize(): void; setColors(colors: SignalFieldColors): void; destroy(): void }`
  - `createSignalField(canvas: HTMLCanvasElement, options: SignalFieldOptions): SignalField | null`
- Produces: `<SignalField />` component, mounted once in `App.vue`.

- [ ] **Step 1: Write the failing tests**

Append to `src/motion/signalField.test.ts`, and extend its import line to:

```ts
import {
  FALLBACK_COLORS,
  alphaLevel,
  buildAxisTerms,
  isHighlight,
  resolveColors,
  shouldResize,
  spacingFor,
  valueAt,
  waveReference,
} from './signalField'
```

```ts
test('spacingFor switches at the 60rem breakpoint', () => {
  assert.equal(spacingFor(959), 20)
  assert.equal(spacingFor(960), 16)
})

test('shouldResize ignores a mobile toolbar shrinking the height', () => {
  assert.equal(shouldResize({ width: 390, height: 844 }, { width: 390, height: 780 }), false)
  assert.equal(shouldResize({ width: 390, height: 844 }, { width: 390, height: 844 }), false)
})

test('shouldResize rebuilds when the height grows or the width changes', () => {
  assert.equal(shouldResize({ width: 390, height: 780 }, { width: 390, height: 844 }), true)
  assert.equal(shouldResize({ width: 390, height: 844 }, { width: 844, height: 390 }), true)
})

test('resolveColors trims values and falls back when a property is empty', () => {
  assert.deepEqual(resolveColors(() => ''), FALLBACK_COLORS)
  assert.deepEqual(resolveColors(() => '   '), FALLBACK_COLORS)
  assert.deepEqual(
    resolveColors((name) => (name === '--color-ink-3' ? ' #8f8f8f ' : '#3fb950')),
    { dot: '#8f8f8f', accent: '#3fb950' },
  )
})
```

- [ ] **Step 2: Run the tests to verify they fail**

Run: `rtk npm run test`
Expected: FAIL, `spacingFor`, `shouldResize`, `resolveColors`, `FALLBACK_COLORS` are not exported.

- [ ] **Step 3: Add the helpers and the renderer**

Append to `src/motion/signalField.ts`:

```ts
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
  const ctx = canvas.getContext('2d')
  if (!ctx) return null

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
```

- [ ] **Step 4: Run the tests to verify they pass**

Run: `rtk npm run test`
Expected: PASS, 9 tests.

- [ ] **Step 5: Create the component**

Create `src/components/ui/SignalField.vue`:

```vue
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
```

- [ ] **Step 6: Mount it behind the page**

In `src/App.vue`, add the import after the `AppFooter` import:

```ts
import SignalField from './components/ui/SignalField.vue'
```

Add `<SignalField />` as the first element of the template, before the skip link:

```vue
  <SignalField />
  <a class="skip-link" href="#main">Skip to content</a>
```

Replace the `.page` style block:

```css
/* Transparent so the fixed signal field shows through; body keeps the paper
   color underneath. The page sits one layer above the canvas. */
.page {
  position: relative;
  z-index: 1;
  min-height: 100dvh;
}
```

- [ ] **Step 7: Check it in the browser**

Run `rtk npm run typecheck` (expected: no errors). Start `npm run dev:web` in the background and open http://localhost:5173 in Chrome.

Expected, and check each:
- Gray dot bands drift slowly behind the whole page, with a few green dots. Scrolling shifts the bands at a slower rate than the content.
- The canvas fades in once, about 600 ms.
- Toggle the header theme button while the field runs: dots switch from `#666666` to `#8f8f8f` and green from `#1a7f37` to `#3fb950` immediately. (Review Focus 3.)
- In DevTools Rendering, emulate `prefers-reduced-motion: reduce` and reload: one still frame, bands do not move on scroll. Toggle the theme again: the still frame recolors. (Review Focus 3.)
- At 375 px wide, no horizontal scroll. Device toolbar in mobile mode, scroll up and down: the dots never blank or jump. (Review Focus 2.)
- Per-frame cost: in the console on a 1920 px wide window, run

```js
const { createSignalField, FALLBACK_COLORS } = await import('/src/motion/signalField.ts')
const c = document.createElement('canvas')
c.style.cssText = 'position:fixed;top:0;left:0;width:100%;height:100vh;visibility:hidden'
document.body.append(c)
const f = createSignalField(c, { colors: FALLBACK_COLORS, getScroll: () => 0 })
const t0 = performance.now(); for (let k = 0; k < 100; k++) f.drawOnce()
console.log('ms per frame', (performance.now() - t0) / 100); c.remove()
```

Expected: under 4 ms. Text still sits on dots here; Task 3 fixes that.

- [ ] **Step 8: Commit**

```bash
rtk git add src/motion/signalField.ts src/motion/signalField.test.ts src/components/ui/SignalField.vue src/App.vue
rtk git commit -F - <<'EOF'
feat: draw the signal field behind the page

Canvas 2D renderer with one fill per alpha level, a 30 fps cap, and a
static frame under reduced motion. Colors follow the theme through
<html data-theme>; the canvas ignores mobile toolbar height changes.

Claude-Session: https://claude.ai/code/session_01J3y9YTqYkRowiXU6Ri1yGe
EOF
```

---

### Task 3: Paper fills

**Files:**
- Modify: `src/styles/base.css` (add `.paper-fill`)
- Modify: `src/components/ui/SectionHeading.vue`, `src/components/HeroSection.vue`, `src/components/ProofStrip.vue`, `src/components/AppFooter.vue`, `src/components/WorkSection.vue`, `src/components/ExperienceSection.vue`, `src/components/AboutSection.vue`, `src/components/StackSection.vue`, `src/components/CredentialsSection.vue`, `src/components/ContactSection.vue`

**Interfaces:**
- Consumes: the signal field from Task 2 (for the visual check).
- Produces: the `.paper-fill` utility class, used again in Task 6 on `.heading`.

- [ ] **Step 1: Add the utility**

In `src/styles/base.css`, directly after the `@media (min-width: 60rem) { .section { … } }` block, add:

```css
/* Keeps text off the signal field. The spread shadow bleeds the paper 12px
   past the box without moving layout; it is a fill, not a visible shadow. */
.paper-fill {
  background: var(--color-paper);
  box-shadow: 0 0 0 12px var(--color-paper);
}
```

- [ ] **Step 2: Apply it**

Make exactly these class changes:

- `src/components/ui/SectionHeading.vue`: `<div class="heading">` becomes `<div class="heading paper-fill">`, and add `width: fit-content;` as the first declaration of `.heading`, so only the label is filled and dots stay visible in the rest of the label column.
- `src/components/HeroSection.vue`: `<div class="hero__copy">` becomes `<div class="hero__copy paper-fill">`.
- `src/components/ProofStrip.vue`: `<dl class="proof">` becomes `<dl class="proof paper-fill">`.
- `src/components/AppFooter.vue`: `<div class="shell footer__inner">` becomes `<div class="shell footer__inner paper-fill">`.
- `src/components/WorkSection.vue`: `<div class="work">` becomes `<div class="work paper-fill">`.
- `src/components/ExperienceSection.vue`: the bare `<div>` right after `<SectionHeading … />` becomes `<div class="paper-fill">`.
- `src/components/AboutSection.vue`: `<div class="about">` becomes `<div class="about paper-fill">`.
- `src/components/CredentialsSection.vue`: `<div class="credentials">` becomes `<div class="credentials paper-fill">`.
- `src/components/ContactSection.vue`: `<div class="contact">` becomes `<div class="contact paper-fill">`.
- `src/components/StackSection.vue`: the body is a bare `RevealItem`, which starts invisible below the fold, so wrap it and fill the wrapper (the fill is there before the reveal, as in every other section):

```vue
    <!-- Plain text in a spec table, so a recruiter can scan for keywords
         and a search can find them. -->
    <div class="paper-fill">
      <RevealItem>
        <dl class="spec">
          <div v-for="group in stackGroups" :key="group.id" class="spec__row">
            <dt class="spec__key">{{ group.label }}</dt>
            <dd class="spec__value">{{ group.items.join(', ') }}</dd>
          </div>
        </dl>
      </RevealItem>
    </div>
```

- [ ] **Step 3: Check it in the browser**

Run `rtk npm run typecheck` (expected: no errors). With `npm run dev:web` running, check http://localhost:5173 in both themes at 1440 px and 375 px:
- No body text, label, table, or form sits on dots.
- Dots show in the outer gutters, around each section label, in the vertical space between sections, and around the hero copy and diagram.
- The fills show no visible edge, border, or shadow in either theme.
- At 375 px there is no horizontal scroll.

- [ ] **Step 4: Commit**

```bash
rtk git add src/styles/base.css src/components
rtk git commit -F - <<'EOF'
feat: keep text on paper fills above the signal field

A .paper-fill utility with a 12px spread bleed on headings, section
bodies, hero copy, proof strip, and footer.

Claude-Session: https://claude.ai/code/session_01J3y9YTqYkRowiXU6Ri1yGe
EOF
```

---

### Task 4: Diagram highlight, caption, and accessibility

**Files:**
- Create: `src/data/diagram.ts`
- Test: `src/data/diagram.test.ts`
- Create: `src/composables/diagramActive.ts`
- Test: `src/composables/diagramActive.test.ts`
- Modify: `src/components/ui/SystemDiagram.vue` (full rewrite below)

**Interfaces:**
- Consumes: `projects` from `src/data/portfolio.ts` (test only).
- Produces (`src/data/diagram.ts`):
  - `interface DiagramNode { id; x; y; w; h; label; sub?; phase; note? }`, `interface DiagramEdge { id; from; to; d; phase }`
  - `nodes: DiagramNode[]`, `edges: DiagramEdge[]`, `nodeById: Map<string, DiagramNode>`, `edgeById: Map<string, DiagramEdge>`
  - `buildNeighbors(list: DiagramEdge[]): Map<string, Set<string>>`, `neighbors`
  - `joinLabels(labels: string[]): string`
  - `interface LitSet { nodes: ReadonlySet<string>; edges: ReadonlySet<string> }`, `litFor(id: string): LitSet`
  - `captionFor(id: string): string`, `ariaLabelFor(id: string): string`
- Produces (`src/composables/diagramActive.ts`):
  - `type ActiveAction`, `reduceActive(current: string | null, action: ActiveAction): string | null`

- [ ] **Step 1: Write the failing tests**

Create `src/data/diagram.test.ts`:

```ts
import { test } from 'node:test'
import assert from 'node:assert/strict'
import { ariaLabelFor, buildNeighbors, captionFor, edges, litFor, neighbors, nodeById, nodes } from './diagram'
import { projects } from './portfolio'

test('every edge joins two known nodes', () => {
  for (const edge of edges) {
    assert.ok(nodeById.has(edge.from), `${edge.id} from ${edge.from}`)
    assert.ok(nodeById.has(edge.to), `${edge.id} to ${edge.to}`)
  }
})

test('neighbors are symmetric and come from the edges', () => {
  assert.deepEqual(
    [...(neighbors.get('api') ?? [])].sort(),
    ['assistant', 'customers', 'meilisearch', 'payments', 'postgres', 'rabbitmq', 'redis'],
  )
  assert.deepEqual([...(neighbors.get('fcm') ?? [])], ['rabbitmq'])
  const built = buildNeighbors([{ id: 'a-b', from: 'a', to: 'b', d: '', phase: 0 }])
  assert.deepEqual([...(built.get('b') ?? [])], ['a'])
})

test('litFor lights a node, its neighbors, and only its own edges', () => {
  const lit = litFor('redis')
  assert.deepEqual([...lit.nodes].sort(), ['api', 'redis'])
  assert.deepEqual([...lit.edges], ['api-redis'])
})

test('captionFor uses the note, or lists connections when there is none', () => {
  assert.equal(captionFor('payments'), 'Payment gateway and third-party API integrations.')
  assert.equal(captionFor('postgres'), 'PostgreSQL: connects to API.')
  assert.equal(captionFor('fcm'), 'Firebase FCM: connects to RabbitMQ.')
  assert.equal(captionFor('nope'), '')
})

test('every note is a verbatim line from the Kirimfresh.id case study', () => {
  const did = projects.find((project) => project.id === 'kirimfresh')?.did ?? []
  assert.ok(did.length > 0)
  const withNotes = nodes.filter((node) => node.note)
  assert.equal(withNotes.length, 4)
  for (const node of withNotes) {
    assert.ok(did.includes((node.note ?? '').replace(/\.$/, '')), `${node.id}: ${node.note}`)
  }
})

test('ariaLabelFor names the node and its connections', () => {
  assert.equal(ariaLabelFor('rabbitmq'), 'RabbitMQ, connected to API and Firebase FCM')
  assert.equal(ariaLabelFor('redis'), 'Redis, connected to API')
})
```

The `did` entries in `portfolio.ts` have no trailing period; each note is the same line with one added, which the `replace` strips before comparing.

Create `src/composables/diagramActive.test.ts`:

```ts
import { test } from 'node:test'
import assert from 'node:assert/strict'
import { reduceActive } from './diagramActive'
import type { ActiveAction } from './diagramActive'

const run = (actions: ActiveAction[], start: string | null = null) =>
  actions.reduce<string | null>(reduceActive, start)

test('a tap (non-keyboard focus, then tap) leaves the node highlighted', () => {
  assert.equal(run([{ type: 'focus', id: 'redis', keyboard: false }, { type: 'tap', id: 'redis' }]), 'redis')
})

test('a second tap on the same node clears it', () => {
  assert.equal(run([{ type: 'tap', id: 'redis' }], 'redis'), null)
})

test('tapping another node moves the highlight', () => {
  assert.equal(
    run(
      [
        { type: 'blur', id: 'redis' },
        { type: 'focus', id: 'api', keyboard: false },
        { type: 'tap', id: 'api' },
      ],
      'redis',
    ),
    'api',
  )
})

test('keyboard focus highlights and tabbing moves it', () => {
  assert.equal(run([{ type: 'focus', id: 'api', keyboard: true }]), 'api')
  assert.equal(
    run([{ type: 'blur', id: 'api' }, { type: 'focus', id: 'redis', keyboard: true }], 'api'),
    'redis',
  )
})

test('Enter or Space toggles', () => {
  assert.equal(run([{ type: 'press', id: 'api' }]), 'api')
  assert.equal(run([{ type: 'press', id: 'api' }], 'api'), null)
})

test('hover sets and leaving clears, but only for the same node', () => {
  assert.equal(run([{ type: 'hover', id: 'api' }]), 'api')
  assert.equal(run([{ type: 'unhover', id: 'api' }], 'api'), null)
  assert.equal(run([{ type: 'unhover', id: 'redis' }], 'api'), 'api')
  assert.equal(run([{ type: 'blur', id: 'redis' }], 'api'), 'api')
})

test('clear always resets', () => {
  assert.equal(run([{ type: 'clear' }], 'api'), null)
})
```

- [ ] **Step 2: Run the tests to verify they fail**

Run: `rtk npm run test`
Expected: FAIL, `Cannot find module` for `./diagram` and `./diagramActive`.

- [ ] **Step 3: Write the diagram data**

Create `src/data/diagram.ts` (the node and edge geometry is unchanged from `SystemDiagram.vue`; edges gain `from` and `to`):

```ts
/**
 * The Kirimfresh.id backend, simplified, as drawn in the hero. Every node is
 * a component the CV names; nothing here is decorative invention.
 *
 * Pure data and helpers with no Vue and no alias imports, so the unit tests
 * import it directly.
 */

export interface DiagramNode {
  id: string
  x: number
  y: number
  w: number
  h: number
  label: string
  sub?: string
  /** 0 = callers, 1 = API dependencies, 2 = downstream of the queue. */
  phase: number
  /**
   * Shown in the caption while the node is active. Each one is a line from
   * the Kirimfresh.id `did` list in portfolio.ts, and a unit test keeps it
   * that way. Nodes the CV says nothing specific about have no note.
   */
  note?: string
}

export interface DiagramEdge {
  id: string
  from: string
  to: string
  /** Orthogonal route, drawn from caller to callee so pulses flow forward. */
  d: string
  phase: number
}

export const nodes: DiagramNode[] = [
  { id: 'customers', x: 16, y: 16, w: 140, h: 36, label: 'Customers', phase: 0 },
  {
    id: 'assistant',
    x: 184,
    y: 16,
    w: 140,
    h: 36,
    label: 'AI assistant',
    phase: 0,
    note: 'A customer-facing AI assistant for recipe search, nutrition questions, product lookups, and support.',
  },
  {
    id: 'api',
    x: 80,
    y: 92,
    w: 180,
    h: 48,
    label: 'API',
    sub: 'Go · Fiber',
    phase: 0,
    note: 'Go (Fiber) services in a layered handler-service-repository design with dependency injection.',
  },
  { id: 'postgres', x: 16, y: 184, w: 94, h: 36, label: 'PostgreSQL', phase: 1 },
  { id: 'redis', x: 16, y: 240, w: 94, h: 36, label: 'Redis', phase: 1 },
  { id: 'meilisearch', x: 16, y: 296, w: 94, h: 36, label: 'Meilisearch', phase: 1 },
  {
    id: 'payments',
    x: 230,
    y: 184,
    w: 94,
    h: 36,
    label: 'Payments',
    phase: 1,
    note: 'Payment gateway and third-party API integrations.',
  },
  {
    id: 'rabbitmq',
    x: 230,
    y: 240,
    w: 94,
    h: 36,
    label: 'RabbitMQ',
    phase: 1,
    note: 'RabbitMQ event processing for order events, delivery tracking, and notifications via Firebase FCM.',
  },
  { id: 'fcm', x: 230, y: 304, w: 94, h: 36, label: 'Firebase FCM', phase: 2 },
]

export const edges: DiagramEdge[] = [
  { id: 'customers-api', from: 'customers', to: 'api', d: 'M86 52 V72 H150 V92', phase: 0 },
  { id: 'assistant-api', from: 'assistant', to: 'api', d: 'M254 52 V72 H190 V92', phase: 0 },
  { id: 'api-postgres', from: 'api', to: 'postgres', d: 'M130 140 V202 H110', phase: 1 },
  { id: 'api-redis', from: 'api', to: 'redis', d: 'M130 140 V258 H110', phase: 1 },
  { id: 'api-meilisearch', from: 'api', to: 'meilisearch', d: 'M130 140 V314 H110', phase: 1 },
  { id: 'api-payments', from: 'api', to: 'payments', d: 'M210 140 V202 H230', phase: 1 },
  { id: 'api-rabbitmq', from: 'api', to: 'rabbitmq', d: 'M210 140 V258 H230', phase: 1 },
  { id: 'rabbitmq-fcm', from: 'rabbitmq', to: 'fcm', d: 'M277 276 V304', phase: 2 },
]

export const nodeById = new Map(nodes.map((node) => [node.id, node]))
export const edgeById = new Map(edges.map((edge) => [edge.id, edge]))

/** Both directions, in edge order. Derived, so there is no second copy of the graph. */
export function buildNeighbors(list: DiagramEdge[]): Map<string, Set<string>> {
  const map = new Map<string, Set<string>>()
  const link = (a: string, b: string) => {
    const set = map.get(a) ?? new Set<string>()
    set.add(b)
    map.set(a, set)
  }
  for (const edge of list) {
    link(edge.from, edge.to)
    link(edge.to, edge.from)
  }
  return map
}

export const neighbors = buildNeighbors(edges)

/** "A", "A and B", "A, B and C". */
export function joinLabels(labels: string[]): string {
  if (labels.length <= 1) return labels.join('')
  return `${labels.slice(0, -1).join(', ')} and ${labels.at(-1)}`
}

function neighborLabels(id: string): string[] {
  return [...(neighbors.get(id) ?? [])].map((other) => nodeById.get(other)?.label ?? other)
}

export interface LitSet {
  nodes: ReadonlySet<string>
  edges: ReadonlySet<string>
}

export function litFor(id: string): LitSet {
  return {
    nodes: new Set([id, ...(neighbors.get(id) ?? [])]),
    edges: new Set(edges.filter((edge) => edge.from === id || edge.to === id).map((edge) => edge.id)),
  }
}

export function captionFor(id: string): string {
  const node = nodeById.get(id)
  if (!node) return ''
  return node.note ?? `${node.label}: connects to ${joinLabels(neighborLabels(id))}.`
}

export function ariaLabelFor(id: string): string {
  const node = nodeById.get(id)
  if (!node) return ''
  return `${node.label}, connected to ${joinLabels(neighborLabels(id))}`
}
```

- [ ] **Step 4: Write the reducer**

Create `src/composables/diagramActive.ts`:

```ts
/**
 * Which diagram node is highlighted, as a pure reducer so the event-order
 * quirks are testable.
 *
 * The one that matters: a tap focuses a tabindex element and then clicks
 * it. If any focus highlighted and the click toggled, every tap would switch
 * the highlight on and straight back off. So focus only counts when it is
 * keyboard focus (:focus-visible), and a mouse click (which follows a hover)
 * dispatches nothing at all.
 */
export type ActiveAction =
  | { type: 'hover'; id: string }
  | { type: 'unhover'; id: string }
  | { type: 'focus'; id: string; keyboard: boolean }
  | { type: 'blur'; id: string }
  /** A touch or pen tap, or an assistive-technology click. */
  | { type: 'tap'; id: string }
  /** Enter or Space on a focused node. */
  | { type: 'press'; id: string }
  | { type: 'clear' }

export function reduceActive(current: string | null, action: ActiveAction): string | null {
  switch (action.type) {
    case 'hover':
      return action.id
    case 'unhover':
    case 'blur':
      return current === action.id ? null : current
    case 'focus':
      return action.keyboard ? action.id : current
    case 'tap':
    case 'press':
      return current === action.id ? null : action.id
    case 'clear':
      return null
  }
}
```

- [ ] **Step 5: Run the tests to verify they pass**

Run: `rtk npm run test`
Expected: PASS, 9 + 6 + 7 = 22 tests.

- [ ] **Step 6: Rewrite the component**

Replace all of `src/components/ui/SystemDiagram.vue` with:

```vue
<script setup lang="ts">
import { computed, onBeforeUnmount, onMounted, ref } from 'vue'
import { ariaLabelFor, captionFor, edges, litFor, nodes } from '@/data/diagram'
import { reduceActive } from '@/composables/diagramActive'
import type { ActiveAction } from '@/composables/diagramActive'

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
let observer: IntersectionObserver | undefined

/**
 * Written on pointerdown and consumed by the click that follows. A mouse
 * click comes after a hover that already lit the node; anything else (touch,
 * pen, or an assistive-technology click with no pointerdown) is a tap.
 */
let lastPointer = ''

const lit = computed(() => (activeId.value ? litFor(activeId.value) : null))
const caption = computed(() => (activeId.value ? captionFor(activeId.value) : DEFAULT_CAPTION))

function dispatch(action: ActiveAction) {
  activeId.value = reduceActive(activeId.value, action)
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
    :class="{ 'diagram--paused': paused }"
    @keydown.esc="dispatch({ type: 'clear' })"
  >
    <svg
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

    <figcaption class="diagram__caption mono" aria-live="polite">{{ caption }}</figcaption>
  </figure>
</template>
```

Keep the existing `<style scoped>` block, with these changes:

1. Replace the `.diagram__node rect { … }` selector with `.diagram__box { … }` (same declarations), and `.diagram__node--core rect` with `.diagram__node--core .diagram__box`. Otherwise the hit rect would be painted.
2. Add after `.diagram--paused .diagram__pulse { … }`:

```css
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
```

- [ ] **Step 7: Check it in the browser**

Run `rtk npm run typecheck` (expected: no errors). With `npm run dev:web` running:
- Mouse: hovering Redis lights Redis, API, and their edge; everything else fades to about 35%; the caption reads "Redis: connects to API." Moving off restores the default caption.
- Click Payments with the mouse: it stays lit while hovered (the click does not toggle it off).
- Touch (DevTools device mode): tap RabbitMQ and it lights and stays lit. Tap it again and it clears. Tap PostgreSQL and the highlight moves there. Tap empty diagram space and it clears. (Review Focus 1.)
- Keyboard: Tab reaches each node in order with a visible box outline, and each lights on focus. Enter toggles. Esc clears.
- Only the lit edges pulse while a node is active.
- With reduced motion emulated, highlighting still works.

- [ ] **Step 8: Commit**

```bash
rtk git add src/data/diagram.ts src/data/diagram.test.ts src/composables/diagramActive.ts src/composables/diagramActive.test.ts src/components/ui/SystemDiagram.vue
rtk git commit -F - <<'EOF'
feat: make the system diagram explorable

Hover, keyboard focus, or tap a node to light it and its neighbors;
the caption shows a line from the CV. Nodes are keyboard buttons,
and a pure reducer keeps a tap from toggling itself back off.

Claude-Session: https://claude.ai/code/session_01J3y9YTqYkRowiXU6Ri1yGe
EOF
```

---

### Task 5: Trace a request

**Files:**
- Modify: `src/data/diagram.ts` (append trace helpers)
- Test: `src/data/diagram.test.ts` (append)
- Create: `src/composables/useDiagramTrace.ts`
- Modify: `src/components/ui/SystemDiagram.vue`

**Interfaces:**
- Consumes: `edges`, `edgeById`, `nodeById`, `LitSet` from Task 4; `gsap` from `@/motion/gsap`.
- Produces (`src/data/diagram.ts`):
  - `traceSteps: string[][]`
  - `stepCaption(step: string[]): string`
  - `traceSummary(): string`
  - `nodesOnEdges(edgeIds: string[]): Set<string>`
- Produces (`src/composables/useDiagramTrace.ts`):
  - `useDiagramTrace(svg: Ref<SVGSVGElement | null>): { tracing: Ref<boolean>; lit: Ref<LitSet>; caption: Ref<string | null>; play(): void; cancel(): void }`

- [ ] **Step 1: Write the failing tests**

Append to `src/data/diagram.test.ts`, and extend its import to include `edgeById, nodesOnEdges, stepCaption, traceSteps, traceSummary`:

```ts
test('every trace step uses known edges that share one caller', () => {
  for (const step of traceSteps) {
    assert.ok(step.length > 0)
    const callers = new Set(step.map((id) => edgeById.get(id)?.from))
    assert.equal(callers.size, 1, step.join(','))
    for (const id of step) assert.ok(edgeById.has(id), id)
  }
})

test('stepCaption names the hop', () => {
  assert.equal(stepCaption(['customers-api']), 'Customers → API')
  assert.equal(stepCaption(['api-redis', 'api-postgres']), 'API → Redis, PostgreSQL')
  assert.equal(stepCaption(['nope']), '')
})

test('traceSummary lists every hop in order', () => {
  assert.equal(
    traceSummary(),
    'Customers → API; API → Redis, PostgreSQL; API → Payments; API → RabbitMQ; RabbitMQ → Firebase FCM',
  )
})

test('nodesOnEdges collects both ends', () => {
  assert.deepEqual([...nodesOnEdges(['api-redis', 'rabbitmq-fcm'])].sort(), ['api', 'fcm', 'rabbitmq', 'redis'])
})
```

- [ ] **Step 2: Run the tests to verify they fail**

Run: `rtk npm run test`
Expected: FAIL, `traceSteps`, `stepCaption`, `traceSummary`, `nodesOnEdges` are not exported.

- [ ] **Step 3: Add the trace data**

Append to `src/data/diagram.ts`:

```ts
/** One request through the system, in order. Edges in one step run together. */
export const traceSteps: string[][] = [
  ['customers-api'],
  ['api-redis', 'api-postgres'],
  ['api-payments'],
  ['api-rabbitmq'],
  ['rabbitmq-fcm'],
]

/** "API → Redis, PostgreSQL". Names the hop and makes no other claim. */
export function stepCaption(step: string[]): string {
  const hops = step.map((id) => edgeById.get(id)).filter((edge): edge is DiagramEdge => edge !== undefined)
  const first = hops[0]
  if (!first) return ''
  const from = nodeById.get(first.from)?.label ?? first.from
  const to = hops.map((edge) => nodeById.get(edge.to)?.label ?? edge.to).join(', ')
  return `${from} → ${to}`
}

/** The whole trace in one line, for reduced motion, where it lights all at once. */
export function traceSummary(): string {
  return traceSteps.map(stepCaption).join('; ')
}

export function nodesOnEdges(edgeIds: string[]): Set<string> {
  const ids = new Set<string>()
  for (const id of edgeIds) {
    const edge = edgeById.get(id)
    if (!edge) continue
    ids.add(edge.from)
    ids.add(edge.to)
  }
  return ids
}
```

- [ ] **Step 4: Run the tests to verify they pass**

Run: `rtk npm run test`
Expected: PASS, 26 tests.

- [ ] **Step 5: Write the trace composable**

Create `src/composables/useDiagramTrace.ts`:

```ts
import { onBeforeUnmount, ref } from 'vue'
import type { Ref } from 'vue'
import { gsap } from '@/motion/gsap'
import { edgeById, nodesOnEdges, stepCaption, traceSteps, traceSummary } from '@/data/diagram'
import type { LitSet } from '@/data/diagram'

/** Seconds a dash takes to cross one step's edges. Five steps: 2.5 s. */
const STEP_SECONDS = 0.5
const HOLD_SECONDS = 0.6
const REDUCED_HOLD_MS = 2000

const empty = (): LitSet => ({ nodes: new Set(), edges: new Set() })

/**
 * "Trace a request": one green dash per step, in request order, lighting
 * each node as the dash reaches it. The timeline lives in a gsap.context
 * scoped to the SVG; every play() and cancel() reverts it first, so presses
 * never stack. Under reduced motion there is no moving dash: the whole path
 * lights at once for two seconds.
 */
export function useDiagramTrace(svg: Ref<SVGSVGElement | null>) {
  const tracing = ref(false)
  const lit = ref<LitSet>(empty())
  const caption = ref<string | null>(null)

  let context: ReturnType<typeof gsap.context> | undefined
  let resetTimer: number | undefined

  function cancel() {
    context?.revert()
    context = undefined
    window.clearTimeout(resetTimer)
    tracing.value = false
    lit.value = empty()
    caption.value = null
  }

  function play() {
    const root = svg.value
    if (!root) return
    cancel()
    tracing.value = true

    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
      const all = traceSteps.flat()
      lit.value = { nodes: nodesOnEdges(all), edges: new Set(all) }
      caption.value = traceSummary()
      resetTimer = window.setTimeout(cancel, REDUCED_HOLD_MS)
      return
    }

    const firstCaller = edgeById.get(traceSteps[0]?.[0] ?? '')?.from
    lit.value = { nodes: new Set(firstCaller ? [firstCaller] : []), edges: new Set() }

    context = gsap.context(() => {
      const timeline = gsap.timeline({
        // Revert outside the timeline's own callback.
        onComplete: () => {
          resetTimer = window.setTimeout(cancel, 0)
        },
      })

      traceSteps.forEach((step, index) => {
        const label = `step${index}`
        timeline.addLabel(label)
        timeline.call(
          () => {
            caption.value = stepCaption(step)
            lit.value = { nodes: lit.value.nodes, edges: new Set([...lit.value.edges, ...step]) }
          },
          undefined,
          label,
        )
        for (const id of step) {
          const path = root.querySelector(`[data-trace="${id}"]`)
          if (!path) continue
          timeline.fromTo(
            path,
            { strokeDashoffset: 8 },
            { strokeDashoffset: -100, duration: STEP_SECONDS, ease: 'none' },
            label,
          )
        }
        timeline.call(
          () => {
            const reached = new Set(lit.value.nodes)
            for (const id of step) {
              const to = edgeById.get(id)?.to
              if (to) reached.add(to)
            }
            lit.value = { nodes: reached, edges: lit.value.edges }
          },
          undefined,
          `${label}+=${STEP_SECONDS}`,
        )
      })

      timeline.to({}, { duration: HOLD_SECONDS })
    }, root)
  }

  onBeforeUnmount(cancel)

  return { tracing, lit, caption, play, cancel }
}
```

- [ ] **Step 6: Wire it into the diagram**

In `src/components/ui/SystemDiagram.vue`:

Add the import:

```ts
import { useDiagramTrace } from '@/composables/useDiagramTrace'
```

After `const activeId = ref<string | null>(null)`, add:

```ts
const svg = ref<SVGSVGElement | null>(null)
const trace = useDiagramTrace(svg)
```

Replace the `lit`, `caption`, and `dispatch` definitions with:

```ts
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
```

In the template:
- Add `'diagram--tracing': trace.tracing.value` to the figure's class object: `:class="{ 'diagram--paused': paused, 'diagram--tracing': trace.tracing.value }"`.
- Add `ref="svg"` to the `<svg>`.
- After the `diagram__pulses` group, add the trace paths:

```vue
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
```

- Between `</svg>` and `<figcaption>` (the figcaption stays the figure's last child), add:

```vue
    <button type="button" class="link mono diagram__trace-button" @click="trace.play()">
      Trace a request
    </button>
```

Add to the `<style scoped>` block:

```css
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
```

- [ ] **Step 7: Check it in the browser**

Run `rtk npm run typecheck` (expected: no errors). With `npm run dev:web` running:
- Press "Trace a request": one green dash crosses Customers → API, then API → Redis and PostgreSQL together, then Payments, RabbitMQ, FCM. Nodes light as the dash reaches them, and the caption names each hop. The looping pulses pause. After about 3 s everything returns to idle.
- Press it 5 times quickly: exactly one dash is visible at any moment, and after the last press the page returns to idle with nothing dimmed. (Review Focus 5.)
- Mid-trace, hover a node: the trace stops, that node's highlight shows, and moving off restores the idle state with nothing left dimmed. (Review Focus 5.)
- With reduced motion emulated: pressing the button lights the whole path at once, the caption reads the `traceSummary` line, and after 2 s it resets.
- The button is reachable by Tab and has the link-style underline.

- [ ] **Step 8: Commit**

```bash
rtk git add src/data/diagram.ts src/data/diagram.test.ts src/composables/useDiagramTrace.ts src/components/ui/SystemDiagram.vue
rtk git commit -F - <<'EOF'
feat: trace one request through the system diagram

A GSAP timeline sends a single dash through the diagram in request
order and lights each node on arrival. Under reduced motion the whole
path lights at once.

Claude-Session: https://claude.ai/code/session_01J3y9YTqYkRowiXU6Ri1yGe
EOF
```

---

### Task 6: Active section in the nav and the margin labels

**Files:**
- Create: `src/composables/useActiveSection.ts`
- Test: `src/composables/useActiveSection.test.ts`
- Modify: `src/components/AppHeader.vue`
- Modify: `src/components/ui/SectionHeading.vue`

**Interfaces:**
- Consumes: `useSectionMotion` (existing), `gsap` from `@/motion/gsap`, `navItems` (existing).
- Produces (`src/composables/useActiveSection.ts`):
  - `pickActive(ids: readonly string[], hits: ReadonlySet<string>): string | null`
  - `useActiveSection(): { activeId: Readonly<Ref<string | null>> }`

- [ ] **Step 1: Write the failing test**

Create `src/composables/useActiveSection.test.ts`:

```ts
import { test } from 'node:test'
import assert from 'node:assert/strict'
import { pickActive } from './useActiveSection'

const order = ['work', 'experience', 'about', 'skills', 'credentials', 'contact']

test('no section in the band means none is active', () => {
  assert.equal(pickActive(order, new Set()), null)
})

test('the one section in the band is active', () => {
  assert.equal(pickActive(order, new Set(['about'])), 'about')
})

test('at a boundary the earlier section wins', () => {
  assert.equal(pickActive(order, new Set(['skills', 'about'])), 'about')
})

test('ids outside the section order are ignored', () => {
  assert.equal(pickActive(order, new Set(['hero'])), null)
})
```

- [ ] **Step 2: Run the test to verify it fails**

Run: `rtk npm run test`
Expected: FAIL, `Cannot find module` for `./useActiveSection`.

- [ ] **Step 3: Write the composable**

Create `src/composables/useActiveSection.ts`:

```ts
import { onBeforeUnmount, onMounted, readonly, ref } from 'vue'

/**
 * Which section the reader is in, shared by the header nav and every margin
 * label. One IntersectionObserver watches a band 1% tall, 40% down the
 * viewport; the section crossing it is the active one.
 *
 * Module-level and reference-counted: the first subscriber creates the
 * observer, the last one disconnects it. `activeId` is null on the server
 * and until the first observer callback, so hydration output matches.
 */
const activeId = ref<string | null>(null)
const intersecting = new Set<string>()
let order: string[] = []
let observer: IntersectionObserver | undefined
let subscribers = 0

/** The first section in document order that is in the band. */
export function pickActive(ids: readonly string[], hits: ReadonlySet<string>): string | null {
  return ids.find((id) => hits.has(id)) ?? null
}

function connect() {
  // No observer support: nothing is ever marked active, as before this feature.
  if (typeof IntersectionObserver === 'undefined') return
  const sections = Array.from(document.querySelectorAll<HTMLElement>('main section[id]'))
  order = sections.map((section) => section.id)
  const io = new IntersectionObserver(
    (entries) => {
      for (const entry of entries) {
        const id = (entry.target as HTMLElement).id
        if (entry.isIntersecting) intersecting.add(id)
        else intersecting.delete(id)
      }
      activeId.value = pickActive(order, intersecting)
    },
    { rootMargin: '-40% 0px -59% 0px' },
  )
  sections.forEach((section) => io.observe(section))
  observer = io
}

function disconnect() {
  observer?.disconnect()
  observer = undefined
  intersecting.clear()
  order = []
  activeId.value = null
}

export function useActiveSection() {
  // Mounted hooks run after the whole app is in the document, so every
  // section exists by the time the first subscriber connects.
  onMounted(() => {
    if (subscribers++ === 0) connect()
  })
  onBeforeUnmount(() => {
    if (--subscribers === 0) disconnect()
  })
  return { activeId: readonly(activeId) }
}
```

- [ ] **Step 4: Run the test to verify it passes**

Run: `rtk npm run test`
Expected: PASS, 30 tests.

- [ ] **Step 5: Header nav**

In `src/components/AppHeader.vue` `<script setup>`:

Change the vue import to `import { computed, onBeforeUnmount, onMounted, ref, watch } from 'vue'` and add:

```ts
import { useActiveSection } from '@/composables/useActiveSection'
```

After `const { theme, toggle: toggleTheme } = useTheme()`, add:

```ts
const { activeId } = useActiveSection()

/**
 * The green bar under the active nav link. Position comes from the link's
 * measured box, minus its padding, so the bar matches the text. It only
 * starts animating after its first placement; otherwise it would slide in
 * from the left edge on load.
 */
const links = ref<HTMLElement | null>(null)
const indicator = ref({ x: 0, w: 0, visible: false })
const indicatorReady = ref(false)
const indicatorStyle = computed(() => ({
  '--x': `${indicator.value.x}px`,
  '--w': String(indicator.value.w),
}))

function placeIndicator() {
  const id = activeId.value
  const link = id ? links.value?.querySelector<HTMLElement>(`[data-nav="${id}"]`) : null
  if (!link || link.offsetWidth === 0) {
    indicator.value = { ...indicator.value, visible: false }
    return
  }
  const style = getComputedStyle(link)
  const padLeft = parseFloat(style.paddingLeft)
  const padRight = parseFloat(style.paddingRight)
  indicator.value = {
    x: link.offsetLeft + padLeft,
    w: link.offsetWidth - padLeft - padRight,
    visible: true,
  }
  if (!indicatorReady.value) requestAnimationFrame(() => (indicatorReady.value = true))
}

watch(activeId, placeIndicator)
```

In `onMounted`, add at the end:

```ts
  window.addEventListener('resize', placeIndicator)
  // Web fonts change link widths; measure again once they are in.
  document.fonts?.ready.then(placeIndicator)
```

In `onBeforeUnmount`, add:

```ts
  window.removeEventListener('resize', placeIndicator)
```

Replace the desktop `<nav class="nav__links" …>` element with:

```vue
      <nav ref="links" class="nav__links" aria-label="Sections">
        <a
          v-for="item in navItems"
          :key="item.id"
          :href="`#${item.id}`"
          :data-nav="item.id"
          :aria-current="activeId === item.id ? 'location' : undefined"
        >
          {{ item.label }}
        </a>
        <span
          class="nav__indicator"
          :class="{
            'nav__indicator--visible': indicator.visible,
            'nav__indicator--ready': indicatorReady,
          }"
          :style="indicatorStyle"
          aria-hidden="true"
        ></span>
      </nav>
```

On the mobile sheet links (`class="nav-sheet__link"`), add `:aria-current="activeId === item.id ? 'location' : undefined"`.

Add to `<style scoped>`, after `.nav__links a:hover { … }`:

```css
.nav__links {
  position: relative;
}

.nav__links a[aria-current='location'] {
  color: var(--color-ink);
}

/* A 1px bar scaled to the link's width: transform-only, so moving it never
   triggers layout. Fades out on sections that have no nav link. */
.nav__indicator {
  position: absolute;
  left: 0;
  bottom: 6px;
  width: 1px;
  height: 2px;
  background: var(--color-accent);
  transform: translateX(var(--x, 0)) scaleX(var(--w, 0));
  transform-origin: left;
  opacity: 0;
  pointer-events: none;
  transition: opacity var(--dur-short) var(--ease-out);
}

.nav__indicator--visible {
  opacity: 1;
}

.nav__indicator--ready {
  transition:
    opacity var(--dur-short) var(--ease-out),
    transform 300ms var(--ease-out);
}

.nav-sheet__link[aria-current='location'] {
  color: var(--color-accent);
}
```

- [ ] **Step 6: Margin labels**

Replace all of `src/components/ui/SectionHeading.vue` with (this keeps Task 3's `paper-fill` and `width: fit-content`):

```vue
<script setup lang="ts">
import { computed, onMounted, ref } from 'vue'
import { gsap } from '@/motion/gsap'
import { useActiveSection } from '@/composables/useActiveSection'
import { useSectionMotion } from '@/composables/useSectionMotion'

defineProps<{
  /** Wired to the section's `aria-labelledby`. */
  id: string
  /** Two-digit section number, shown in mono above the title. */
  index: string
  title: string
}>()

const root = ref<HTMLElement | null>(null)
/** Read after mount, so server and client render the same inactive label. */
const sectionId = ref<string | null>(null)
const { activeId } = useActiveSection()
const isActive = computed(() => sectionId.value !== null && activeId.value === sectionId.value)

onMounted(() => {
  sectionId.value = root.value?.closest('section')?.id ?? null
})

// On wide screens the label is sticky; a short hairline under the index
// fills as the reader moves through its section.
useSectionMotion(root, ({ isDesktop, reduceMotion }) => {
  const section = root.value?.closest('section')
  if (!section || !isDesktop || reduceMotion) return
  gsap.fromTo(
    '.heading__progress',
    { scaleX: 0 },
    {
      scaleX: 1,
      ease: 'none',
      scrollTrigger: { trigger: section, start: 'top 40%', end: 'bottom 40%', scrub: true },
    },
  )
})
</script>

<template>
  <!-- The page's connective motif: a numbered margin label, like the
       sections of a design doc. It stays in view while its section scrolls
       past on wide screens, and marks itself while it is being read. -->
  <div ref="root" class="heading paper-fill" :class="{ 'heading--active': isActive }">
    <span class="heading__index mono" aria-hidden="true">{{ index }}</span>
    <span class="heading__progress" aria-hidden="true"></span>
    <h2 :id="id" class="heading__title">{{ title }}</h2>
  </div>
</template>

<style scoped>
.heading {
  width: fit-content;
  display: flex;
  flex-direction: column;
  gap: 6px;
  align-self: start;
}

@media (min-width: 60rem) {
  .heading {
    position: sticky;
    top: calc(var(--header-h) + 24px);
  }
}

.heading__index {
  color: var(--color-ink-3);
  transition: color var(--dur-short) var(--ease-out);
}

.heading__progress {
  display: none;
}

@media (min-width: 60rem) {
  .heading--active .heading__index {
    color: var(--color-accent);
  }
}

@media (min-width: 60rem) and (prefers-reduced-motion: no-preference) {
  .heading__progress {
    display: block;
    width: 48px;
    height: 1px;
    background: var(--color-accent);
    transform: scaleX(0);
    transform-origin: left;
  }
}

.heading__title {
  font-size: var(--text-h2);
  letter-spacing: var(--tracking-heading);
  line-height: 1.15;
  overflow-wrap: anywhere;
}
</style>
```

- [ ] **Step 7: Check it in the browser**

Run `rtk npm run typecheck` (expected: no errors). With `npm run dev:web` running at 1440 px:
- Scroll from top to bottom. In the hero no nav link is marked and the bar is hidden. From Selected work on, the bar slides under the matching link and that link turns ink. In Credentials the bar fades out. In Contact it returns.
- The active section's index number turns green, and the 48 px hairline under it fills from left to right as that section scrolls past.
- Click "Show 4 earlier roles" in Experience, then keep scrolling: the hairlines of later sections still start filling as their section reaches 40% of the viewport.
- At 375 px, open the menu: the current section's link is green. No hairline shows under the labels.
- Reduced motion emulated: the index still turns green, and no progress hairline is shown.
- Reload with DevTools open: no hydration mismatch warnings in the console. (The dev server does a plain mount; Task 9 repeats this check on the prerendered build.)

- [ ] **Step 8: Commit**

```bash
rtk git add src/composables/useActiveSection.ts src/composables/useActiveSection.test.ts src/components/AppHeader.vue src/components/ui/SectionHeading.vue
rtk git commit -F - <<'EOF'
feat: show the section being read in the nav and labels

One shared IntersectionObserver drives aria-current and a sliding
green bar in the header, a green index on the active label, and a
scrubbed progress hairline under it on desktop.

Claude-Session: https://claude.ai/code/session_01J3y9YTqYkRowiXU6Ri1yGe
EOF
```

---

### Task 7: Hairline draw-in

**Files:**
- Modify: `src/styles/base.css` (`@property --draw`, `.section`, `.spec`, `.spec__row`)
- Create: `src/composables/useRuleDraw.ts`
- Modify: `src/App.vue`
- Modify: `src/components/ui/RevealItem.vue` (comment only)

**Interfaces:**
- Consumes: `useSectionMotion`, `REVEAL_START`, `ScrollTrigger`, `gsap`.
- Produces: `useRuleDraw(root: Ref<HTMLElement | null>): void`.

- [ ] **Step 1: Move the rules to pseudo-elements**

In `src/styles/base.css`:

At the top of the "Shared primitives" block (just before `.shell`), add:

```css
/* How far a hairline has drawn in, 0 to 1. Registered as non-inheriting so a
   section's value never leaks into the table rules inside it. At rest it is
   1: without JavaScript every rule is simply there. */
@property --draw {
  syntax: '<number>';
  inherits: false;
  initial-value: 1;
}
```

In `.section`, delete `border-top: 1px solid var(--color-rule);` and add `position: relative;` as the first declaration.

In `.spec`, delete `border-top: 1px solid var(--color-rule);` and add `position: relative;` as the first declaration.

In `.spec__row`, delete `border-bottom: 1px solid var(--color-rule);` and add `position: relative;` as the first declaration.

After the `.spec__value { … }` block, add:

```css
/* Section and table hairlines are pseudo-elements rather than borders so
   they can draw in from the left (useRuleDraw tweens --draw). */
.section::before,
.spec::before,
.spec__row::after {
  content: '';
  position: absolute;
  left: 0;
  right: 0;
  height: 1px;
  background: var(--color-rule);
  transform: scaleX(var(--draw, 1));
  transform-origin: left;
  pointer-events: none;
}

.section::before,
.spec::before {
  top: 0;
}

.spec__row::after {
  bottom: 0;
}
```

Run `npm run dev:web` and check at 1440 px and 375 px: every section top rule and every table rule looks exactly as before (same position, color, and full width).

- [ ] **Step 2: Write the composable**

Create `src/composables/useRuleDraw.ts`:

```ts
import type { Ref } from 'vue'
import { REVEAL_START, ScrollTrigger, gsap } from '@/motion/gsap'
import { useSectionMotion } from './useSectionMotion'

/** A section's rule fires just before its content rises in at REVEAL_START. */
const SECTION_RULE_START = 'top 95%'
const SECTION_RULE_LINE = 0.95
const REVEAL_LINE = 0.9

const isBelowFold = (el: HTMLElement) => el.getBoundingClientRect().top >= window.innerHeight
const isPast = (el: HTMLElement, line: number) => el.getBoundingClientRect().top < window.innerHeight * line

const draw = (batch: Element[]) => gsap.to(batch, { '--draw': 1, duration: 0.6, stagger: 0.04 })

/**
 * Hairlines draw in from the left as they scroll into view.
 *
 * Table rules sit inside RevealItem blocks, which stay invisible until
 * REVEAL_START, so they fire with the reveal; firing earlier would finish
 * the draw unseen. Same rule as RevealItem: anything already on screen at
 * mount was painted by the prerender and stays drawn, so nothing blinks.
 */
export function useRuleDraw(root: Ref<HTMLElement | null>) {
  let sections: HTMLElement[] = []
  let tables: HTMLElement[] = []

  useSectionMotion(
    root,
    ({ reduceMotion }) => {
      if (reduceMotion) {
        // Reduced motion switched on mid-visit: finish anything still hidden.
        const hidden = [...sections, ...tables]
        if (hidden.length) gsap.set(hidden, { '--draw': 1 })
        return
      }
      schedule(sections, SECTION_RULE_START, SECTION_RULE_LINE)
      schedule(tables, REVEAL_START, REVEAL_LINE)
    },
    (el) => {
      sections = Array.from(el.querySelectorAll<HTMLElement>('.section')).filter(isBelowFold)
      tables = Array.from(el.querySelectorAll<HTMLElement>('.spec, .spec__row')).filter(isBelowFold)
      const hidden = [...sections, ...tables]
      if (hidden.length) gsap.set(hidden, { '--draw': 0 })
    },
  )
}

/**
 * The builder can run with the page already scrolled past some rules (a
 * restored scroll position, or a matchMedia re-run after crossing 60rem,
 * which reverts earlier tweens). Those draw immediately instead of waiting
 * for a trigger that already fired.
 */
function schedule(targets: HTMLElement[], start: string, line: number) {
  const passed = targets.filter((el) => isPast(el, line))
  const pending = targets.filter((el) => !isPast(el, line))
  if (passed.length) gsap.set(passed, { '--draw': 1 })
  if (pending.length) ScrollTrigger.batch(pending, { start, once: true, onEnter: draw })
}
```

- [ ] **Step 3: Call it from the app**

In `src/App.vue` `<script setup>`, add:

```ts
import { ref } from 'vue'
import { useRuleDraw } from './composables/useRuleDraw'

const main = ref<HTMLElement | null>(null)
useRuleDraw(main)
```

Change `<main id="main" class="shell">` to `<main id="main" ref="main" class="shell">`.

- [ ] **Step 4: Update the RevealItem comment**

In `src/components/ui/RevealItem.vue`, replace the doc comment

```ts
/**
 * The one scroll reveal on the page: a short settle as a block comes into
 * view, so the eye lands on new content. Nothing else moves on scroll.
 */
```

with

```ts
/**
 * The block reveal on the page: a short settle as a block comes into view,
 * so the eye lands on new content. Its hairlines draw in alongside it
 * (useRuleDraw); the other scroll-linked motion is listed in DESIGN.md.
 */
```

- [ ] **Step 5: Check it in the browser**

Run `rtk npm run typecheck` (expected: no errors). With `npm run dev:web` running at 1440 px:
- Load at the top and scroll slowly: each section's top rule draws left to right just before its content rises. Table rows draw one after another as each row enters.
- Rules visible on the first screen are drawn on load and never blink.
- Deep link: open http://localhost:5173/#contact directly. Every rule on screen and every rule above it is drawn. Scroll back up and none are missing. (Review Focus 4.)
- Breakpoint: scroll to the bottom, resize the window from 1440 px to 800 px and back. Every rule you already passed is still drawn. (Review Focus 4.)
- Reload while scrolled halfway (let the browser restore the position): the rules on screen are drawn. (Review Focus 4.)
- Reduced motion emulated: all rules drawn, nothing animates.

- [ ] **Step 6: Commit**

```bash
rtk git add src/styles/base.css src/composables/useRuleDraw.ts src/App.vue src/components/ui/RevealItem.vue
rtk git commit -F - <<'EOF'
feat: draw section and table hairlines in from the left

Rules become non-inheriting --draw pseudo-elements. Section rules fire
just before their content; table rules fire with the reveal. Rules
already on screen or passed stay drawn.

Claude-Session: https://claude.ai/code/session_01J3y9YTqYkRowiXU6Ri1yGe
EOF
```

---

### Task 8: Hero depth

**Files:**
- Modify: `src/components/HeroSection.vue`

**Interfaces:**
- Consumes: `useSectionMotion`, `gsap`.
- Produces: nothing new.

- [ ] **Step 1: Add the depth wrapper and scrub**

In `src/components/HeroSection.vue` `<script setup>`, add:

```ts
import { ref } from 'vue'
import { gsap } from '@/motion/gsap'
import { useSectionMotion } from '@/composables/useSectionMotion'

const root = ref<HTMLElement | null>(null)

// Desktop depth: the diagram drifts up to 40px slower than the copy while
// the hero scrolls out. 40px with the grid as trigger keeps it inside the
// grid's bottom margin (at least 40px on desktop), so it never slides over
// the proof strip while visible.
useSectionMotion(root, ({ isDesktop, reduceMotion }) => {
  if (!isDesktop || reduceMotion) return
  gsap.to('.hero__depth', {
    y: 40,
    ease: 'none',
    scrollTrigger: { trigger: '.hero__grid', start: 'top top', end: 'bottom top', scrub: true },
  })
})
```

In the template, replace the opening comment with:

```vue
  <!-- Answers a recruiter's first three questions in one screen: who, whether
       he is available, and what he has actually built. The load sequence is
       a short CSS stagger (.rise); on desktop the diagram scrubs slightly
       slower than the copy as the hero scrolls out. -->
```

Change `<section class="hero" aria-labelledby="hero-title">` to `<section ref="root" class="hero" aria-labelledby="hero-title">`.

Replace the visual block with (the transform goes on the inner wrapper because `.hero__visual` runs the `rise-in` animation with `fill-mode: both`, which would override GSAP's inline transform):

```vue
      <div class="hero__visual rise" :style="{ '--i': 3 }">
        <div class="hero__depth">
          <SystemDiagram />
        </div>
      </div>
```

Add to `<style scoped>` after the `.hero__visual` rules:

```css
.hero__depth {
  width: 100%;
  max-width: 420px;
}
```

- [ ] **Step 2: Check it in the browser**

Run `rtk npm run typecheck` (expected: no errors). With `npm run dev:web` running:
- At 1440 px, scroll slowly through the hero: the diagram moves up more slowly than the copy. It never overlaps the proof strip while both are visible below the header.
- The diagram is still centered at 1024 px and right-aligned from 60rem up, exactly as before.
- At 375 px the diagram scrolls with the page (no transform in the Elements panel).
- Reduced motion: no transform.
- Diagram hover and trace still work while the hero is partly scrolled.

- [ ] **Step 3: Commit**

```bash
rtk git add src/components/HeroSection.vue
rtk git commit -F - <<'EOF'
feat: give the hero diagram a little scroll depth

On desktop the diagram scrubs up to 40px slower than the copy while
the hero scrolls out. Nothing moves on mobile or under reduced motion.

Claude-Session: https://claude.ai/code/session_01J3y9YTqYkRowiXU6Ri1yGe
EOF
```

---

### Task 9: DESIGN.md, full verification, and handoff

**Files:**
- Modify: `DESIGN.md`
- Modify: `src/motion/gsap.ts` (comment only)

**Interfaces:**
- Consumes: everything above.
- Produces: an updated design doc and a verified branch.

- [ ] **Step 1: Update DESIGN.md**

Make these exact edits:

1. Replace `**Dial:** ENERGY 2 / RHYTHM 2 / MOTION 2` with `**Dial:** ENERGY 3 / RHYTHM 2 / MOTION 4`.

2. Replace motif 4:

```markdown
4. **Healthcheck green.** The only chromatic color. It marks availability, diagram traffic, the section being read, rare signal dots, and link hover, and echoes "stay up".
5. **The signal field.** A fixed dot grid behind the whole page whose density bands drift like a signal: gray dots with rare green ones, drawn on Canvas 2D. Text never sits on it; headings and content blocks sit on paper fills, like document pages on graph paper.
```

3. In "Shape and space", replace `- 1px hairlines, no shadows.` with:

```markdown
- 1px hairlines, no shadows. The one exception is `.paper-fill`: a 12px spread in the paper color that extends a text block's fill over the signal field. It reads as paper, never as a shadow.
```

4. Replace the whole "## Motion" section body with:

```markdown
- Signal field: dots every 16px (20px under 60rem) behind the page. Two summed sine waves decide which dots show and how strongly (six alpha levels, peak 0.6); about 1.5% of dots, fixed by a hash, are green. The bands drift over time and move at 0.3x scroll speed, the page's only background parallax. 30 fps cap, stops in hidden tabs, starts once the page is idle, fades in over 600ms.
- Hero: a short CSS stagger on load. On desktop the diagram scrubs up to 40px slower than the copy as the hero scrolls out.
- Diagram: edges draw in once, then pulses loop; paused offscreen. Hover, keyboard focus, or a tap lights a node and its neighbors, and the caption shows the node's line from the CV. "Trace a request" sends one dash through the system in request order.
- Active section: the header's green bar and the margin label's index follow the section being read; on desktop a 48px hairline under the index fills as the section scrolls (scrubbed).
- Scroll: section rules and table rules draw in from the left (0.6s), and blocks below the fold rise 8px (0.45s, once). Anything already on screen is never hidden.
- Reduced motion: the signal field is one still frame, nothing is scroll-linked, diagram highlighting still works and the trace lights the whole path at once, and everything else renders in its finished state.
```

5. In "## Don't", replace `- No particles, gradients, glows, background grids, or decorative icons.` with:

```markdown
- The signal field is the only background layer. No gradients, glows, second accent, or decorative icons.
```

- [ ] **Step 2: Update the gsap.ts comment**

In `src/motion/gsap.ts`, replace the sentence

```
 * for the whole app rather than in every component that animates. GSAP only
 * drives scroll reveals and the earlier-roles accordion now; the hero and
 * the system diagram animate in CSS.
```

with

```
 * for the whole app rather than in every component that animates. GSAP
 * drives the scroll reveals, hairline draw-in, label progress, hero depth,
 * the diagram trace, and the earlier-roles accordion. The hero load stagger
 * and the diagram's idle pulses stay in CSS; the signal field is Canvas 2D.
```

- [ ] **Step 3: Run every automated check**

```bash
rtk npm run test
rtk npm run typecheck
rtk npm run build
```

Expected: 30 tests pass; no type errors; the build prints `prerender: wrote … kB of markup into dist/index.html`.

- [ ] **Step 4: Check the prerendered build**

Start `npm run preview -- --port 4173 --strictPort` in the background and open http://localhost:4173 in Chrome:
- View source: every section's text, the diagram's nodes, and an empty `<canvas class="signal-field" aria-hidden="true">` are in the HTML.
- Console after load and a full scroll: no hydration mismatch warnings, no errors.
- Light and dark themes at 1440 px and 375 px: success criteria 1, 2, 4, and 8 from the spec hold (field visible, no text on dots, active section shown, no horizontal scroll).
- Keyboard only: Tab from the skip link through nav, hero actions, every diagram node, the trace button, and on down the page; focus is always visible.
- Reduced motion emulated: spec success criterion 5 holds.

- [ ] **Step 5: Compare Lighthouse against the baseline**

With the preview still running:

```bash
LH="C:/Users/ANDHAN~1/AppData/Local/Temp/claude/C--Users-Andhana-Utama-Documents-PROJECTS-personal-web/ff076220-6c36-43b3-b160-7bbdad7e564c/scratchpad/lighthouse"
for n in 1 2 3; do
  npx --yes lighthouse@12 http://localhost:4173/ --quiet --only-categories=performance --chrome-flags="--headless=new" --output=json --output-path="$LH/final-mobile-$n.json"
  npx --yes lighthouse@12 http://localhost:4173/ --quiet --only-categories=performance --preset=desktop --chrome-flags="--headless=new" --output=json --output-path="$LH/final-desktop-$n.json"
done
for f in "$LH"/final-*.json; do node -e "const r=require(process.argv[1]);console.log(process.argv[1].split('/').pop(), Math.round(r.categories.performance.score*100), 'CLS', r.audits['cumulative-layout-shift'].numericValue)" "$f"; done
cat "$LH/baseline.txt"
```

Expected: median mobile and desktop scores at most 3 points below the baseline medians, and CLS 0 in every run. If either fails, stop and report the numbers to Andhana before changing anything. Stop the preview server.

- [ ] **Step 6: Commit**

```bash
rtk git add DESIGN.md src/motion/gsap.ts
rtk git commit -F - <<'EOF'
docs: record the motion layer in DESIGN.md

Dial to MOTION 4, the signal field as motif 5, the paper-fill
exception, the new Motion list, and the updated Don't rule.

Claude-Session: https://claude.ai/code/session_01J3y9YTqYkRowiXU6Ri1yGe
EOF
```

- [ ] **Step 7: Hand off**

Report to Andhana: the test count, the Lighthouse baseline and final medians, and anything that failed or was skipped. Ask whether to push `andhana/feat/motion-layer` and open a PR to `main` (CI then runs tests, build, and the Docker build). Do not push until Andhana says yes.
