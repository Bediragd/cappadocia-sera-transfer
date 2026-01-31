"use client"

import { useState } from "react"
import Link from "next/link"
import { Menu, X, Phone } from "lucide-react"
import { useTranslations, useLocale } from "next-intl"
import { Button } from "@/components/ui/button"
import { LanguageSwitcher } from "@/components/language-switcher"

export function Header() {
  const [isMenuOpen, setIsMenuOpen] = useState(false)
  const t = useTranslations()
  const locale = useLocale()

  const navItems = [
    { href: "#hizmetler", label: t("nav.services") },
    { href: "#galeri", label: t("nav.gallery") },
    { href: "#rezervasyon", label: t("nav.booking") },
    { href: "#hakkimizda", label: t("nav.about") },
    { href: "#iletisim", label: t("nav.contact") },
    { href: "/sofor-basvuru", label: t("nav.driverApplication") },
  ]

  return (
    <header className="fixed top-0 left-0 right-0 z-50 bg-background/95 backdrop-blur-sm border-b border-border">
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between h-16 md:h-20">
          <Link href="/" className="flex items-center gap-2">
            <div className="w-10 h-10 rounded-full bg-primary flex items-center justify-center">
              <span className="text-primary-foreground font-bold text-lg">S</span>
            </div>
            <div className="flex flex-col">
              <span className="font-sans text-lg md:text-xl font-bold text-foreground tracking-tight">
                Cappadocia Sera
              </span>
              <span className="text-xs text-muted-foreground -mt-1">TRANSFER</span>
            </div>
          </Link>

          <nav className="hidden lg:flex items-center gap-8">
            {navItems.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors"
              >
                {item.label}
              </Link>
            ))}
          </nav>

          <div className="hidden md:flex items-center gap-4">
            <LanguageSwitcher currentLocale={locale} />
            <a href="tel:+905001234567" className="flex items-center gap-2 text-sm font-medium text-foreground">
              <Phone className="w-4 h-4" />
              <span>+90 500 123 45 67</span>
            </a>
            <Button asChild>
              <Link href="#rezervasyon">{t("nav.booking")}</Link>
            </Button>
          </div>

          <div className="flex items-center gap-2 lg:hidden">
            <LanguageSwitcher currentLocale={locale} />
            <button className="p-2" onClick={() => setIsMenuOpen(!isMenuOpen)} aria-label="Menu">
              {isMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>

        {isMenuOpen && (
          <div className="lg:hidden py-4 border-t border-border">
            <nav className="flex flex-col gap-4">
              {navItems.map((item) => (
                <Link
                  key={item.href}
                  href={item.href}
                  className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors"
                  onClick={() => setIsMenuOpen(false)}
                >
                  {item.label}
                </Link>
              ))}
              <a href="tel:+905001234567" className="flex items-center gap-2 text-sm font-medium text-foreground">
                <Phone className="w-4 h-4" />
                <span>+90 500 123 45 67</span>
              </a>
              <Button asChild className="w-full">
                <Link href="#rezervasyon">{t("nav.booking")}</Link>
              </Button>
            </nav>
          </div>
        )}
      </div>
    </header>
  )
}
