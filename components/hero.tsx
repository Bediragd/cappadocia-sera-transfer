import Link from "next/link"
import Image from "next/image"
import { Button } from "@/components/ui/button"
import { MapPin, Clock, Shield } from "lucide-react"

export function Hero() {
  return (
    <section className="relative min-h-screen flex items-center pt-20">
      <div className="absolute inset-0 z-0">
        <Image
          src="/cappadocia-fairy-chimneys-sunset-golden-hour-hot-a.jpg"
          alt="Kapadokya Peri Bacaları Gün Batımı"
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
            Nevşehir • Kayseri • Kapadokya
          </p>
          <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-foreground leading-tight mb-6 text-balance">
            Kapadokya&apos;nın Büyüsüne
            <span className="block text-primary">Konforla Ulaşın</span>
          </h1>
          <p className="text-lg text-muted-foreground mb-8 max-w-xl leading-relaxed">
            Havalimanından otelinize veya otelinizden havalimanına güvenli ve konforlu transfer hizmeti. Peri
            bacalarının gölgesinde unutulmaz bir yolculuk sizi bekliyor.
          </p>

          <div className="flex flex-col sm:flex-row gap-4 mb-12">
            <Button size="lg" asChild className="text-base">
              <Link href="#rezervasyon">Hemen Rezervasyon Yap</Link>
            </Button>
            <Button size="lg" variant="outline" asChild className="text-base bg-transparent">
              <Link href="tel:+905001234567">Bizi Arayın</Link>
            </Button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center">
                <MapPin className="w-5 h-5 text-primary" />
              </div>
              <div>
                <p className="font-semibold text-foreground">2 Havalimanı</p>
                <p className="text-sm text-muted-foreground">Nevşehir & Kayseri</p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center">
                <Clock className="w-5 h-5 text-primary" />
              </div>
              <div>
                <p className="font-semibold text-foreground">7/24 Hizmet</p>
                <p className="text-sm text-muted-foreground">Her an yanınızda</p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center">
                <Shield className="w-5 h-5 text-primary" />
              </div>
              <div>
                <p className="font-semibold text-foreground">Güvenli Yolculuk</p>
                <p className="text-sm text-muted-foreground">Sigortalı araçlar</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
