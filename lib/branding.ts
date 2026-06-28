import sharp from 'sharp'
import path from 'path'
import { mkdir, readFile } from 'fs/promises'

export const UPLOAD_DIR = path.join(process.cwd(), 'public', 'uploads')

export const BRANDING_FILES = {
  logo: 'site-logo.png',
  favicon32: 'favicon-32x32.png',
  appleTouch: 'apple-touch-icon.png',
  icon192: 'icon-192x192.png',
} as const

export const BRANDING_URLS = {
  logo: `/uploads/${BRANDING_FILES.logo}`,
  favicon32: `/uploads/${BRANDING_FILES.favicon32}`,
  appleTouch: `/uploads/${BRANDING_FILES.appleTouch}`,
} as const

export async function ensureUploadDir() {
  await mkdir(UPLOAD_DIR, { recursive: true })
}

/** Site logosu — max 512px, PNG */
export async function saveLogo(buffer: Buffer): Promise<string> {
  await ensureUploadDir()
  await sharp(buffer)
    .rotate()
    .resize(512, 512, { fit: 'inside', withoutEnlargement: true })
    .png()
    .toFile(path.join(UPLOAD_DIR, BRANDING_FILES.logo))
  return BRANDING_URLS.logo
}

/** Favicon seti: 32x32, 180x180 (Apple), 192x192 (Android) */
export async function saveFavicons(buffer: Buffer): Promise<string> {
  await ensureUploadDir()
  const base = sharp(buffer).rotate()

  await base
    .clone()
    .resize(32, 32, { fit: 'cover' })
    .png()
    .toFile(path.join(UPLOAD_DIR, BRANDING_FILES.favicon32))

  await base
    .clone()
    .resize(180, 180, { fit: 'cover' })
    .png()
    .toFile(path.join(UPLOAD_DIR, BRANDING_FILES.appleTouch))

  await base
    .clone()
    .resize(192, 192, { fit: 'cover' })
    .png()
    .toFile(path.join(UPLOAD_DIR, BRANDING_FILES.icon192))

  return BRANDING_URLS.favicon32
}

export async function saveFaviconsFromLogoPath(logoPublicPath: string): Promise<string> {
  const relative = logoPublicPath.replace(/^\//, '')
  const diskPath = path.join(process.cwd(), 'public', relative)
  const buffer = await readFile(diskPath)
  return saveFavicons(buffer)
}

export function appleIconUrl(faviconPath: string): string {
  if (faviconPath.startsWith('/uploads/')) return BRANDING_URLS.appleTouch
  return faviconPath
}
