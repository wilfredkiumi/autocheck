import { NextRequest, NextResponse } from 'next/server'
import { sendWeeklyDigests } from '@/lib/digest'

// Cron endpoint for weekly garage owner digests.
// Vercel Cron: set in vercel.json with schedule "0 8 * * 1" (Monday 8am).
// Protected by CRON_SECRET to prevent unauthorized triggers.

export async function GET(req: NextRequest) {
  const secret = req.headers.get('authorization')?.replace('Bearer ', '')
  if (process.env.CRON_SECRET && secret !== process.env.CRON_SECRET) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  try {
    const result = await sendWeeklyDigests()
    console.info('[cron] weekly digest:', result)
    return NextResponse.json(result)
  } catch (e) {
    console.error('[cron] weekly digest failed:', e)
    return NextResponse.json({ error: 'Failed' }, { status: 500 })
  }
}
