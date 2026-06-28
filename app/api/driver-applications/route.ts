import { NextRequest, NextResponse } from 'next/server'
import { sql } from '@/lib/db'
import { driverApplicationSchema } from '@/lib/validations'
import { notifyAdmin } from '@/lib/notifications'
import { requireAdmin, unauthorized } from '@/lib/auth'
import {
  saveApplicationDocuments,
  validateRequiredDocuments,
  REQUIRED_DOC_KEYS,
} from '@/lib/driver-application-upload'

export const runtime = 'nodejs'
export const maxDuration = 120

function isDbSchemaError(error: unknown): boolean {
  if (!error || typeof error !== 'object') return false
  const code = 'code' in error ? String((error as { code?: string }).code) : ''
  const message = 'message' in error ? String((error as { message?: string }).message) : ''
  return code === '42703' || /column .* does not exist/i.test(message)
}

function isWriteError(error: unknown): boolean {
  if (!error || typeof error !== 'object') return false
  const code = 'code' in error ? String((error as { code?: string }).code) : ''
  return code === 'EACCES' || code === 'ENOENT' || code === 'EROFS'
}

export async function GET() {
  try {
    if (!(await requireAdmin())) return unauthorized()
    const applications = await sql`
      SELECT * FROM driver_applications ORDER BY created_at DESC
    `
    return NextResponse.json({ applications })
  } catch (error) {
    console.error('Error fetching applications:', error)
    return NextResponse.json({ error: 'Failed to fetch applications' }, { status: 500 })
  }
}

async function handleFormDataSubmit(request: NextRequest) {
  try {
    const formData = await request.formData()

    const adSoyad = String(formData.get('adSoyad') || '').trim()
    const email = String(formData.get('email') || '').trim()
    const telefon = String(formData.get('telefon') || '').trim()
    const tcKimlik = String(formData.get('tcKimlik') || '').trim()
    const plaka = String(formData.get('plaka') || '').trim()
    const aracMarka = String(formData.get('aracMarka') || '').trim()
    const aracModel = String(formData.get('aracModel') || '').trim()
    const aracYil = String(formData.get('aracYil') || '').trim()
    const kvkkOnay = formData.get('kvkkOnay') === 'true'

    if (!kvkkOnay) {
      return NextResponse.json({ error: 'KVKK onayi zorunludur' }, { status: 400 })
    }

    const files: Record<string, File> = {}
    for (const key of REQUIRED_DOC_KEYS) {
      const file = formData.get(key)
      if (file instanceof File) files[key] = file
    }

    const docError = validateRequiredDocuments(files)
    if (docError) {
      return NextResponse.json({ error: docError }, { status: 400 })
    }

    const payload = {
      name: adSoyad,
      email,
      phone: telefon,
      experienceYears: 0,
      licenseType: 'SRC + Ehliyet',
      hasOwnVehicle: true,
      vehicleType: `${aracMarka} ${aracModel}`.trim(),
      city: 'Nevsehir',
      message: `TC: ${tcKimlik} | Plaka: ${plaka}`,
    }

    const validated = driverApplicationSchema.parse(payload)

    const [row] = await sql`
      INSERT INTO driver_applications (
        name, email, phone, experience_years, license_type,
        has_own_vehicle, vehicle_type, city, message,
        tc_kimlik, vehicle_plate, vehicle_brand, vehicle_model, vehicle_year
      ) VALUES (
        ${validated.name}, ${validated.email}, ${validated.phone},
        ${validated.experienceYears}, ${validated.licenseType},
        ${validated.hasOwnVehicle}, ${validated.vehicleType || null},
        ${validated.city}, ${validated.message || null},
        ${tcKimlik || null}, ${plaka || null}, ${aracMarka || null},
        ${aracModel || null}, ${aracYil || null}
      )
      RETURNING id
    `

    const applicationId = Number(row.id)
    const documents = await saveApplicationDocuments(applicationId, files)

    await sql`
      UPDATE driver_applications
      SET documents = ${JSON.stringify(documents)}
      WHERE id = ${applicationId}
    `

    await notifyAdmin('driver_application', {
      name: validated.name,
      email: validated.email,
      city: validated.city,
      vehicle: `${plaka} - ${aracMarka} ${aracModel}`,
    })

    return NextResponse.json({ application: { id: applicationId }, message: 'Basvuru alindi' }, { status: 201 })
  } catch (error) {
    console.error('Error creating multipart application:', error)
    if (error instanceof Error && error.name === 'ZodError') {
      return NextResponse.json({ error: 'Form verileri gecersiz. Lutfen alanlari kontrol edin.' }, { status: 400 })
    }
    if (isDbSchemaError(error)) {
      return NextResponse.json(
        { error: 'Veritabani guncel degil. Sunucuda migration calistirin: node scripts/migrate.js' },
        { status: 500 }
      )
    }
    if (isWriteError(error)) {
      return NextResponse.json(
        { error: 'Belgeler kaydedilemedi. public/uploads klasorunun yazilabilir oldugundan emin olun.' },
        { status: 500 }
      )
    }
    return NextResponse.json({ error: 'Basvuru kaydedilemedi. Lutfen tekrar deneyin.' }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const contentType = request.headers.get('content-type') || ''

    if (contentType.includes('multipart/form-data')) {
      return handleFormDataSubmit(request)
    }

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

    await notifyAdmin('driver_application', {
      name: validatedData.name,
      email: validatedData.email,
      city: validatedData.city,
    })

    return NextResponse.json({ application: result[0] }, { status: 201 })
  } catch (error) {
    console.error('Error creating application:', error)
    if (error instanceof Error && error.name === 'ZodError') {
      return NextResponse.json({ error: 'Validation failed', details: error }, { status: 400 })
    }
    return NextResponse.json({ error: 'Failed to create application' }, { status: 500 })
  }
}
