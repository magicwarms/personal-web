/**
 * Request validation for the contact endpoint.
 *
 * The browser already enforces `required` and `type="email"`, but that is a
 * convenience for humans — anything reaching the server is untrusted.
 */

export interface ContactInput {
  name: string
  email: string
  message: string
}

export type ValidationErrors = Partial<Record<keyof ContactInput, string>>

export type ValidationResult =
  | { ok: true; data: ContactInput }
  | { ok: false; errors: ValidationErrors }

/** Caps that keep a single submission from becoming a payload attack. */
const LIMITS = { name: 100, email: 200, message: 5000 } as const

/**
 * Deliberately loose. Full RFC 5322 validation rejects addresses that work
 * fine in practice; the real proof an address is valid is that a reply lands.
 */
const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/

function asTrimmedString(value: unknown): string {
  return typeof value === 'string' ? value.trim() : ''
}

function asRecord(body: unknown): Record<string, unknown> {
  return typeof body === 'object' && body !== null ? (body as Record<string, unknown>) : {}
}

export function validateContact(body: unknown): ValidationResult {
  const source = asRecord(body)

  const data: ContactInput = {
    name: asTrimmedString(source.name),
    email: asTrimmedString(source.email),
    message: asTrimmedString(source.message),
  }

  const errors: ValidationErrors = {}

  if (!data.name) {
    errors.name = 'Please include your name.'
  } else if (data.name.length > LIMITS.name) {
    errors.name = `Please keep your name under ${LIMITS.name} characters.`
  }

  if (!data.email) {
    errors.email = 'An email address is required so I can reply.'
  } else if (data.email.length > LIMITS.email) {
    errors.email = `Please keep your email under ${LIMITS.email} characters.`
  } else if (!EMAIL_PATTERN.test(data.email)) {
    errors.email = 'That email address does not look right.'
  }

  if (!data.message) {
    errors.message = 'Please include a message.'
  } else if (data.message.length > LIMITS.message) {
    errors.message = `Please keep your message under ${LIMITS.message} characters.`
  }

  if (Object.keys(errors).length > 0) return { ok: false, errors }

  return { ok: true, data }
}

/**
 * The honeypot is a field hidden from humans. Bots fill in every input they
 * find, so anything non-empty here is automated.
 */
export function isHoneypotTripped(body: unknown): boolean {
  return asTrimmedString(asRecord(body).company).length > 0
}
