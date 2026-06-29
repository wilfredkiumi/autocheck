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
export async function verifyPhoneOtp(
  phone: string,
  token: string,
): Promise<ActionResult> {
  const supabase = await createClient()
  const { error } = await supabase.auth.verifyOtp({ phone, token, type: 'sms' })
  if (error) return { ok: false, error: error.message }
  await redirectToRoleHome()
  return { ok: true }
}

// Email magic-link / password is offered to garage owners and platform admins.
export async function requestEmailOtp(email: string): Promise<ActionResult> {
  const supabase = await createClient()
  const { error } = await supabase.auth.signInWithOtp({
    email,
    options: { emailRedirectTo: redirectUrl('/auth/callback') },
  })
  if (error) return { ok: false, error: error.message }
  return { ok: true }
}

export async function signInWithGoogle(): Promise<ActionResult> {
  const supabase = await createClient()
  const { data, error } = await supabase.auth.signInWithOAuth({
    provider: 'google',
    options: { redirectTo: redirectUrl('/auth/callback') },
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
  const base =
    process.env.NEXT_PUBLIC_SITE_URL ??
    (process.env.VERCEL_URL ? `https://${process.env.VERCEL_URL}` : 'http://localhost:3000')
  return `${base}${path}`
}
