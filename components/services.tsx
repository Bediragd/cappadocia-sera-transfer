"use client"

import { Plane, Car, Users, Hotel, type LucideIcon } from "lucide-react"
import { Card, CardContent } from "@/components/ui/card"
import { useTranslations } from "next-intl"

const SERVICES: { key: string; icon: LucideIcon }[] = [
  { key: "airportTransfer", icon: Plane },
  { key: "cityTransfer", icon: Car },
  { key: "vipTour", icon: Users },
  { key: "weddingTransfer", icon: Hotel },
]

export function Services() {
  const t = useTranslations("services")

  return (
    <section id="hizmetler" className="py-20 bg-secondary/30">
      <div className="container mx-auto px-4">
        <div className="text-center mb-16">
          <p className="text-accent font-medium mb-2 tracking-widest uppercase text-sm">{t("title")}</p>
          <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-4">{t("subtitle")}</h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {SERVICES.map(({ key, icon: Icon }) => (
            <Card key={key} className="bg-card border-border hover:shadow-lg transition-shadow">
              <CardContent className="p-6 text-center">
                <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-4">
                  <Icon className="w-7 h-7 text-primary" />
                </div>
                <h3 className="text-xl font-semibold text-card-foreground mb-2">{t(`${key}.title`)}</h3>
                <p className="text-muted-foreground text-sm">{t(`${key}.description`)}</p>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </section>
  )
}
