import { NextRequest, NextResponse } from 'next/server'
import { greetingFor, sendButtons, tenantFromText } from '@/lib/whatsapp'

// WhatsApp Business Cloud API webhook.
//
// GET  — Meta's subscription verification handshake.
// POST — inbound messages. We map the prefilled "BOOK <garage>" keyword to a
//        tenant and reply with the first interactive step. A real build would
//        persist the booking + conversation state against the shared backend
//        (the same store the PWA reads), then drive the symptom → slot →
//        deposit → confirm flow. Sending no-ops without WHATSAPP_* env vars.

export async function GET(req: NextRequest) {
  const params = req.nextUrl.searchParams
  const mode = params.get('hub.mode')
  const token = params.get('hub.verify_token')
  const challenge = params.get('hub.challenge')

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

  // Walk the (deeply nested) Cloud API payload to the first message.
  const msg = extractMessage(payload)
  if (msg) {
    const text =
      msg.text?.body ?? msg.button?.text ?? msg.interactive?.button_reply?.title ?? ''
    const tenant = tenantFromText(text)
    const greeting = greetingFor(tenant)
    // Fire-and-forget reply; harmless no-op when credentials are absent.
    await sendButtons(msg.from, greeting.body, greeting.buttons).catch((e) =>
      console.error('[whatsapp] reply failed:', e),
    )
  }

  // WhatsApp expects a fast 200 ack regardless.
  return NextResponse.json({ ok: true })
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
