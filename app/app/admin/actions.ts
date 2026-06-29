'use server'

import { revalidatePath } from 'next/cache'
import { setGarageVerified } from '@/lib/db/tenants'

// Platform-admin: flip a garage's verification flag. RLS restricts this to admins.
export async function toggleGarageVerifiedAction(formData: FormData): Promise<void> {
  const id = formData.get('id')
  const verified = formData.get('verified')
  if (typeof id !== 'string' || !id) return
  await setGarageVerified(id, verified === 'true')
  revalidatePath('/admin')
}
