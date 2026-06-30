'use server'

// Driver-side booking write path. Creates a real booking row (visible to the
// garage owner's dashboard) for the signed-in driver. RLS enforces that the
// driver can only insert their own booking (driver_id = auth.uid()).
import { createClient } from '@/lib/supabase/server'
import type { Fulfilment } from '@/lib/supabase/types'

export type CreateBookingInput = {
  garageId: string
  issues: string[]
  note?: string
  slotLabel?: string
  fulfilment?: Fulfilment | null
  hasPhoto?: boolean
  plate?: string
  driverName?: string
}

export type CreateBookingResult =
  | { ok: true; ref: string }
  | { ok: false; needAuth?: boolean; error: string }

export async function createBookingAction(
  input: CreateBookingInput,
): Promise<CreateBookingResult> {
  const supabase = await createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) {
    return { ok: false, needAuth: true, error: 'Sign in to hold your bay.' }
  }

  // Resolve the garage's tenant so the booking is correctly scoped.
  const { data: garage } = await supabase
    .from('garages')
    .select('id, tenant_id')
    .eq('id', input.garageId)
    .returns<{ id: string; tenant_id: string }[]>()
    .maybeSingle()
  if (!garage) return { ok: false, error: 'That garage could not be found.' }

  // If the driver supplied their name, persist it on their profile so future
  // bookings (and the garage owner's view) show a real name, not just a phone.
  const driverName = (input.driverName || '').trim()
  if (driverName) {
    await supabase
      .from('profiles')
      .update({ full_name: driverName })
      .eq('id', user.id)
  }

  const { data: profile } = await supabase
    .from('profiles')
    .select('full_name, phone')
    .eq('id', user.id)
    .returns<{ full_name: string | null; phone: string | null }[]>()
    .maybeSingle()
  const customerName = profile?.full_name || profile?.phone || 'Driver'

  // The car is the booking's identity — get-or-create the vehicle by plate,
  // then soft-lock it to this driver (owner_id). The driver can always see
  // bookings for their cars; other drivers can still book the same plate
  // (e.g. a spouse or hired driver) — we record ownership, not exclusivity.
  let vehicleId: string | null = null
  const plate = (input.plate || '').trim()
  if (plate) {
    const { data } = await supabase.rpc('upsert_vehicle', { p_plate: plate })
    vehicleId = (data as string | null) ?? null
    if (vehicleId) {
      await supabase
        .from('vehicles')
        .update({ owner_id: user.id })
        .eq('id', vehicleId)
        .is('owner_id', null)
    }
  }

  const { data: booking, error: bookingErr } = await supabase
    .from('bookings')
    .insert({
      tenant_id: garage.tenant_id,
      garage_id: garage.id,
      driver_id: user.id,
      customer_name: customerName,
      customer_phone: profile?.phone ?? null,
      vehicle: plate ? plate.toUpperCase() : null,
      vehicle_id: vehicleId,
      plate: plate ? plate.toUpperCase() : null,
      note: input.note || null,
      slot_label: input.slotLabel || null,
      fulfilment: input.fulfilment ?? null,
      has_photo: !!input.hasPhoto,
      status: 'new',
      channel: 'app',
    })
    .select('id')
    .returns<{ id: string }[]>()
    .single()
  if (bookingErr || !booking) {
    return { ok: false, error: bookingErr?.message ?? 'Could not create the booking.' }
  }

  if (input.issues?.length) {
    await supabase
      .from('booking_issues')
      .insert(input.issues.map((label) => ({ booking_id: booking.id, label })))
  }

  return { ok: true, ref: 'AG-' + booking.id.slice(0, 4).toUpperCase() }
}
