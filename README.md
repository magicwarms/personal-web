# Andhana Utama — Portfolio

Personal site for Andhana Utama, Senior Backend Engineer and Technical Lead,
built for recruiters and hiring managers. Design direction lives in
[DESIGN.md](DESIGN.md).

## Stack

- **Vue 3** (`<script setup>`, TypeScript, strict), prerendered to static HTML at
  build time and hydrated in the browser
- **Vite** for dev server and build
- **GSAP** (ScrollTrigger) for scroll reveals and the earlier-roles accordion;
  the hero and system diagram animate in plain CSS
- Plain CSS with design tokens and a light/dark theme — no UI framework, no CSS-in-JS
- **Express + nodemailer** for the contact form endpoint (see [Contact form](#contact-form)),
  with `helmet` for CSP and security headers and `compression` for gzip
- Shipped as a single container — see [DEPLOY.md](DEPLOY.md)

## Getting started

```bash
npm install
cp .env.example .env   # then fill in the SMTP values
npm run dev            # Vite on :5173 + API on :3000, together
npm run build          # typecheck + SPA into dist/ + prerender + API into dist-server/
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
public/             favicon, robots.txt, sitemap.xml, theme-init.js (pre-paint theme)
public/assets/      portrait + CV PDF served as-is
scripts/prerender.mjs  writes the server-rendered page into dist/index.html
server/             contact API — never imported by src/
  index.ts          app wiring, helmet/CSP, rate limit, static SPA, /api/health
  env.ts            required env vars, validated at boot
  mailer.ts         pooled nodemailer transport
  validate.ts       payload validation + honeypot check
  routes/contact.ts POST /api/contact
src/
  data/portfolio.ts all copy — edit content here, not in components
  motion/gsap.ts    GSAP plugin registration and shared easing
  composables/      useSectionMotion (reveal lifecycle), useTheme (light/dark)
  components/       one component per section, plus ui/ primitives
  entry-server.ts   build-time render entry used by the prerender step
  styles/base.css   design tokens, resets, shared primitives
```

Content lives in `src/data/portfolio.ts`, and every number in it comes from
the CV in `public/assets/`. Components are presentational: changing a job, a
project, or a skill means editing data, not markup.

## SEO

- The page is prerendered, so crawlers and link-preview bots that do not run
  JavaScript still get the full content.
- `index.html` carries the title, description, canonical URL, Open Graph and
  Twitter tags, and a JSON-LD `ProfilePage`/`Person` block. Keep it in sync with
  `src/data/portfolio.ts` when the copy changes.
- `robots.txt` and `sitemap.xml` are in `public/`. Paths other than `/` return
  404 with the page, so stray URLs are not indexed as duplicates.

## Animation notes

- Reduced motion is honoured everywhere: `useSectionMotion` builds the static
  end state instead of the reveal, and `base.css` collapses the CSS animations.
- Scroll reveals run once, through `RevealItem`. Blocks already on screen at
  load are not hidden, so the prerendered page never blinks.
- The hero diagram pauses its traffic animation while offscreen.

## Accessibility

- Skip link, landmark elements, one `h1`, ordered headings, `aria-labelledby`
  on each section.
- Light and dark themes both meet WCAG AA contrast; the theme toggle keeps its
  visible label inside its accessible name.
- The earlier-roles toggle uses `aria-expanded`/`aria-controls` against an
  element that is always present in the DOM.
- Contact form has real labels, native validation, and a polite live region that
  announces sending, success and failure. The submit button is disabled while a
  send is in flight, and a failed send keeps what the visitor typed and offers a
  direct email address instead. The honeypot is `aria-hidden` and untabbable, so
  it is invisible to assistive technology.
