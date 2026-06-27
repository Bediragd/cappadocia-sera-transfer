import nodemailer from 'nodemailer'

type MailOptions = {
  to: string
  fromEmail: string
  fromName?: string
  subject: string
  text: string
  html: string
}

function getTransporter(smtpUser: string) {
  const host = process.env.SMTP_HOST?.trim()
  const pass = process.env.SMTP_PASS?.trim()

  if (!host || !pass || !smtpUser) return null

  const port = parseInt(process.env.SMTP_PORT || '587', 10)
  const secure = process.env.SMTP_SECURE === 'true' || port === 465

  return nodemailer.createTransport({
    host,
    port,
    secure,
    auth: { user: smtpUser, pass },
  })
}

/** SMTP sunucu + sifre + admin panelindeki site e-postasi yeterli */
export function isEmailConfigured(siteEmail?: string): boolean {
  return Boolean(
    process.env.SMTP_HOST?.trim() &&
      process.env.SMTP_PASS?.trim() &&
      siteEmail?.trim()
  )
}

export async function sendAdminEmail(options: MailOptions): Promise<boolean> {
  const transporter = getTransporter(options.fromEmail)
  if (!transporter) {
    console.warn('[email] SMTP ayarlari veya site e-postasi eksik, mail atlaniyor')
    return false
  }

  const fromName = options.fromName || 'Cappadocia Sera Transfer'
  const from = `"${fromName}" <${options.fromEmail}>`

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
