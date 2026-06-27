import { NextRequest, NextResponse } from 'next/server'
import { sql } from '@/lib/db'
import { requireAdmin, unauthorized } from '@/lib/auth'

const VALID_STATUS = ['pending', 'approved', 'rejected', 'inactive']

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    if (!(await requireAdmin())) return unauthorized()
    const { id } = await params
    const drivers = await sql`SELECT * FROM drivers WHERE id = ${id}`
    if (drivers.length === 0) {
      return NextResponse.json({ error: 'Driver not found' }, { status: 404 })
    }
    return NextResponse.json({ driver: drivers[0] })
  } catch (error) {
    console.error('Error fetching driver:', error)
    return NextResponse.json({ error: 'Failed to fetch driver' }, { status: 500 })
  }
}

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    if (!(await requireAdmin())) return unauthorized()
    const { id } = await params
    const body = await request.json()

    if (body.status && !VALID_STATUS.includes(body.status)) {
      return NextResponse.json({ error: 'Geçersiz durum' }, { status: 400 })
    }

    const result = await sql`
      UPDATE drivers SET
        full_name = COALESCE(${body.fullName ?? body.name ?? null}, full_name),
        phone = COALESCE(${body.phone ?? null}, phone),
        email = COALESCE(${body.email ?? null}, email),
        license_number = COALESCE(${body.licenseNumber ?? null}, license_number),
        city = COALESCE(${body.city ?? null}, city),
        vehicle_type = COALESCE(${body.vehicleType ?? null}, vehicle_type),
        vehicle_plate = COALESCE(${body.vehiclePlate ?? null}, vehicle_plate),
        experience_years = COALESCE(${body.experienceYears ?? null}, experience_years),
        own_vehicle = COALESCE(${body.ownVehicle ?? null}, own_vehicle),
        notes = COALESCE(${body.notes ?? null}, notes),
        status = COALESCE(${body.status ?? null}, status),
        updated_at = NOW()
      WHERE id = ${id}
      RETURNING *
    `

    if (result.length === 0) {
      return NextResponse.json({ error: 'Driver not found' }, { status: 404 })
    }

    return NextResponse.json({ driver: result[0] })
  } catch (error) {
    console.error('Error updating driver:', error)
    return NextResponse.json({ error: 'Failed to update driver' }, { status: 500 })
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    if (!(await requireAdmin())) return unauthorized()
    const { id } = await params
    await sql`UPDATE bookings SET driver_id = NULL WHERE driver_id = ${id}`
    await sql`DELETE FROM drivers WHERE id = ${id}`
    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Error deleting driver:', error)
    return NextResponse.json({ error: 'Failed to delete driver' }, { status: 500 })
  }
}
