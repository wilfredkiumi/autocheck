import { NextRequest, NextResponse } from 'next/server'
import { sendButtons, sendText, tenantFromText } from '@/lib/whatsapp'
import { advance, startConversation, WaConversation } from '@/lib/wa-flow'
import { persistWaBooking } from '@/lib/db/wa-booking'

// WhatsApp Business Cloud API webhook — drives the STRUCTURED booking bot.
//
// GET  — Meta's subscription verification handshake.
// POST — inbound messages. We run a fixed booking state machine (lib/wa-flow):
//        symptom → media → slot → deposit → confirmed. It is deliberately not a
//        general-purpose assistant; off-script messages re-prompt the current
//        step. On completion the structured brief is delivered to the fundi.
//        Sends no-op without WHATSAPP_* credentials, so it runs anywhere.
//
// NOTE: conversation state is held in an in-memory Map keyed by phone number —
// fine for a single instance / demo. A production deploy must move this to a
// shared store (Redis / DB) — the same booking store the PWA reads, which is how
// the two channels stay one engine.

const conversations = new Map<string, WaConversation>()

export async function GET(req: NextRequest) {
  const p = req.nextUrl.searchParams
  const mode = p.get('hub.mode')
  const token = p.get('hub.verify_token')
  const challenge = p.get('hub.challenge')
  if (mode === 'subscribe' && token && token === process.env.WHATSAPP_VERIFY_TOKEN) {
    return new NextResponse(challenge ?? '', { status: 200 })
  }
  return new NextResponse('Forbidden', { status: 403 })
}

export async function POST(req: NextRequest) {
  let payload: unknown
  try {
    payload = await req.json()
  } catch {
    return NextResponse.json({ ok: false, error: 'invalid json' }, { status: 400 })
  }

  const msg = extractMessage(payload)
  if (msg) {
    const buttonId = msg.interactive?.button_reply?.id ?? null
    const text = msg.text?.body ?? msg.button?.text ?? msg.interactive?.button_reply?.title ?? ''

    // Resume an existing conversation, or start one (routing the tenant from the
    // prefilled "BOOK <garage>" keyword the wa.me / QR link carries).
    const existing = conversations.get(msg.from)
    const turn = existing
      ? advance(existing, buttonId, text)
      : startConversation(tenantFromText(text))

    conversations.set(msg.from, turn.conversation)

    try {
      let { body } = turn.outbound
      const { buttons, garageBrief, terminal } = turn.outbound
      // On completion, persist the booking so it reaches the owner dashboard —
      // the same store the PWA writes to — and stamp the real reference into the
      // confirmation. No-ops without Supabase, so the bot still works standalone.
      if (terminal) {
        const persisted = await persistWaBooking({
          tenant: turn.conversation.tenant,
          symptom: turn.conversation.symptom,
          slot: turn.conversation.slot,
          phone: msg.from,
          brief: garageBrief,
        })
        if (persisted) body = body.replace(/Ref #AG-\d+/, `Ref #${persisted.ref}`)
      }
      if (buttons?.length) await sendButtons(msg.from, body, buttons)
      else await sendText(msg.from, body)
      // Structured brief lands on the garage's WhatsApp too (a fundi with only
      // WhatsApp gets the same prepared booking the dashboard would show).
      if (garageBrief) await sendText(garageNumber(turn.conversation), garageBrief)
      if (terminal) conversations.delete(msg.from)
    } catch (e) {
      console.error('[whatsapp] send failed:', e)
    }
  }

  // WhatsApp expects a fast 200 ack regardless.
  return NextResponse.json({ ok: true })
}

// Where the fundi-facing brief is delivered. A real build looks this up per
// tenant; here it falls back to the business number env.
function garageNumber(_conv: WaConversation): string {
  return process.env.WHATSAPP_GARAGE_NUMBER || process.env.WHATSAPP_BUSINESS_NUMBER || ''
}

interface InboundMessage {
  from: string
  text?: { body: string }
  button?: { text: string }
  interactive?: { button_reply?: { id: string; title: string } }
}

function extractMessage(payload: unknown): InboundMessage | null {
  try {
    const entry = (payload as { entry?: unknown[] }).entry?.[0] as
      | { changes?: { value?: { messages?: InboundMessage[] } }[] }
      | undefined
    return entry?.changes?.[0]?.value?.messages?.[0] ?? null
  } catch {
    return null
  }
}
