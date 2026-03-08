"use client"

import Image from "next/image"
import { CheckCircle } from "lucide-react"
import { useTranslations } from "next-intl"

const featureKeys = ["feature1", "feature2", "feature3", "feature4", "feature5", "feature6"] as const

export function About() {
  const t = useTranslations("about")
  return (
    <section id="hakkimizda" className="py-20 bg-secondary/30">
      <div className="container mx-auto px-4">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
          <div className="relative">
            <div className="aspect-[4/3] relative rounded-lg overflow-hidden">
              <Image
                src="/luxury-vip-transfer-van-cappadocia-landscape.jpg"
                alt={t("imageAlt")}
                fill
                className="object-cover"
              />
            </div>
            <div className="absolute -bottom-6 -right-6 bg-primary text-primary-foreground p-6 rounded-lg shadow-xl hidden md:block">
              <p className="text-4xl font-bold">{t("experienceBadge")}</p>
              <p className="text-sm">{t("experience")}</p>
            </div>
          </div>

          <div>
            <p className="text-accent font-medium mb-2 tracking-widest uppercase text-sm">{t("sectionTitle")}</p>
            <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-6">{t("companyName")}</h2>
            <p className="text-muted-foreground mb-6 leading-relaxed">{t("paragraph1")}</p>
            <p className="text-muted-foreground mb-8 leading-relaxed">{t("paragraph2")}</p>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {featureKeys.map((key) => (
                <div key={key} className="flex items-center gap-2">
                  <CheckCircle className="w-5 h-5 text-primary flex-shrink-0" />
                  <span className="text-foreground">{t(key)}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
