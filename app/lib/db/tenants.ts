import 'server-only'

import { createClient } from '@/lib/supabase/server'
import type { Garage, Tenant } from '@/lib/supabase/types'

export interface TenantWithGarages extends Tenant {
  garages: Garage[]
}

// Every tenant with its garages — the platform-admin trust view.
export async function listTenantsWithGarages(): Promise<TenantWithGarages[]> {
  const supabase = await createClient()
  const { data, error } = await supabase
    .from('tenants')
    .select('*, garages(*)')
    .order('created_at', { ascending: true })
    .returns<TenantWithGarages[]>()
  if (error) throw error
  return data ?? []
}

// Resolve a url slug (e.g. 'juma-auto' or 'juma') to its tenant.
export async function getTenantBySlug(slug: string): Promise<Tenant | null> {
  const supabase = await createClient()
  const { data: bySlug } = await supabase
    .from('tenants')
    .select('*')
    .eq('slug', slug.toLowerCase())
    .returns<Tenant[]>()
    .maybeSingle()
  if (bySlug) return bySlug

  const { data: alias } = await supabase
    .from('tenant_slugs')
    .select('tenant_id')
    .eq('slug', slug.toLowerCase())
    .returns<{ tenant_id: string }[]>()
    .maybeSingle()
  if (!alias) return null

  const { data } = await supabase
    .from('tenants')
    .select('*')
    .eq('id', alias.tenant_id)
    .returns<Tenant[]>()
    .single()
  return data ?? null
}

export async function setGarageVerified(
  garageId: string,
  isVerified: boolean,
): Promise<void> {
  const supabase = await createClient()
  const { error } = await supabase
    .from('garages')
    .update({ is_verified: isVerified })
    .eq('id', garageId)
  if (error) throw error
}
