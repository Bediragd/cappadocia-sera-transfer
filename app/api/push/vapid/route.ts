import { NextResponse } from 'next/server'
import { getVapidPublicKey } from '@/lib/push'

export async function GET() {
  const publicKey = getVapidPublicKey()
  return NextResponse.json({
    publicKey,
    enabled: Boolean(publicKey && process.env.VAPID_PRIVATE_KEY?.trim()),
  })
}
