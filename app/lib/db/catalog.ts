import 'server-only'

import { createAnonClient } from '@/lib/supabase/server'
import { isSupabaseConfigured } from '@/lib/supabase/env'
import {
  STATIC_APP_DATA,
  TENANT_SLUGS,
  type AppData,
  type Garage as DemoGarage,
  type TenantKey,
  type Theme,
} from '@/lib/data'
import type { Garage as DbGarage, Issue, Service, Tenant } from '@/lib/supabase/types'

// Loads the driver-facing catalog (tenants, garages, issues, services) the
// booking screens render. When Supabase isn't configured — or a query fails, or
// returns nothing — it falls back to the static demo bundle, so the screens
// always have data. These reads are public under RLS, so they work on the open
// booking pages without a session.
export async function loadAppData(): Promise<AppData> {
  if (!isSupabaseConfigured) return STATIC_APP_DATA

  try {
    const supabase = createAnonClient()
    const [tenantsRes, garagesRes, issuesRes, servicesRes] = await Promise.all([
      supabase.from('tenants').select('*'),
      supabase.from('garages').select('*').order('sort', { ascending: true }),
      supabase.from('issues').select('*').order('sort', { ascending: true }),
      supabase.from('services').select('*').order('sort', { ascending: true }),
    ])

    const tenants = (tenantsRes.data ?? []) as Tenant[]
    const garages = (garagesRes.data ?? []) as DbGarage[]
    const issues = (issuesRes.data ?? []) as Issue[]
    const services = (servicesRes.data ?? []) as Service[]

    if (!tenants.length || !garages.length) return STATIC_APP_DATA

    // THEMES must keep all three TenantKey entries; start from the static set and
    // override with whatever the database supplies.
    const THEMES: Record<TenantKey, Theme> = { ...STATIC_APP_DATA.THEMES }
    for (const t of tenants) {
      const key = TENANT_SLUGS[t.slug]
      if (key) THEMES[key] = mapTheme(t)
    }

    const GARAGES = garages.filter((g) => g.mode === 'circle').map(mapGarage)
    const NYERI = garages.filter((g) => g.mode === 'verified').map(mapGarage)
    const ISSUES = dedupe(issues.map((i) => i.label))
    const SERVICES = dedupeBy(
      services.map((s) => ({ key: s.key, label: s.label, def: s.est_mins })),
      (s) => s.key,
    )

    return {
      THEMES,
      GARAGES: GARAGES.length ? GARAGES : STATIC_APP_DATA.GARAGES,
      NYERI: NYERI.length ? NYERI : STATIC_APP_DATA.NYERI,
      ISSUES: ISSUES.length ? ISSUES : STATIC_APP_DATA.ISSUES,
      SERVICES: SERVICES.length ? SERVICES : STATIC_APP_DATA.SERVICES,
    }
  } catch {
    return STATIC_APP_DATA
  }
}

function mapTheme(t: Tenant): Theme {
  return {
    name: t.name,
    short: t.short_name,
    label: t.short_name,
    sub: t.sub ?? '',
    mark: t.mark,
    accent: t.accent,
    accentDark: t.accent_dark,
    accentSoft: t.accent_soft,
    domain: t.domain,
    plan: t.plan_label ?? t.plan,
    price: t.price ?? '',
    feats: t.features,
  }
}

function mapGarage(g: DbGarage): DemoGarage {
  const d = g.details ?? {}
  return {
    name: g.name,
    area: g.area,
    dist: d.dist ?? '',
    bays: String(g.bays_total),
    next: d.next ?? '',
    trustType: d.trustType,
    trust: d.trust,
    avatars: d.avatars,
    circleAvatars: d.circleAvatars ?? [],
    circleText: d.circleText ?? '',
    quote: g.quote ?? '',
    quoteBy: g.quote_by ?? '',
    mode: g.mode,
    rating: g.rating != null ? String(g.rating) : undefined,
    visits: d.visits,
    open: d.open,
    avail: d.avail,
  }
}

function dedupe(items: string[]): string[] {
  return [...new Set(items)]
}

function dedupeBy<T>(items: T[], key: (item: T) => string): T[] {
  const seen = new Set<string>()
  const out: T[] = []
  for (const item of items) {
    const k = key(item)
    if (!seen.has(k)) {
      seen.add(k)
      out.push(item)
    }
  }
  return out
}
