"use client"

import { useState, useTransition, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Globe, Check } from "lucide-react"
import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { locales, localeNames, type Locale } from "@/i18n/config"
import { parseEnabledLocales } from "@/lib/settings-utils"

interface LanguageSwitcherProps {
  currentLocale: string
}

export function LanguageSwitcher({ currentLocale }: LanguageSwitcherProps) {
  const router = useRouter()
  const [isPending, startTransition] = useTransition()
  const [isOpen, setIsOpen] = useState(false)
  const [enabledLocales, setEnabledLocales] = useState<Locale[]>([...locales])

  useEffect(() => {
    fetch("/api/settings/public")
      .then((res) => (res.ok ? res.json() : null))
      .then((data) => {
        if (data?.settings?.enabled_locales) {
          setEnabledLocales(parseEnabledLocales(data.settings.enabled_locales))
        }
      })
      .catch(() => {})
  }, [])

  const handleLocaleChange = async (locale: Locale) => {
    try {
      const res = await fetch("/api/locale", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ locale }),
      })

      if (!res.ok) return

      startTransition(() => {
        router.refresh()
      })
    } catch (error) {
      console.error("Failed to change locale:", error)
    }
    setIsOpen(false)
  }

  const shortLabels: Record<Locale, string> = {
    tr: "TR",
    en: "EN",
    ru: "RU",
    hi: "HI",
    de: "DE",
    fr: "FR",
    es: "ES",
    ar: "AR",
    zh: "中",
  }

  const visibleLocales = locales.filter((l) => enabledLocales.includes(l))

  return (
    <DropdownMenu open={isOpen} onOpenChange={setIsOpen}>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" size="sm" className="gap-2" disabled={isPending}>
          <Globe className="h-4 w-4" />
          <span className="hidden sm:inline">
            {shortLabels[currentLocale as Locale] ?? currentLocale.toUpperCase()}
          </span>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-40">
        {visibleLocales.map((locale) => (
          <DropdownMenuItem
            key={locale}
            onClick={() => handleLocaleChange(locale)}
            className="flex items-center justify-between cursor-pointer"
          >
            <span>{localeNames[locale]}</span>
            {currentLocale === locale && <Check className="h-4 w-4" />}
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
