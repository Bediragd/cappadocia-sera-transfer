import { NextRequest, NextResponse } from 'next/server'
import { sql } from '@/lib/db'

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const bookings = await sql`
      SELECT b.*, v.name_tr as vehicle_name, d.name as driver_name
      FROM bookings b
      LEFT JOIN vehicles v ON b.vehicle_id = v.id
      LEFT JOIN drivers d ON b.driver_id = d.id
      WHERE b.id = ${id}
    `

    if (bookings.length === 0) {
      return NextResponse.json({ error: 'Booking not found' }, { status: 404 })
    }

    return NextResponse.json({ booking: bookings[0] })
  } catch (error) {
    console.error('Error fetching booking:', error)
    return NextResponse.json({ error: 'Failed to fetch booking' }, { status: 500 })
  }
}

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const body = await request.json()
    const { status, driverId, paymentStatus } = body

    const updates: string[] = []
    const values: (string | number)[] = []

    if (status) {
      const result = await sql`
        UPDATE bookings SET status = ${status}, updated_at = NOW() WHERE id = ${id} RETURNING *
      `
      return NextResponse.json({ booking: result[0] })
    }

    if (driverId !== undefined) {
      const result = await sql`
        UPDATE bookings SET driver_id = ${driverId}, updated_at = NOW() WHERE id = ${id} RETURNING *
      `
      return NextResponse.json({ booking: result[0] })
    }

    if (paymentStatus) {
      const result = await sql`
        UPDATE bookings SET payment_status = ${paymentStatus}, updated_at = NOW() WHERE id = ${id} RETURNING *
      `
      return NextResponse.json({ booking: result[0] })
    }

    return NextResponse.json({ error: 'No valid fields to update' }, { status: 400 })
  } catch (error) {
    console.error('Error updating booking:', error)
    return NextResponse.json({ error: 'Failed to update booking' }, { status: 500 })
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    await sql`DELETE FROM bookings WHERE id = ${id}`
    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Error deleting booking:', error)
    return NextResponse.json({ error: 'Failed to delete booking' }, { status: 500 })
  }
}
