import { existsSync } from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'
import express from 'express'
import type { ErrorRequestHandler } from 'express'
import rateLimit from 'express-rate-limit'
import { loadConfig } from './env.js'
import { createMailer } from './mailer.js'
import { createContactHandler } from './routes/contact.js'

const config = loadConfig()
const mailer = createMailer(config)

const app = express()

// nginx terminates TLS in production. Without this the limiter sees every
// request as coming from 127.0.0.1 and throttles all visitors as one client.
app.set('trust proxy', 1)
app.disable('x-powered-by')

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
