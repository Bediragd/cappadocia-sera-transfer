import { NextRequest, NextResponse } from 'next/server'
import { sql } from '@/lib/db'

export async function GET() {
  try {
    const drivers = await sql`
      SELECT d.*, v.name_tr as vehicle_name
      FROM drivers d
      LEFT JOIN vehicles v ON d.vehicle_id = v.id
      WHERE d.is_active = true
      ORDER BY d.name ASC
    `
    return NextResponse.json({ drivers })
  } catch (error) {
    console.error('Error fetching drivers:', error)
    return NextResponse.json({ error: 'Failed to fetch drivers' }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { name, phone, email, licenseNumber, vehicleId } = body

    const result = await sql`
      INSERT INTO drivers (name, phone, email, license_number, vehicle_id)
      VALUES (${name}, ${phone}, ${email}, ${licenseNumber}, ${vehicleId || null})
      RETURNING *
    `

    return NextResponse.json({ driver: result[0] }, { status: 201 })
  } catch (error) {
    console.error('Error creating driver:', error)
    return NextResponse.json({ error: 'Failed to create driver' }, { status: 500 })
  }
}
