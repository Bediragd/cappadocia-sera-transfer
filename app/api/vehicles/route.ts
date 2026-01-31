import { NextRequest, NextResponse } from 'next/server'
import { sql } from '@/lib/db'

export async function GET() {
  try {
    const vehicles = await sql`
      SELECT * FROM vehicles WHERE is_active = true ORDER BY capacity ASC
    `
    return NextResponse.json({ vehicles })
  } catch (error) {
    console.error('Error fetching vehicles:', error)
    return NextResponse.json({ error: 'Failed to fetch vehicles' }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const {
      name, nameTr, nameEn, nameRu, nameHi,
      descriptionTr, descriptionEn, descriptionRu, descriptionHi,
      capacity, luggageCapacity, imageUrl, pricePerKm, basePrice
    } = body

    const result = await sql`
      INSERT INTO vehicles (
        name, name_tr, name_en, name_ru, name_hi,
        description_tr, description_en, description_ru, description_hi,
        capacity, luggage_capacity, image_url, price_per_km, base_price
      ) VALUES (
        ${name}, ${nameTr}, ${nameEn}, ${nameRu}, ${nameHi},
        ${descriptionTr}, ${descriptionEn}, ${descriptionRu}, ${descriptionHi},
        ${capacity}, ${luggageCapacity}, ${imageUrl}, ${pricePerKm}, ${basePrice}
      )
      RETURNING *
    `

    return NextResponse.json({ vehicle: result[0] }, { status: 201 })
  } catch (error) {
    console.error('Error creating vehicle:', error)
    return NextResponse.json({ error: 'Failed to create vehicle' }, { status: 500 })
  }
}
