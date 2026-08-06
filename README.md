# Andhana Utama — Portfolio

Personal site for Andhana Utama, Senior Backend Engineer and Technical Lead.
Ported from a Claude Design project into a Vue 3 single-page site.

## Stack

- **Vue 3** (`<script setup>`, TypeScript, strict)
- **Vite** for dev server and build
- **[Motion for Vue](https://motion.dev/docs/vue)** (`motion-v`) for every state-driven animation
- Plain CSS with design tokens — no UI framework, no CSS-in-JS

## Getting started

```bash
npm install
npm run dev        # dev server on http://localhost:5173
npm run build      # typecheck + production build into dist/
npm run preview    # serve the production build
npm run typecheck  # vue-tsc, no emit
```

## Layout

```
public/assets/      portrait + CV PDF served as-is
src/
  data/             all copy and code samples — edit content here, not in components
  motion/presets.ts shared easing, transitions, variants and viewport config
  composables/      useCycle (auto-advancing index), usePrefersReducedMotion
  components/       one component per section, plus ui/ primitives
  styles/base.css   design tokens, resets, shared primitives
```

Content lives in `src/data/portfolio.ts` and `src/data/snippets.ts`. Components
are presentational: changing a job, a project, or a stack chip means editing
data, not markup.

## Animation notes

- `MotionConfig` sets `reducedMotion="user"`, so transform animations follow the
  OS setting. Ambient CSS animation is disabled in the same case via
  `prefers-reduced-motion` in `base.css`.
- Scroll reveals run once, through `RevealItem` (or `revealProps` where a
  different element is needed), keeping viewport config in one place.
- Rows that sit on 1px hairline grids animate their contents rather than
  themselves, so the seams never open up mid-animation.
- Auto-cycling (hero role stack, code panel) pauses on hover, focus and hidden
  tabs, stops permanently once the visitor picks a tab, and never starts when
  reduced motion is requested.

## Accessibility

- Skip link, landmark elements, one `h1`, ordered headings, `aria-labelledby`
  on each section.
- The cycling hero headline exposes a single stable accessible name; the
  animated stack is `aria-hidden`.
- Code samples use the WAI-ARIA tabs pattern with roving focus and arrow keys.
- The earlier-roles toggle uses `aria-expanded`/`aria-controls` against an
  element that is always present in the DOM.
- Contact form has real labels, native validation, and a polite live region.
