# WhatsApp booking bot — design & policy note

AutoCheck's WhatsApp channel is a **structured booking bot**, not a general-purpose
AI assistant. This is a deliberate product *and* compliance decision.

## What it is

A fixed state machine — `lib/wa-flow.ts` — driven by interactive reply buttons:

```
symptom → media → slot → deposit → confirmed
```

The webhook (`app/api/whatsapp/route.ts`) advances one step per inbound reply. Any
off-script / free-form message **re-prompts the current step** rather than being
answered conversationally. The only place free text is accepted is the symptom step,
where it's captured as the issue description (structured intake, not open chat).

On completion the structured technician brief is delivered to the fundi's WhatsApp —
so a mechanic with nothing but WhatsApp gets the same prepared booking the dashboard
would show. This mirrors the in-app demo in `components/screens/WhatsApp.tsx`; both
channels run the same flow.

## Why structured, not "responds like you"

- **Product:** our value is reserving a real bay — capacity, slot, deposit, prepared
  brief — not open-ended chat. In a referral- and trust-driven market (drivers,
  especially women, wary of being overcharged) the customer is booking *with the
  garage they trust*, not talking to an AI impersonating it. We don't mimic the owner;
  we reserve the bay honestly.
- **Policy (WhatsApp, Jan 15 2026):** the platform disallows general-purpose AI
  chatbots, simulating broad assistants (e.g. ChatGPT-style), and sharing chat data
  for AI model training. A scoped bot for the business's own service is the allowed
  lane. Our flow stays inside it.

## Compliance commitments

- **Scoped to booking.** No general-purpose / open-domain assistant is exposed on the
  WhatsApp number. Unrecognized input re-prompts; it is never free-form answered.
- **No training on chat data.** WhatsApp conversation content is used only to fulfil
  the booking. It is not used to train any model.
- **AI-describe is business-specific.** The optional "help me describe it" summary (a
  future server-side Claude call) runs over the booking context to produce a
  technician brief for *this* garage — not as an assistant the customer can chat with.
- **Human handoff.** A fundi can step in at any point; the bot reroutes to a person
  for anything outside the booking flow.

## Relationship to Meta Business Agent

Meta Business Agent (the no-code agent in the WhatsApp Business app) is a sales/CX
greeter — answer questions, recommend products, capture leads, hand off to a human. It
has no bay/capacity/booking engine. The clean composition is **handoff**: let it greet
and field FAQs, then hand the customer to AutoCheck's booking via the per-tenant
`wa.me` / `/<tenant>` link (`lib/whatsapp.ts → waLink`). Meta is front-of-house;
AutoCheck is the booking-and-trust engine.
