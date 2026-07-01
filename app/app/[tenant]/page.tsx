import { notFound } from 'next/navigation'
import AppShell from '@/components/AppShell'
import { TENANT_SLUGS } from '@/lib/data'
import { isSupabaseConfigured } from '@/lib/supabase/env'
import { loadAppData, loadDriverContext } from '@/lib/db/catalog'

export const dynamic = 'force-dynamic'

// Per-tenant entry point. When Supabase is configured, render on-demand
// (tenants are dynamic). Without it, pre-render the static demo slugs.
export function generateStaticParams() {
  if (isSupabaseConfigured) return []
  return Object.keys(TENANT_SLUGS).map((tenant) => ({ tenant }))
}

export default async function TenantPage({ params }: { params: { tenant: string } }) {
  const key = TENANT_SLUGS[params.tenant.toLowerCase()]
  if (!key) notFound()
  const [data, driver] = await Promise.all([loadAppData(), loadDriverContext()])
  return <AppShell initialTenant={key} data={{ ...data, driver: driver ?? undefined }} />
}
