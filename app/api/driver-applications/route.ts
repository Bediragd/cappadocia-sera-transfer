import { NextRequest, NextResponse } from 'next/server'
import { sql } from '@/lib/db'
import { driverApplicationSchema } from '@/lib/validations'

export async function GET() {
  try {
    const applications = await sql`
      SELECT * FROM driver_applications ORDER BY created_at DESC
    `
    return NextResponse.json({ applications })
  } catch (error) {
    console.error('Error fetching applications:', error)
    return NextResponse.json({ error: 'Failed to fetch applications' }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const validatedData = driverApplicationSchema.parse(body)

    const result = await sql`
      INSERT INTO driver_applications (
        name, email, phone, experience_years, license_type,
        has_own_vehicle, vehicle_type, city, message
      ) VALUES (
        ${validatedData.name}, ${validatedData.email}, ${validatedData.phone},
        ${validatedData.experienceYears}, ${validatedData.licenseType},
        ${validatedData.hasOwnVehicle}, ${validatedData.vehicleType || null},
        ${validatedData.city}, ${validatedData.message || null}
      )
      RETURNING *
    `

    return NextResponse.json({ application: result[0] }, { status: 201 })
  } catch (error) {
    console.error('Error creating application:', error)
    if (error instanceof Error && error.name === 'ZodError') {
      return NextResponse.json({ error: 'Validation failed', details: error }, { status: 400 })
    }
    return NextResponse.json({ error: 'Failed to create application' }, { status: 500 })
  }
}
