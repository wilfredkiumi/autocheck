// WhatsApp Business Cloud API helpers.
//
// This is the server-side counterpart to the in-app WhatsApp UI. It is the
// "one engine, three faces" join point: inbound WhatsApp messages and the PWA
// both flow through the same booking backend. Nothing here sends live traffic
// unless the WHATSAPP_* env vars are set — without them the send is a no-op so
// the app runs locally and on a vanilla Vercel deploy.
//
// Required env for live sending / webhook verification:
//   WHATSAPP_TOKEN            — Cloud API access token
//   WHATSAPP_PHONE_NUMBER_ID  — the business phone number id
//   WHATSAPP_VERIFY_TOKEN     — shared secret for webhook GET verification
//   WHATSAPP_BUSINESS_NUMBER  — E.164 number (no +) used in wa.me links

import { THEMES, TenantKey } from './data'

const GRAPH = 'https://graph.facebook.com/v21.0'

/**
 * Build the click-to-chat link a garage shares (QR sticker, WhatsApp bio, SMS).
 * The prefilled text encodes the tenant so a single business number can route
 * every garage — the webhook reads the keyword to pick the right tenant.
 */
export function waLink(tenant: TenantKey, businessNumber = process.env.WHATSAPP_BUSINESS_NUMBER) {
  const number = (businessNumber || '').replace(/[^0-9]/g, '')
  const text = `BOOK ${THEMES[tenant].short} — I'd like to book my car in.`
  const base = number ? `https://wa.me/${number}` : 'https://wa.me/'
  return `${base}?text=${encodeURIComponent(text)}`
}

/** Map an inbound prefilled "BOOK <garage>" message to a tenant key. */
export function tenantFromText(text: string): TenantKey {
  const t = (text || '').toLowerCase()
  if (t.includes('juma')) return 'juma'
  if (t.includes('westgate')) return 'westgate'
  return 'autocheck'
}

interface ReplyButton {
  id: string
  title: string
}

/**
 * Send an interactive reply-button message (max 3 buttons — WhatsApp's limit;
 * use a list message for more). No-ops with a log if credentials are absent.
 */
export async function sendButtons(to: string, body: string, buttons: ReplyButton[]) {
  const token = process.env.WHATSAPP_TOKEN
  const phoneId = process.env.WHATSAPP_PHONE_NUMBER_ID
  if (!token || !phoneId) {
    console.info('[whatsapp] send skipped (no credentials):', { to, body, buttons })
    return { skipped: true as const }
  }
  const res = await fetch(`${GRAPH}/${phoneId}/messages`, {
    method: 'POST',
    headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' },
    body: JSON.stringify({
      messaging_product: 'whatsapp',
      to,
      type: 'interactive',
      interactive: {
        type: 'button',
        body: { text: body },
        action: {
          buttons: buttons.slice(0, 3).map((b) => ({
            type: 'reply',
            reply: { id: b.id, title: b.title.slice(0, 20) },
          })),
        },
      },
    }),
  })
  return res.json()
}

/** First bot turn for a fresh inbound booking conversation. */
export function greetingFor(tenant: TenantKey) {
  const g = THEMES[tenant].short
  return {
    body: `Karibu ${g} 👋 Book your car straight in here — no calling around. What's the problem?`,
    buttons: [
      { id: 'sym_brakes', title: 'Brakes 🛑' },
      { id: 'sym_engine', title: 'Engine / heat' },
      { id: 'sym_other', title: 'Something else' },
    ],
  }
}
