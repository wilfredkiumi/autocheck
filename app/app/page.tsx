import AppShell from '@/components/AppShell'
import { loadAppData, loadDriverContext } from '@/lib/db/catalog'

// Revalidate the catalog periodically when backed by Supabase. With no backend
// configured this is a no-op (loadAppData returns the static demo bundle).
export const revalidate = 60

export default async function Page() {
  const [data, driver] = await Promise.all([loadAppData(), loadDriverContext()])
  return <AppShell data={{ ...data, driver: driver ?? undefined }} />
}
