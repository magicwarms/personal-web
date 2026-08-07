import { createTransport } from 'nodemailer'
import type { Transporter } from 'nodemailer'
import type { ServerConfig } from './env.js'
import type { ContactInput } from './validate.js'

/**
 * Collapses CR/LF so visitor input can never inject additional SMTP headers
 * when it is interpolated into `subject` or `replyTo`.
 */
function singleLine(value: string): string {
  return value.replace(/[\r\n]+/g, ' ').trim()
}

function escapeHtml(value: string): string {
  return value
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
}

export interface Mailer {
  sendContactEmail(input: ContactInput): Promise<void>
  verify(): Promise<void>
}

export function createMailer(config: ServerConfig): Mailer {
  // One pooled transport for the life of the process. Building a transport per
  // request would add a full TLS handshake to every submission.
  const transporter: Transporter = createTransport({
    host: config.smtp.host,
    port: config.smtp.port,
    secure: config.smtp.secure,
    auth: { user: config.smtp.user, pass: config.smtp.pass },
    pool: true,
    maxConnections: 2,
  })

  return {
    async sendContactEmail(input) {
      const name = singleLine(input.name)
      const email = singleLine(input.email)

      await transporter.sendMail({
        // `from` stays the verified sender so the message passes SPF/DMARC.
        // Sending as the visitor's own address would get us rejected.
        from: `"Portfolio Contact" <${config.from}>`,
        // Recipient comes from config, never from the request body — otherwise
        // the endpoint is an open relay.
        to: config.to,
        // Reply lands with the visitor instead of the noreply mailbox.
        replyTo: `"${name.replace(/"/g, "'")}" <${email}>`,
        subject: `Portfolio enquiry from ${name}`,
        text: `${input.message}\n\n—\nFrom: ${name} <${email}>`,
        html:
          `<p style="white-space:pre-wrap">${escapeHtml(input.message)}</p>` +
          `<hr>` +
          `<p>From: ${escapeHtml(name)} &lt;${escapeHtml(email)}&gt;</p>`,
      })
    },

    async verify() {
      await transporter.verify()
    },
  }
}
