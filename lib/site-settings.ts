import { sql } from '@/lib/db'
import { type Locale } from '@/i18n/config'
import {
  parseEnabledLocales,
  parseBool,
  phoneToTel,
  phoneToWhatsApp,
  SETTING_KEYS,
  PUBLIC_SETTING_KEYS,
  DEFAULT_SERVICES,
  DEFAULT_GALLERY,
  DEFAULT_FOOTER_REGIONS,
} from '@/lib/settings-utils'

export { parseEnabledLocales, parseBool, phoneToTel, phoneToWhatsApp, SETTING_KEYS, PUBLIC_SETTING_KEYS }

const DEFAULTS: Record<string, string> = {
  [SETTING_KEYS.companyName]: 'Cappadocia Sera Transfer',
  [SETTING_KEYS.sitePhone]: '0553 464 71 50',
  [SETTING_KEYS.siteEmail]: 'info@cappadociaseratransfer.com',
  [SETTING_KEYS.siteAddress]: 'Nevsehir, Turkiye',
  [SETTING_KEYS.siteWhatsapp]: '905534647150',
  [SETTING_KEYS.enabledLocales]: JSON.stringify(['tr', 'en', 'ru', 'hi']),
  [SETTING_KEYS.notifyBooking]: 'true',
  [SETTING_KEYS.notifyDriverApplication]: 'true',
  [SETTING_KEYS.notifyContact]: 'true',
  [SETTING_KEYS.notifyQa]: 'true',
  [SETTING_KEYS.smtpHost]: 'smtp.gmail.com',
  [SETTING_KEYS.smtpPort]: '587',
  [SETTING_KEYS.smtpSecure]: 'false',
  [SETTING_KEYS.smtpPass]: '',
  [SETTING_KEYS.paymentCashEnabled]: 'true',
  [SETTING_KEYS.paymentOnlineEnabled]: 'false',
  [SETTING_KEYS.currency]: 'TRY',
  [SETTING_KEYS.minBookingHours]: '2',
  [SETTING_KEYS.socialInstagram]: 'https://instagram.com',
  [SETTING_KEYS.socialFacebook]: 'https://facebook.com',
  [SETTING_KEYS.socialYoutube]: '',
  [SETTING_KEYS.socialTwitter]: '',
  [SETTING_KEYS.contentServices]: JSON.stringify(DEFAULT_SERVICES),
  [SETTING_KEYS.contentGallery]: JSON.stringify(DEFAULT_GALLERY),
  [SETTING_KEYS.contentFooterRegions]: JSON.stringify(DEFAULT_FOOTER_REGIONS),
  [SETTING_KEYS.siteLogo]: '/logo.png',
  [SETTING_KEYS.siteFavicon]: '/logo.png',
}

export type SiteSettings = Record<string, string>

export async function getAllSettings(): Promise<SiteSettings> {
  const rows = await sql`SELECT key, value FROM settings`
  const map: SiteSettings = { ...DEFAULTS }

  for (const row of rows) {
    const key = String(row.key)
    const value = String(row.value ?? '')
    if (value !== '') map[key] = value
  }

  return map
}

export async function getPublicSettings(): Promise<SiteSettings> {
  const all = await getAllSettings()
  const pub: SiteSettings = {}

  for (const key of PUBLIC_SETTING_KEYS) {
    pub[key] = all[key] ?? DEFAULTS[key] ?? ''
  }

  return pub
}

export async function upsertSettings(updates: Record<string, string>): Promise<void> {
  for (const [key, value] of Object.entries(updates)) {
    await sql`
      INSERT INTO settings (key, value, updated_at)
      VALUES (${key}, ${value}, NOW())
      ON CONFLICT (key) DO UPDATE SET
        value = EXCLUDED.value,
        updated_at = NOW()
    `
  }
}

let enabledLocalesCache: { value: Locale[]; at: number } | null = null
const CACHE_MS = 60_000

export function invalidateSettingsCache() {
  enabledLocalesCache = null
}

export async function getEnabledLocales(): Promise<Locale[]> {
  if (enabledLocalesCache && Date.now() - enabledLocalesCache.at < CACHE_MS) {
    return enabledLocalesCache.value
  }
  const settings = await getAllSettings()
  const value = parseEnabledLocales(settings[SETTING_KEYS.enabledLocales])
  enabledLocalesCache = { value, at: Date.now() }
  return value
}
