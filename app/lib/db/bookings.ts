import 'server-only'

import { createClient } from '@/lib/supabase/server'
import type { Booking, BookingStatus } from '@/lib/supabase/types'

export interface BookingRow extends Booking {
  issues: string[]
}

// Bookings visible to the signed-in user, newest first. RLS does the scoping:
// an owner sees their tenant, a fundi sees their assigned garages, a driver sees
// their own. The query is identical for every role — the database decides rows.
export async function listBookings(): Promise<BookingRow[]> {
  const supabase = await createClient()
  const { data, error } = await supabase
    .from('bookings')
    .select('*, booking_issues(label)')
    .order('created_at', { ascending: true })
    .returns<(Booking & { booking_issues: { label: string }[] })[]>()

  if (error) throw error

  return (data ?? []).map((b) => {
    const { booking_issues, ...booking } = b
    return { ...booking, issues: booking_issues?.map((i) => i.label) ?? [] }
  })
}

export interface DriverBookingRow extends BookingRow {
  garageName: string | null
}

// The signed-in driver's own bookings, newest first, with the garage name joined
// for display. RLS (`bookings_driver_read`) already scopes rows to
// driver_id = auth.uid(), so no explicit filter is needed here.
export async function listMyBookings(): Promise<DriverBookingRow[]> {
  const supabase = await createClient()
  const { data, error } = await supabase
    .from('bookings')
    .select('*, booking_issues(label), garages(name)')
    .order('created_at', { ascending: false })
    .returns<
      (Booking & { booking_issues: { label: string }[]; garages: { name: string } | null })[]
    >()

  if (error) throw error

  return (data ?? []).map((b) => {
    const { booking_issues, garages, ...booking } = b
    return {
      ...booking,
      issues: booking_issues?.map((i) => i.label) ?? [],
      garageName: garages?.name ?? null,
    }
  })
}

export async function confirmBooking(id: string): Promise<void> {
  const supabase = await createClient()
  const { error } = await supabase
    .from('bookings')
    .update({ status: 'confirmed' as BookingStatus })
    .eq('id', id)
  if (error) throw error
}

export async function setBookingStatus(
  id: string,
  status: BookingStatus,
): Promise<void> {
  const supabase = await createClient()
  const { error } = await supabase.from('bookings').update({ status }).eq('id', id)
  if (error) throw error
}
