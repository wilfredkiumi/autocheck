'use server'

// Server actions for the auth flows. Kept on the server so tokens and the OTP
// verification never touch client code beyond the form inputs.
import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { homeForRole } from './roles'
import type { UserRole } from '@/lib/supabase/types'

export type ActionResult = { ok: true } | { ok: false; error: string }

const E164 = /^\+[1-9]\d{6,14}$/

// Step 1 — send a one-time passcode to a phone number.
// WhatsApp is the primary channel (on-brand, cheap in Kenya); the caller falls
// back to SMS if WhatsApp delivery isn't available.
export async function requestPhoneOtp(
  phone: string,
  channel: 'whatsapp' | 'sms' = 'whatsapp',
): Promise<ActionResult> {
  if (!E164.test(phone)) {
    return { ok: false, error: 'Enter a phone number in international format, e.g. +254700000000.' }
  }
  const supabase = await createClient()
  const { error } = await supabase.auth.signInWithOtp({
    phone,
    options: { channel },
  })
  if (error) return { ok: false, error: error.message }
  return { ok: true }
}

// Step 2 — exchange the passcode for a session, then route by role.
// An optional `next` path (e.g. "/register") overrides the default role-based
// redirect so callers like the garage-registration flow can bounce users back.
export async function verifyPhoneOtp(
  phone: string,
  token: string,
  next?: string,
): Promise<ActionResult> {
  const supabase = await createClient()
  const { error } = await supabase.auth.verifyOtp({ phone, token, type: 'sms' })
  if (error) return { ok: false, error: error.message }
  if (next) redirect(next)
  await redirectToRoleHome()
  return { ok: true }
}

// Email sign-in for garage owners and platform admins. Sends a 6-digit code
// (same UX as phone). We still pass emailRedirectTo so a clicked magic link
// keeps working as a fallback, but the primary path is code entry below —
// which, unlike the PKCE link, needs no cookie and survives in-app browsers.
export async function requestEmailOtp(email: string, next?: string): Promise<ActionResult> {
  const callbackPath = next ? `/auth/callback?next=${encodeURIComponent(next)}` : '/auth/callback'
  const supabase = await createClient()
  const { error } = await supabase.auth.signInWithOtp({
    email,
    options: { emailRedirectTo: redirectUrl(callbackPath) },
  })
  if (error) return { ok: false, error: error.message }
  return { ok: true }
}

// Verify the emailed 6-digit code and route by role. Mirrors verifyPhoneOtp.
// `type: 'email'` is a direct OTP check — no PKCE, no redirect — so it works in
// any browser, including the Mail/WhatsApp in-app webviews that break magic links.
export async function verifyEmailOtp(
  email: string,
  token: string,
  next?: string,
): Promise<ActionResult> {
  const supabase = await createClient()
  const { error } = await supabase.auth.verifyOtp({ email, token, type: 'email' })
  if (error) return { ok: false, error: error.message }
  if (next) redirect(next)
  await redirectToRoleHome()
  return { ok: true }
}

export async function signInWithGoogle(next?: string): Promise<ActionResult> {
  const callbackPath = next ? `/auth/callback?next=${encodeURIComponent(next)}` : '/auth/callback'
  const supabase = await createClient()
  const { data, error } = await supabase.auth.signInWithOAuth({
    provider: 'google',
    options: { redirectTo: redirectUrl(callbackPath) },
  })
  if (error) return { ok: false, error: error.message }
  if (data.url) redirect(data.url)
  return { ok: true }
}

export async function signOut(): Promise<void> {
  const supabase = await createClient()
  await supabase.auth.signOut()
  redirect('/login')
}

// ---------------------------------------------------------------------------
async function redirectToRoleHome(): Promise<never> {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()
  let role: UserRole = 'driver'
  if (user) {
    // Attach any WhatsApp bookings made with this phone (driver_id was null) to
    // the now-signed-in account, so they show up under "my bookings".
    try {
      await supabase.rpc('claim_bookings_by_phone')
    } catch {
      /* non-blocking */
    }
    const { data: profile } = await supabase
      .from('profiles')
      .select('role')
      .eq('id', user.id)
      .returns<{ role: UserRole }[]>()
      .single()
    role = profile?.role ?? 'driver'
  }
  redirect(homeForRole(role))
}

function redirectUrl(path: string): string {
  // Use a trimmed, non-empty value only. `??` won't catch NEXT_PUBLIC_SITE_URL=""
  // (empty string is neither null nor undefined), which silently drops the origin
  // and makes Supabase fall back to its dashboard Site URL — often a protected
  // *.vercel.app deployment URL that bounces users to the Vercel login page.
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL?.trim()
  const vercelUrl = process.env.VERCEL_URL?.trim()
  const base =
    siteUrl || (vercelUrl ? `https://${vercelUrl}` : 'http://localhost:3000')
  return `${base.replace(/\/$/, '')}${path}`
}
