import { NextResponse } from 'next/server'
import { sql } from '@/lib/db'

const CACHE_MAX_AGE = 300 // 5 dk; havalimanı listesi nadiren değişir

export async function GET() {
  try {
    const airports = await sql`
      SELECT * FROM airports WHERE is_active = true ORDER BY code ASC
    `
    return NextResponse.json({ airports }, {
      headers: { "Cache-Control": `public, s-maxage=${CACHE_MAX_AGE}, stale-while-revalidate=120` },
    })
  } catch (error) {
    console.error('Error fetching airports:', error)
    return NextResponse.json({ error: 'Failed to fetch airports' }, { status: 500 })
  }
}
