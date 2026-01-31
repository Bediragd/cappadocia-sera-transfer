import Image from "next/image"

const images = [
  {
    src: "/cappadocia-fairy-chimneys-sunrise-panorama.jpg",
    alt: "Kapadokya Peri Bacaları Gündoğumu",
  },
  {
    src: "/cappadocia-hot-air-balloons-sunrise.jpg",
    alt: "Kapadokya Sıcak Hava Balonları",
  },
  {
    src: "/goreme-valley-cappadocia-sunset.jpg",
    alt: "Göreme Vadisi Gün Batımı",
  },
  {
    src: "/uchisar-castle-cappadocia.jpg",
    alt: "Uçhisar Kalesi",
  },
  {
    src: "/cappadocia-cave-hotels-sunset.jpg",
    alt: "Kapadokya Kaya Otelleri",
  },
  {
    src: "/cappadocia-landscape-fairy-chimneys.jpg",
    alt: "Kapadokya Manzarası",
  },
]

export function Gallery() {
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
