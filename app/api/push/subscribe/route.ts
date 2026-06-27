import { NextRequest, NextResponse } from 'next/server'
import { sql } from '@/lib/db'
import { requireAdmin, unauthorized } from '@/lib/auth'

type SubscribeBody = {
  endpoint?: string
  keys?: { p256dh?: string; auth?: string }
}

export async function POST(request: NextRequest) {
  try {
    const admin = await requireAdmin()
    if (!admin) return unauthorized()

    const body = (await request.json()) as SubscribeBody
    const endpoint = body.endpoint?.trim()
    const p256dh = body.keys?.p256dh?.trim()
    const auth = body.keys?.auth?.trim()

    if (!endpoint || !p256dh || !auth) {
      return NextResponse.json({ error: 'Gecersiz abonelik verisi' }, { status: 400 })
    }

    await sql`
      INSERT INTO push_subscriptions (user_id, endpoint, p256dh, auth)
      VALUES (${admin.id}, ${endpoint}, ${p256dh}, ${auth})
      ON CONFLICT (endpoint) DO UPDATE SET
        user_id = EXCLUDED.user_id,
        p256dh = EXCLUDED.p256dh,
        auth = EXCLUDED.auth
    `

    return NextResponse.json({ message: 'Push aboneligi kaydedildi' })
  } catch (error) {
    console.error('Push subscribe error:', error)
    return NextResponse.json({ error: 'Abonelik kaydedilemedi' }, { status: 500 })
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const admin = await requireAdmin()
    if (!admin) return unauthorized()

    const body = (await request.json()) as { endpoint?: string }
    const endpoint = body.endpoint?.trim()

    if (endpoint) {
      await sql`DELETE FROM push_subscriptions WHERE endpoint = ${endpoint}`
    } else {
      await sql`DELETE FROM push_subscriptions WHERE user_id = ${admin.id}`
    }

    return NextResponse.json({ message: 'Push aboneligi silindi' })
  } catch (error) {
    console.error('Push unsubscribe error:', error)
    return NextResponse.json({ error: 'Abonelik silinemedi' }, { status: 500 })
  }
}
