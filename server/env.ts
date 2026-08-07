/**
 * Server-side configuration, resolved once at boot.
 *
 * Everything here is either a secret or a deployment detail, so nothing in
 * `src/` may import this module — that would compile the credentials into the
 * browser bundle.
 */

const REQUIRED = [
  'SMTP_HOST',
  'SMTP_PORT',
  'SMTP_USER',
  'SMTP_PASS',
  'SMTP_FROM',
  'CONTACT_TO',
] as const

type RequiredKey = (typeof REQUIRED)[number]

export interface SmtpConfig {
  readonly host: string
  readonly port: number
  readonly secure: boolean
  readonly user: string
  readonly pass: string
}

export interface ServerConfig {
  readonly smtp: SmtpConfig
  readonly from: string
  readonly to: string
  readonly port: number
}

function readPort(value: string | undefined, label: string, fallback?: number): number {
  if (value === undefined || value.trim() === '') {
    if (fallback !== undefined) return fallback
    throw new Error(`${label} is required.`)
  }

  const port = Number(value)

  if (!Number.isInteger(port) || port < 1 || port > 65535) {
    throw new Error(`${label} must be a port number between 1 and 65535, received "${value}".`)
  }

  return port
}

/**
 * Validates up front so a misconfigured deploy crashes on start rather than
 * silently swallowing the first enquiry that arrives.
 */
export function loadConfig(): ServerConfig {
  const missing = REQUIRED.filter((key) => !process.env[key]?.trim())

  if (missing.length > 0) {
    throw new Error(
      `Missing required environment variable(s): ${missing.join(', ')}. ` +
        'Copy .env.example to .env and fill it in, or set them in your service manager.',
    )
  }

  const env = Object.fromEntries(
    REQUIRED.map((key) => [key, process.env[key]!.trim()]),
  ) as Record<RequiredKey, string>

  const smtpPort = readPort(env.SMTP_PORT, 'SMTP_PORT')

  return Object.freeze({
    smtp: Object.freeze({
      host: env.SMTP_HOST,
      port: smtpPort,
      // 465 is implicit TLS. Anything else (587, 25) starts plaintext and
      // upgrades via STARTTLS, which nodemailer handles when `secure` is false.
      secure: smtpPort === 465,
      user: env.SMTP_USER,
      pass: env.SMTP_PASS,
    }),
    from: env.SMTP_FROM,
    to: env.CONTACT_TO,
    port: readPort(process.env.PORT, 'PORT', 3000),
  })
}
