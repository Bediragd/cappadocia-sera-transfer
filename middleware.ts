import { NextRequest, NextResponse } from 'next/server'

/** Standalone modda public/uploads runtime dosyalari static olarak sunulmaz — API uzerinden oku */
export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl

  if (pathname.startsWith('/uploads/')) {
    const subpath = pathname.slice('/uploads/'.length)
    if (!subpath) {
      return NextResponse.next()
    }
    const url = request.nextUrl.clone()
    url.pathname = `/api/files/${subpath}`
    return NextResponse.rewrite(url)
  }

  return NextResponse.next()
}

export const config = {
  matcher: '/uploads/:path*',
}
