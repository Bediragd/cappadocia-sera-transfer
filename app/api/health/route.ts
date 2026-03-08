import { NextResponse } from 'next/server'
import { sql } from '@/lib/db'

/**
 * Veritabanı bağlantısını test eder.
 * Sunucuda: curl http://127.0.0.1:3000/api/health
 * - db: "ok" → bağlantı çalışıyor
 * - db: "error", message: "..." → DATABASE_URL yok veya bağlantı hatası (timeout vb.)
 */
export async function GET() {
  const hasEnv = !!process.env.DATABASE_URL
  if (!hasEnv) {
    return NextResponse.json(
      { db: 'error', message: 'DATABASE_URL tanımlı değil. .env dosyasını kontrol edin.' },
      { status: 503 }
    )
  }
  try {
    await sql`SELECT 1 as n`
    return NextResponse.json({ db: 'ok' })
  } catch (e) {
    const message = e instanceof Error ? e.message : String(e)
    return NextResponse.json(
      { db: 'error', message },
      { status: 503 }
    )
  }
}
