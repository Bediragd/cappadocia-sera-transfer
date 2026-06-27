import { getAllSettings, parseBool } from '@/lib/site-settings'
import { SETTING_KEYS } from '@/lib/settings-utils'
import { sendPushToAdmins } from '@/lib/push'

export type NotificationType = 'booking' | 'driver_application' | 'contact' | 'qa'

const KEY_BY_TYPE: Record<NotificationType, string> = {
  booking: SETTING_KEYS.notifyBooking,
  driver_application: SETTING_KEYS.notifyDriverApplication,
  contact: SETTING_KEYS.notifyContact,
  qa: SETTING_KEYS.notifyQa,
}

type NotificationContent = {
  title: string
  body: string
  url: string
  tag: string
}

function buildContent(type: NotificationType, payload: Record<string, unknown>): NotificationContent {
  switch (type) {
    case 'booking':
      return {
        title: 'Yeni Rezervasyon',
        body: `${payload.customerName ?? 'Musteri'} — ${payload.bookingNumber ?? ''}`,
        url: '/admin/bookings',
        tag: 'booking',
      }
    case 'driver_application':
      return {
        title: 'Yeni Sofor Basvurusu',
        body: `${payload.name ?? 'Basvuran'} (${payload.city ?? ''})`,
        url: '/admin/applications',
        tag: 'driver_application',
      }
    case 'contact':
      return {
        title: 'Yeni Iletisim Mesaji',
        body: `${payload.name ?? 'Gonderen'}: ${payload.subject ?? ''}`,
        url: '/admin/messages',
        tag: 'contact',
      }
    case 'qa':
      return {
        title: 'Yeni Soru',
        body: `${payload.username ?? 'Kullanici'}: ${String(payload.question ?? '').slice(0, 80)}`,
        url: '/admin/questions',
        tag: 'qa',
      }
  }
}

export async function shouldNotify(type: NotificationType): Promise<boolean> {
  const settings = await getAllSettings()
  const key = KEY_BY_TYPE[type]
  return parseBool(settings[key], true)
}

export async function notifyAdmin(type: NotificationType, payload: Record<string, unknown>) {
  if (!(await shouldNotify(type))) return

  const settings = await getAllSettings()
  const adminEmail = settings[SETTING_KEYS.siteEmail]
  const content = buildContent(type, payload)

  console.info(`[notify:${type}] → ${adminEmail}`, payload)

  try {
    const sent = await sendPushToAdmins(content)
    if (sent > 0) {
      console.info(`[push] ${sent} admin cihazina bildirim gonderildi (${type})`)
    }
  } catch (err) {
    console.error('[push] notifyAdmin push hatasi:', err)
  }
}
