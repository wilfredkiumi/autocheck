# Go-live checklist

How to take AutoCheck from **demo mode** (what's on `autocheck-mauve.vercel.app`
today) to a **live** app with real auth, a working WhatsApp bot, and bookings
saved to the database. **No code changes are required** — everything below is
project + env configuration. The app degrades gracefully, so you can do these in
order and redeploy as you go.

Env vars are set in **Vercel → your project → Settings → Environment Variables**
(Production + Preview). Remember: **`NEXT_PUBLIC_*` vars are baked in at build
time — after changing any of them you must redeploy.**

---

## 1. Supabase (database + auth)

1. Create a project at [supabase.com](https://supabase.com).
2. Apply the schema + seed (see `docs/supabase-setup.md` for detail):
   - migrations `0001` → `0006` in order, then `seed.sql`.
   - Enable **pg_cron** (Dashboard → Database → Extensions) if `0006` couldn't
     create it automatically.
3. Set in Vercel (from Supabase → Project Settings → API):
   ```
   NEXT_PUBLIC_SUPABASE_URL=https://YOUR-REF.supabase.co
   NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJ...
   SUPABASE_SERVICE_ROLE_KEY=eyJ...           # server-only, never NEXT_PUBLIC_
   NEXT_PUBLIC_SITE_URL=https://autocheck-mauve.vercel.app
   ```
4. **Auth → URL Configuration:** add `${NEXT_PUBLIC_SITE_URL}/auth/callback` to
   the allowed redirect URLs.
5. **Auth → Providers → Phone:** enable and connect a provider (Twilio) for the
   OTP. WhatsApp is the preferred OTP channel, SMS the fallback. (These provider
   creds live in the Supabase dashboard, not Vercel.)
6. Promote yourself to admin once you've signed in once (Supabase SQL editor):
   ```sql
   update profiles set role = 'admin' where id = '<your-auth-user-uuid>';
   ```
   (Owner/staff promotion examples are in `docs/supabase-setup.md`.)

After this: sign-in works, `/dashboard` + `/admin` are live, and app bookings
persist. The WhatsApp **button** already shows once
`NEXT_PUBLIC_WHATSAPP_BUSINESS_NUMBER` is set (below), but the **bot** needs §2.

---

## 2. WhatsApp Business Cloud API (the bot)

### 2a. Get a dedicated number
- Use a number that is **NOT on the normal WhatsApp / WhatsApp Business app** —
  a number already there can't be used on the Cloud API (it opens "message
  yourself" instead of reaching the bot).
- **Any country works** (a UK `+44` number can serve Kenyan drivers). Note:
  per-conversation pricing follows the *driver's* country, not the number's; a
  local `+254` number just feels more local to a Kenyan driver.
- It must be able to receive an SMS/voice OTP for verification.

### 2b. Create the Meta app + register the number
1. [business.facebook.com](https://business.facebook.com) → create/confirm a
   Meta Business (verify it later for higher send limits).
2. [developers.facebook.com](https://developers.facebook.com) → create an App
   (type: Business) → add the **WhatsApp** product.
3. WhatsApp → **API Setup**: add your dedicated phone number, verify via OTP.
   This creates a WhatsApp Business Account (WABA).

### 2c. Credentials → Vercel env
```
WHATSAPP_PHONE_NUMBER_ID=        # WhatsApp → API Setup (the number's ID)
WHATSAPP_TOKEN=                  # permanent System User token (see note)
WHATSAPP_VERIFY_TOKEN=           # any secret string you invent
WHATSAPP_BUSINESS_NUMBER=441234567890        # E.164, no '+'
NEXT_PUBLIC_WHATSAPP_BUSINESS_NUMBER=441234567890   # same number, for the button
# optional: where the fundi-facing booking brief is sent (defaults to the above)
WHATSAPP_GARAGE_NUMBER=
```
> ⚠️ **Permanent token:** the token shown in API Setup expires in **24 hours**.
> For production create a **System User** in Business Settings → Users → System
> Users, give it the WABA asset + `whatsapp_business_messaging` +
> `whatsapp_business_management`, and generate a **non-expiring** token. Use that
> as `WHATSAPP_TOKEN`.

### 2d. Wire the webhook
In Meta → WhatsApp → **Configuration → Webhook**:
- **Callback URL:** `https://autocheck-mauve.vercel.app/api/whatsapp`
- **Verify token:** the same value as `WHATSAPP_VERIFY_TOKEN`
- Click verify (Meta calls `GET /api/whatsapp` — the handler is already built).
- **Subscribe** to the **`messages`** field.

### 2e. Redeploy
Redeploy so the env vars take effect. Now a driver who messages the number gets
the full flow: `Karibu → symptom → photo/voice → slot → confirmed`, the booking
saves to `bookings` (keyed by plate), and the structured brief is sent to the
garage. Conversation state is held in `wa_conversations` (serverless-safe) and
abandoned chats self-clean hourly (pg_cron, migration `0006`).

---

## 3. Verify end to end
- [ ] Open `autocheck-mauve.vercel.app` → tap a garage → **Book on WhatsApp**
      shows and opens a chat to the business number with the prefilled opener.
- [ ] Send it → bot replies with the symptom buttons → complete to "Booking
      confirmed".
- [ ] The booking appears on the owner **/dashboard** for that garage.
- [ ] Sign in on the app with the **same phone number** → the WhatsApp booking is
      now attached to your account (claim-by-phone).
- [ ] Finish a booking **in the app** (plate → slot → Hold my bay) → it also
      lands on the dashboard.

---

## Notes & what's deliberately deferred
- **Cost:** Meta bills per conversation. Driver-initiated (click-to-chat) chats
  reply inside the free 24-hour service window; check current per-conversation
  pricing for your drivers' countries.
- **One shared number for now (Tier 0):** every garage funnels through this one
  AutoCheck number, routed by the `BOOK <garage>` keyword in the opener. Letting
  **paid garages connect their own number** is a later feature (Meta Embedded
  Signup) — not needed to launch.
- **M-Pesa deposit:** intentionally removed for now (the driver and garage know
  each other). Daraja STK-push can be added later.
- **AI "describe my issue":** `ANTHROPIC_API_KEY` is reserved for a future
  server-side Claude call; not required to go live.

## Env var quick reference
| Var | Where | Needed for |
| --- | --- | --- |
| `NEXT_PUBLIC_SUPABASE_URL` | Vercel | DB + auth |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Vercel | DB + auth |
| `SUPABASE_SERVICE_ROLE_KEY` | Vercel (server) | WhatsApp writes, cleanup |
| `NEXT_PUBLIC_SITE_URL` | Vercel | OAuth/magic-link redirects |
| `NEXT_PUBLIC_WHATSAPP_BUSINESS_NUMBER` | Vercel | "Book on WhatsApp" button |
| `WHATSAPP_BUSINESS_NUMBER` | Vercel (server) | wa.me links / brief routing |
| `WHATSAPP_PHONE_NUMBER_ID` | Vercel (server) | sending messages |
| `WHATSAPP_TOKEN` | Vercel (server) | sending messages (permanent token) |
| `WHATSAPP_VERIFY_TOKEN` | Vercel (server) | webhook verification |
| Twilio creds | Supabase dashboard | phone-OTP delivery |
| `GOOGLE_CLIENT_ID` / `_SECRET` | Vercel + Supabase | owner/admin Google login (optional) |
