import 'server-only'

import { createClient } from '@/lib/supabase/server'

export interface GarageStats {
  today: number
  thisWeek: number
  thisMonth: number
  completed: number
  cancelled: number
  avgPerDay: number
  topIssues: { label: string; count: number }[]
  byChannel: { app: number; whatsapp: number }
  byStatus: { status: string; count: number }[]
  dailyCounts: { date: string; count: number }[]
}

export async function getGarageStats(): Promise<GarageStats> {
  const supabase = await createClient()

  const now = new Date()
  const todayStart = new Date(now.getFullYear(), now.getMonth(), now.getDate()).toISOString()

  const weekStart = new Date(now)
  weekStart.setDate(now.getDate() - now.getDay())
  weekStart.setHours(0, 0, 0, 0)

  const monthStart = new Date(now.getFullYear(), now.getMonth(), 1).toISOString()

  // Last 30 days start for daily chart
  const thirtyDaysAgo = new Date(now)
  thirtyDaysAgo.setDate(now.getDate() - 30)

  // All bookings — RLS scopes to the owner's tenant automatically
  const { data: allBookings } = await supabase
    .from('bookings')
    .select('id, status, channel, created_at')
    .gte('created_at', thirtyDaysAgo.toISOString())
    .order('created_at', { ascending: true })
    .returns<{ id: string; status: string; channel: string; created_at: string }[]>()

  const bookings = allBookings ?? []

  const today = bookings.filter((b) => b.created_at >= todayStart).length
  const thisWeek = bookings.filter((b) => b.created_at >= weekStart.toISOString()).length
  const thisMonth = bookings.filter((b) => b.created_at >= monthStart).length
  const completed = bookings.filter((b) => b.status === 'collected' || b.status === 'ready').length
  const cancelled = bookings.filter((b) => b.status === 'cancelled').length

  const app = bookings.filter((b) => b.channel === 'app').length
  const whatsapp = bookings.filter((b) => b.channel === 'whatsapp').length

  // Status breakdown
  const statusMap: Record<string, number> = {}
  for (const b of bookings) {
    statusMap[b.status] = (statusMap[b.status] || 0) + 1
  }
  const byStatus = Object.entries(statusMap).map(([status, count]) => ({ status, count }))

  // Daily counts for last 30 days
  const dailyMap: Record<string, number> = {}
  for (const b of bookings) {
    const day = b.created_at.slice(0, 10)
    dailyMap[day] = (dailyMap[day] || 0) + 1
  }
  const dailyCounts = Object.entries(dailyMap)
    .map(([date, count]) => ({ date, count }))
    .sort((a, b) => a.date.localeCompare(b.date))

  // Average per day (over days that had bookings, or 30-day window)
  const daysWithData = Math.max(dailyCounts.length, 1)
  const avgPerDay = Math.round((bookings.length / Math.min(30, daysWithData)) * 10) / 10

  // Top issues
  const { data: issues } = await supabase
    .from('booking_issues')
    .select('label')
    .returns<{ label: string }[]>()

  const issueMap: Record<string, number> = {}
  for (const i of issues ?? []) {
    issueMap[i.label] = (issueMap[i.label] || 0) + 1
  }
  const topIssues = Object.entries(issueMap)
    .map(([label, count]) => ({ label, count }))
    .sort((a, b) => b.count - a.count)
    .slice(0, 5)

  return {
    today,
    thisWeek,
    thisMonth,
    completed,
    cancelled,
    avgPerDay,
    topIssues,
    byChannel: { app, whatsapp },
    byStatus,
    dailyCounts,
  }
}
