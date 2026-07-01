# Driver login — WhatsApp OTP via a Supabase auth hook

Drivers sign in with a one-time passcode delivered over **WhatsApp** (SMS is the
fallback we don't use). Rather than pay for a separate SMS/WhatsApp provider,
we deliver the code through the **same Meta Cloud API number as the booking
bot** — using a Supabase **"Send SMS" auth hook**.

## Why a hook (and not Supabase's built-in WhatsApp provider)

Supabase's built-in `channel: 'whatsapp'` routes through **Twilio's** WhatsApp
sender — a second account with its own approval and cost. We already run a Meta
Cloud API number for the booking bot (`lib/whatsapp.ts`), so instead we let
Supabase *delegate delivery* to us:

- Supabase still **generates** the code, **rate-limits**, **verifies** it, and
  **issues the session** — none of that security-critical logic moves.
- Our hook only does **delivery**: it receives `{ phone, otp }` and sends it
  over our WhatsApp number.
- Result: one number does bookings *and* login OTP. No Twilio, no SMS.

```
driver enters phone  →  supabase.auth.signInWithOtp({ phone, channel: 'whatsapp' })
                            │  Supabase generates + stores the OTP
                            ▼
        Supabase "Send SMS" hook  ──POST──▶  /api/auth/whatsapp-otp
                                                 │  verify signature
                                                 │  sendWhatsAppOtp(phone, otp)
                                                 ▼
                                        Meta Cloud API  ──▶  driver's WhatsApp
driver enters code   →  supabase.auth.verifyOtp(...)  →  session + role routing
```

## Moving parts

| Piece | Location |
| --- | --- |
| Hook receiver (signature-verified) | `app/api/auth/whatsapp-otp/route.ts` |
| Template sender | `sendWhatsAppOtp()` in `lib/whatsapp.ts` |
| Sign-in / verify actions | `requestPhoneOtp` / `verifyPhoneOtp` in `lib/auth/actions.ts` |

### The hook route
- Verifies the **Standard Webhooks** signature Supabase sends
  (`webhook-id` / `webhook-timestamp` / `webhook-signature`) against
  `SEND_SMS_HOOK_SECRET`, with a timing-safe compare and a 5-minute replay
  window.
- **Fails closed**: no secret, bad signature, or stale timestamp → rejected. An
  unauthenticated OTP sender would let anyone spray messages through our number.
- Returns Supabase's `{ error: { http_code, message } }` shape on failure so the
  driver gets a real error instead of a silent hang.

### The sender
`sendWhatsAppOtp()` sends an **AUTHENTICATION-category template** — WhatsApp
rejects free-form text for a login code sent outside a 24-hour conversation
window, so a pre-approved template is mandatory. The code is passed to both the
body and the OTP button component.

## Environment variables

```
WHATSAPP_TOKEN            # Cloud API access token
WHATSAPP_PHONE_NUMBER_ID  # business phone number id
WHATSAPP_BUSINESS_NUMBER  # E.164 without '+', e.g. 447517846404
SEND_SMS_HOOK_SECRET      # the v1,whsec_… value Supabase generates for the hook
WHATSAPP_OTP_TEMPLATE     # authentication template name (default: otp_login)
WHATSAPP_OTP_LANG         # template language code    (default: en)
```

Set these in `.env.local` for local dev and in **Vercel** (Production + Preview)
for deploys.

## One-time setup

1. **Register the number** on the Cloud API (`…/{phone_number_id}/register`) so
   it can send/receive — see `whatsapp-bot.md`.
2. **Create an Authentication template** in Meta Business Manager named
   `otp_login` (or set `WHATSAPP_OTP_TEMPLATE` to your chosen name), language
   `en`. Wait for approval (auth templates are usually fast).
   - The sender uses button `sub_type: 'url'` (one-tap / autofill). If you build
     a **copy-code** button instead, adjust that field in `sendWhatsAppOtp()`.
3. **Push env to Vercel** (Prod + Preview) — all the vars above plus
   `WHATSAPP_VERIFY_TOKEN`.
4. **Enable the hook**: Supabase Dashboard → Authentication → Hooks →
   **Send SMS hook** →
   - URL: `https://autocheck-mauve.vercel.app/api/auth/whatsapp-otp`
   - Copy the generated `v1,whsec_…` secret into `SEND_SMS_HOOK_SECRET`.
5. **Deploy**, then test **"Send code on WhatsApp"** on `/login` (Phone tab).

## Troubleshooting

- **No code arrives** — check the Vercel function logs for `/api/auth/whatsapp-otp`.
  `401` = secret mismatch (dashboard secret ≠ `SEND_SMS_HOOK_SECRET`).
  `502` = Graph API rejected the send (template not approved / wrong name /
  number not registered).
- **`132001` / template errors** — the template name or language doesn't match an
  approved AUTHENTICATION template.
- **`skipped: true` in logs** — `WHATSAPP_TOKEN` / `WHATSAPP_PHONE_NUMBER_ID`
  aren't set in that environment.
- **Driver signs in but sees no bookings** — separate issue: there is no
  driver-facing "my bookings" list yet (see the note in the phase docs);
  `claim_bookings_by_phone` links the rows but no UI surfaces them.
