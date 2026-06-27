import nodemailer from 'nodemailer'
import { getAllSettings } from '@/lib/site-settings'
import { SETTING_KEYS } from '@/lib/settings-utils'

type MailOptions = {
  to: string
  fromEmail: string
  fromName?: string
  subject: string
  text: string
  html: string
}

type SmtpConfig = {
  host: string
  port: number
  secure: boolean
  pass: string
  user: string
}

async function resolveSmtpConfig(siteEmail: string): Promise<SmtpConfig | null> {
  const settings = await getAllSettings()
  const host = settings[SETTING_KEYS.smtpHost]?.trim() || process.env.SMTP_HOST?.trim()
  const pass = settings[SETTING_KEYS.smtpPass]?.trim() || process.env.SMTP_PASS?.trim()
  const user = siteEmail.trim()

  if (!host || !pass || !user) return null

  const port = parseInt(
    settings[SETTING_KEYS.smtpPort] || process.env.SMTP_PORT || '587',
    10
  )
  const secureSetting =
    settings[SETTING_KEYS.smtpSecure] ?? process.env.SMTP_SECURE ?? 'false'
  const secure = secureSetting === 'true' || port === 465

  return { host, port, secure, pass, user }
}

function createTransporter(config: SmtpConfig) {
  return nodemailer.createTransport({
    host: config.host,
    port: config.port,
    secure: config.secure,
    auth: { user: config.user, pass: config.pass },
  })
}

export async function isEmailConfigured(siteEmail?: string): Promise<boolean> {
  if (!siteEmail?.trim()) return false
  const config = await resolveSmtpConfig(siteEmail)
  return config !== null
}

export async function sendAdminEmail(options: MailOptions): Promise<boolean> {
  const config = await resolveSmtpConfig(options.fromEmail)
  if (!config) {
    console.warn('[email] SMTP veya site e-postasi eksik, mail atlaniyor')
    return false
  }

  const fromName = options.fromName || 'Cappadocia Sera Transfer'
  const from = `"${fromName}" <${options.fromEmail}>`

  try {
    await createTransporter(config).sendMail({
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
