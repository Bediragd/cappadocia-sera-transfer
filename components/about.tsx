import Image from "next/image"
import { CheckCircle } from "lucide-react"

const features = [
  "10+ yıllık deneyim",
  "Profesyonel ve deneyimli şoförler",
  "Modern ve bakımlı araç filosu",
  "Sigortalı yolculuk garantisi",
  "Çoklu dil desteği",
  "Rekabetçi fiyatlar",
]

export function About() {
  return (
    <section id="hakkimizda" className="py-20 bg-secondary/30">
      <div className="container mx-auto px-4">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
          <div className="relative">
            <div className="aspect-[4/3] relative rounded-lg overflow-hidden">
              <Image
                src="/luxury-vip-transfer-van-cappadocia-landscape.jpg"
                alt="Cappadocia Sera Transfer Araç"
                fill
                className="object-cover"
              />
            </div>
            <div className="absolute -bottom-6 -right-6 bg-primary text-primary-foreground p-6 rounded-lg shadow-xl hidden md:block">
              <p className="text-4xl font-bold">10+</p>
              <p className="text-sm">Yıllık Deneyim</p>
            </div>
          </div>

          <div>
            <p className="text-accent font-medium mb-2 tracking-widest uppercase text-sm">Hakkımızda</p>
            <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-6">Cappadocia Sera Transfer</h2>
            <p className="text-muted-foreground mb-6 leading-relaxed">
              Kapadokya&apos;nın kalbinde, misafirlerimize en kaliteli transfer hizmetini sunmak için çalışıyoruz.
              Nevşehir ve Kayseri havalimanlarından bölgedeki tüm otellere güvenli ve konforlu ulaşım sağlıyoruz.
            </p>
            <p className="text-muted-foreground mb-8 leading-relaxed">
              Modern araç filomuz ve profesyonel şoför kadromuzla, yolculuğunuzun her anının keyifli geçmesini
              sağlıyoruz. Kapadokya&apos;nın eşsiz güzelliklerini keşfederken, ulaşım konusunda endişelenmenize gerek
              yok.
            </p>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {features.map((feature, index) => (
                <div key={index} className="flex items-center gap-2">
                  <CheckCircle className="w-5 h-5 text-primary flex-shrink-0" />
                  <span className="text-foreground">{feature}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
