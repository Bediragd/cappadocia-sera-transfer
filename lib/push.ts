import webpush from 'web-push'
import { sql } from '@/lib/db'

export type PushPayload = {
  title: string
  body: string
  url?: string
  tag?: string
}

type PushSubscriptionRow = {
  id: number
  endpoint: string
  p256dh: string
  auth: string
}

let vapidConfigured = false

export function getVapidPublicKey(): string | null {
  return process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY?.trim() || null
}

function ensureVapidConfigured(): boolean {
  if (vapidConfigured) return true

  const publicKey = getVapidPublicKey()
  const privateKey = process.env.VAPID_PRIVATE_KEY?.trim()
  const subject = process.env.VAPID_SUBJECT?.trim() || 'mailto:info@cappadociaseratransfer.com'

  if (!publicKey || !privateKey) return false

  webpush.setVapidDetails(subject, publicKey, privateKey)
  vapidConfigured = true
  return true
}

export async function sendPushToAdmins(payload: PushPayload): Promise<number> {
  if (!ensureVapidConfigured()) {
    console.warn('[push] VAPID anahtarlari tanimli degil, push atlaniyor')
    return 0
  }

  const rows = (await sql`
    SELECT id, endpoint, p256dh, auth
    FROM push_subscriptions
  `) as PushSubscriptionRow[]

  if (rows.length === 0) return 0

  const body = JSON.stringify(payload)
  let sent = 0

  for (const row of rows) {
    try {
      await webpush.sendNotification(
        {
          endpoint: row.endpoint,
          keys: { p256dh: row.p256dh, auth: row.auth },
        },
        body
      )
      sent++
    } catch (err: unknown) {
      const status = err && typeof err === 'object' && 'statusCode' in err
        ? (err as { statusCode?: number }).statusCode
        : undefined

      if (status === 404 || status === 410) {
        await sql`DELETE FROM push_subscriptions WHERE id = ${row.id}`
      } else {
        const msg = err instanceof Error ? err.message : String(err)
        console.error('[push] Gonderim hatasi:', msg)
      }
    }
  }

  return sent
}
