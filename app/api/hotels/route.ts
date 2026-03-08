import { NextResponse } from "next/server"
import { sql } from "@/lib/db"

const CACHE_MAX_AGE = 120 // 2 dakika; otel listesi sık değişmez

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url)
  const region = searchParams.get("region")
  const category = searchParams.get("category")
  const minRating = searchParams.get("minRating")
  
  try {
    // Filtreleri uygula
    if (region) {
      const hotels = await sql`
        SELECT * FROM popular_hotels 
        WHERE is_active = true AND region = ${region}
        ORDER BY rating DESC, name ASC
      `
      return NextResponse.json(hotels, {
        headers: { "Cache-Control": `public, s-maxage=${CACHE_MAX_AGE}, stale-while-revalidate=60` },
      })
    }
    
    if (category) {
      const hotels = await sql`
        SELECT * FROM popular_hotels 
        WHERE is_active = true AND category = ${category}
        ORDER BY rating DESC, name ASC
      `
      return NextResponse.json(hotels, {
        headers: { "Cache-Control": `public, s-maxage=${CACHE_MAX_AGE}, stale-while-revalidate=60` },
      })
    }
    
    if (minRating) {
      const hotels = await sql`
        SELECT * FROM popular_hotels 
        WHERE is_active = true AND rating >= ${parseFloat(minRating)}
        ORDER BY rating DESC, name ASC
      `
      return NextResponse.json(hotels, {
        headers: { "Cache-Control": `public, s-maxage=${CACHE_MAX_AGE}, stale-while-revalidate=60` },
      })
    }
    
    // Filtre yoksa tüm otelleri getir
    const hotels = await sql`
      SELECT * FROM popular_hotels 
      WHERE is_active = true
      ORDER BY rating DESC, name ASC
    `
    
    return NextResponse.json(hotels, {
      headers: { "Cache-Control": `public, s-maxage=${CACHE_MAX_AGE}, stale-while-revalidate=60` },
    })
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
