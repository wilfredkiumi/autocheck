'use server'

import { createAnonClient } from '@/lib/supabase/server'

export type BookingStatus = 'new' | 'confirmed' | 'in_bay' | 'ready' | 'collected' | 'cancelled'

export async function getBookingStatusAction(
  bookingId: string,
): Promise<{ status: BookingStatus; updatedAt: string } | null> {
  const supabase = createAnonClient()
  const { data } = await supabase
    .from('bookings')
    .select('status, updated_at')
    .eq('id', bookingId)
    .returns<{ status: BookingStatus; updated_at: string }[]>()
    .maybeSingle()
  if (!data) return null
  return { status: data.status, updatedAt: data.updated_at }
}
