import { getRequestConfig } from 'next-intl/server'
import { cookies, headers } from 'next/headers'
import { locales, defaultLocale, type Locale } from './config'

export default getRequestConfig(async () => {
  const cookieStore = await cookies()
  const headersList = await headers()
  
  // Try to get locale from cookie first
  let locale = cookieStore.get('locale')?.value as Locale | undefined
  
  // If no cookie, try Accept-Language header
  if (!locale) {
    const acceptLanguage = headersList.get('accept-language')
    if (acceptLanguage) {
      const browserLocale = acceptLanguage.split(',')[0].split('-')[0]
      if (locales.includes(browserLocale as Locale)) {
        locale = browserLocale as Locale
      }
    }
  }
  
  // Fallback to default
  if (!locale || !locales.includes(locale)) {
    locale = defaultLocale
  }

  return {
    locale,
    messages: (await import(`./messages/${locale}.json`)).default
  }
})
