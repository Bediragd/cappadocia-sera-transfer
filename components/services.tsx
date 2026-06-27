"use client"

import { Plane, Hotel, Users, Car, type LucideIcon } from "lucide-react"
import { Card, CardContent } from "@/components/ui/card"
import { useSiteSettings } from "@/hooks/use-site-settings"
import {
  DEFAULT_SERVICES,
  parseJsonSetting,
  type ServiceItem,
} from "@/lib/settings-utils"

const ICONS: Record<string, LucideIcon> = {
  Plane,
  Hotel,
  Users,
  Car,
}

export function Services() {
  const { settings } = useSiteSettings()
  const services = parseJsonSetting<ServiceItem[]>(
    settings.content_services,
    DEFAULT_SERVICES
  )

  return (
    <section id="hizmetler" className="py-20 bg-secondary/30">
      <div className="container mx-auto px-4">
        <div className="text-center mb-16">
          <p className="text-accent font-medium mb-2 tracking-widest uppercase text-sm">Hizmetlerimiz</p>
          <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-4">Transfer Çözümlerimiz</h2>
          <p className="text-muted-foreground max-w-2xl mx-auto">
            Kapadokya&apos;da ihtiyacınız olan her türlü transfer hizmetini profesyonel ekibimizle sunuyoruz.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {services.map((service, index) => {
            const Icon = ICONS[service.icon] || Car
            return (
              <Card key={index} className="bg-card border-border hover:shadow-lg transition-shadow">
                <CardContent className="p-6 text-center">
                  <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-4">
                    <Icon className="w-7 h-7 text-primary" />
                  </div>
                  <h3 className="text-xl font-semibold text-card-foreground mb-2">{service.title}</h3>
                  <p className="text-muted-foreground text-sm">{service.description}</p>
                </CardContent>
              </Card>
            )
          })}
        </div>
      </div>
    </section>
  )
}
