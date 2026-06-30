'use server'

// Driver-side booking write path. Creates a real booking row (visible to the
// garage owner's dashboard). Works for both signed-in and guest drivers — guest
// bookings have driver_id = null and get linked when the driver verifies later.
import { createClient, createServiceClient } from '@/lib/supabase/server'
import type { Fulfilment } from '@/lib/supabase/types'

export type CreateBookingInput = {
  garageId: string
  issues: string[]
  note?: string
  slotLabel?: string
  fulfilment?: Fulfilment | null
  hasPhoto?: boolean
  plate?: string
  carModel?: string
  driverName?: string
}

export type CreateBookingResult =
  | { ok: true; ref: string; isGuest: boolean }
  | { ok: false; error: string }

export async function createBookingAction(
  input: CreateBookingInput,
): Promise<CreateBookingResult> {
  const authClient = await createClient()

  const {
    data: { user },
  } = await authClient.auth.getUser()

  // Use the authenticated client when signed in; service client for guest
  // bookings so RLS doesn't block the insert.
  const supabase = user ? authClient : createServiceClient()

  // Resolve the garage's tenant so the booking is correctly scoped.
  const { data: garage } = await supabase
    .from('garages')
    .select('id, tenant_id')
    .eq('id', input.garageId)
    .returns<{ id: string; tenant_id: string }[]>()
    .maybeSingle()
  if (!garage) return { ok: false, error: 'That garage could not be found.' }

  // If signed in, persist the driver's name and resolve their profile.
  const driverName = (input.driverName || '').trim()
  let customerName = driverName || 'Driver'
  let customerPhone: string | null = null

  if (user) {
    if (driverName) {
      await authClient
        .from('profiles')
        .update({ full_name: driverName })
        .eq('id', user.id)
    }
    const { data: profile } = await authClient
      .from('profiles')
      .select('full_name, phone')
      .eq('id', user.id)
      .returns<{ full_name: string | null; phone: string | null }[]>()
      .maybeSingle()
    customerName = profile?.full_name || driverName || profile?.phone || 'Driver'
    customerPhone = profile?.phone ?? null
  }

  // The car is the booking's identity — get-or-create the vehicle by plate,
  // then soft-lock it to this driver (owner_id) if signed in.
  let vehicleId: string | null = null
  const plate = (input.plate || '').trim()
  const carModel = (input.carModel || '').trim()
  if (plate) {
    const { data } = await supabase.rpc('upsert_vehicle', {
      p_plate: plate,
      ...(carModel ? { p_make_model: carModel } : {}),
    })
    vehicleId = (data as string | null) ?? null
    if (vehicleId && user) {
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
      driver_id: user?.id ?? null,
      customer_name: customerName,
      customer_phone: customerPhone,
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

  return { ok: true, ref: 'AG-' + booking.id.slice(0, 4).toUpperCase(), isGuest: !user }
}
