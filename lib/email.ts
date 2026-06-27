import nodemailer from 'nodemailer'

type MailOptions = {
  to: string
  subject: string
  text: string
  html: string
}

function getTransporter() {
  const host = process.env.SMTP_HOST?.trim()
  const user = process.env.SMTP_USER?.trim()
  const pass = process.env.SMTP_PASS?.trim()

  if (!host || !user || !pass) return null

  const port = parseInt(process.env.SMTP_PORT || '587', 10)
  const secure = process.env.SMTP_SECURE === 'true' || port === 465

  return nodemailer.createTransport({
    host,
    port,
    secure,
    auth: { user, pass },
  })
}

export function isEmailConfigured(): boolean {
  return Boolean(
    process.env.SMTP_HOST?.trim() &&
      process.env.SMTP_USER?.trim() &&
      process.env.SMTP_PASS?.trim()
  )
}

export async function sendAdminEmail(options: MailOptions): Promise<boolean> {
  const transporter = getTransporter()
  if (!transporter) {
    console.warn('[email] SMTP ayarlari eksik, mail atlaniyor')
    return false
  }

  const from =
    process.env.SMTP_FROM?.trim() ||
    `"Cappadocia Sera Transfer" <${process.env.SMTP_USER}>`

  try {
    await transporter.sendMail({
      from,
      to: options.to,
      subject: options.subject,
      text: options.text,
      html: options.html,
    })
    return true
  } catch (err) {
    const msg = err instanceof Error ? err.message : String(err)
    console.error('[email] Gonderim hatasi:', msg)
    return false
  }
}

export function adminPanelUrl(path: string): string {
  const base = (process.env.SITE_URL || '').replace(/\/$/, '')
  return base ? `${base}${path}` : path
}
