// Session-refresh helper used by the root middleware. Returns the (possibly
// cookie-mutated) response plus the current user so the middleware can make
// routing decisions without a second round-trip.
import { createServerClient } from '@supabase/ssr'
import { NextResponse, type NextRequest } from 'next/server'
import { SUPABASE_ANON_KEY, SUPABASE_URL } from './env'
import type { Database, UserRole } from './types'
import type { User } from '@supabase/supabase-js'

export async function updateSession(
  request: NextRequest,
): Promise<{ response: NextResponse; user: User | null; role: UserRole | null }> {
  let response = NextResponse.next({ request })

  const supabase = createServerClient<Database>(SUPABASE_URL, SUPABASE_ANON_KEY, {
    cookies: {
      getAll() {
        return request.cookies.getAll()
      },
      setAll(cookiesToSet) {
        cookiesToSet.forEach(({ name, value }) => request.cookies.set(name, value))
        response = NextResponse.next({ request })
        cookiesToSet.forEach(({ name, value, options }) =>
          response.cookies.set(name, value, options),
        )
      },
    },
  })

  // IMPORTANT: getUser() revalidates the token with Supabase Auth. Do not gate
  // on getSession() in middleware — it trusts the cookie without verifying.
  const {
    data: { user },
  } = await supabase.auth.getUser()

  let role: UserRole | null = null
  if (user) {
    const { data: profile } = await supabase
      .from('profiles')
      .select('role')
      .eq('id', user.id)
      .returns<{ role: UserRole }[]>()
      .single()
    role = profile?.role ?? null
  }

  return { response, user, role }
}
