import { NextRequest, NextResponse } from 'next/server'
import { sql } from '@/lib/db'
import crypto from 'crypto'
import {
  SESSION_COOKIE,
  createSession,
  deleteSession,
  sessionCookieOptions,
  clearedCookieOptions,
  requireAdmin,
} from '@/lib/auth'

// Basit hash fonksiyonu (Production'da bcrypt kullanın!)
function hashPassword(password: string): string {
  return crypto.createHash('sha256').update(password).digest('hex')
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { email, password, name, action, currentPassword, newPassword } = body

    // Login
    if (action === 'login') {
      if (!email || !password) {
        return NextResponse.json({ error: 'Email ve şifre gerekli' }, { status: 400 })
      }

      const normalizedEmail = email.trim().toLowerCase()
      const hashedPassword = hashPassword(password)
      const users = await sql`
        SELECT id, email, name, role FROM users
        WHERE LOWER(TRIM(email)) = ${normalizedEmail} AND password_hash = ${hashedPassword}
      `

      if (users.length === 0) {
        return NextResponse.json({ error: 'Geçersiz email veya şifre' }, { status: 401 })
      }

      const user = users[0] as { id: number; email: string; name: string; role: string }
      const { token, expiresAt } = await createSession(user.id)

      const response = NextResponse.json({ user, message: 'Giriş başarılı' })
      response.cookies.set(SESSION_COOKIE, token, sessionCookieOptions(expiresAt))
      return response
    }

    // Logout
    if (action === 'logout') {
      const token = request.cookies.get(SESSION_COOKIE)?.value
      if (token) await deleteSession(token)
      const response = NextResponse.json({ message: 'Çıkış yapıldı' })
      response.cookies.set(SESSION_COOKIE, '', clearedCookieOptions())
      return response
    }

    // Şifre değiştir (giriş yapmış admin gerekli)
    if (action === 'change-password') {
      if (!(await requireAdmin())) {
        return NextResponse.json({ error: 'Yetkisiz erişim. Lütfen giriş yapın.' }, { status: 401 })
      }
      if (!email || !currentPassword || !newPassword) {
        return NextResponse.json({ error: 'Tüm alanlar gerekli' }, { status: 400 })
      }

      if (newPassword.length < 6) {
        return NextResponse.json({ error: 'Yeni şifre en az 6 karakter olmalı' }, { status: 400 })
      }

      if (currentPassword === newPassword) {
        return NextResponse.json({ error: 'Yeni şifre mevcut şifreden farklı olmalı' }, { status: 400 })
      }

      const normalizedEmail = email.trim().toLowerCase()
      const currentHash = hashPassword(currentPassword)
      const users = await sql`
        SELECT id FROM users
        WHERE LOWER(TRIM(email)) = ${normalizedEmail} AND password_hash = ${currentHash}
      `

      if (users.length === 0) {
        return NextResponse.json({ error: 'Mevcut şifre yanlış' }, { status: 401 })
      }

      const newHash = hashPassword(newPassword)
      await sql`
        UPDATE users
        SET password_hash = ${newHash}, updated_at = NOW()
        WHERE id = ${users[0].id}
      `

      return NextResponse.json({ message: 'Şifre başarıyla güncellendi' })
    }

    if (!email || !password) {
      return NextResponse.json({ error: 'Email ve şifre gerekli' }, { status: 400 })
    }

    // Register (yalnızca giriş yapmış admin yeni admin oluşturabilir)
    if (action === 'register') {
      const admin = await requireAdmin()
      if (!admin) {
        return NextResponse.json({ error: 'Yetkisiz erişim. Lütfen giriş yapın.' }, { status: 401 })
      }
      // Check if user exists
      const existingUsers = await sql`SELECT id FROM users WHERE email = ${email}`
      if (existingUsers.length > 0) {
        return NextResponse.json({ error: 'Bu email zaten kayıtlı' }, { status: 400 })
      }

      const hashedPassword = hashPassword(password)
      const result = await sql`
        INSERT INTO users (email, password_hash, name, role)
        VALUES (${email}, ${hashedPassword}, ${name || 'Admin'}, 'admin')
        RETURNING id, email, name, role
      `

      return NextResponse.json({ 
        user: result[0],
        message: 'Kayıt başarılı'
      }, { status: 201 })
    }

    return NextResponse.json({ error: 'Geçersiz işlem' }, { status: 400 })
  } catch (error) {
    console.error('Auth error:', error)
    return NextResponse.json({ error: 'Bir hata oluştu' }, { status: 500 })
  }
}
