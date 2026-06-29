# AutoCheck — Garage Booking

A faithful, production-oriented implementation of the **AutoCheck** garage-booking
prototype exported from Claude Design. Built with **Next.js (App Router) + React +
TypeScript**.

> AutoCheck is a booking *layer* for African garages: reserve your bay and describe
> the issue ahead of time, so you don't show up to a yard full of cars. Trust is
> referral-based with the garages you already know, and platform-verified when you're
> stranded somewhere new.

Next.js (rather than a plain SPA) is the foundation because the product roadmap is
server-shaped: a server-side **Claude** call for AI-describe (keeps the API key off
the client), **M-Pesa** STK-push + callbacks, and **multi-tenant routing** by
sub-domain / custom domain (`juma-auto.autocheck.app`, `book.westgateauto.co.ke`) via
middleware. None of that is wired yet — the current build is the UI — but the shell is
ready for it.

## Run it

```bash
cd app
npm install
npm run dev      # dev server (http://localhost:3000)
npm run build    # production build
npm start        # serve the production build
```

## Deploy

Zero-config on **Vercel** (free tier): point it at this `app/` directory and it
detects Next.js automatically. (A plain Vite SPA would also deploy free to Vercel —
Next.js is chosen for the backend roadmap above, not for hosting.)

## What's implemented

It's a single pannable demo with a **switcher** at the top — three tenants
(AutoCheck / Juma Auto / Westgate) × three faces (Driver app / WhatsApp / Dashboard),
all driven by one engine and themed per tenant via CSS variables.

**Driver app**
- Consumer home — *your* trusted garages (referral trust, "booked here 6 times",
  "used by 4 women in your network"), each showing its next bookable opening.
- White-label brand home for tenant garages (logo, colour, branded sub-domain).
- Garage detail — "why you can trust them" (your circle, or platform-verified), the
  verified checklist, next opening.
- Issue intake — symptom chips + free text + real photo picker + voice recording
  (live timer + waveform) + an AI "help me describe it" assist.
- Slot picker — estimated bay-time window from the described issue, wait-or-leave-it
  choice, M-Pesa cost estimate.
- Confirmation with a live status timeline.
- Away / breakdown path — drop-a-pin location (with permission prompt + town
  fallback) → verified discovery (Nyeri) → roadside help form → dispatch tracking.

**WhatsApp** — full in-chat booking on both sides: the driver books via quick-reply
buttons (symptom → media → slot → deposit → confirmation), and the fundi receives the
structured booking request and confirms / marks ready from their own chat.

**Owner dashboard** — Bookings (today's incoming with issue tags, AI summary, photo
flag, confirm), Availability (accepting toggle, bay stepper, service-duration
catalogue, slot blocking), Settings (QR + booking link, branding, subscription tier).

## Notes on fidelity & scope

- The visuals are recreated 1:1 from the prototype (`project/Garage Booking.dc.html`):
  Manrope / Archivo / Space Mono type, the green/orange/teal tenant palettes, spacing
  and components all match.
- **AI-describe is illustrative** — it returns the canned technician summary after a
  short delay rather than calling a live model. Wiring it to the Claude API (with a
  backend route + key) is a deliberate follow-up.
- Photo/voice capture, roadside dispatch, M-Pesa and the QR/link are front-end only —
  no backend, matching the prototype's intent.

## Structure

```
app/
  app/
    layout.tsx            root layout (fonts, metadata)
    page.tsx              renders <AppShell/>
    globals.css           global styles / keyframes (ported from the prototype)
    icon.svg              app icon
  lib/
    data.ts               themes, garages, services, bookings, helpers (typed)
    state.ts              useBooking() — the state machine + derived view model
  components/
    AppShell.tsx          'use client' — demo switcher + phone frame + screen routing
    icons.tsx             shared SVG icons
    screens/
      Home.tsx            consumer + white-label home
      Booking.tsx         detail / issue / slot / done
      Away.tsx            location / discovery / roadside / dispatch
      WhatsApp.tsx        driver + fundi chat
      Owner.tsx           owner dashboard (bookings / availability / settings)
```

`AppShell` is the single client component (it owns the interactive state machine);
everything under `app/` is a server component by default. Path alias `@/*` maps to the
`app/` project root.

The original Claude Design export is preserved under `../project` and `../chats` for
reference.
