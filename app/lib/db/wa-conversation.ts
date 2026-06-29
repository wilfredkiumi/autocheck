import 'server-only'

// Shared store for the WhatsApp bot's in-progress conversation state.
//
// Serverless functions are ephemeral, so an in-memory Map can't hold this across
// requests on a real deploy. When Supabase is configured we persist to the
// wa_conversations table (service role); otherwise we fall back to an in-process
// Map so the bot still works locally / in demo mode.
import { isSupabaseConfigured } from '@/lib/supabase/env'
import { createServiceClient } from '@/lib/supabase/server'
import type { WaConversation } from '@/lib/wa-flow'

const memory = new Map<string, WaConversation>()

function useDb(): boolean {
  return isSupabaseConfigured && Boolean(process.env.SUPABASE_SERVICE_ROLE_KEY)
}

export async function getWaConversation(phone: string): Promise<WaConversation | null> {
  if (!useDb()) return memory.get(phone) ?? null
  try {
    const supabase = createServiceClient()
    const { data } = await supabase
      .from('wa_conversations')
      .select('state')
      .eq('phone', phone)
      .maybeSingle()
    return (data?.state as unknown as WaConversation) ?? null
  } catch (e) {
    console.error('[whatsapp] load state failed:', e)
    return memory.get(phone) ?? null
  }
}

export async function saveWaConversation(phone: string, state: WaConversation): Promise<void> {
  if (!useDb()) {
    memory.set(phone, state)
    return
  }
  try {
    const supabase = createServiceClient()
    await supabase
      .from('wa_conversations')
      .upsert({ phone, state: state as unknown as Record<string, unknown>, updated_at: new Date().toISOString() })
  } catch (e) {
    console.error('[whatsapp] save state failed:', e)
    memory.set(phone, state)
  }
}

export async function clearWaConversation(phone: string): Promise<void> {
  if (!useDb()) {
    memory.delete(phone)
    return
  }
  try {
    const supabase = createServiceClient()
    await supabase.from('wa_conversations').delete().eq('phone', phone)
  } catch (e) {
    console.error('[whatsapp] clear state failed:', e)
    memory.delete(phone)
  }
}
