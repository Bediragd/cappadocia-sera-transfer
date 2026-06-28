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

export function appleIconUrl(faviconPath: string): string {
  if (faviconPath.startsWith('/uploads/')) return BRANDING_URLS.appleTouch
  return faviconPath
}
