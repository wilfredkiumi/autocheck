# Phase 2 — from demo to product

Phase 1 put a real backend under the app but left the public front door as the
multi-tenant *demo showcase*. Phase 2 makes the consumer app real and closes the
booking loop on two channels.

## 1. The front door is now a real consumer app
`components/AppShell.tsx` no longer renders the demo switcher (the persona tabs,
the brand chips) or the fake phone status bar. It is the **driver app only**:
full-bleed on phones, a centered app column on desktop. The route fixes the
tenant — `/` is AutoCheck, `/juma-auto` / `/westgate` are the branded entries a
driver reaches from a garage's QR code or wa.me link. Owners/staff/admins sign
in at `/login` for `/dashboard` and `/admin`; they never see a switcher.

## 2. Driver booking write-path
- `lib/actions/booking.ts` → `createBookingAction` inserts a real booking
  (`bookings` + `booking_issues`) for the signed-in driver. RLS requires
  `driver_id = auth.uid()`.
- The garage's DB id is now threaded through the catalog (`Garage.id`) into the
  funnel, so the booking is attached to the right garage/tenant.
- The Slot screen's "Hold my bay" CTA calls `submitBooking()`:
  - **no Supabase / static demo** → in-memory confirmation, exactly as before;
  - **signed-in driver** → writes the booking, shows the real `Ref #…`, and it
    appears on the garage owner's `/dashboard`;
  - **not signed in** → a "Sign in to hold your bay" prompt linking to `/login`.

## 3. WhatsApp bot → same booking store ("one engine")
The webhook (`app/api/whatsapp/route.ts`) already verifies Meta's handshake and
sends live interactive messages when `WHATSAPP_*` creds are set. Phase 2 adds
`lib/db/wa-booking.ts` → `persistWaBooking`, called when the chat flow completes:
it writes the booking via the **service-role client** (the driver has no app
session) and stamps the real reference into the confirmation. A booking made
entirely in WhatsApp now lands on the owner dashboard exactly like an app
booking. No-ops without Supabase, so the bot still runs standalone.

## Verified
- `next build` passes.
- Screenshot/click-through in demo mode: `/` renders as a clean consumer app
  (no switcher/persona tabs), and the funnel walks home → garage → issue → slot
  → **"Your bay is reserved"** with the live status tracker — no regression.

## Still needs a live backend to exercise
The write-path, RLS enforcement, and WhatsApp persistence are written and
build-verified but were **not run against a real Supabase / WhatsApp** here.
Apply the migrations (`docs/supabase-setup.md`) and exercise the flows before
production.

## Known follow-ups
- **Sign-in mid-funnel** currently links out to `/login`; a smoother build keeps
  the booking draft and signs in inline (phone OTP) without leaving the flow.
- **Vehicle / plate** isn't collected in the driver funnel yet (the booking uses
  the driver's profile name); add a quick "car + plate" field before deposit.
- **M-Pesa** deposit is still illustrative — wire Daraja STK-push next.
