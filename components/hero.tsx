"use client"

import Link from "next/link"
import Image from "next/image"
import { Button } from "@/components/ui/button"
import { MapPin, Clock, Shield } from "lucide-react"
import { useTranslations } from "next-intl"

export function Hero() {
  const t = useTranslations("hero")
  return (
    <section className="relative min-h-screen flex items-center pt-20">
      <div className="absolute inset-0 z-0">
        <Image
          src="/cappadocia-fairy-chimneys-sunset-golden-hour-hot-a.jpg"
          alt={t("headline")}
          fill
          className="object-cover"
          priority
        />
        <div className="absolute inset-0 bg-gradient-to-r from-background/95 via-background/70 to-transparent" />
        <div className="absolute inset-0 bg-gradient-to-t from-background via-transparent to-transparent" />
      </div>

      <div className="container mx-auto px-4 relative z-10">
        <div className="max-w-2xl">
          <p className="text-accent font-medium mb-4 tracking-widest uppercase text-sm">
            {t("tagline")}
          </p>
          <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-foreground leading-tight mb-6 text-balance">
            {t("headline")}
            <span className="block text-primary">{t("headlineHighlight")}</span>
          </h1>
          <p className="text-lg text-muted-foreground mb-8 max-w-xl leading-relaxed">
            {t("heroDescription")}
          </p>

          <div className="flex flex-col sm:flex-row gap-4 mb-12">
            <Button size="lg" asChild className="text-base">
              <Link href="#rezervasyon">{t("bookNow")}</Link>
            </Button>
            <Button size="lg" variant="outline" asChild className="text-base bg-transparent">
              <Link href="tel:+905534647150">{t("callUs")}</Link>
            </Button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center">
                <MapPin className="w-5 h-5 text-primary" />
              </div>
              <div>
                <p className="font-semibold text-foreground">{t("twoAirports")}</p>
                <p className="text-sm text-muted-foreground">{t("airportsNames")}</p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center">
                <Clock className="w-5 h-5 text-primary" />
              </div>
              <div>
                <p className="font-semibold text-foreground">{t("service24")}</p>
                <p className="text-sm text-muted-foreground">{t("alwaysWithYou")}</p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center">
                <Shield className="w-5 h-5 text-primary" />
              </div>
              <div>
                <p className="font-semibold text-foreground">{t("safeTrip")}</p>
                <p className="text-sm text-muted-foreground">{t("insuredVehicles")}</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
