import { NextResponse } from 'next/server'
import { auth } from '@/auth'

export default auth((request) => {
  const { pathname } = request.nextUrl
  const isLoggedIn = !!request.auth
  const role = request.auth?.user?.role
  const isAdminLogin = pathname === '/admin/login'
  const isCustomerLoginRoute = pathname === '/login'
  const isCustomerSignupRoute = pathname === '/signup'
  const isCustomerProtectedRoute = ['/profile', '/orders', '/request', '/cart'].includes(pathname)

  if (pathname.startsWith('/admin')) {
    if (!isLoggedIn && !isAdminLogin) {
      return NextResponse.redirect(new URL('/admin/login', request.url))
    }

    if (isLoggedIn && role !== 'admin' && !isAdminLogin) {
      return NextResponse.redirect(new URL('/login', request.url))
    }
  }

  if (isCustomerProtectedRoute && !isLoggedIn) {
    return NextResponse.redirect(new URL('/login', request.url))
  }

  if (isCustomerLoginRoute && isLoggedIn) {
    const destination = role === 'admin' ? '/admin' : '/products'
    return NextResponse.redirect(new URL(destination, request.url))
  }

  // Allow the signup page even for signed-in users so the landing-page CTA
  // always opens account creation instead of bouncing to /products.
  if (isCustomerSignupRoute) {
    return NextResponse.next()
  }

  if (isAdminLogin && isLoggedIn) {
    const destination = role === 'admin' ? '/admin' : '/login'
    return NextResponse.redirect(new URL(destination, request.url))
  }

  return NextResponse.next()
})

export const config = {
  matcher: ['/admin/:path*', '/login', '/signup', '/profile', '/orders', '/request', '/cart']
}
