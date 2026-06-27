import { getAllSettings, parseBool } from '@/lib/site-settings'
import { SETTING_KEYS } from '@/lib/settings-utils'

export type NotificationType = 'booking' | 'driver_application' | 'contact'

const KEY_BY_TYPE: Record<NotificationType, string> = {
  booking: SETTING_KEYS.notifyBooking,
  driver_application: SETTING_KEYS.notifyDriverApplication,
  contact: SETTING_KEYS.notifyContact,
}

export async function shouldNotify(type: NotificationType): Promise<boolean> {
  const settings = await getAllSettings()
  const key = KEY_BY_TYPE[type]
  return parseBool(settings[key], true)
}

/** E-posta altyapısı yokken admin bildirim tercihini loglar; ileride SMTP buraya bağlanır. */
export async function notifyAdmin(type: NotificationType, payload: Record<string, unknown>) {
  if (!(await shouldNotify(type))) return

  const settings = await getAllSettings()
  const adminEmail = settings[SETTING_KEYS.siteEmail]

  console.info(`[notify:${type}] → ${adminEmail}`, payload)
}
