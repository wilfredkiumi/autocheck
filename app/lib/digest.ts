import 'server-only'

import OpenAI from 'openai'
import { createServiceClient } from '@/lib/supabase/server'
import { isSupabaseConfigured } from '@/lib/supabase/env'
import { sendText } from '@/lib/whatsapp'

let _openai: OpenAI | null = null
function getClient(): OpenAI | null {
  if (!process.env.OPENAI_API_KEY) return null
  if (!_openai) _openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY })
  return _openai
}

interface TenantDigestData {
  tenantName: string
  ownerPhone: string
  total: number
  completed: number
  cancelled: number
  byChannel: { app: number; whatsapp: number }
  topIssues: { label: string; count: number }[]
  busiestDay: string | null
  slowestDay: string | null
}

const DAY_NAMES = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday']

/** Gather last 7 days of booking data for each tenant and send AI digest via WhatsApp. */
export async function sendWeeklyDigests(): Promise<{ sent: number; skipped: number }> {
  if (!isSupabaseConfigured || !process.env.SUPABASE_SERVICE_ROLE_KEY) {
    return { sent: 0, skipped: 0 }
  }

  const supabase = createServiceClient()

  // Get all tenants with their owners' phone numbers
  const { data: owners } = await supabase
    .from('profiles')
    .select('tenant_id, phone, full_name')
    .eq('role', 'owner')
    .not('phone', 'is', null)
    .not('tenant_id', 'is', null)
    .returns<{ tenant_id: string; phone: string; full_name: string | null }[]>()

  if (!owners?.length) return { sent: 0, skipped: 0 }

  // Get tenant names
  const tenantIds = [...new Set(owners.map((o) => o.tenant_id))]
  const { data: tenants } = await supabase
    .from('tenants')
    .select('id, name')
    .in('id', tenantIds)
    .returns<{ id: string; name: string }[]>()
  const tenantNames: Record<string, string> = {}
  for (const t of tenants ?? []) tenantNames[t.id] = t.name

  // Last 7 days of bookings
  const weekAgo = new Date()
  weekAgo.setDate(weekAgo.getDate() - 7)

  const { data: bookings } = await supabase
    .from('bookings')
    .select('id, tenant_id, status, channel, created_at')
    .gte('created_at', weekAgo.toISOString())
    .in('tenant_id', tenantIds)
    .returns<{ id: string; tenant_id: string; status: string; channel: string; created_at: string }[]>()

  // Issues for those bookings
  const bookingIds = (bookings ?? []).map((b) => b.id)
  const { data: issues } = bookingIds.length
    ? await supabase
        .from('booking_issues')
        .select('booking_id, label')
        .in('booking_id', bookingIds)
        .returns<{ booking_id: string; label: string }[]>()
    : { data: [] as { booking_id: string; label: string }[] }

  // Build per-tenant data
  const tenantData: Record<string, TenantDigestData> = {}
  for (const owner of owners) {
    if (tenantData[owner.tenant_id]) continue

    const tb = (bookings ?? []).filter((b) => b.tenant_id === owner.tenant_id)
    const tbIds = new Set(tb.map((b) => b.id))
    const ti = (issues ?? []).filter((i) => tbIds.has(i.booking_id))

    // Top issues
    const issueMap: Record<string, number> = {}
    for (const i of ti) issueMap[i.label] = (issueMap[i.label] || 0) + 1
    const topIssues = Object.entries(issueMap)
      .map(([label, count]) => ({ label, count }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 5)

    // Busiest / slowest day
    const dayCounts: Record<number, number> = {}
    for (const b of tb) {
      const day = new Date(b.created_at).getDay()
      dayCounts[day] = (dayCounts[day] || 0) + 1
    }
    const dayEntries = Object.entries(dayCounts).map(([d, c]) => ({ day: Number(d), count: c }))
    dayEntries.sort((a, b) => b.count - a.count)
    const busiestDay = dayEntries.length > 0 ? DAY_NAMES[dayEntries[0].day] : null
    const slowestDay = dayEntries.length > 1 ? DAY_NAMES[dayEntries[dayEntries.length - 1].day] : null

    tenantData[owner.tenant_id] = {
      tenantName: tenantNames[owner.tenant_id] || 'Your garage',
      ownerPhone: owner.phone.replace(/\+/g, ''),
      total: tb.length,
      completed: tb.filter((b) => b.status === 'collected' || b.status === 'ready').length,
      cancelled: tb.filter((b) => b.status === 'cancelled').length,
      byChannel: {
        app: tb.filter((b) => b.channel === 'app').length,
        whatsapp: tb.filter((b) => b.channel === 'whatsapp').length,
      },
      topIssues,
      busiestDay,
      slowestDay,
    }
  }

  let sent = 0
  let skipped = 0

  for (const data of Object.values(tenantData)) {
    if (data.total === 0) {
      skipped++
      continue
    }

    const message = await generateDigestMessage(data)
    await sendText(data.ownerPhone, message)
    sent++
  }

  return { sent, skipped }
}

async function generateDigestMessage(data: TenantDigestData): Promise<string> {
  const fallback = buildFallbackDigest(data)
  const openai = getClient()
  if (!openai) return fallback

  try {
    const res = await openai.chat.completions.create({
      model: 'gpt-4o-mini',
      temperature: 0.5,
      max_tokens: 300,
      messages: [
        {
          role: 'system',
          content:
            'You are a garage business assistant in Kenya. Write a short, friendly WhatsApp weekly digest for a garage owner. Use simple language. Include the key numbers, one actionable insight, and encouragement. Keep it under 10 lines. Use emojis sparingly. No greetings like "Dear" — start with the garage name.',
        },
        {
          role: 'user',
          content: JSON.stringify(data),
        },
      ],
    })

    return res.choices[0]?.message?.content?.trim() || fallback
  } catch (e) {
    console.error('[digest] OpenAI call failed:', e)
    return fallback
  }
}

function buildFallbackDigest(data: TenantDigestData): string {
  const lines = [
    `${data.tenantName} — Weekly Report`,
    '',
    `Cars this week: ${data.total}`,
    `Completed: ${data.completed} | Cancelled: ${data.cancelled}`,
    `WhatsApp: ${data.byChannel.whatsapp} | App: ${data.byChannel.app}`,
  ]
  if (data.topIssues.length > 0) {
    lines.push(`Top issue: ${data.topIssues[0].label} (${data.topIssues[0].count})`)
  }
  if (data.busiestDay) {
    lines.push(`Busiest day: ${data.busiestDay}`)
  }
  return lines.join('\n')
}
