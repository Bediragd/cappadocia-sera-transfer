import type React from "react"
import type { Metadata } from "next"
import { Playfair_Display, Inter } from "next/font/google"
import { Analytics } from "@vercel/analytics/next"
import { NextIntlClientProvider } from "next-intl"
import { getMessages, getLocale } from "next-intl/server"
import "./globals.css"

const _playfair = Playfair_Display({ subsets: ["latin", "cyrillic"], variable: "--font-playfair" })
const _inter = Inter({ subsets: ["latin", "cyrillic"], variable: "--font-inter" })

export const metadata: Metadata = {
  title: "Cappadocia Sera Transfer | Nevşehir Havalimanı Transfer",
  description:
    "Kapadokya ve Kayseri havalimanı transfer hizmetleri. Güvenli, konforlu ve zamanında otel transferi. 7/24 hizmet.",
  generator: "v0.app",
  keywords: [
    "Kapadokya transfer",
    "Nevşehir transfer",
    "Kayseri havalimanı transfer",
    "otel transfer",
    "Cappadocia transfer",
  ],
  icons: {
    icon: [
      {
        url: "/icon-light-32x32.png",
        media: "(prefers-color-scheme: light)",
      },
      {
        url: "/icon-dark-32x32.png",
        media: "(prefers-color-scheme: dark)",
      },
      {
        url: "/icon.svg",
        type: "image/svg+xml",
      },
    ],
    apple: "/apple-icon.png",
  },
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
