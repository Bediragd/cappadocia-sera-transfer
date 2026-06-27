"use client"

import { useEffect, useState } from "react"

export type PublicSiteSettings = {
  company_name?: string
  site_phone?: string
  site_email?: string
  site_address?: string
  site_whatsapp?: string
  enabled_locales?: string
  payment_cash_enabled?: string
  payment_online_enabled?: string
  social_instagram?: string
  social_facebook?: string
  social_youtube?: string
  social_twitter?: string
  content_services?: string
  content_gallery?: string
  content_footer_regions?: string
}

const FALLBACK: PublicSiteSettings = {
  company_name: "Cappadocia Sera Transfer",
  site_phone: "0553 464 71 50",
  site_email: "info@cappadociaseratransfer.com",
  site_address: "Nevsehir, Turkiye",
  site_whatsapp: "905534647150",
  enabled_locales: '["tr","en","ru","hi"]',
  payment_cash_enabled: "true",
  payment_online_enabled: "false",
}

export function useSiteSettings() {
  const [settings, setSettings] = useState<PublicSiteSettings>(FALLBACK)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    let cancelled = false

    fetch("/api/settings/public")
      .then((res) => (res.ok ? res.json() : null))
      .then((data) => {
        if (!cancelled && data?.settings) {
          setSettings({ ...FALLBACK, ...data.settings })
        }
      })
      .catch(() => {})
      .finally(() => {
        if (!cancelled) setLoading(false)
      })

    return () => {
      cancelled = true
    }
  }, [])

  return { settings, loading }
}
