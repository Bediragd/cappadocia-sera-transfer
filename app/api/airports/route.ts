import { NextResponse } from 'next/server'
import { sql } from '@/lib/db'

export async function GET() {
  try {
    const airports = await sql`
      SELECT * FROM airports WHERE is_active = true ORDER BY code ASC
    `
    return NextResponse.json({ airports })
  } catch (error) {
    console.error('Error fetching airports:', error)
    return NextResponse.json({ error: 'Failed to fetch airports' }, { status: 500 })
  }
}
