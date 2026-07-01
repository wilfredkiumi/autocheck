import { createHmac, timingSafeEqual } from 'node:crypto'
import { NextRequest, NextResponse } from 'next/server'
import { sendWhatsAppOtp } from '@/lib/whatsapp'

// Supabase "Send SMS" Auth Hook → deliver the login OTP over OUR WhatsApp number.
//
// Supabase generates and verifies the code and issues the session; it only
// delegates *delivery* to this endpoint. That lets driver sign-in reuse the same
// Meta Cloud API number as the booking bot — no Twilio, no SMS.
//
// Configure in Supabase dashboard → Authentication → Hooks → "Send SMS hook":
//   URL:    https://autocheck-mauve.vercel.app/api/auth/whatsapp-otp
//   Secret: generates a `v1,whsec_…` value — store it as SEND_SMS_HOOK_SECRET.
//
// crypto needs the Node runtime (not edge).
export const runtime = 'nodejs'

interface SendSmsHookPayload {
  user: { phone?: string; id?: string }
  sms: { otp: string }
}

// Reject requests older than this to blunt replay attacks (Standard Webhooks).
const TOLERANCE_SECONDS = 5 * 60

// Verify the Standard Webhooks signature Supabase sends. The secret looks like
// `v1,whsec_<base64>`; the signed payload is `${id}.${timestamp}.${body}` and the
// header carries a space-separated list of `v1,<base64 sig>` candidates.
function verifySignature(rawBody: string, req: NextRequest, secret: string): boolean {
  const id = req.headers.get('webhook-id')
  const timestamp = req.headers.get('webhook-timestamp')
  const signatureHeader = req.headers.get('webhook-signature')
  if (!id || !timestamp || !signatureHeader) return false

  const ts = Number(timestamp)
  if (!Number.isFinite(ts)) return false
  const nowMs = Date.now()
  if (Math.abs(nowMs - ts * 1000) > TOLERANCE_SECONDS * 1000) return false

  const base64Secret = secret.replace(/^v1,/, '').replace(/^whsec_/, '')
  const key = Buffer.from(base64Secret, 'base64')
  const expected = createHmac('sha256', key)
    .update(`${id}.${timestamp}.${rawBody}`)
    .digest('base64')
  const expectedBuf = Buffer.from(expected)

  return signatureHeader.split(' ').some((part) => {
    const sig = part.includes(',') ? part.slice(part.indexOf(',') + 1) : part
    const sigBuf = Buffer.from(sig)
    return sigBuf.length === expectedBuf.length && timingSafeEqual(sigBuf, expectedBuf)
  })
}

// Supabase reads this error shape and surfaces `message` to the caller.
function hookError(httpCode: number, message: string) {
  return NextResponse.json({ error: { http_code: httpCode, message } }, { status: httpCode })
}

export async function POST(req: NextRequest) {
  const secret = process.env.SEND_SMS_HOOK_SECRET
  if (!secret) {
    // Fail closed: without the shared secret we cannot trust the caller, and an
    // open OTP-sender would let anyone spray WhatsApp messages via our number.
    console.error('[otp-hook] SEND_SMS_HOOK_SECRET is not set — rejecting')
    return hookError(500, 'OTP delivery is not configured.')
  }

  const rawBody = await req.text()
  if (!verifySignature(rawBody, req, secret)) {
    return hookError(401, 'Invalid webhook signature.')
  }

  let payload: SendSmsHookPayload
  try {
    payload = JSON.parse(rawBody) as SendSmsHookPayload
  } catch {
    return hookError(400, 'Malformed payload.')
  }

  const phone = payload.user?.phone?.replace(/[^0-9]/g, '')
  const otp = payload.sms?.otp
  if (!phone || !otp) {
    return hookError(400, 'Missing phone or otp.')
  }

  try {
    await sendWhatsAppOtp(phone, otp)
  } catch (err) {
    console.error('[otp-hook] send failed:', err)
    return hookError(502, 'Could not deliver the code on WhatsApp. Please try again.')
  }

  return NextResponse.json({})
}
