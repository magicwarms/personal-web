# Andhana Utama: Design Direction

> A typeset engineering design doc, printed on paper.

**Audience:** recruiters and engineering managers hiring a senior backend engineer or technical lead.
**Job of the page:** answer "who is this, is he available, what has he built, how do I reach him" in that order, fast.
**Inspiration:** Refero's Vercel reference ("typeset terminal on white paper"), used as a starting point only. The site keeps its own identity: no ▲ mark, no Geist, one green accent, design-doc structure.

**Dial:** ENERGY 3 / RHYTHM 2 / MOTION 4

## Identity motifs

1. **Numbered margin labels.** Every section opens with a mono index (`01`) and title in a left margin column above a full-width hairline, like the sections of an RFC. On wide screens the label stays in view while its section scrolls.
2. **Spec tables.** Key/value rows separated by hairlines for working details, skills, credentials, and contact links. It is a backend engineer's native format and it scans fast.
3. **The system diagram.** The hero shows the Kirimfresh.id backend (Go/Fiber API, PostgreSQL, Redis, Meilisearch, RabbitMQ, FCM, payments, AI assistant), with a green pulse moving along each edge in request order. It is his real work, not decoration.
4. **Healthcheck green.** The only chromatic color. It marks availability, diagram traffic, the section being read, rare signal dots, and link hover, and echoes "stay up".
5. **The signal field.** A fixed dot grid behind the whole page whose density bands drift like a signal: gray dots with rare green ones, drawn on Canvas 2D. Text never sits on it; headings and content blocks sit on paper fills, like document pages on graph paper.

## Tokens

### Color

| Token | Light | Dark | Role |
|---|---|---|---|
| `--color-paper` | `#fafafa` | `#0a0a0a` | Page canvas |
| `--color-surface` | `#ffffff` | `#111111` | Featured case study, diagram panel, inputs |
| `--color-rule` | `#e5e5e5` | `#262626` | Hairlines (decorative structure) |
| `--color-rule-strong` | `#8f8f8f` | `#6f6f6f` | Control borders, diagram edges (at least 3:1) |
| `--color-ink` | `#171717` | `#ededed` | Headings, primary text, filled button |
| `--color-ink-2` | `#4d4d4d` | `#a1a1a1` | Body text |
| `--color-ink-3` | `#666666` | `#8f8f8f` | Metadata, captions, placeholders |
| `--color-accent` | `#1a7f37` | `#3fb950` | Availability, diagram traffic, link hover |
| `--color-danger` | `#b42318` | `#ff7b72` | Form errors only |

Every text pair is at least 4.5:1 on both paper and surface in both themes.

### Type

- **Instrument Sans** (400 to 700) for display and body. A crisp grotesk that holds tight tracking at display sizes and reads well at 17px.
- **IBM Plex Mono** (400, 500) for metadata, indices, and spec keys. Reads as documentation rather than a hacker terminal.

| Role | Size | Weight | Tracking |
|---|---|---|---|
| Display (hero) | `clamp(2.5rem, 5.5vw, 4rem)` | 500 | -0.04em |
| Section title | `clamp(1.625rem, 2.6vw, 2.125rem)` | 500 | -0.025em |
| Stat | `clamp(2rem, 3.6vw, 2.75rem)` | 500 | -0.025em |
| Case title | 1.25rem | 500 | -0.01em |
| Body | 1.0625rem / 1.6 | 400 | 0 |
| Small | 0.9375rem | 400 | 0 |
| Mono meta | 0.8125rem | 400 | 0 |

Labels are sentence case. No uppercase with wide tracking.

### Shape and space

- Radius 6px on buttons, inputs, and panels. Full round only on the status dot.
- 1px hairlines, no shadows. The one exception is `.paper-fill`: a 12px spread in the paper color that extends a text block's fill over the signal field. It reads as paper, never as a shadow.
- Shell max 1120px. Sections are a 3/9 label/body grid on desktop and stack on mobile.
- Section padding `clamp(48px, 7vh, 80px)`; sticky header 64px.

## Components

- **Filled button** (ink on paper): one per view. "Email me" in the hero, "Send message" in the contact form.
- **Outline button**: everything else ("Download CV (PDF)", the earlier-roles toggle).
- **Text link**: ink with a quiet underline that turns green on hover; tap area extended to about 42px.
- **Theme toggle**: mono text button showing the current theme with a half-filled disc.
- **Featured case study**: the most recent project sits on a surface panel; older ones are denser rows. Long lists split into two columns on wide screens.

## Motion

- Signal field: dots every 16px (20px under 60rem) behind the page. Two summed sine waves decide which dots show and how strongly (six alpha levels, peak 0.6); about 1.5% of dots, fixed by a hash, are green. The bands drift over time and move at 0.3x scroll speed, the page's only background parallax. 30 fps cap, stops in hidden tabs, starts once the page is idle, fades in over 600ms.
- Hero: a short CSS stagger on load. On desktop the diagram scrubs up to 40px slower than the copy as the hero scrolls out.
- Diagram: edges draw in once, then pulses loop; paused offscreen. Hover, keyboard focus, or a tap lights a node and its neighbors, and the caption shows the node's line from the CV. "Trace a request" sends one dash through the system in request order.
- Active section: the header's green bar and the margin label's index follow the section being read; on desktop a 48px hairline under the index fills as the section scrolls (scrubbed).
- Scroll: section rules and table rules draw in from the left (0.6s), and blocks below the fold rise 8px (0.45s, once). Anything already on screen is never hidden.
- Reduced motion: the signal field is one still frame, nothing is scroll-linked, diagram highlighting still works and the trace lights the whole path at once, and everything else renders in its finished state.

## Do

- Put a source next to every number. Use only facts from the CV.
- Keep the page scannable: scope lines in Experience, results in Selected work, no repetition between them.
- Verify both themes and a 375px viewport for every change.

## Don't

- The signal field is the only background layer. No gradients, glows, second accent, or decorative icons.
- No second accent color.
- No em dashes in copy.
- No fabricated metrics, testimonials, or logos.
