import { notFound } from 'next/navigation'
import AppShell from '@/components/AppShell'
import { TENANT_SLUGS } from '@/lib/data'
import { loadAppData } from '@/lib/db/catalog'

export const revalidate = 60

// Per-tenant entry point. A garage shares one link (QR at the gate, WhatsApp
// bio): scanning lands the driver straight in that garage's branded booking —
// e.g. /juma-auto or /westgate. This is the path-based form of the multi-tenant
// routing; sub-domain / custom-domain mapping would layer on via middleware.
export function generateStaticParams() {
  return Object.keys(TENANT_SLUGS).map((tenant) => ({ tenant }))
}

export default async function TenantPage({ params }: { params: { tenant: string } }) {
  const key = TENANT_SLUGS[params.tenant.toLowerCase()]
  if (!key) notFound()
  const data = await loadAppData()
  return <AppShell initialTenant={key} data={data} />
}
