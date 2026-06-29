import 'server-only'

// Server Supabase client for Server Components, Route Handlers and Server Actions.
// Reads/writes the session through Next's cookie store.
import { cookies } from 'next/headers'
import { createServerClient } from '@supabase/ssr'
import { SUPABASE_ANON_KEY, SUPABASE_URL } from './env'
import type { Database } from './types'

export async function createClient() {
  const cookieStore = await cookies()

  return createServerClient<Database>(SUPABASE_URL, SUPABASE_ANON_KEY, {
    cookies: {
      getAll() {
        return cookieStore.getAll()
      },
      setAll(cookiesToSet) {
        try {
          cookiesToSet.forEach(({ name, value, options }) =>
            cookieStore.set(name, value, options),
          )
        } catch {
          // `setAll` is called from a Server Component where cookies are
          // read-only. The middleware refreshes the session, so this is safe
          // to ignore.
        }
      },
    },
  })
}

// Service-role client — bypasses RLS. SERVER-ONLY, never expose the key to the
// browser. Used by trusted server paths such as the WhatsApp webhook, which
// writes bookings on behalf of users who have no app session.
export function createServiceClient() {
  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY
  if (!serviceKey) {
    throw new Error('SUPABASE_SERVICE_ROLE_KEY is not set')
  }
  const { createClient: createSupabaseClient } =
    require('@supabase/supabase-js') as typeof import('@supabase/supabase-js')
  return createSupabaseClient<Database>(SUPABASE_URL, serviceKey, {
    auth: { persistSession: false, autoRefreshToken: false },
  })
}
