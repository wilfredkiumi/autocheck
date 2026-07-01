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

/**
 * Deliver a one-time login passcode via a WhatsApp *authentication* template.
 *
 * A login code is sent outside any active conversation window, so WhatsApp
 * rejects free-form text here — it must be a pre-approved template in the
 * AUTHENTICATION category. Create it once in Meta Business Manager, then point
 * these env vars at it:
 *   WHATSAPP_OTP_TEMPLATE — template name  (default 'otp_login')
 *   WHATSAPP_OTP_LANG     — language code  (default 'en')
 *
 * Authentication templates must carry an OTP button (copy-code or one-tap), so
 * Meta expects the code in BOTH the body and the button component.
 *
 * Throws on a Graph API error so the auth hook fails loudly (a swallowed error
 * would leave the driver waiting for a code that never comes). No-ops with a
 * log when credentials are absent, matching the other senders here.
 */
export async function sendWhatsAppOtp(to: string, code: string) {
  const token = process.env.WHATSAPP_TOKEN
  const phoneId = process.env.WHATSAPP_PHONE_NUMBER_ID
  if (!to || !token || !phoneId) {
    console.info('[whatsapp] otp skipped (no credentials):', { to })
    return { skipped: true as const }
  }
  const name = process.env.WHATSAPP_OTP_TEMPLATE || 'otp_login'
  const lang = process.env.WHATSAPP_OTP_LANG || 'en'
  const res = await fetch(`${GRAPH}/${phoneId}/messages`, {
    method: 'POST',
    headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' },
    body: JSON.stringify({
      messaging_product: 'whatsapp',
      to,
      type: 'template',
      template: {
        name,
        language: { code: lang },
        components: [
          { type: 'body', parameters: [{ type: 'text', text: code }] },
          {
            type: 'button',
            sub_type: 'url',
            index: '0',
            parameters: [{ type: 'text', text: code }],
          },
        ],
      },
    }),
  })
  const json = await res.json()
  if (!res.ok) {
    throw new Error(
      `WhatsApp OTP send failed (${res.status}): ${JSON.stringify(json?.error ?? json)}`,
    )
  }
  return json
}

/** Send a plain text message. No-ops with a log if credentials are absent. */
export async function sendText(to: string, body: string) {
  const token = process.env.WHATSAPP_TOKEN
  const phoneId = process.env.WHATSAPP_PHONE_NUMBER_ID
  if (!to || !token || !phoneId) {
    console.info('[whatsapp] text skipped (no credentials):', { to, body })
    return { skipped: true as const }
  }
  const res = await fetch(`${GRAPH}/${phoneId}/messages`, {
    method: 'POST',
    headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' },
    body: JSON.stringify({
      messaging_product: 'whatsapp',
      to,
      type: 'text',
      text: { body },
    }),
  })
  return res.json()
}
