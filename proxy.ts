import { getToken } from 'next-auth/jwt'
import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

export async function proxy(request: NextRequest) {
  const token = await getToken({ req: request })
  const { pathname } = request.nextUrl

  if (token && (pathname.startsWith('/login') || pathname.startsWith('/signup') || pathname.startsWith('/verify-email'))) {
    return NextResponse.redirect(new URL('/', request.url))
  }

  return NextResponse.next()
}

export const config = {
  matcher: ['/login/:path*', '/signup/:path*','/verify-email/:path*'],
}
