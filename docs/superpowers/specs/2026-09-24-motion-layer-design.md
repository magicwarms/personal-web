# Motion layer: design

- **Date:** 2026-09-24
- **Branch:** `andhana/feat/motion-layer`
- **Status:** design approved in conversation; this written spec awaits review

## Intent

**What Andhana asked for**

- More motion on the site (parallax, animation, effects) so the page itself is evidence of craft: "this person builds carefully", even for a backend engineer.
- All four proposed pieces: interactive system diagram, scroll-aware labels and nav, hairline draw-in, subtle hero depth.
- A background animation like the one on https://thegamechangers.id/en, across the **whole page, fixed**, at **the same visible strength as the reference**, rendered with **Canvas 2D**.

**Assumptions carried from the current design**

- Recruiters and hiring managers stay the primary audience. The page still answers "who, available, built what, how to reach" in that order.
- No new runtime dependencies. GSAP 3.15 (ScrollTrigger, CustomEase) is already installed and registered in `src/motion/gsap.ts`.
- The prerendered HTML keeps every piece of content visible. Motion only enhances after hydration.
- One accent color (healthcheck green). No glows, gradients, or second accent.
- `prefers-reduced-motion: reduce` gets a finished, static page.

**Success criteria**

1. The dot field is visible across the whole page in both themes and uses only `--color-ink-3` and `--color-accent`.
2. No body text sits directly on dots (visual check in both themes, desktop and 375px).
3. Diagram nodes highlight on hover, keyboard focus, and tap; "Trace a request" plays; every node is reachable by keyboard.
4. The header nav and the margin labels show the section currently being read.
5. Under reduced motion: one static frame of the field, no scroll-linked motion, all content visible.
6. No hydration mismatch warnings in the console.
7. The signal field costs under 4 ms per frame on a desktop (DevTools Performance panel), CLS stays 0, and Lighthouse performance (mobile and desktop) is no more than 3 points below the baseline measured on `main` before work starts.
8. No horizontal scroll at 375px.

## Scope

**In:** signal field background, paper fills for readability, interactive diagram, active section tracking (nav and margin labels), hairline draw-in, hero depth, `DESIGN.md` update, unit tests for the pure logic.

**Out:** number count-ups, custom cursor, magnetic buttons, smooth-scroll hijacking, pinned sections, WebGL, cursor interaction with the dot field.

## Reference analysis

The reference background is `SignalParticles`: a Canvas 2D effect with no library. A fixed grid of dots (16 px spacing, 1.5 px radius) is sampled against two summed sine waves. A dot is drawn only where the sum exceeds 0.1, with alpha rising with the sum up to 0.6, so dotted bands drift slowly across the screen. A fixed hash marks rare dots in highlight colors. The site tints it green (hue 120), runs dark mode only, and swaps in a static fallback under reduced motion. Their loop recomputes every trig term per dot and changes `fillStyle` per dot; this design keeps the look and removes that cost.

## 1. Signal field

### Files

- `src/motion/signalField.ts`: framework-free renderer plus exported pure math.
- `src/components/ui/SignalField.vue`: mounts the canvas, wires theme, visibility, resize, and reduced motion.
- `src/motion/signalField.test.ts`: unit tests for the math.

### Renderer API

```ts
interface SignalFieldColors {
  dot: string    // resolved --color-ink-3
  accent: string // resolved --color-accent
}

interface SignalFieldOptions {
  colors: SignalFieldColors
  /** Returns window.scrollY; read once per frame, no scroll listener. */
  getScroll: () => number
  /** Called once, after the first frame is on the canvas (the fade-in hook). */
  onFirstFrame?: () => void
}

interface SignalField {
  start(): void            // begin the rAF loop
  stop(): void             // cancel the loop, keep the last frame
  drawOnce(): void         // render a single frame at t = 0 (reduced motion)
  resize(): void           // re-read CSS size, rebuild the grid
  setColors(c: SignalFieldColors): void
  destroy(): void
}

function createSignalField(canvas: HTMLCanvasElement, opts: SignalFieldOptions): SignalField | null
```

`createSignalField` returns `null` when `getContext('2d')` fails; the component then renders nothing and the page stays plain paper.

### Grid

