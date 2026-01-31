import { neon } from "@neondatabase/serverless"
import { NextResponse } from "next/server"

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url)
  const region = searchParams.get("region")
  const category = searchParams.get("category")
  const minRating = searchParams.get("minRating")
  
  try {
    const sql = neon(process.env.DATABASE_URL!)
    
    // Filtreler için dinamik query oluştur
    let baseQuery = `
      SELECT 
        id, name, category, region, address, 
        latitude, longitude, rating, image_url,
        amenities, phone, price_range, description
      FROM popular_hotels 
      WHERE is_active = true
    `
    
    // Filtreleri uygula
    if (region) {
      const hotels = await sql`
        SELECT * FROM popular_hotels 
        WHERE is_active = true AND region = ${region}
        ORDER BY rating DESC, name ASC
      `
      return NextResponse.json(hotels)
    }
    
    if (category) {
      const hotels = await sql`
        SELECT * FROM popular_hotels 
        WHERE is_active = true AND category = ${category}
        ORDER BY rating DESC, name ASC
      `
      return NextResponse.json(hotels)
    }
    
    if (minRating) {
      const hotels = await sql`
        SELECT * FROM popular_hotels 
        WHERE is_active = true AND rating >= ${parseFloat(minRating)}
        ORDER BY rating DESC, name ASC
      `
      return NextResponse.json(hotels)
    }
    
    // Filtre yoksa tüm otelleri getir
    const hotels = await sql`
      SELECT * FROM popular_hotels 
      WHERE is_active = true
      ORDER BY rating DESC, name ASC
    `
    
    return NextResponse.json(hotels)
  } catch (error) {
    console.error("Error fetching hotels:", error)
    return NextResponse.json(
      { error: "Failed to fetch hotels" },
      { status: 500 }
    )
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json()
    const sql = neon(process.env.DATABASE_URL!)
    
    const result = await sql`
      INSERT INTO popular_hotels (
        name, category, region, address, latitude, longitude, 
        rating, image_url, amenities, phone, price_range, description
      ) VALUES (
        ${body.name}, ${body.category}, ${body.region}, ${body.address},
        ${body.latitude}, ${body.longitude}, ${body.rating || 4.5},
        ${body.imageUrl || null}, ${body.amenities || []}, 
        ${body.phone || null}, ${body.priceRange || null}, ${body.description || null}
      ) RETURNING *
    `
    
    return NextResponse.json(result[0], { status: 201 })
  } catch (error) {
    console.error("Error creating hotel:", error)
    return NextResponse.json(
      { error: "Failed to create hotel" },
      { status: 500 }
    )
  }
}
