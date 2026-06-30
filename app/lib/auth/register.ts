'use server'

import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'

export type RegisterResult = { ok: true } | { ok: false; error: string }

export async function registerGarage(formData: {
  businessName: string
  garageName: string
  area: string
  city: string
  region: string
  ownerName: string
  phone: string
}): Promise<RegisterResult> {
  const { businessName, garageName, area, city, region, ownerName, phone } = formData

  if (!businessName.trim() || !garageName.trim() || !area.trim() || !city.trim() || !ownerName.trim()) {
    return { ok: false, error: 'Please fill in all required fields.' }
  }

  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) {
    return { ok: false, error: 'You must be signed in to register a garage.' }
  }

  const { error } = await supabase.rpc('register_garage_owner', {
    p_business_name: businessName.trim(),
    p_garage_name: garageName.trim(),
    p_area: area.trim(),
    p_city: city.trim(),
    p_county: region.trim() || city.trim(),
    p_owner_name: ownerName.trim(),
    p_phone: phone.trim() || null,
  })

  if (error) {
    if (error.message.includes('Already registered')) {
      return { ok: false, error: 'This account is already registered as a garage owner.' }
    }
    return { ok: false, error: error.message }
  }

  redirect('/dashboard')
}
