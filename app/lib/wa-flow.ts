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

export type WaStep = 'symptom' | 'media' | 'slot' | 'plate' | 'done'

export interface WaButton {
  id: string
  title: string
}

export interface WaConversation {
  tenant: TenantKey
  step: WaStep
  symptom?: string
  slot?: string
  plate?: string // parsed from the prefilled "BOOK <garage> [PLATE]" opener
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
  slot_2: 'Tomorrow · 9:00 AM',
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
 *
 * Every step after symptom supports a "go_back" button to return to the
 * previous step, within WhatsApp's 3-button limit.
 */
export function advance(conv: WaConversation, buttonId: string | null, text: string): WaTurn {
  const g = THEMES[conv.tenant].short
  const reprompt = (body: string, buttons?: WaButton[]): WaTurn => ({
    conversation: conv,
    outbound: { body: `Tap an option below to continue 👇\n\n${body}`, buttons },
  })

  // Handle "go back" from any step after symptom.
  if (buttonId === 'go_back') {
    switch (conv.step) {
      case 'media':
        return startConversation(conv.tenant)
      case 'slot':
        return {
          conversation: { ...conv, step: 'media' },
          outbound: {
            body: "Got it 👍 Add a photo or voice note if you can — or I'll jump to available times.",
            buttons: MEDIA_BUTTONS,
          },
        }
      case 'plate':
        return {
          conversation: { ...conv, step: 'slot' },
          outbound: {
            body: `Next openings at ${g}:`,
            buttons: SLOT_BUTTONS,
          },
        }
    }
  }

  switch (conv.step) {
    case 'symptom': {
      const symptom = (buttonId && SYMPTOM_LABELS[buttonId]) || text.trim()
      if (!symptom) return startConversation(conv.tenant)
      return {
        conversation: { ...conv, step: 'media', symptom },
        outbound: {
          body: "Got it 👍 Add a photo or voice note if you can — or I'll jump to available times.",
          buttons: MEDIA_BUTTONS,
        },
      }
    }

    case 'media': {
      if (!buttonId || !buttonId.startsWith('media_')) {
        return reprompt('Send a photo/voice note, or skip to times.', MEDIA_BUTTONS)
      }
      return {
        conversation: { ...conv, step: 'slot' },
        outbound: {
          body: `Asante. That looks like ~a 2-hour job. Next openings at ${g}:`,
          buttons: SLOT_BUTTONS,
        },
      }
    }

    case 'slot': {
      const slot = buttonId ? SLOT_LABELS[buttonId] : undefined
      if (!slot) {
        return reprompt('Pick one of the available times:', SLOT_BUTTONS)
      }
      if (conv.plate) return confirm({ ...conv, slot })
      return {
        conversation: { ...conv, step: 'plate', slot },
        outbound: {
          body: "Last thing — what's your car's number plate? (e.g. KDA 123A)",
          buttons: [{ id: 'go_back', title: '← Go back' }],
        },
      }
    }

    case 'plate': {
      const plate = text.trim().toUpperCase()
      if (plate.replace(/[^A-Z0-9]/g, '').length < 4) {
        return {
          conversation: conv,
          outbound: {
            body: 'Reply with your number plate, e.g. KDA 123A.',
            buttons: [{ id: 'go_back', title: '← Go back' }],
          },
        }
      }
      return confirm({ ...conv, plate })
    }

    case 'done':
    default:
      return startConversation(conv.tenant)
  }
}

const MEDIA_BUTTONS: WaButton[] = [
  { id: 'media_photo', title: '📷 Send media' },
  { id: 'media_skip', title: 'Skip → see times' },
  { id: 'go_back', title: '← Go back' },
]

const SLOT_BUTTONS: WaButton[] = [
  { id: 'slot_1', title: 'Today · 2:00 PM' },
  { id: 'slot_2', title: 'Tomorrow · 9:00 AM' },
  { id: 'go_back', title: '← Go back' },
]

// Build the terminal "confirmed" turn. No deposit — the driver and garage already
// know each other, so a chosen slot (with a plate) confirms outright.
function confirm(conv: WaConversation): WaTurn {
  const g = THEMES[conv.tenant].short
  const sym = conv.symptom || 'Issue described'
  const car = conv.plate ? `\nCar: ${conv.plate}` : ''
  const carBrief = conv.plate ? ` Car: ${conv.plate}.` : ''
  return {
    conversation: { ...conv, step: 'done' },
    outbound: {
      body: `Booking confirmed 🎉\n${g} · ${conv.slot}${car}\nRef #AG-4821\n\nDrive straight in — no queue, no deposit. We'll WhatsApp you the moment your car is ready.\n\nTrack your repairs: autocheck.co.ke`,
      garageBrief: `📋 New booking — ${sym}.${carBrief} Bay held: ${conv.slot}.`,
      terminal: true,
    },
  }
}
