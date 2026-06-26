import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'
import { getToken } from 'next-auth/jwt'

// Public routes that don't require authentication
const publicRoutes = ['/', '/login', '/register', '/offline']

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl

  // Allow public routes
  if (publicRoutes.some((route) => pathname === route)) {
    return NextResponse.next()
  }

  // Allow API routes + NextAuth + static files
  if (
    pathname.startsWith('/api') ||
    pathname.startsWith('/_next') ||
    pathname.startsWith('/icons') ||
    pathname.includes('.')
  ) {
    return NextResponse.next()
  }

  // Get the session token
  const token = await getToken({
    req: request,
    secret: process.env.AUTH_SECRET,
  })

  // Not authenticated → redirect to login
  if (!token) {
    const loginUrl = new URL('/login', request.url)
    loginUrl.searchParams.set('callbackUrl', pathname)
    return NextResponse.redirect(loginUrl)
  }

  const role = token.role as string

  // Admin routes — only super_admin
  if (pathname.startsWith('/admin') && role !== 'super_admin') {
    return NextResponse.redirect(new URL('/dashboard', request.url))
  }

  // Dashboard routes — redirect super_admin to admin panel
  if (pathname.startsWith('/dashboard') && role === 'super_admin') {
    return NextResponse.redirect(new URL('/admin', request.url))
  }

  return NextResponse.next()
}

export const config = {
  matcher: ['/((?!_next/static|_next/image|favicon.ico).*)'],
}
