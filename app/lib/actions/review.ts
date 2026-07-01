'use server'

import { createClient, createServiceClient } from '@/lib/supabase/server'

export type SubmitReviewInput = {
  bookingId: string
  garageId: string
  rating: number
  comment?: string
}

export type SubmitReviewResult =
  | { ok: true }
  | { ok: false; error: string }

export async function submitReviewAction(
  input: SubmitReviewInput,
): Promise<SubmitReviewResult> {
  if (input.rating < 1 || input.rating > 5) {
    return { ok: false, error: 'Rating must be between 1 and 5.' }
  }

  const authClient = await createClient()
  const { data: { user } } = await authClient.auth.getUser()

  // Use service client for guest reviews
  const supabase = user ? authClient : createServiceClient()

  const { error } = await supabase.from('reviews').insert({
    booking_id: input.bookingId,
    garage_id: input.garageId,
    driver_id: user?.id ?? null,
    rating: input.rating,
    comment: input.comment || null,
  })

  if (error) {
    if (error.message.includes('unique') || error.message.includes('duplicate')) {
      return { ok: false, error: 'You have already reviewed this booking.' }
    }
    return { ok: false, error: error.message }
  }

  return { ok: true }
}
