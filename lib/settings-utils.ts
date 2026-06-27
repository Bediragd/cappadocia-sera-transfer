import { locales, defaultLocale, type Locale } from '@/i18n/config'

export const SETTING_KEYS = {
  companyName: 'company_name',
  sitePhone: 'site_phone',
  siteEmail: 'site_email',
  siteAddress: 'site_address',
  siteWhatsapp: 'site_whatsapp',
  enabledLocales: 'enabled_locales',
  notifyBooking: 'notify_booking',
  notifyDriverApplication: 'notify_driver_application',
  notifyContact: 'notify_contact',
  notifyQa: 'notify_qa',
  smtpHost: 'smtp_host',
  smtpPort: 'smtp_port',
  smtpSecure: 'smtp_secure',
  smtpPass: 'smtp_pass',
  paymentCashEnabled: 'payment_cash_enabled',
  paymentOnlineEnabled: 'payment_online_enabled',
  currency: 'currency',
  minBookingHours: 'min_booking_hours',
  // Sosyal medya
  socialInstagram: 'social_instagram',
  socialFacebook: 'social_facebook',
  socialYoutube: 'social_youtube',
  socialTwitter: 'social_twitter',
  // Site içeriği (JSON)
  contentServices: 'content_services',
  contentGallery: 'content_gallery',
  contentFooterRegions: 'content_footer_regions',
} as const

export const PUBLIC_SETTING_KEYS = [
  SETTING_KEYS.companyName,
  SETTING_KEYS.sitePhone,
  SETTING_KEYS.siteEmail,
  SETTING_KEYS.siteAddress,
  SETTING_KEYS.siteWhatsapp,
  SETTING_KEYS.enabledLocales,
  SETTING_KEYS.paymentCashEnabled,
  SETTING_KEYS.paymentOnlineEnabled,
  SETTING_KEYS.socialInstagram,
  SETTING_KEYS.socialFacebook,
  SETTING_KEYS.socialYoutube,
  SETTING_KEYS.socialTwitter,
  SETTING_KEYS.contentServices,
  SETTING_KEYS.contentGallery,
  SETTING_KEYS.contentFooterRegions,
] as const

export type ServiceItem = { icon: string; title: string; description: string }
export type GalleryItem = { src: string; alt: string }

export const DEFAULT_SERVICES: ServiceItem[] = [
  { icon: 'Plane', title: 'Havalimanı Transferi', description: 'Nevşehir ve Kayseri havalimanlarından otelinize güvenli transfer hizmeti.' },
  { icon: 'Hotel', title: 'Otel Transferi', description: 'Otelinizden havalimanına zamanında ve konforlu ulaşım.' },
  { icon: 'Users', title: 'VIP Transfer', description: 'Lüks araçlarla özel ve kişiye özel transfer deneyimi.' },
  { icon: 'Car', title: 'Grup Transferi', description: 'Büyük gruplar için geniş araç filosuyla toplu transfer hizmeti.' },
]

export const DEFAULT_GALLERY: GalleryItem[] = [
  { src: '/cappadocia-fairy-chimneys-sunrise-panorama.jpg', alt: 'Kapadokya Peri Bacaları Gündoğumu' },
  { src: '/cappadocia-hot-air-balloons-sunrise.jpg', alt: 'Kapadokya Sıcak Hava Balonları' },
  { src: '/goreme-valley-cappadocia-sunset.jpg', alt: 'Göreme Vadisi Gün Batımı' },
  { src: '/uchisar-castle-cappadocia.jpg', alt: 'Uçhisar Kalesi' },
  { src: '/cappadocia-cave-hotels-sunset.jpg', alt: 'Kapadokya Kaya Otelleri' },
  { src: '/cappadocia-landscape-fairy-chimneys.jpg', alt: 'Kapadokya Manzarası' },
]

export const DEFAULT_FOOTER_REGIONS: string[] = [
  'Nevşehir Kapadokya Havalimanı',
  'Kayseri Erkilet Havalimanı',
  'Göreme',
  'Ürgüp',
  'Uçhisar',
  'Avanos',
]

export function parseJsonSetting<T>(raw: string | undefined, fallback: T): T {
  if (!raw) return fallback
  try {
    const parsed = JSON.parse(raw)
    return parsed as T
  } catch {
    return fallback
  }
}

export function parseEnabledLocales(raw: string | undefined): Locale[] {
  try {
    const parsed = JSON.parse(raw || '[]') as unknown
    if (!Array.isArray(parsed)) return [defaultLocale]
    const enabled = parsed.filter(
      (code): code is Locale =>
        typeof code === 'string' && locales.includes(code as Locale)
    )
    if (!enabled.includes(defaultLocale)) enabled.unshift(defaultLocale)
    return enabled.length > 0 ? enabled : [defaultLocale]
  } catch {
    return [defaultLocale]
  }
}

export function parseBool(value: string | undefined, fallback = false): boolean {
  if (value === undefined) return fallback
  return value === 'true' || value === '1'
}

export function phoneToTel(phone: string): string {
  const digits = phone.replace(/\D/g, '')
  if (digits.startsWith('90')) return `+${digits}`
  if (digits.startsWith('0')) return `+90${digits.slice(1)}`
  return digits ? `+${digits}` : phone
}

export function phoneToWhatsApp(phone: string): string {
  return phone.replace(/\D/g, '').replace(/^0/, '90')
}
