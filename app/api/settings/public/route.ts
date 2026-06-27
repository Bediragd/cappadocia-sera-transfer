import { NextResponse } from 'next/server'
import { getPublicSettings } from '@/lib/site-settings'

export async function GET() {
  try {
    const settings = await getPublicSettings()
    return NextResponse.json(
      { settings },
      { headers: { 'Cache-Control': 'public, s-maxage=60, stale-while-revalidate=120' } }
    )
  } catch (error) {
    console.error('Public settings GET error:', error)
    return NextResponse.json({ error: 'Ayarlar yüklenemedi' }, { status: 500 })
  }
}
