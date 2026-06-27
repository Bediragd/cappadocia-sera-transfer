import { getAllSettings, parseBool } from '@/lib/site-settings'
import { SETTING_KEYS } from '@/lib/settings-utils'
import { sendPushToAdmins } from '@/lib/push'
import { sendAdminEmail, adminPanelUrl, isEmailConfigured } from '@/lib/email'

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

function buildEmailDetails(type: NotificationType, payload: Record<string, unknown>): string[] {
  switch (type) {
    case 'booking':
      return [
        `Rezervasyon No: ${payload.bookingNumber ?? '-'}`,
        `Musteri: ${payload.customerName ?? '-'}`,
        `E-posta: ${payload.customerEmail ?? '-'}`,
        `Telefon: ${payload.customerPhone ?? '-'}`,
      ]
    case 'driver_application':
      return [
        `Ad: ${payload.name ?? '-'}`,
        `E-posta: ${payload.email ?? '-'}`,
        `Sehir: ${payload.city ?? '-'}`,
      ]
    case 'contact':
      return [
        `Gonderen: ${payload.name ?? '-'}`,
        `E-posta: ${payload.email ?? '-'}`,
        `Konu: ${payload.subject ?? '-'}`,
        payload.message ? `Mesaj: ${String(payload.message).slice(0, 500)}` : '',
      ].filter(Boolean)
    case 'qa':
      return [
        `Kullanici: ${payload.username ?? '-'}`,
        `Soru: ${payload.question ?? '-'}`,
      ]
  }
}

function buildEmailHtml(content: NotificationContent, details: string[], link: string): string {
  const rows = details.map((line) => `<p style="margin:4px 0">${line}</p>`).join('')
  return `
    <div style="font-family:sans-serif;max-width:520px">
      <h2 style="color:#1a1a1a">${content.title}</h2>
      <p>${content.body}</p>
      ${rows}
      <p style="margin-top:20px">
        <a href="${link}" style="background:#2563eb;color:#fff;padding:10px 16px;text-decoration:none;border-radius:6px;display:inline-block">
          Admin Panelde Gor
        </a>
      </p>
    </div>
  `
}

export async function shouldNotify(type: NotificationType): Promise<boolean> {
  const settings = await getAllSettings()
  const key = KEY_BY_TYPE[type]
  return parseBool(settings[key], true)
}

export async function notifyAdmin(type: NotificationType, payload: Record<string, unknown>) {
  if (!(await shouldNotify(type))) return

  const settings = await getAllSettings()
  const siteEmail = settings[SETTING_KEYS.siteEmail]?.trim()
  const companyName = settings[SETTING_KEYS.companyName]?.trim() || 'Cappadocia Sera Transfer'
  const content = buildContent(type, payload)
  const link = adminPanelUrl(content.url)
  const details = buildEmailDetails(type, payload)

  const tasks: Promise<void>[] = []

  tasks.push(
    sendPushToAdmins(content)
      .then((sent) => {
        if (sent > 0) {
          console.info(`[push] ${sent} cihaza bildirim gonderildi (${type})`)
        }
      })
      .catch((err) => console.error('[push] hata:', err))
  )

  if (siteEmail && (await isEmailConfigured(siteEmail))) {
    tasks.push(
      sendAdminEmail({
        to: siteEmail,
        fromEmail: siteEmail,
        fromName: companyName,
        subject: `[Admin] ${content.title}`,
        text: `${content.body}\n\n${details.join('\n')}\n\nAdmin panel: ${link}`,
        html: buildEmailHtml(content, details, link),
      }).then((ok) => {
        if (ok) console.info(`[email] ${siteEmail} adresine mail gonderildi (${type})`)
      })
    )
  }

  await Promise.all(tasks)
}
