import Link from "next/link"
import { Phone, Mail, MapPin, Instagram, Facebook } from "lucide-react"

export function Footer() {
  return (
    <footer className="bg-foreground text-background py-16">
      <div className="container mx-auto px-4">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12">
          <div>
            <div className="flex items-center gap-2 mb-4">
              <div className="w-10 h-10 rounded-full bg-primary flex items-center justify-center">
                <span className="text-primary-foreground font-bold text-lg">S</span>
              </div>
              <div className="flex flex-col">
                <span className="text-lg font-bold text-background tracking-tight">Cappadocia Sera</span>
                <span className="text-xs text-background/60 -mt-1">TRANSFER</span>
              </div>
            </div>
            <p className="text-background/70 text-sm leading-relaxed">
              Kapadokya&apos;da güvenli ve konforlu transfer hizmeti. Havalimanı ve otel transferleriniz için
              yanınızdayız.
            </p>
          </div>

          <div>
            <h4 className="font-semibold text-background mb-4">Hızlı Linkler</h4>
            <ul className="space-y-2">
              <li>
                <Link href="#hizmetler" className="text-background/70 hover:text-background text-sm transition-colors">
                  Hizmetler
                </Link>
              </li>
              <li>
                <Link href="#galeri" className="text-background/70 hover:text-background text-sm transition-colors">
                  Galeri
                </Link>
              </li>
              <li>
                <Link
                  href="#rezervasyon"
                  className="text-background/70 hover:text-background text-sm transition-colors"
                >
                  Rezervasyon
                </Link>
              </li>
              <li>
                <Link href="#hakkimizda" className="text-background/70 hover:text-background text-sm transition-colors">
                  Hakkımızda
                </Link>
              </li>
            </ul>
          </div>

          <div>
            <h4 className="font-semibold text-background mb-4">Hizmet Bölgeleri</h4>
            <ul className="space-y-2 text-sm text-background/70">
              <li>Nevşehir Kapadokya Havalimanı</li>
              <li>Kayseri Erkilet Havalimanı</li>
              <li>Göreme</li>
              <li>Ürgüp</li>
              <li>Uçhisar</li>
              <li>Avanos</li>
            </ul>
          </div>

          <div>
            <h4 className="font-semibold text-background mb-4">İletişim</h4>
            <ul className="space-y-3">
              <li className="flex items-center gap-2 text-sm text-background/70">
                <Phone className="w-4 h-4" />
                <a href="tel:+905001234567" className="hover:text-background transition-colors">
                  +90 500 123 45 67
                </a>
              </li>
              <li className="flex items-center gap-2 text-sm text-background/70">
                <Mail className="w-4 h-4" />
                <a href="mailto:info@cappadociaseratransfer.com" className="hover:text-background transition-colors">
                  info@cappadociaseratransfer.com
                </a>
              </li>
              <li className="flex items-start gap-2 text-sm text-background/70">
                <MapPin className="w-4 h-4 mt-0.5" />
                <span>Göreme, Nevşehir, Türkiye</span>
              </li>
            </ul>
            <div className="flex gap-4 mt-4">
              <a
                href="https://instagram.com"
                target="_blank"
                rel="noopener noreferrer"
                className="w-10 h-10 rounded-full bg-background/10 flex items-center justify-center hover:bg-background/20 transition-colors"
                aria-label="Instagram"
              >
                <Instagram className="w-5 h-5" />
              </a>
              <a
                href="https://facebook.com"
                target="_blank"
                rel="noopener noreferrer"
                className="w-10 h-10 rounded-full bg-background/10 flex items-center justify-center hover:bg-background/20 transition-colors"
                aria-label="Facebook"
              >
                <Facebook className="w-5 h-5" />
              </a>
            </div>
          </div>
        </div>

        <div className="border-t border-background/10 mt-12 pt-8 text-center">
          <p className="text-background/60 text-sm">© 2026 Cappadocia Sera Transfer. Tüm hakları saklıdır.</p>
        </div>
      </div>
    </footer>
  )
}
