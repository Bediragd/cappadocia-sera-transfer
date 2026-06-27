import { NextRequest, NextResponse } from 'next/server'
import { sql } from '@/lib/db'

export async function GET() {
  try {
    const drivers = await sql`
      SELECT
        id, status, full_name, email, phone, city,
        license_number, own_vehicle, vehicle_type, vehicle_plate,
        experience_years, notes, created_at
      FROM drivers
      ORDER BY full_name ASC
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
    const {
      fullName,
      name,
      phone,
      email,
      licenseNumber,
      city,
      vehicleType,
      vehiclePlate,
      experienceYears,
      ownVehicle,
      notes,
      status,
    } = body

    const finalName = fullName || name

    if (!finalName || !phone) {
      return NextResponse.json({ error: 'Ad ve telefon zorunlu' }, { status: 400 })
    }

    const result = await sql`
      INSERT INTO drivers (
        full_name, phone, email, license_number, city,
        vehicle_type, vehicle_plate, experience_years, own_vehicle, notes, status
      )
      VALUES (
        ${finalName}, ${phone}, ${email || null}, ${licenseNumber || null}, ${city || null},
        ${vehicleType || null}, ${vehiclePlate || null}, ${experienceYears || 0},
        ${ownVehicle ?? false}, ${notes || null}, ${status || 'approved'}
      )
      RETURNING *
    `

    return NextResponse.json({ driver: result[0] }, { status: 201 })
  } catch (error) {
    console.error('Error creating driver:', error)
    return NextResponse.json({ error: 'Failed to create driver' }, { status: 500 })
  }
}
