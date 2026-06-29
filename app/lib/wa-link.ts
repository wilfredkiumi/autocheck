// Resolve the "Book on WhatsApp" click-to-chat target for a garage's tenant.
//
// Pure + client-safe (reads only the NEXT_PUBLIC_ shared number), so the
// consumer screens can render a plain <a href>. Two tiers:
//   • Tier 0 — shared AutoCheck number: the prefill carries a "BOOK <garage>"
//     keyword so the one webhook can route the tenant (tenantFromText).
//   • Paid tier — the garage's own number: the number itself identifies the
//     tenant, so the prefill is just a friendly opener. Pass `ownNumber` once the
//     whatsapp_accounts routing lands; until then every garage uses the shared
//     number and nothing changes here.
import { THEMES, type TenantKey } from './data'

const SHARED_NUMBER = (process.env.NEXT_PUBLIC_WHATSAPP_BUSINESS_NUMBER ?? '').replace(
  /[^0-9]/g,
  '',
)

export interface WaTarget {
  /** E.164 digits (no +) the chat opens to, or '' if none configured. */
  number: string
  /** Full https://wa.me/<number>?text=… link, or '' when unavailable. */
  href: string
  /** True only when a destination number is configured. */
  available: boolean
}

export function resolveWaTarget(tenant: TenantKey, ownNumber?: string): WaTarget {
  const own = (ownNumber ?? '').replace(/[^0-9]/g, '')
  const number = own || SHARED_NUMBER
  const short = THEMES[tenant]?.short ?? 'AutoCheck'
  const prefill = own
    ? `Hi ${short}, I'd like to book my car in.`
    : `BOOK ${short} — I'd like to book my car in.`
  const href = number ? `https://wa.me/${number}?text=${encodeURIComponent(prefill)}` : ''
  return { number, href, available: Boolean(number) }
}
