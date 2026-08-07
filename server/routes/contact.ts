import type { RequestHandler } from 'express'
import type { Mailer } from '../mailer.js'
import { isHoneypotTripped, validateContact } from '../validate.js'

export function createContactHandler(mailer: Mailer): RequestHandler {
  return async (req, res) => {
    // Answer bots with the same shape a human gets. An error response only
    // teaches the bot to retry with different input.
    if (isHoneypotTripped(req.body)) {
      res.status(200).json({ ok: true })
      return
    }

    const result = validateContact(req.body)

    if (!result.ok) {
      res.status(400).json({ ok: false, errors: result.errors })
      return
    }

    try {
      await mailer.sendContactEmail(result.data)
      res.status(200).json({ ok: true })
    } catch (error) {
      // Log detail for the operator, but never echo it to the client — SMTP
      // errors disclose host and auth information to anyone probing this route.
      console.error('[contact] send failed:', {
        message: error instanceof Error ? error.message : String(error),
        code: (error as { code?: unknown }).code,
      })

      res.status(502).json({
        ok: false,
        error: 'Could not send your message right now.',
      })
    }
  }
}
