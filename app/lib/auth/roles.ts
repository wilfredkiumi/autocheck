import type { UserRole } from '@/lib/supabase/types'

// Where each role lands after sign-in, and which path prefixes that role may use.
//
//   driver        → their account page (bookings + a link back into the funnel)
//   owner / staff → the garage dashboard
//   admin         → the platform admin (verify garages, manage tenants)
//
// Note: the booking funnel lives at '/' and stays open to everyone; a signed-in
// driver's *home* is /profile, which links back to '/' to book again.

export const HOME_FOR_ROLE: Record<UserRole, string> = {
  driver: '/profile',
  owner: '/dashboard',
  staff: '/dashboard',
  admin: '/admin',
}

// Path prefixes that require a session AND a specific set of roles.
const PROTECTED: { prefix: string; roles: UserRole[] }[] = [
  { prefix: '/dashboard', roles: ['owner', 'staff'] },
  { prefix: '/admin', roles: ['admin'] },
]

// Public paths that never require a session (the open booking funnel + auth).
const PUBLIC_PREFIXES = ['/login', '/auth', '/register']

export function isPublicPath(pathname: string): boolean {
  return PUBLIC_PREFIXES.some((p) => pathname === p || pathname.startsWith(p + '/'))
}

/** The protected rule matching this path, if any. */
export function matchProtected(pathname: string) {
  return PROTECTED.find(
    (r) => pathname === r.prefix || pathname.startsWith(r.prefix + '/'),
  )
}

export function homeForRole(role: UserRole): string {
  return HOME_FOR_ROLE[role] ?? '/'
}
