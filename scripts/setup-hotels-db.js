// Veritabanı kurulum scripti
const { neon } = require("@neondatabase/serverless")
require("dotenv").config({ path: ".env.local" })

async function setupDatabase() {
  console.log("🚀 Veritabanı kurulumu başlatılıyor...")

  try {
    const sql = neon(process.env.DATABASE_URL)

    // 1. Popüler oteller tablosunu oluştur
    console.log("📋 Popüler oteller tablosu oluşturuluyor...")
    
    await sql`
      CREATE TABLE IF NOT EXISTS popular_hotels (
        id SERIAL PRIMARY KEY,
        name VARCHAR(255) NOT NULL,
        category VARCHAR(50) NOT NULL,
        region VARCHAR(100) NOT NULL,
        address TEXT NOT NULL,
        latitude DECIMAL(10, 8) NOT NULL,
        longitude DECIMAL(11, 8) NOT NULL,
        rating DECIMAL(2, 1) DEFAULT 4.5,
        image_url TEXT,
        amenities TEXT[],
        phone VARCHAR(20),
        email VARCHAR(255),
        website TEXT,
        price_range VARCHAR(50),
        description TEXT,
        is_active BOOLEAN DEFAULT true,
        created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
      )
    `

    // Index'leri oluştur
    await sql`CREATE INDEX IF NOT EXISTS idx_hotels_region ON popular_hotels(region)`
    await sql`CREATE INDEX IF NOT EXISTS idx_hotels_category ON popular_hotels(category)`
    await sql`CREATE INDEX IF NOT EXISTS idx_hotels_rating ON popular_hotels(rating DESC)`
    await sql`CREATE INDEX IF NOT EXISTS idx_hotels_active ON popular_hotels(is_active)`

    console.log("✅ Popüler oteller tablosu oluşturuldu")

    // 2. Mevcut otelleri kontrol et
    const existingHotels = await sql`SELECT COUNT(*) as count FROM popular_hotels`
    
    if (existingHotels[0].count === 0) {
      console.log("🏨 Popüler oteller ekleniyor...")
      
      const hotels = [
        {
          name: "Museum Hotel",
          category: "5 Star",
          region: "Uçhisar",
          address: "Tekeli Mah. No:1, 50240 Uçhisar/Nevşehir",
          latitude: 38.6274,
          longitude: 34.8033,
          rating: 4.8,
          amenities: ["Spa", "Restoran", "Bar", "Wi-Fi", "Havuz", "Otopark"],
          phone: "+90 384 219 2220",
          priceRange: "€€€€",
          description: "Kapadokya'nın en lüks otellerinden biri. Muhteşem manzara ve tarihi mağara odalar."
        },
        {
          name: "Argos in Cappadocia",
          category: "5 Star",
          region: "Uçhisar",
          address: "Aşağı Mahalle, Kayabaşı Sk. No:25, 50240 Uçhisar/Nevşehir",
          latitude: 38.6289,
          longitude: 34.8045,
          rating: 4.9,
          amenities: ["Spa", "Restoran", "Bar", "Wi-Fi", "Kapalı Havuz", "Otopark"],
          phone: "+90 384 219 3130",
          priceRange: "€€€€",
          description: "Tarihi taş evlerden oluşan butik otel."
        },
        {
          name: "Sultan Cave Suites",
          category: "Boutique",
          region: "Göreme",
          address: "Aydınlı Mah. Belediye Cad. No:39, 50180 Göreme/Nevşehir",
          latitude: 38.6436,
          longitude: 34.8281,
          rating: 4.7,
          amenities: ["Restoran", "Teras", "Wi-Fi", "Kahvaltı", "Otopark"],
          phone: "+90 384 271 2866",
          priceRange: "€€€",
          description: "Göreme'nin merkezinde, balon manzaralı teraslı mağara otel."
        },
        {
          name: "Cappadocia Cave Suites",
          category: "Boutique",
          region: "Göreme",
          address: "Ünlü Sok. No:19, 50180 Göreme/Nevşehir",
          latitude: 38.6445,
          longitude: 34.8295,
          rating: 4.6,
          amenities: ["Restoran", "Teras", "Wi-Fi", "Kahvaltı", "Otopark"],
          phone: "+90 384 271 2800",
          priceRange: "€€€",
          description: "Göreme'de balon manzarası için en iyi konumlardan biri."
        },
        {
          name: "Kayakapi Premium Caves",
          category: "5 Star",
          region: "Ürgüp",
          address: "Kayakapı Mahallesi, 50400 Ürgüp/Nevşehir",
          latitude: 38.6285,
          longitude: 34.9145,
          rating: 4.8,
          amenities: ["Spa", "Restoran", "Bar", "Wi-Fi", "Kapalı Havuz", "Otopark"],
          phone: "+90 384 341 6900",
          priceRange: "€€€€",
          description: "Ürgüp'ün en lüks oteli."
        },
        {
          name: "Mithra Cave Hotel",
          category: "4 Star",
          region: "Göreme",
          address: "Hakki Pasa Meydani No:1, 50180 Göreme/Nevşehir",
          latitude: 38.6423,
          longitude: 34.8267,
          rating: 4.5,
          amenities: ["Restoran", "Teras", "Wi-Fi", "Kahvaltı", "Otopark"],
          phone: "+90 384 271 2474",
          priceRange: "€€",
          description: "Göreme merkezde uygun fiyatlı, kaliteli konaklama."
        },
        {
          name: "Seki Cave Suites",
          category: "Boutique",
          region: "Uçhisar",
          address: "Göreme Cad. No:58, 50240 Uçhisar/Nevşehir",
          latitude: 38.6298,
          longitude: 34.8062,
          rating: 4.7,
          amenities: ["Restoran", "Teras", "Wi-Fi", "Kahvaltı", "Otopark"],
          phone: "+90 384 219 3030",
          priceRange: "€€€",
          description: "Uçhisar kalesi manzaralı butik otel."
        },
        {
          name: "Gamirasu Hotel",
          category: "4 Star",
          region: "Ayvali",
          address: "Ayvali Köyü, 50500 Ürgüp/Nevşehir",
          latitude: 38.5987,
          longitude: 34.8745,
          rating: 4.6,
          amenities: ["Restoran", "Bar", "Wi-Fi", "Kahvaltı", "Otopark"],
          phone: "+90 384 354 5060",
          priceRange: "€€",
          description: "1000 yıllık manastırdan dönüştürülmüş otel."
        }
      ]

      for (const hotel of hotels) {
        await sql`
          INSERT INTO popular_hotels (
            name, category, region, address, latitude, longitude,
            rating, amenities, phone, price_range, description
          ) VALUES (
            ${hotel.name}, ${hotel.category}, ${hotel.region}, ${hotel.address},
            ${hotel.latitude}, ${hotel.longitude}, ${hotel.rating},
            ${hotel.amenities}, ${hotel.phone}, ${hotel.priceRange}, ${hotel.description}
          )
        `
      }

      console.log(`✅ ${hotels.length} popüler otel eklendi`)
    } else {
      console.log(`ℹ️  Veritabanında zaten ${existingHotels[0].count} otel var`)
    }

    console.log("✅ Veritabanı kurulumu tamamlandı!")
    
    // İstatistikleri göster
    const stats = await sql`
      SELECT 
        region,
        COUNT(*) as count,
        AVG(rating) as avg_rating
      FROM popular_hotels
      WHERE is_active = true
      GROUP BY region
      ORDER BY count DESC
    `
    
    console.log("\n📊 Otel İstatistikleri:")
    console.table(stats)

  } catch (error) {
    console.error("❌ Veritabanı kurulum hatası:", error)
    process.exit(1)
  }
}

setupDatabase()
