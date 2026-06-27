import { NextRequest, NextResponse } from 'next/server'
import { sql } from '@/lib/db'

const CACHE_MAX_AGE = 300 // 5 dk; havalimanı listesi nadiren değişir

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const includeAll = searchParams.get('all') === 'true'

    const airports = includeAll
      ? await sql`SELECT * FROM airports ORDER BY code ASC`
      : await sql`SELECT * FROM airports WHERE is_active = true ORDER BY code ASC`

    return NextResponse.json(
      { airports },
      includeAll
        ? undefined
        : { headers: { 'Cache-Control': `public, s-maxage=${CACHE_MAX_AGE}, stale-while-revalidate=120` } }
    )
  } catch (error) {
    console.error('Error fetching airports:', error)
    return NextResponse.json({ error: 'Failed to fetch airports' }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { code, nameTr, nameEn, nameRu, nameHi, latitude, longitude, address } = body

    if (!code || !nameTr) {
      return NextResponse.json({ error: 'Kod ve Türkçe ad zorunlu' }, { status: 400 })
    }

    const result = await sql`
      INSERT INTO airports (code, name_tr, name_en, name_ru, name_hi, latitude, longitude, address)
      VALUES (
        ${code.toUpperCase()}, ${nameTr}, ${nameEn || nameTr}, ${nameRu || nameTr}, ${nameHi || nameTr},
        ${latitude || null}, ${longitude || null}, ${address || null}
      )
      RETURNING *
    `

    return NextResponse.json({ airport: result[0] }, { status: 201 })
  } catch (error) {
    console.error('Error creating airport:', error)
    return NextResponse.json({ error: 'Failed to create airport' }, { status: 500 })
  }
}
