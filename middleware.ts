import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl
  const token = request.cookies.get('token')?.value
  const role = request.cookies.get('role')?.value
  const isAdminLogin = pathname === '/admin/login'
  const isCustomerGuestRoute = pathname === '/login' || pathname === '/signup'

  if (pathname.startsWith('/admin')) {
    if (!token && !isAdminLogin) {
      return NextResponse.redirect(new URL('/admin/login', request.url))
    }

    if (token && role !== 'admin' && !isAdminLogin) {
      return NextResponse.redirect(new URL('/login', request.url))
    }
  }

  if (isCustomerGuestRoute && token) {
    const destination = role === 'admin' ? '/admin' : '/products'
    return NextResponse.redirect(new URL(destination, request.url))
  }

  if (isAdminLogin && token && role === 'admin') {
    return NextResponse.redirect(new URL('/admin', request.url))
  }

  return NextResponse.next()
}

export const config = {
  matcher: ['/admin/:path*', '/login', '/signup']
}
