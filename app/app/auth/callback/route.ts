import { NextResponse, type NextRequest } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { homeForRole } from '@/lib/auth/roles'
import type { UserRole } from '@/lib/supabase/types'

// OAuth / email magic-link callback. Supabase redirects here with a `code` which
// we exchange for a session cookie, then forward the user to their role's home.
export async function GET(request: NextRequest) {
  const { searchParams, origin } = new URL(request.url)
  const code = searchParams.get('code')
  const next = searchParams.get('next')

  if (code) {
    const supabase = await createClient()
    const { error } = await supabase.auth.exchangeCodeForSession(code)
    if (!error) {
      if (next) return NextResponse.redirect(`${origin}${next}`)
      const {
        data: { user },
      } = await supabase.auth.getUser()
      let dest = '/'
      if (user) {
        // Attach WhatsApp bookings made with this phone to the account.
        try {
          await supabase.rpc('claim_bookings_by_phone')
        } catch {
          /* non-blocking */
        }
        const { data: profile } = await supabase
          .from('profiles')
          .select('role')
          .eq('id', user.id)
          .returns<{ role: UserRole }[]>()
          .single()
        const role = profile?.role ?? 'driver'
        // This callback only fires for email / Google — our garage-owner &
        // admin channels. A user still on the default 'driver' role signed in
        // here to become an owner, so send them to garage registration rather
        // than the driver home. Existing owners/admins go to their dashboard.
        dest = role === 'driver' ? '/register' : homeForRole(role)
      }
      return NextResponse.redirect(`${origin}${dest}`)
    }
  }

  return NextResponse.redirect(`${origin}/login?error=auth`)
}
