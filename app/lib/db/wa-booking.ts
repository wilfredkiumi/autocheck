import 'server-only'

// Persist a completed WhatsApp booking. The driver has no app session, so this
// runs through the service-role client (bypasses RLS) — the trusted server path
// the schema comments anticipated. This is what makes the WhatsApp bot and the
// PWA "one engine": a booking made entirely in chat shows up on the garage
// owner's dashboard exactly like an app booking.
import { isSupabaseConfigured } from '@/lib/supabase/env'
import { createServiceClient } from '@/lib/supabase/server'
import type { TenantKey } from '@/lib/data'

// WhatsApp flow tenant key → DB tenant slug (see seed.sql).
const KEY_TO_SLUG: Record<TenantKey, string> = {
  autocheck: 'autocheck',
  juma: 'juma-auto',
  westgate: 'westgate',
}

export async function persistWaBooking(input: {
  tenant: TenantKey
  symptom?: string
  slot?: string
  phone: string
  brief?: string
  plate?: string
}): Promise<{ ref: string } | null> {
  if (!isSupabaseConfigured || !process.env.SUPABASE_SERVICE_ROLE_KEY) return null

  try {
    const supabase = createServiceClient()

    const { data: tenant } = await supabase
      .from('tenants')
      .select('id')
      .eq('slug', KEY_TO_SLUG[input.tenant])
      .returns<{ id: string }[]>()
      .maybeSingle()
    if (!tenant) return null

    // Route to the tenant's primary garage (lowest sort).
    const { data: garage } = await supabase
      .from('garages')
      .select('id')
      .eq('tenant_id', tenant.id)
      .order('sort', { ascending: true })
      .limit(1)
      .returns<{ id: string }[]>()
      .maybeSingle()
    if (!garage) return null

    // Get-or-create the vehicle by plate (the booking's cross-channel identity).
    let vehicleId: string | null = null
    const plate = (input.plate || '').trim()
    if (plate) {
      const { data } = await supabase.rpc('upsert_vehicle', { p_plate: plate })
      vehicleId = (data as string | null) ?? null
    }

    const { data: booking, error } = await supabase
      .from('bookings')
      .insert({
        tenant_id: tenant.id,
        garage_id: garage.id,
        driver_id: null,
        customer_name: input.phone,
        customer_phone: input.phone,
        vehicle: plate ? plate.toUpperCase() : null,
        vehicle_id: vehicleId,
        plate: plate ? plate.toUpperCase() : null,
        note: input.symptom || null,
        ai_summary: input.brief || null,
        slot_label: input.slot || null,
        status: 'new',
        channel: 'whatsapp',
        has_photo: false,
      })
      .select('id')
      .returns<{ id: string }[]>()
      .single()
    if (error || !booking) return null

    if (input.symptom) {
      await supabase
        .from('booking_issues')
        .insert([{ booking_id: booking.id, label: input.symptom }])
    }

    return { ref: 'AG-' + booking.id.slice(0, 4).toUpperCase() }
  } catch (e) {
    console.error('[whatsapp] persist failed:', e)
    return null
  }
}
