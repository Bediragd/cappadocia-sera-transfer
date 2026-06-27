"use client"

import Image from "next/image"
import { useSiteSettings } from "@/hooks/use-site-settings"
import {
  DEFAULT_GALLERY,
  parseJsonSetting,
  type GalleryItem,
} from "@/lib/settings-utils"

export function Gallery() {
  const { settings } = useSiteSettings()
  const images = parseJsonSetting<GalleryItem[]>(
    settings.content_gallery,
    DEFAULT_GALLERY
  )

  return (
    <section id="galeri" className="py-20">
      <div className="container mx-auto px-4">
        <div className="text-center mb-16">
          <p className="text-accent font-medium mb-2 tracking-widest uppercase text-sm">Galeri</p>
          <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-4">Kapadokya&apos;nın Güzellikleri</h2>
          <p className="text-muted-foreground max-w-2xl mx-auto">
            Eşsiz peri bacaları ve büyüleyici manzaralarıyla Kapadokya sizi bekliyor.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {images.map((image, index) => (
            <div key={index} className="relative aspect-[4/3] overflow-hidden rounded-lg group">
              <Image
                src={image.src || "/placeholder.svg"}
                alt={image.alt}
                fill
                className="object-cover transition-transform duration-500 group-hover:scale-110"
              />
              <div className="absolute inset-0 bg-foreground/0 group-hover:bg-foreground/20 transition-colors duration-300" />
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
