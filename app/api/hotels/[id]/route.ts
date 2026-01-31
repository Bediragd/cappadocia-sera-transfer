import { neon } from "@neondatabase/serverless"
import { NextResponse } from "next/server"

export async function GET(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const sql = neon(process.env.DATABASE_URL!)
    const hotels = await sql`
      SELECT * FROM popular_hotels 
      WHERE id = ${params.id} AND is_active = true
    `
    
    if (hotels.length === 0) {
      return NextResponse.json(
        { error: "Hotel not found" },
        { status: 404 }
      )
    }
    
    return NextResponse.json(hotels[0])
  } catch (error) {
    console.error("Error fetching hotel:", error)
    return NextResponse.json(
      { error: "Failed to fetch hotel" },
      { status: 500 }
    )
  }
}

export async function PATCH(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const body = await request.json()
    const sql = neon(process.env.DATABASE_URL!)
    
    const result = await sql`
      UPDATE popular_hotels 
      SET 
        name = COALESCE(${body.name}, name),
        category = COALESCE(${body.category}, category),
        region = COALESCE(${body.region}, region),
        address = COALESCE(${body.address}, address),
        latitude = COALESCE(${body.latitude}, latitude),
        longitude = COALESCE(${body.longitude}, longitude),
        rating = COALESCE(${body.rating}, rating),
        image_url = COALESCE(${body.imageUrl}, image_url),
        amenities = COALESCE(${body.amenities}, amenities),
        phone = COALESCE(${body.phone}, phone),
        price_range = COALESCE(${body.priceRange}, price_range),
        description = COALESCE(${body.description}, description),
        updated_at = CURRENT_TIMESTAMP
      WHERE id = ${params.id}
      RETURNING *
    `
    
    if (result.length === 0) {
      return NextResponse.json(
        { error: "Hotel not found" },
        { status: 404 }
      )
    }
    
    return NextResponse.json(result[0])
  } catch (error) {
    console.error("Error updating hotel:", error)
    return NextResponse.json(
      { error: "Failed to update hotel" },
      { status: 500 }
    )
  }
}

export async function DELETE(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const sql = neon(process.env.DATABASE_URL!)
    
    // Soft delete
    const result = await sql`
      UPDATE popular_hotels 
      SET is_active = false, updated_at = CURRENT_TIMESTAMP
      WHERE id = ${params.id}
      RETURNING *
    `
    
    if (result.length === 0) {
      return NextResponse.json(
        { error: "Hotel not found" },
        { status: 404 }
      )
    }
    
    return NextResponse.json({ message: "Hotel deactivated successfully" })
  } catch (error) {
    console.error("Error deleting hotel:", error)
    return NextResponse.json(
      { error: "Failed to delete hotel" },
      { status: 500 }
    )
  }
}
