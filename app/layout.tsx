import type React from "react"
import type { Metadata } from "next"
import { Playfair_Display, Inter } from "next/font/google"
import { Analytics } from "@vercel/analytics/next"
import { NextIntlClientProvider } from "next-intl"
import { getMessages, getLocale } from "next-intl/server"
import { getPublicSettings } from "@/lib/site-settings"
import { SETTING_KEYS } from "@/lib/settings-utils"
import { appleIconUrl } from "@/lib/branding"
import "./globals.css"

const _playfair = Playfair_Display({ subsets: ["latin", "cyrillic"], variable: "--font-playfair" })
const _inter = Inter({ subsets: ["latin", "cyrillic"], variable: "--font-inter" })

export async function generateMetadata(): Promise<Metadata> {
  const settings = await getPublicSettings()
  const logo = settings[SETTING_KEYS.siteLogo] || "/logo.png"
  const favicon = settings[SETTING_KEYS.siteFavicon] || logo
  const apple = appleIconUrl(favicon)

  return {
    title: "Cappadocia Sera Transfer | Nevşehir Havalimanı Transfer",
    description:
      "Kapadokya ve Kayseri havalimanı transfer hizmetleri. Güvenli, konforlu ve zamanında otel transferi. 7/24 hizmet.",
    keywords: [
      "Kapadokya transfer",
      "Nevşehir transfer",
      "Kayseri havalimanı transfer",
      "otel transfer",
      "Cappadocia transfer",
    ],
    icons: {
      icon: [{ url: favicon, sizes: "32x32", type: "image/png" }],
      apple: [{ url: apple, sizes: "180x180", type: "image/png" }],
    },
  }
}

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  const locale = await getLocale()
  const messages = await getMessages()

  return (
    <html lang={locale}>
      <body className={`${_playfair.variable} ${_inter.variable} font-sans antialiased`}>
        <NextIntlClientProvider messages={messages}>
          {children}
        </NextIntlClientProvider>
        <Analytics />
      </body>
    </html>
  )
}
