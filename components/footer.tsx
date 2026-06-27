"use client"

import Link from "next/link"
import { Phone, Mail, MapPin, Instagram, Facebook, Youtube, Twitter } from "lucide-react"
import { useTranslations } from "next-intl"
import { useSiteSettings } from "@/hooks/use-site-settings"
import {
  phoneToTel,
  parseJsonSetting,
  DEFAULT_FOOTER_REGIONS,
} from "@/lib/settings-utils"

export function Footer() {
  const t = useTranslations()
  const { settings } = useSiteSettings()
  const phone = settings.site_phone || "0553 464 71 50"
  const email = settings.site_email || "info@cappadociaseratransfer.com"
  const address = settings.site_address || "Nevsehir, Turkiye"
  const regions = parseJsonSetting<string[]>(settings.content_footer_regions, DEFAULT_FOOTER_REGIONS)
  const socials = [
    { url: settings.social_instagram, Icon: Instagram, label: "Instagram" },
    { url: settings.social_facebook, Icon: Facebook, label: "Facebook" },
    { url: settings.social_youtube, Icon: Youtube, label: "YouTube" },
    { url: settings.social_twitter, Icon: Twitter, label: "Twitter" },
  ].filter((s) => s.url && s.url.trim() !== "")
  return (
    <footer className="bg-foreground text-background py-16">
      <div className="container mx-auto px-4">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12">
          <div>
            <div className="flex items-center gap-2 mb-4">
              <img src="/logo.png" alt="Cappadocia Sera Transfer" className="w-10 h-10 rounded-full object-cover" />
              <div className="flex flex-col">
                <span className="text-lg font-bold text-background tracking-tight">Cappadocia Sera</span>
                <span className="text-xs text-background/60 -mt-1">TRANSFER</span>
              </div>
            </div>
            <p className="text-background/70 text-sm leading-relaxed">
              {t("footer.description")}
            </p>
          </div>

          <div>
            <h4 className="font-semibold text-background mb-4">{t("footer.quickLinks")}</h4>
            <ul className="space-y-2">
              <li>
                <Link href="#hizmetler" className="text-background/70 hover:text-background text-sm transition-colors">
                  {t("nav.services")}
                </Link>
              </li>
              <li>
                <Link href="#galeri" className="text-background/70 hover:text-background text-sm transition-colors">
                  {t("nav.gallery")}
                </Link>
              </li>
              <li>
                <Link href="#rezervasyon" className="text-background/70 hover:text-background text-sm transition-colors">
                  {t("nav.booking")}
                </Link>
              </li>
              <li>
                <Link href="#hakkimizda" className="text-background/70 hover:text-background text-sm transition-colors">
                  {t("nav.about")}
                </Link>
              </li>
            </ul>
          </div>

          <div>
            <h4 className="font-semibold text-background mb-4">{t("footer.serviceRegions")}</h4>
            <ul className="space-y-2 text-sm text-background/70">
              {regions.map((region, i) => (
                <li key={i}>{region}</li>
              ))}
            </ul>
          </div>

          <div>
            <h4 className="font-semibold text-background mb-4">{t("footer.contact")}</h4>
            <ul className="space-y-3">
              <li className="flex items-center gap-2 text-sm text-background/70">
                <Phone className="w-4 h-4" />
                <a href={phoneToTel(phone)} className="hover:text-background transition-colors">
                  {phone}
                </a>
              </li>
              <li className="flex items-center gap-2 text-sm text-background/70">
                <Mail className="w-4 h-4" />
                <a href={`mailto:${email}`} className="hover:text-background transition-colors">
                  {email}
                </a>
              </li>
              <li className="flex items-start gap-2 text-sm text-background/70">
                <MapPin className="w-4 h-4 mt-0.5" />
                <span>{address}</span>
              </li>
            </ul>
            {socials.length > 0 && (
              <div className="flex gap-4 mt-4">
                {socials.map(({ url, Icon, label }) => (
                  <a
                    key={label}
                    href={url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="w-10 h-10 rounded-full bg-background/10 flex items-center justify-center hover:bg-background/20 transition-colors"
                    aria-label={label}
                  >
                    <Icon className="w-5 h-5" />
                  </a>
                ))}
              </div>
            )}
          </div>
        </div>

        <div className="border-t border-background/10 mt-12 pt-8 text-center">
          <p className="text-background/60 text-sm">{t("footer.copyright")}</p>
        </div>
      </div>
    </footer>
  )
}
