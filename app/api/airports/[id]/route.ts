import { NextRequest, NextResponse } from 'next/server'
import { sql } from '@/lib/db'

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const body = await request.json()

    const result = await sql`
      UPDATE airports SET
        code = COALESCE(${body.code ? String(body.code).toUpperCase() : null}, code),
        name_tr = COALESCE(${body.nameTr ?? null}, name_tr),
        name_en = COALESCE(${body.nameEn ?? null}, name_en),
        name_ru = COALESCE(${body.nameRu ?? null}, name_ru),
        name_hi = COALESCE(${body.nameHi ?? null}, name_hi),
        latitude = COALESCE(${body.latitude ?? null}, latitude),
        longitude = COALESCE(${body.longitude ?? null}, longitude),
        address = COALESCE(${body.address ?? null}, address),
        is_active = COALESCE(${body.isActive ?? null}, is_active)
      WHERE id = ${id}
      RETURNING *
    `

    if (result.length === 0) {
      return NextResponse.json({ error: 'Airport not found' }, { status: 404 })
    }

    return NextResponse.json({ airport: result[0] })
  } catch (error) {
    console.error('Error updating airport:', error)
    return NextResponse.json({ error: 'Failed to update airport' }, { status: 500 })
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    await sql`UPDATE airports SET is_active = false WHERE id = ${id}`
    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Error deleting airport:', error)
    return NextResponse.json({ error: 'Failed to delete airport' }, { status: 500 })
  }
}
