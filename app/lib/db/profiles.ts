import 'server-only'

import { createClient } from '@/lib/supabase/server'
import type { Profile, Tenant } from '@/lib/supabase/types'

export interface SessionContext {
  profile: Profile
  tenant: Tenant | null
}

// The signed-in user's profile (with role/tenant) plus their tenant branding,
// or null when there's no session. Server-side only; used by gated layouts.
export async function getSessionContext(): Promise<SessionContext | null> {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) return null

  const { data: profile } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', user.id)
    .returns<Profile[]>()
    .single()
  if (!profile) return null

  let tenant: Tenant | null = null
  if (profile.tenant_id) {
    const { data } = await supabase
      .from('tenants')
      .select('*')
      .eq('id', profile.tenant_id)
      .returns<Tenant[]>()
      .single()
    tenant = data ?? null
  }

  return { profile, tenant }
}
