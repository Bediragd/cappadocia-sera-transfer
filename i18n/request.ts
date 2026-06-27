import { getRequestConfig } from 'next-intl/server'
import { cookies, headers } from 'next/headers'
import { locales, defaultLocale, type Locale } from './config'
import { getEnabledLocales } from '@/lib/site-settings'

export default getRequestConfig(async () => {
  const cookieStore = await cookies()
  const headersList = await headers()
  const enabledLocales = await getEnabledLocales()

  let locale = cookieStore.get('locale')?.value as Locale | undefined

  if (!locale) {
    const acceptLanguage = headersList.get('accept-language')
    if (acceptLanguage) {
      const browserLocale = acceptLanguage.split(',')[0].split('-')[0]
      if (locales.includes(browserLocale as Locale) && enabledLocales.includes(browserLocale as Locale)) {
        locale = browserLocale as Locale
      }
    }
  }

  if (!locale || !locales.includes(locale) || !enabledLocales.includes(locale)) {
    locale = enabledLocales.includes(defaultLocale) ? defaultLocale : enabledLocales[0]
  }

  return {
    locale,
    messages: (await import(`./messages/${locale}.json`)).default,
  }
})
