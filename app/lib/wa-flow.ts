// Canonical definition of the AutoCheck WhatsApp booking bot.
//
// This is intentionally a STRUCTURED booking flow — a fixed state machine driven
// by interactive reply buttons — not a general-purpose "responds like you"
// assistant. That is a deliberate product + policy choice:
//   • Product: our value is reserving a real bay (capacity, slot, structured
//     technician brief), not open-ended chat. A garage in a
//     referral / trust-sensitive market is booking *with Juma*, not talking to
//     an AI wearing Juma's name.
//   • Policy: WhatsApp's Jan-2026 AI rules disallow general-purpose assistants
//     on the platform. A scoped booking bot for the business's own service is
//     the allowed lane. See docs/whatsapp-bot.md.
//
// Mirrors the in-app WhatsApp demo (components/screens/WhatsApp.tsx) so both
// channels run the same flow. Pure + side-effect-free so it can be unit-tested
// and reused by the webhook.

import { TenantKey, THEMES } from './data'

export type WaStep = 'symptom' | 'media' | 'slot' | 'deposit' | 'done'

export interface WaButton {
  id: string
  title: string
}

export interface WaConversation {
  tenant: TenantKey
  step: WaStep
  symptom?: string
  slot?: string
}

export interface WaOutbound {
  /** Message body to send to the driver. */
  body: string
  /** Interactive reply buttons (max 3 — WhatsApp's limit). */
  buttons?: WaButton[]
  /** On completion: the structured brief that also lands on the fundi's WhatsApp. */
  garageBrief?: string
  /** True once the booking is confirmed and the flow is finished. */
  terminal?: boolean
}

export interface WaTurn {
  conversation: WaConversation
  outbound: WaOutbound
}

const SLOT_LABELS: Record<string, string> = {
  slot_1: 'Today · 2:00 PM',
  slot_2: 'Today · 4:30 PM',
  slot_3: 'Tomorrow · 9:00 AM',
}

/** Start (or restart) a booking conversation for a tenant. */
export function startConversation(tenant: TenantKey): WaTurn {
  const g = THEMES[tenant].short
  return {
    conversation: { tenant, step: 'symptom' },
    outbound: {
      body: `Karibu ${g} 👋 Book your car straight in here — no calling around. What's the problem?`,
      buttons: [
        { id: 'sym_brakes', title: 'Brakes 🛑' },
        { id: 'sym_engine', title: 'Engine / heat' },
        { id: 'sym_other', title: 'Something else' },
      ],
    },
  }
}

const SYMPTOM_LABELS: Record<string, string> = {
  sym_brakes: 'Brakes',
  sym_engine: 'Engine / overheating',
  sym_other: 'Something else',
}

/**
 * Advance the conversation given an inbound button id (or free text).
 *
 * The bot is strict: at every step after the first it expects a button tap. Any
 * off-script / free-form message re-prompts the current step rather than being
 * answered like an assistant — that is what keeps this a structured booking bot.
 * The one exception is the symptom step, where free text is captured as the
 * issue description (still structured intake, not open conversation).
 */
export function advance(conv: WaConversation, buttonId: string | null, text: string): WaTurn {
  const g = THEMES[conv.tenant].short
  const reprompt = (body: string, buttons?: WaButton[]): WaTurn => ({
    conversation: conv,
    outbound: { body: `Tap an option below to continue 👇\n\n${body}`, buttons },
  })

  switch (conv.step) {
    case 'symptom': {
      const symptom = (buttonId && SYMPTOM_LABELS[buttonId]) || text.trim()
      if (!symptom) return startConversation(conv.tenant)
      return {
        conversation: { ...conv, step: 'media', symptom },
        outbound: {
          body: "Got it 👍 Add a photo or voice note if you can — or I'll jump to available times.",
          buttons: [
            { id: 'media_photo', title: '📷 Send a photo' },
            { id: 'media_voice', title: '🎤 Voice note' },
            { id: 'media_skip', title: 'Skip → see times' },
          ],
        },
      }
    }

    case 'media': {
      if (!buttonId || !buttonId.startsWith('media_')) {
        return reprompt('Add a photo or voice note, or skip to times.', [
          { id: 'media_photo', title: '📷 Send a photo' },
          { id: 'media_voice', title: '🎤 Voice note' },
          { id: 'media_skip', title: 'Skip → see times' },
        ])
      }
      return {
        conversation: { ...conv, step: 'slot' },
        outbound: {
          body: `Asante. That looks like ~a 2-hour job. Next openings at ${g}:`,
          buttons: [
            { id: 'slot_1', title: 'Today · 2:00 PM' },
            { id: 'slot_2', title: 'Today · 4:30 PM' },
            { id: 'slot_3', title: 'Tomorrow · 9:00 AM' },
          ],
        },
      }
    }

    case 'slot': {
      const slot = buttonId ? SLOT_LABELS[buttonId] : undefined
      if (!slot) {
        return reprompt('Pick one of the available times:', [
          { id: 'slot_1', title: 'Today · 2:00 PM' },
          { id: 'slot_2', title: 'Today · 4:30 PM' },
          { id: 'slot_3', title: 'Tomorrow · 9:00 AM' },
        ])
      }
      // No deposit — the driver and garage already know each other, so picking a
      // slot confirms the booking outright. (M-Pesa can come back as a later step.)
      const sym = conv.symptom || 'Issue described'
      return {
        conversation: { ...conv, step: 'done', slot },
        outbound: {
          body: `Booking confirmed 🎉\n${g} · ${slot}\nRef #AG-4821\n\nDrive straight in — no queue, no deposit. We'll WhatsApp you the moment your car is ready.`,
          garageBrief: `📋 New booking — ${sym}. Bay held: ${slot}.`,
          terminal: true,
        },
      }
    }

    case 'done':
    default:
      // Conversation finished — any further message starts a fresh booking.
      return startConversation(conv.tenant)
  }
}
