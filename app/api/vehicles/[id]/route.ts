import { NextRequest, NextResponse } from 'next/server'
import { sql } from '@/lib/db'

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const vehicles = await sql`SELECT * FROM vehicles WHERE id = ${id}`

    if (vehicles.length === 0) {
      return NextResponse.json({ error: 'Vehicle not found' }, { status: 404 })
    }

    return NextResponse.json({ vehicle: vehicles[0] })
  } catch (error) {
    console.error('Error fetching vehicle:', error)
    return NextResponse.json({ error: 'Failed to fetch vehicle' }, { status: 500 })
  }
}

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const body = await request.json()

    const result = await sql`
      UPDATE vehicles SET
        name_tr = COALESCE(${body.name_tr}, name_tr),
        name_en = COALESCE(${body.name_en}, name_en),
        name_ru = COALESCE(${body.name_ru}, name_ru),
        name_hi = COALESCE(${body.name_hi}, name_hi),
        model = COALESCE(${body.model}, model),
        description_tr = COALESCE(${body.description_tr}, description_tr),
        description_en = COALESCE(${body.description_en}, description_en),
        description_ru = COALESCE(${body.description_ru}, description_ru),
        description_hi = COALESCE(${body.description_hi}, description_hi),
        capacity = COALESCE(${body.capacity}, capacity),
        luggage_capacity = COALESCE(${body.luggage_capacity}, luggage_capacity),
        image_url = COALESCE(${body.image_url}, image_url),
        price_per_km = COALESCE(${body.price_per_km}, price_per_km),
        base_price = COALESCE(${body.base_price}, base_price),
        is_active = COALESCE(${body.is_active}, is_active),
        updated_at = NOW()
      WHERE id = ${id}
      RETURNING *
    `

    return NextResponse.json({ vehicle: result[0] })
  } catch (error) {
    console.error('Error updating vehicle:', error)
    return NextResponse.json({ error: 'Failed to update vehicle' }, { status: 500 })
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    
    // Check if vehicle has bookings
    const bookings = await sql`SELECT COUNT(*) as count FROM bookings WHERE vehicle_id = ${id}`
    if (bookings[0].count > 0) {
      // Soft delete - deactivate instead of deleting
      await sql`UPDATE vehicles SET is_active = false WHERE id = ${id}`
      return NextResponse.json({ success: true, message: 'Vehicle deactivated due to existing bookings' })
    }

    await sql`DELETE FROM vehicles WHERE id = ${id}`
    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Error deleting vehicle:', error)
    return NextResponse.json({ error: 'Failed to delete vehicle' }, { status: 500 })
  }
}
