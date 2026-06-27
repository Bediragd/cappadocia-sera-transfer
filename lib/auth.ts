import { cookies } from 'next/headers'
import { NextResponse } from 'next/server'
import crypto from 'crypto'
import { sql } from '@/lib/db'

export const SESSION_COOKIE = 'admin_session'
const SESSION_DAYS = 7
const ADMIN_ROLES = ['admin', 'super_admin']

export type SessionUser = {
  id: number
  email: string
  name: string
  role: string
}

/**
 * Cookie güvenliği:
 * - httpOnly: JS erişemez (XSS'e karşı)
 * - sameSite=lax: temel CSRF koruması
 * - secure: yalnızca HTTPS üzerinden gönderilir. HTTP üzerinden çalışan
 *   kurulumlarda giriş engellenmesin diye COOKIE_SECURE=true ile açılır.
 */
function isSecure(): boolean {
  return process.env.COOKIE_SECURE === 'true'
}

export function sessionCookieOptions(expiresAt: Date) {
  return {
    httpOnly: true,
    secure: isSecure(),
    sameSite: 'lax' as const,
    path: '/',
    expires: expiresAt,
  }
}

export function clearedCookieOptions() {
  return {
    httpOnly: true,
    secure: isSecure(),
    sameSite: 'lax' as const,
    path: '/',
    maxAge: 0,
  }
}

export async function createSession(userId: number): Promise<{ token: string; expiresAt: Date }> {
  const token = crypto.randomBytes(32).toString('hex')
  const expiresAt = new Date(Date.now() + SESSION_DAYS * 24 * 60 * 60 * 1000)
  await sql`
    INSERT INTO sessions (user_id, token, expires_at)
    VALUES (${userId}, ${token}, ${expiresAt.toISOString()})
  `
  return { token, expiresAt }
}

export async function deleteSession(token: string): Promise<void> {
  if (!token) return
  await sql`DELETE FROM sessions WHERE token = ${token}`
}

export async function getSessionUser(token: string): Promise<SessionUser | null> {
  if (!token) return null
  const rows = await sql`
    SELECT u.id, u.email, u.name, u.role
    FROM sessions s
    JOIN users u ON u.id = s.user_id
    WHERE s.token = ${token} AND s.expires_at > NOW()
  `
  return (rows[0] as SessionUser) ?? null
}

export async function getCurrentUser(): Promise<SessionUser | null> {
  const store = await cookies()
  const token = store.get(SESSION_COOKIE)?.value
  if (!token) return null
  return getSessionUser(token)
}

/**
 * Admin yetkisi doğrular. Yetki yoksa null döner; çağıran taraf
 * `unauthorized()` ile 401 dönmelidir.
 */
export async function requireAdmin(): Promise<SessionUser | null> {
  const user = await getCurrentUser()
  if (!user) return null
  if (!ADMIN_ROLES.includes(user.role)) return null
  return user
}

export function unauthorized() {
  return NextResponse.json({ error: 'Yetkisiz erişim. Lütfen giriş yapın.' }, { status: 401 })
}