- Spacing 16 px at `min-width: 60rem`, 20 px below it. Dot radius 1.5 px.
- Columns `i = 0..cols`, rows `j = 0..rows`, centered with the leftover space split evenly (as the reference).
- Backing store = CSS size × `min(devicePixelRatio, 2)`, with `setTransform` so drawing stays in CSS pixels.

### Wave formula

Reference, per dot:

```
nx = 0.1 * i
ny = 0.1 * j'
wave1 = sin(nx + 0.5t) * cos(ny - 0.3t)
wave2 = sin(0.5nx - 0.5ny + 0.8t)
value = wave1 + wave2
```

Scroll coupling: `j' = j + (scrollY * 0.3) / spacing`. The dots stay fixed on screen while the bands move at 30% of scroll speed, which reads as a slower, deeper layer (the page's parallax).

Time: `t = elapsedSeconds * 1.2`, which matches the reference's `t += 0.02` at 60 fps regardless of the actual frame rate.

Separable form (the only form the loop uses). With `a_i = 0.1i + 0.5t`, `b_j = 0.1j' - 0.3t`, `c_i = 0.05i + 0.8t`, `d_j = 0.05j'`:

```
value = sin(a_i)·cos(b_j) + sin(c_i)·cos(d_j) - cos(c_i)·sin(d_j)
```

Each frame fills three column arrays (`sinA`, `sinC`, `cosC`) and three row arrays (`cosB`, `cosD`, `sinD`), about 200 trig calls at 1440 px instead of about 16,000. The inner loop is multiply-adds only.

Exported pure functions for tests:

- `waveReference(i, jPrime, t): number`, the per-dot formula above.
- `buildAxisTerms(cols, rows, t, rowOffset)`, returning the six arrays.
- `valueAt(terms, i, j): number`, the separable sum for one dot.
- `alphaLevel(value): number` and `isHighlight(i, j): boolean`, described below.
- `spacingFor(width)`, `shouldResize(prev, next)`, `resolveColors(read)` and `FALLBACK_COLORS`, the sizing and color rules below.

### Alpha levels and batching

- `alpha = min(0.6, (value - 0.1) * 0.8)` when `value > 0.1`, otherwise the dot is skipped.
- `alphaLevel(value)` returns `ceil(alpha / 0.1)` clamped to 1..6, or 0 for a skipped dot.
- Each frame builds up to six `Path2D` objects (one per level) plus one for highlights, then fills each once with `globalAlpha = level * 0.1`. Seven fills per frame instead of thousands of `fillStyle` changes.

### Highlights

- `isHighlight(i, j)`: `Math.abs(Math.sin(i * 12.34) * Math.cos(j * 56.78)) > 0.98` (the reference's hash, both tails mapped to one color).
- Uses screen grid indices, so a highlight never flickers or moves with scroll.
- A highlighted dot is drawn only if its wave value is above 0.1, in `--color-accent` at alpha 0.9. The reference's blue and purple are dropped.

### Colors and themes

- `SignalField.vue` resolves `--color-ink-3` and `--color-accent` with `getComputedStyle(document.documentElement)`.
- It re-reads them when `<html data-theme>` changes (a `MutationObserver`) and when `matchMedia('(prefers-color-scheme: dark)')` fires `change`. It cannot watch `useTheme().theme`: `useTheme()` keeps its state per call, so the header's toggle is only visible through the attribute it writes.
- If a value comes back empty, it falls back to the light-theme hex values from `base.css`.

### Frame loop

- `requestAnimationFrame`, skipping any frame less than 33 ms after the last drawn one (30 fps cap).
- `visibilitychange`: `stop()` when `document.hidden`, `start()` when visible again.
- Starts in `requestIdleCallback` (fallback `setTimeout(…, 200)`) after mount, so hydration and the largest contentful paint go first.
- The canvas fades in from `opacity: 0` over 600 ms on the first drawn frame (class toggle, CSS transition). No fade under reduced motion.

### Sizing

- The canvas is `position: fixed; top: 0; left: 0; width: 100%; height: 100lvh`. `100%` of the viewport excludes a desktop scrollbar (`100vw` would include it and overflow). `lvh` keeps it from resizing when a mobile browser's toolbar shows or hides.
- Resize is debounced 150 ms, uses `ResizeObserver` on the canvas when available and the window `resize` event otherwise, and rebuilds the grid only when the width changes or the height grows.

### Reduced motion

`drawOnce()` renders one frame at `t = 0`, `scrollY = 0`. No loop, no scroll coupling, no fade. The component listens for `change` on the reduced-motion media query and switches mode live.

### Layering

- `body` keeps `background: var(--color-paper)`.
- `.page` in `App.vue` drops its `background` (it would cover the canvas), gains `position: relative; z-index: 1`.
- `SignalField` renders as the first child of the app root, outside `.page`, `z-index: 0`, `pointer-events: none`, `aria-hidden="true"`.
- The sticky header keeps its solid paper background.
- SSR renders an empty `<canvas>`; drawing starts only on the client, so hydration output matches.

## 2. Readability: paper fills

At reference strength, text cannot sit on dots. Text blocks get a plain paper fill, so the page reads as document pages lying on graph paper.

- **Mechanism:** one utility class, `.paper-fill`, in `base.css`: `background: var(--color-paper)` plus `box-shadow: 0 0 0 12px var(--color-paper)`. The spread shadow extends the fill 12 px past the text without changing layout. It is a fill, not a visible shadow; `DESIGN.md` records this so it is not mistaken for a "no shadows" violation.
- **Filled elements:**
  - `.heading` (SectionHeading root): `width: fit-content`, so only the label itself is filled and dots stay visible in the rest of the label column.
  - Each section's content column (the existing wrapper div, or a new wrapper div in Skills, whose content is a bare `RevealItem`).
  - `.hero__copy`, `.proof` (ProofStrip), and the footer's inner content.
- Existing surface panels (featured case study, diagram, contact form) are already opaque and stay as they are.
- Dots stay visible in the outer gutters, the label column around each label, the vertical section padding, and the hero around the copy and diagram.

## 3. Interactive system diagram

### Files

- `src/data/diagram.ts`: nodes, edges (now with `from` and `to`), `buildNeighbors(edges)`, `traceSteps`, and node notes. Moved out of `SystemDiagram.vue` so the component is only rendering and interaction.
- `src/data/diagram.test.ts`.
- `src/components/ui/SystemDiagram.vue`: interaction state and markup.
- `src/composables/useDiagramTrace.ts`: the trace timeline.

### Highlight

- Reactive `activeId: string | null`, default `null` (prerender and hydration match).
- Set by mouse `pointerenter`, by keyboard focus (`:focus-visible` only), by tap (tap toggles), and by Enter or Space (toggles). Cleared by mouse `pointerleave`, `blur`, a click on empty diagram space, and `Escape`.
- The rules live in a pure reducer, `reduceActive(current, action)` in `src/composables/diagramActive.ts`, with unit tests. The case it exists for: a tap focuses a `tabindex` element and then clicks it, so if any focus highlighted and the click toggled, every tap would switch the highlight on and straight back off.
- Lit set = the active node, its edges, and its neighbors from `buildNeighbors`. Everything else gets `--dim` (opacity 0.35). Transition 200 ms, `var(--ease-out)`. The opacity goes on each node's `rect` and `text`, not the `<g>`: the `<g>` holds the `diagram-fade` animation with `fill-mode: both`, which would fight an opacity set on the same element.
- Looping pulses run only on lit edges while a node is active.

### Caption

- `aria-live="polite"`. Default text is today's caption.
- With a node active, it shows that node's note from `src/data/diagram.ts`. **Every note must be sourced from the CV or the existing copy in `src/data/portfolio.ts`.** A node with no sourced fact gets a generated line such as "PostgreSQL: connects to API." Four nodes have notes, each a verbatim line from the Kirimfresh.id `did` list in `portfolio.ts` (a unit test enforces this): AI assistant, API, Payments, RabbitMQ.

### Trace a request

- A mono text button, "Trace a request", beside the caption.
- `traceSteps` (edge ids, parallel edges share a step):
  1. `customers-api`
  2. `api-redis`, `api-postgres`
  3. `api-payments`
  4. `api-rabbitmq`
  5. `rabbitmq-fcm`
- A GSAP timeline animates a short green dash along each step's edges (`strokeDashoffset` on dedicated `diagram__trace` paths), lighting each node as the dash arrives. About 3 s total, then a 0.6 s hold, then back to the idle state.
- Looping pulses pause during the trace. Pressing the button again restarts it. Activating a node cancels it.
- The caption names each hop as it plays ("API → Redis, PostgreSQL"), no other claims.
- The GSAP context is scoped to the SVG and reverted on unmount.
- Reduced motion: no moving dash; the whole trace path lights at once for 2 s.

### Accessibility

- The SVG changes from `role="img"` to `role="group"`, keeping `aria-labelledby` on the title and description.
- Each node `<g>` gets `role="button"`, `tabindex="0"`, and an `aria-label` such as "Redis, connected to API". Enter and Space act as a tap.
- Focus ring on nodes uses the existing focus style.
- Node hit areas are at least 36 px tall at the diagram's rendered size.

## 4. Active section tracking

### Composable

`src/composables/useActiveSection.ts`:

- One shared `IntersectionObserver` for all sections with an `id` (`work`, `experience`, `about`, `skills`, `credentials`, `contact`), `rootMargin: '-40% 0px -59% 0px'` (a 1% band 40% down the viewport). Reference-counted: created by the first subscriber, disconnected by the last.
- Exposes a shared readonly `activeId: Ref<string | null>`. `null` in the hero and when `IntersectionObserver` is unavailable.
- Exported pure `pickActive(order: string[], intersecting: Set<string>): string | null` returns the first id in document order that intersects, for tests.
- `src/composables/useActiveSection.test.ts`.

### Header nav

- The active link gets `aria-current="location"` and ink color.
- A 2 px green indicator in `.nav__links`: an absolutely positioned 1 px-wide bar with `transform: translateX(var(--x)) scaleX(var(--w))`, `transform-origin: left`, transition 300 ms `var(--ease-out)`. `--x` and `--w` come from the active link's `offsetLeft` and `offsetWidth`, re-measured after fonts load and on resize.
- The indicator fades out when the active section is not in `navItems` (hero, credentials).
- The mobile sheet marks the active link only; no indicator.

### Margin labels (desktop only, where `.heading` is sticky)

- The active section's index turns `--color-accent` (200 ms color transition).
- A 48 px × 1 px progress hairline below the index scales `scaleX(0 → 1)` with ScrollTrigger `scrub` over its section, `start: 'top 40%'`, `end: 'bottom 40%'`. The trigger is `heading.closest('section')`.
- Built through `useSectionMotion` with `isDesktop`. Hidden on mobile and under reduced motion.

## 5. Hairline draw-in

### CSS

- `.section`: `position: relative`; `border-top` replaced by `::before` (absolute, top 0, full width, 1 px, `var(--color-rule)`, `transform: scaleX(var(--draw, 1))`, `transform-origin: left`).
- `.spec`: `border-top` replaced by `::before` the same way.
- `.spec__row`: `border-bottom` replaced by `::after` (bottom 0), same transform.
- Default `--draw: 1`, so the static and no-JS page is unchanged.
- Other rules (ProofStrip, work rows, experience rows, footer, header) stay as borders.

### Motion

- One app-level composable, `src/composables/useRuleDraw.ts`, called from `App.vue` with `useSectionMotion` rooted on `<main>`.
- `prep`: elements whose top is below the viewport get `--draw: 0`. Anything already on screen stays drawn, so nothing blinks.
- `build`: two `ScrollTrigger.batch` calls with `once: true` and `onEnter: batch => gsap.to(batch, { '--draw': 1, duration: 0.6, stagger: 0.04 })`:
  - `.section` at `start: 'top 95%'`, so a section's rule draws just before its content rises in at `REVEAL_START` (`top 90%`).
  - `.spec, .spec__row` at `REVEAL_START`. These rules sit inside `RevealItem` blocks, which stay invisible until `REVEAL_START`; firing earlier would finish the draw unseen.
- Anything already past its start when the builder runs (a reload restored mid-page, or a matchMedia re-run after crossing 60rem) is set to `--draw: 1` directly instead of waiting for a trigger.
- `--draw` is registered with `@property` (`inherits: false`, initial value 1), so a section's value never leaks into the rules inside it.
- Reduced motion: nothing is prepped; everything stays drawn.
- The accordion in `ExperienceSection` already calls `ScrollTrigger.refresh()` after it resizes, which keeps these triggers correct.

## 6. Hero depth

- New wrapper `<div class="hero__depth">` inside `.hero__visual`, around `<SystemDiagram />`. The transform goes on the wrapper because `.hero__visual` runs the `rise-in` CSS animation with `fill-mode: both`, and a CSS animation overrides GSAP's inline transform.
- `useSectionMotion` in `HeroSection.vue`, `isDesktop` and not `reduceMotion`: `gsap.to('.hero__depth', { y: 40, ease: 'none', scrollTrigger: { trigger: '.hero__grid', start: 'top top', end: 'bottom top', scrub: true } })`. 40 px and the grid as trigger keep the diagram inside the grid's bottom margin (at least 40 px on desktop), so it never slides over the proof strip while visible.
- Depth order: dot field (0.3 of scroll), diagram (slower than copy by up to 40 px), copy (normal).
- Mobile and reduced motion: no transform.

## 7. Error handling

| Failure | Behavior |
|---|---|
| `getContext('2d')` returns null | `SignalField` renders nothing; plain paper page |
| Theme custom property empty | Fall back to light-theme hex values |
| No `ResizeObserver` | Window `resize` event, same debounce |
| No `IntersectionObserver` | `activeId` stays `null`; nav and labels look as today; diagram loops never pause (as today) |
| No `requestIdleCallback` | `setTimeout(…, 200)` |
| Component unmounts mid-wait | `useSectionMotion` already reverts prep; `SignalField` cancels the idle callback and the rAF |
| JS bundle fails | Prerendered page, fully drawn rules, no canvas drawing |

No inline scripts are added; the CSP in `server/index.ts` stays unchanged.

## 8. Testing and verification

### Unit tests (no new dependencies)

- Script: `"test": "node --import tsx --test \"src/**/*.test.ts\""` using Node's built-in runner and the already-installed `tsx`.
- `signalField.test.ts`: `valueAt(buildAxisTerms(...))` equals `waveReference` within 1e-9 over random `(i, j, t, scroll)` samples; `alphaLevel` boundaries (0.1 → 0, just above 0.1 → 1, large → 6); `isHighlight` is deterministic.
- `diagram.test.ts`: `buildNeighbors` (API neighbors all others except FCM; FCM's only neighbor is RabbitMQ); every `traceSteps` id exists in `edges`.
- `useActiveSection.test.ts`: `pickActive` with none, one, and two intersecting ids.
- Pure modules do not import `@/` aliases, so the tests run without Vite.

### Build checks

`npm run typecheck`, `npm run build` (includes prerender), `npm run test`.

### Manual checks

- Light and dark themes; desktop and 375 px; emulated reduced motion.
- Keyboard pass through the nav and every diagram node.
- Console free of hydration warnings.
- Performance: record a Lighthouse baseline (mobile and desktop) on `main` before the first code change; compare at the end. DevTools Performance panel for per-frame cost of the field.

## 9. `DESIGN.md` changes

- Dial: `ENERGY 3 / RHYTHM 2 / MOTION 4`.
- Identity motif 5, **the signal field**: a fixed dot grid behind the page whose density bands drift like a signal; gray dots with rare green ones; drawn on Canvas 2D; paper fills keep text off it.
- Motion section rewritten to list: signal field, hero load stagger, diagram draw-in, pulses, interaction, and trace, active section tracking, hairline draw-in, the one scrub-linked effect (hero depth plus the label progress hairline), and reduced-motion behavior for each.
- Shape and space: note the paper-fill spread shadow as a fill technique, not a shadow.
- Don't: replace "No particles, gradients, glows, background grids, or decorative icons" with "The signal field is the only background layer. No gradients, glows, second accent, or decorative icons."

## 10. Build order

1. Lighthouse baseline on `main`.
2. Test script and signal field math with tests.
3. Signal field renderer and component, layering in `App.vue`.
4. Paper fills.
5. Diagram data move, highlight, caption, trace, accessibility.
6. Active section composable, nav indicator, margin labels.
7. Hairline draw-in.
8. Hero depth.
9. `DESIGN.md`.
10. Full verification, then a PR to `main` (CI runs the build and Docker build).
