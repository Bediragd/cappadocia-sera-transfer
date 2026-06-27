import { NextRequest, NextResponse } from 'next/server'

// lib/auth içe aktarılmaz: pg/next-headers edge runtime'da çalışmaz.
// Bu yalnızca UX kapısıdır; gerçek doğrulama API uçlarında DB ile yapılır.
const SESSION_COOKIE = 'admin_session'

export function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl

  // Login sayfası serbest
  if (pathname === '/admin/login') {
    return NextResponse.next()
  }

  const token = request.cookies.get(SESSION_COOKIE)?.value
  if (!token) {
    const url = request.nextUrl.clone()
    url.pathname = '/admin/login'
    url.search = ''
    return NextResponse.redirect(url)
  }

  return NextResponse.next()
}

export const config = {
  matcher: ['/admin', '/admin/:path*'],
}
