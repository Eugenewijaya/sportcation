import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

export function middleware(request: NextRequest) {
  const path = request.nextUrl.pathname

  // Proteksi hanya untuk rute /admin (dan rute-rute di bawahnya jika ada)
  if (path.startsWith('/admin')) {
    const session = request.cookies.get('admin_session')?.value

    if (!session || session !== 'authenticated_kw2') {
      // Belum login, tendang ke halaman /login
      return NextResponse.redirect(new URL('/login', request.url))
    }
  }

  return NextResponse.next()
}

// See "Matching Paths" below to learn more
export const config = {
  matcher: ['/admin/:path*'],
}
