import { NextRequest, NextResponse } from 'next/server'
import { sql } from '@/lib/db'
import { bookingSchema } from '@/lib/validations'
import { nanoid } from 'nanoid'

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const status = searchParams.get('status')
    const limit = parseInt(searchParams.get('limit') || '50')
    const offset = parseInt(searchParams.get('offset') || '0')

    let bookings
    if (status && status !== 'all') {
      bookings = await sql`
        SELECT b.*, v.name_tr as vehicle_name, d.name as driver_name
        FROM bookings b
        LEFT JOIN vehicles v ON b.vehicle_id = v.id
        LEFT JOIN drivers d ON b.driver_id = d.id
        WHERE b.status = ${status}
        ORDER BY b.created_at DESC
        LIMIT ${limit} OFFSET ${offset}
      `
    } else {
      bookings = await sql`
        SELECT b.*, v.name_tr as vehicle_name, d.name as driver_name
        FROM bookings b
        LEFT JOIN vehicles v ON b.vehicle_id = v.id
        LEFT JOIN drivers d ON b.driver_id = d.id
        ORDER BY b.created_at DESC
        LIMIT ${limit} OFFSET ${offset}
      `
    }

    const countResult = await sql`SELECT COUNT(*) as total FROM bookings`
    const total = countResult[0]?.total || 0

    return NextResponse.json({ bookings, total })
  } catch (error) {
    console.error('Error fetching bookings:', error)
    return NextResponse.json({ error: 'Failed to fetch bookings' }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const validatedData = bookingSchema.parse(body)

    const bookingNumber = `NVS-${nanoid(8).toUpperCase()}`

    // Get vehicle price
    const vehicles = await sql`SELECT base_price, price_per_km FROM vehicles WHERE id = ${validatedData.vehicleId}`
    const vehicle = vehicles[0]
    
    if (!vehicle) {
      return NextResponse.json({ error: 'Vehicle not found' }, { status: 404 })
    }

    // Calculate price (simplified - you can add distance calculation later)
    const totalPrice = vehicle.base_price

    const result = await sql`
      INSERT INTO bookings (
        booking_number, customer_name, customer_email, customer_phone,
        pickup_location, dropoff_location, pickup_date, pickup_time,
        passengers, luggage, vehicle_id, total_price, currency, notes
      ) VALUES (
        ${bookingNumber}, ${validatedData.customerName}, ${validatedData.customerEmail},
        ${validatedData.customerPhone}, ${validatedData.pickupLocation}, ${validatedData.dropoffLocation},
        ${validatedData.pickupDate}, ${validatedData.pickupTime}, ${validatedData.passengers},
        ${validatedData.luggage}, ${validatedData.vehicleId}, ${totalPrice}, 'TRY',
        ${validatedData.notes || null}
      )
      RETURNING *
    `

    return NextResponse.json({ booking: result[0], bookingNumber }, { status: 201 })
  } catch (error) {
    console.error('Error creating booking:', error)
    if (error instanceof Error && error.name === 'ZodError') {
      return NextResponse.json({ error: 'Validation failed', details: error }, { status: 400 })
    }
    return NextResponse.json({ error: 'Failed to create booking' }, { status: 500 })
  }
}
