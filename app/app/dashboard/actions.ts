'use server'

import { revalidatePath } from 'next/cache'
import { confirmBooking } from '@/lib/db/bookings'

// Confirm a booking from the dashboard. RLS guarantees the caller may only touch
// bookings within their scope; this action just forwards the id and refreshes.
export async function confirmBookingAction(formData: FormData): Promise<void> {
  const id = formData.get('id')
  if (typeof id !== 'string' || !id) return
  await confirmBooking(id)
  revalidatePath('/dashboard')
}
