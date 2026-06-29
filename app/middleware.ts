import { NextResponse, type NextRequest } from 'next/server'
import { isSupabaseConfigured } from '@/lib/supabase/env'
import { updateSession } from '@/lib/supabase/middleware'
import { homeForRole, isPublicPath, matchProtected } from '@/lib/auth/roles'

// Role-gated routing.
//
// When Supabase is NOT configured the app is the standalone design demo, so the
// middleware is a pass-through and every route stays open. Once env vars are set
// it enforces the trust boundary:
//   * unauthenticated hitting a protected area  → /login
//   * authenticated with the wrong role         → bounced to their own home
//   * authenticated visiting /login             → bounced to their own home
export async function middleware(request: NextRequest) {
  if (!isSupabaseConfigured) {
    return NextResponse.next()
  }

  const { response, user, role } = await updateSession(request)
  const { pathname } = request.nextUrl

  const protectedRule = matchProtected(pathname)

  if (protectedRule) {
    if (!user) {
      const url = request.nextUrl.clone()
      url.pathname = '/login'
      url.searchParams.set('next', pathname)
      return NextResponse.redirect(url)
    }
    if (role && !protectedRule.roles.includes(role)) {
      const url = request.nextUrl.clone()
      url.pathname = homeForRole(role)
      url.search = ''
      return NextResponse.redirect(url)
    }
  }

  // Already signed in but sitting on the login page → send them where they belong.
  if (user && role && isPublicPath(pathname) && pathname.startsWith('/login')) {
    const url = request.nextUrl.clone()
    url.pathname = homeForRole(role)
    url.search = ''
    return NextResponse.redirect(url)
  }

  return response
}

export const config = {
  // Run on everything except Next internals and static assets.
  matcher: ['/((?!_next/static|_next/image|favicon.ico|icons/|manifest.webmanifest|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)'],
}
