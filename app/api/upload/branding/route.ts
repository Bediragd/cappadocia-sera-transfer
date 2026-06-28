import { NextRequest, NextResponse } from 'next/server'
import { requireAdmin, unauthorized } from '@/lib/auth'
import { upsertSettings, invalidateSettingsCache } from '@/lib/site-settings'
import { SETTING_KEYS } from '@/lib/settings-utils'
import {
  saveLogo,
  saveFavicons,
  saveFaviconsFromLogoPath,
  BRANDING_URLS,
} from '@/lib/branding'

const MAX_BYTES = 2 * 1024 * 1024
const ALLOWED_TYPES = new Set(['image/jpeg', 'image/png', 'image/webp', 'image/gif', 'image/svg+xml'])

export async function POST(request: NextRequest) {
  try {
    if (!(await requireAdmin())) return unauthorized()

    const formData = await request.formData()
    const type = String(formData.get('type') || '')
    const file = formData.get('file')

    if (type === 'from-logo') {
      const logoPath = String(formData.get('logoPath') || '/logo.png')
      const faviconPath = await saveFaviconsFromLogoPath(logoPath)
      await upsertSettings({
        [SETTING_KEYS.siteFavicon]: faviconPath,
      })
      invalidateSettingsCache()
      return NextResponse.json({
        message: 'Favicon logodan olusturuldu',
        site_favicon: faviconPath,
        site_apple_icon: BRANDING_URLS.appleTouch,
      })
    }

    if (!(file instanceof File)) {
      return NextResponse.json({ error: 'Dosya gerekli' }, { status: 400 })
    }

    if (!ALLOWED_TYPES.has(file.type)) {
      return NextResponse.json({ error: 'Sadece JPG, PNG, WebP, GIF veya SVG yukleyin' }, { status: 400 })
    }

    if (file.size > MAX_BYTES) {
      return NextResponse.json({ error: 'Dosya en fazla 2 MB olabilir' }, { status: 400 })
    }

    const buffer = Buffer.from(await file.arrayBuffer())

    if (type === 'logo') {
      const logoPath = await saveLogo(buffer)
      const faviconPath = await saveFavicons(buffer)
      await upsertSettings({
        [SETTING_KEYS.siteLogo]: logoPath,
        [SETTING_KEYS.siteFavicon]: faviconPath,
      })
      invalidateSettingsCache()
      return NextResponse.json({
        message: 'Logo yuklendi; favicon otomatik olusturuldu',
        site_logo: logoPath,
        site_favicon: faviconPath,
        site_apple_icon: BRANDING_URLS.appleTouch,
      })
    }

    if (type === 'favicon') {
      const faviconPath = await saveFavicons(buffer)
      await upsertSettings({
        [SETTING_KEYS.siteFavicon]: faviconPath,
      })
      invalidateSettingsCache()
      return NextResponse.json({
        message: 'Favicon yuklendi (32, 180, 192 px)',
        site_favicon: faviconPath,
        site_apple_icon: BRANDING_URLS.appleTouch,
      })
    }

    return NextResponse.json({ error: 'Gecersiz type (logo | favicon | from-logo)' }, { status: 400 })
  } catch (error) {
    console.error('Branding upload error:', error)
    return NextResponse.json({ error: 'Yukleme basarisiz' }, { status: 500 })
  }
}
