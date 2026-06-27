import { NextRequest, NextResponse } from 'next/server'
import { getAllSettings, upsertSettings, invalidateSettingsCache } from '@/lib/site-settings'
import { SETTING_KEYS } from '@/lib/settings-utils'
import { locales, type Locale } from '@/i18n/config'

const ALLOWED_KEYS = new Set<string>(Object.values(SETTING_KEYS))

function validateUpdates(updates: Record<string, string>): string | null {
  if (updates[SETTING_KEYS.enabledLocales]) {
    try {
      const parsed = JSON.parse(updates[SETTING_KEYS.enabledLocales]) as unknown
      if (!Array.isArray(parsed)) return 'enabled_locales geçersiz'
      for (const code of parsed) {
        if (typeof code !== 'string' || !locales.includes(code as Locale)) {
          return `Geçersiz dil kodu: ${code}`
        }
      }
      if (!parsed.includes('tr')) return 'Türkçe dil seçeneği kapatılamaz'
    } catch {
      return 'enabled_locales geçersiz JSON'
    }
  }

  for (const key of Object.keys(updates)) {
    if (!ALLOWED_KEYS.has(key)) return `Geçersiz ayar anahtarı: ${key}`
  }

  return null
}

export async function GET() {
  try {
    const settings = await getAllSettings()
    return NextResponse.json({ settings })
  } catch (error) {
    console.error('Settings GET error:', error)
    return NextResponse.json({ error: 'Ayarlar yüklenemedi' }, { status: 500 })
  }
}

export async function PUT(request: NextRequest) {
  try {
    const body = await request.json()
    const updates = body.settings as Record<string, string> | undefined

    if (!updates || typeof updates !== 'object') {
      return NextResponse.json({ error: 'settings objesi gerekli' }, { status: 400 })
    }

    const normalized: Record<string, string> = {}
    for (const [key, value] of Object.entries(updates)) {
      normalized[key] = String(value)
    }

    const validationError = validateUpdates(normalized)
    if (validationError) {
      return NextResponse.json({ error: validationError }, { status: 400 })
    }

    await upsertSettings(normalized)
    invalidateSettingsCache()
    const settings = await getAllSettings()

    return NextResponse.json({ settings, message: 'Ayarlar kaydedildi' })
  } catch (error) {
    console.error('Settings PUT error:', error)
    return NextResponse.json({ error: 'Ayarlar kaydedilemedi' }, { status: 500 })
  }
}
