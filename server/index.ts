import { existsSync } from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'
import compression from 'compression'
import express from 'express'
import type { ErrorRequestHandler } from 'express'
import rateLimit from 'express-rate-limit'
import helmet from 'helmet'
import { loadConfig } from './env.js'
import { createMailer } from './mailer.js'
import { createContactHandler } from './routes/contact.js'

const config = loadConfig()
const mailer = createMailer(config)

const app = express()

// Two proxy hops in production: Cloudflare's edge fronts the domain and passes
// to Dokploy's Traefik, which passes to this process. Express counts hops from
// the right of X-Forwarded-For, so a depth of one resolves every request to
// Cloudflare's edge address and makes the limiter below throttle a whole PoP as
// one client. This must track the real hop count in both directions — too high
// and a spoofed X-Forwarded-For lets a client pick its own key and dodge the
// limit, so drop back to 1 if the record is ever grey-clouded.
app.set('trust proxy', 2)
app.disable('x-powered-by')

app.use(compression())

// This process serves the HTML itself, so it owns the response headers rather
// than delegating them to a separate web server.
app.use(
  helmet({
    contentSecurityPolicy: {
      directives: {
        defaultSrc: ["'self'"],
        // The production build emits no inline script — every bundle is a
        // separate hashed file — so 'self' needs no nonce or hash alongside it.
        scriptSrc: ["'self'"],
        // fonts.googleapis.com serves the stylesheet linked from index.html.
        // 'unsafe-inline' is here for the inline style attributes motion-v
        // writes while animating; no stylesheet depends on it.
        styleSrc: ["'self'", "'unsafe-inline'", 'https://fonts.googleapis.com'],
        fontSrc: ["'self'", 'https://fonts.gstatic.com'],
        imgSrc: ["'self'", 'data:'],
        // The contact form only ever posts back to this same origin.
        connectSrc: ["'self'"],
        objectSrc: ["'none'"],
        frameAncestors: ["'none'"],
        baseUri: ["'self'"],
        formAction: ["'self'"],
        upgradeInsecureRequests: [],
      },
    },
    frameguard: { action: 'deny' },
    // `preload` is deliberately omitted — submitting to the preload list is a
    // commitment for the whole domain that is slow and painful to undo.
    hsts: { maxAge: 31536000, includeSubDomains: true },
  }),
)

const contactLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  limit: 5,
  standardHeaders: 'draft-7',
  legacyHeaders: false,
  message: { ok: false, error: 'Too many messages sent. Please try again in a little while.' },
})

app.post(
  '/api/contact',
  contactLimiter,
  express.json({ limit: '10kb' }),
  createContactHandler(mailer),
)

// Probed by the container HEALTHCHECK and by Dokploy. Deliberately cheap: no
// SMTP round trip and no disk access, so a briefly unreachable mail provider
// never causes the whole site to be restarted. Must stay above the /api
// catch-all below, which would otherwise answer it with a 404.
app.get('/api/health', (_req, res) => {
  res.json({ ok: true, uptime: process.uptime() })
})

// Malformed JSON throws inside express.json. Without this it would fall through
// to the default handler and return an HTML stack trace.
const apiErrorHandler: ErrorRequestHandler = (error, _req, res, _next) => {
  console.error('[api] request failed:', error instanceof Error ? error.message : error)
  res.status(400).json({ ok: false, error: 'Malformed request.' })
}

app.use('/api', apiErrorHandler)

app.use('/api', (_req, res) => {
  res.status(404).json({ ok: false, error: 'Not found.' })
})

// Serve the built SPA when it exists, so one process covers site + API on a
// single origin. In dev the Vite server handles the front end instead.
const rootDir = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..')
const clientDir = path.join(rootDir, 'dist')

if (existsSync(clientDir)) {
  app.use(express.static(clientDir, { index: false, maxAge: '1h' }))

  // Express 5 rejects the old '*' string pattern, so match with a RegExp.
  app.get(/.*/, (_req, res) => {
    res.sendFile(path.join(clientDir, 'index.html'))
  })
}

const server = app.listen(config.port, () => {
  console.log(`[server] listening on http://localhost:${config.port}`)
  console.log(`[server] contact mail → ${config.to} via ${config.smtp.host}:${config.smtp.port}`)
  console.log(`[server] static SPA: ${existsSync(clientDir) ? clientDir : 'not built (dev mode)'}`)
})

// Surfaces bad credentials or a blocked outbound port at boot instead of on the
// first real enquiry. A warning, not a crash — SMTP being briefly unreachable
// should not stop the site from serving.
void mailer.verify().then(
  () => console.log('[server] SMTP connection verified'),
  (error: unknown) => {
    console.warn(
      '[server] SMTP verify failed —',
      error instanceof Error ? error.message : error,
    )
    console.warn('[server] check credentials, and that outbound port is not blocked.')
  },
)

for (const signal of ['SIGTERM', 'SIGINT'] as const) {
  process.on(signal, () => {
    console.log(`[server] ${signal} received, shutting down`)
    server.close(() => process.exit(0))
  })
}
