# Andhana Utama — Portfolio

Personal site for Andhana Utama, Senior Backend Engineer and Technical Lead.
Ported from a Claude Design project into a Vue 3 single-page site.

## Stack

- **Vue 3** (`<script setup>`, TypeScript, strict)
- **Vite** for dev server and build
- **[Motion for Vue](https://motion.dev/docs/vue)** (`motion-v`) for every state-driven animation
- Plain CSS with design tokens — no UI framework, no CSS-in-JS
- **Express + nodemailer** for the contact form endpoint (see [Contact form](#contact-form)),
  with `helmet` for CSP and security headers and `compression` for gzip
- Shipped as a single container — see [DEPLOY.md](DEPLOY.md)

## Getting started

```bash
npm install
cp .env.example .env   # then fill in the SMTP values
npm run dev            # Vite on :5173 + API on :3000, together
npm run build          # typecheck + SPA into dist/ + API into dist-server/
npm start              # production: serves dist/ and the API on one origin
npm run typecheck      # vue-tsc + tsc over server/
```

`npm run dev` runs two processes. Vite proxies `/api` to the API on port 3000,
so the front end uses the same relative path in development and production.

## Contact form

The form posts to `POST /api/contact`, which sends mail over SMTP. The
credentials are **server-side only** — they are never read through
`import.meta.env` and never reach the browser bundle.

Locally, configure via `.env` (gitignored; `.env.example` lists the keys). In
production the same variables are injected by Dokploy rather than read from a
file — see [DEPLOY.md](DEPLOY.md).

| Variable | Notes |
| --- | --- |
| `SMTP_HOST` / `SMTP_PORT` | Port 465 uses implicit TLS; anything else negotiates STARTTLS |
| `SMTP_USER` / `SMTP_PASS` | Provider credentials |
| `SMTP_FROM` | Verified sender. Must be a domain configured with your provider — sending as an arbitrary `@gmail.com` fails SPF/DMARC |
| `CONTACT_TO` | Where submissions land. Read from config, never from the request body |
| `PORT` | API port, defaults to `3000` |

The server fails to start if any of these are missing, and logs whether the
SMTP connection verified so a bad credential or a blocked outbound port shows
up at boot rather than on the first real enquiry.

Abuse handling: a honeypot field (`company`) that only bots fill in, a per-IP
rate limit of 5 requests per 15 minutes, a 10 kB body cap, server-side
validation with length limits, and CR/LF stripping so input cannot inject SMTP
headers. Replies go to the visitor via `Reply-To`.

### Deploying

**See [DEPLOY.md](DEPLOY.md).** It covers Dokploy setup, how secrets are kept
out of the image, verification and troubleshooting.

In short: one Node process serves the SPA and the API, built from the
`Dockerfile` and fronted by Dokploy's Traefik for TLS. Configuration is injected
at run time through Dokploy's Environment tab — `.env` is gitignored and
`.dockerignore` excludes every `.env*` from the build context, so credentials
never enter an image layer.

`GET /api/health` backs the container `HEALTHCHECK`. It deliberately makes no
SMTP round trip, so a briefly unreachable mail provider cannot cause restarts.

## Layout

```
Dockerfile          multi-stage build; runtime image carries no secrets
docker-compose.yml  runs the production image locally against the real .env
DEPLOY.md           Dokploy deployment, secrets handling, troubleshooting
public/assets/      portrait + CV PDF served as-is
server/             contact API — never imported by src/
  index.ts          app wiring, helmet/CSP, rate limit, static SPA, /api/health
  env.ts            required env vars, validated at boot
  mailer.ts         pooled nodemailer transport
  validate.ts       payload validation + honeypot check
  routes/contact.ts POST /api/contact
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
- Contact form has real labels, native validation, and a polite live region that
  announces sending, success and failure. The submit button is disabled while a
  send is in flight, and a failed send keeps what the visitor typed and offers a
  direct email address instead. The honeypot is `aria-hidden` and untabbable, so
  it is invisible to assistive technology.
