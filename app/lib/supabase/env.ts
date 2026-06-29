// Single source of truth for "is Supabase configured?".
//
// The whole app degrades gracefully when these are absent: the demo runs on the
// static data in lib/data.ts, and auth/routing become no-ops. Set the two public
// vars (plus the service-role key for server-only writes) to switch the app to
// the live Postgres backend — no code changes required.

export const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL ?? ''
export const SUPABASE_ANON_KEY = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ?? ''

/** True only when both public Supabase env vars are present. */
export const isSupabaseConfigured = Boolean(SUPABASE_URL && SUPABASE_ANON_KEY)
