import { NextRequest, NextResponse } from 'next/server'
import { sql } from '@/lib/db'

/**
 * GET /api/bookings/slots?date=YYYY-MM-DD
 * Returns confirmed (occupied) slots for the given date.
 * Frontend uses this to show which (pickup_location, dropoff_location, pickup_time) are already taken.
 */
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const date = searchParams.get('date')
    if (!date) {
      return NextResponse.json({ error: 'Date is required (YYYY-MM-DD)' }, { status: 400 })
    }

    const rows = await sql`
      SELECT pickup_location, dropoff_location, pickup_time
      FROM bookings
      WHERE pickup_date = ${date}::date AND status = 'confirmed'
      ORDER BY pickup_time
    `
    const slots = rows.map((r: { pickup_time?: string | Date }) => ({
      ...r,
      pickup_time: typeof r.pickup_time === 'string' ? r.pickup_time : (r.pickup_time ? String(r.pickup_time).slice(0, 8) : ''),
    }))

    return NextResponse.json({ slots })
  } catch (error) {
    console.error('Error fetching occupied slots:', error)
    return NextResponse.json({ error: 'Failed to fetch slots' }, { status: 500 })
  }
}
