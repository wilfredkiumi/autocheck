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

  const { data: profile } = await supabase
    .from('profiles')
    .select('full_name, phone')
    .eq('id', user.id)
    .returns<{ full_name: string | null; phone: string | null }[]>()
    .maybeSingle()
  const customerName = profile?.full_name || profile?.phone || 'Driver'

  const { data: booking, error: bookingErr } = await supabase
    .from('bookings')
    .insert({
      tenant_id: garage.tenant_id,
      garage_id: garage.id,
      driver_id: user.id,
      customer_name: customerName,
      customer_phone: profile?.phone ?? null,
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
