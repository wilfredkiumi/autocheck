import { redirect } from 'next/navigation'
import { getSessionContext } from '@/lib/db/profiles'
import { listBookings, type BookingRow } from '@/lib/db/bookings'
import { getGarageStats, type GarageStats } from '@/lib/db/analytics'
import { confirmBookingAction } from './actions'
import { SignOutButton } from '@/components/SignOutButton'

export const metadata = { title: 'Dashboard · AutoCheck' }
export const dynamic = 'force-dynamic'

// Owner / staff dashboard — the first view wired to live Supabase data through
// RLS. The same query (listBookings) returns only the rows this user may see;
// the database, not the client, enforces tenant/garage scoping.
export default async function DashboardPage() {
  const ctx = await getSessionContext()
  if (!ctx) redirect('/login')

  const accent = ctx.tenant?.accent ?? '#0E7C50'
  const accentSoft = ctx.tenant?.accent_soft ?? '#EAF3EE'
  const accentDark = ctx.tenant?.accent_dark ?? '#0A6A44'

  const [bookings, stats] = await Promise.all([listBookings(), getGarageStats()])
  const newCount = bookings.filter((b) => b.status === 'new').length

  return (
    <main
      style={{
        minHeight: '100dvh',
        background: '#F2F5F3',
        fontFamily: 'Manrope, system-ui, sans-serif',
        padding: '0 0 40px',
      }}
    >
      <header
        style={{
          background: '#fff',
          borderBottom: '1px solid #E2E8E5',
          padding: '16px 20px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <div
            style={{
              width: 36,
              height: 36,
              borderRadius: 10,
              background: accent,
              color: '#fff',
              display: 'grid',
              placeItems: 'center',
              fontWeight: 800,
            }}
          >
            {ctx.tenant?.mark ?? 'A'}
          </div>
          <div>
            <div style={{ fontWeight: 800, color: '#0F1A14' }}>
              {ctx.tenant?.name ?? 'AutoCheck'}
            </div>
            <div style={{ fontSize: 12, color: '#7B857F' }}>
              {ctx.profile.role === 'owner' ? 'Owner dashboard' : 'Staff dashboard'}
            </div>
          </div>
        </div>
        <SignOutButton />
      </header>

      <div style={{ maxWidth: 640, margin: '0 auto', padding: '20px 16px' }}>
        {/* Key stats */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 10, marginBottom: 18 }}>
          <Stat label="Today" value={String(stats.today)} accent={accentDark} />
          <Stat label="This week" value={String(stats.thisWeek)} accent={accentDark} />
          <Stat label="This month" value={String(stats.thisMonth)} accent={accentDark} />
          <Stat label="Avg / day" value={String(stats.avgPerDay)} accent={accentDark} />
        </div>

        {/* Channel + status breakdown */}
        <div style={{ display: 'flex', gap: 10, marginBottom: 18 }}>
          <div style={cardStyle}>
            <div style={{ fontSize: 11, fontWeight: 800, color: '#7B857F', textTransform: 'uppercase', letterSpacing: '.05em', marginBottom: 10 }}>
              Booking channels
            </div>
            <ChannelBar app={stats.byChannel.app} whatsapp={stats.byChannel.whatsapp} accent={accent} />
          </div>
          <div style={cardStyle}>
            <div style={{ fontSize: 11, fontWeight: 800, color: '#7B857F', textTransform: 'uppercase', letterSpacing: '.05em', marginBottom: 10 }}>
              Awaiting action
            </div>
            <div style={{ fontSize: 28, fontWeight: 800, color: newCount > 0 ? '#C2410C' : accentDark }}>{newCount}</div>
            <div style={{ fontSize: 12, color: '#7B857F' }}>
              {stats.completed} completed · {stats.cancelled} cancelled
            </div>
          </div>
        </div>

        {/* Top issues */}
        {stats.topIssues.length > 0 && (
          <div style={{ ...cardStyle, marginBottom: 18 }}>
            <div style={{ fontSize: 11, fontWeight: 800, color: '#7B857F', textTransform: 'uppercase', letterSpacing: '.05em', marginBottom: 10 }}>
              Common issues (last 30 days)
            </div>
            {stats.topIssues.map((issue) => (
              <div key={issue.label} style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 6 }}>
                <div style={{ flex: 1, fontSize: 13, fontWeight: 600, color: '#33403A' }}>{issue.label}</div>
                <div style={{ width: 80, height: 6, background: '#F2F5F3', borderRadius: 3, overflow: 'hidden' }}>
                  <div
                    style={{
                      height: '100%',
                      width: `${Math.round((issue.count / (stats.topIssues[0]?.count || 1)) * 100)}%`,
                      background: accent,
                      borderRadius: 3,
                    }}
                  />
                </div>
                <div style={{ fontSize: 12, fontWeight: 700, color: '#7B857F', minWidth: 20, textAlign: 'right' }}>{issue.count}</div>
              </div>
            ))}
          </div>
        )}

        {/* Daily activity chart */}
        {stats.dailyCounts.length > 0 && (
          <div style={{ ...cardStyle, marginBottom: 18 }}>
            <div style={{ fontSize: 11, fontWeight: 800, color: '#7B857F', textTransform: 'uppercase', letterSpacing: '.05em', marginBottom: 10 }}>
              Daily bookings (last 30 days)
            </div>
            <div style={{ display: 'flex', alignItems: 'end', gap: 2, height: 60 }}>
              {stats.dailyCounts.map((d) => {
                const max = Math.max(...stats.dailyCounts.map((x) => x.count), 1)
                return (
                  <div
                    key={d.date}
                    title={`${d.date}: ${d.count}`}
                    style={{
                      flex: 1,
                      background: accent,
                      borderRadius: '2px 2px 0 0',
                      minHeight: 2,
                      height: `${Math.round((d.count / max) * 100)}%`,
                      opacity: 0.7,
                    }}
                  />
                )
              })}
            </div>
          </div>
        )}

        <h2 style={{ fontSize: 14, fontWeight: 800, color: '#33403A', margin: '0 0 10px' }}>
          Bookings
        </h2>

        {bookings.length === 0 ? (
          <p style={{ fontSize: 14, color: '#7B857F' }}>
            No bookings yet. New requests from the app and WhatsApp will appear here.
          </p>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
            {bookings.map((b) => (
              <BookingCard
                key={b.id}
                booking={b}
                accent={accent}
                accentSoft={accentSoft}
                accentDark={accentDark}
              />
            ))}
          </div>
        )}
      </div>
    </main>
  )
}

const cardStyle: React.CSSProperties = {
  flex: 1,
  background: '#fff',
  border: '1px solid #E2E8E5',
  borderRadius: 14,
  padding: '14px 16px',
}

function Stat({ label, value, accent }: { label: string; value: string; accent: string }) {
  return (
    <div style={cardStyle}>
      <div style={{ fontSize: 22, fontWeight: 800, color: accent }}>{value}</div>
      <div style={{ fontSize: 11, color: '#7B857F' }}>{label}</div>
    </div>
  )
}

function ChannelBar({ app, whatsapp, accent }: { app: number; whatsapp: number; accent: string }) {
  const total = app + whatsapp || 1
  return (
    <div>
      <div style={{ display: 'flex', height: 8, borderRadius: 4, overflow: 'hidden', marginBottom: 8 }}>
        <div style={{ width: `${(whatsapp / total) * 100}%`, background: '#25D366' }} />
        <div style={{ width: `${(app / total) * 100}%`, background: accent }} />
      </div>
      <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 12 }}>
        <span style={{ color: '#25D366', fontWeight: 700 }}>WhatsApp {whatsapp}</span>
        <span style={{ color: accent, fontWeight: 700 }}>App {app}</span>
      </div>
    </div>
  )
}

function BookingCard({
  booking,
  accent,
  accentSoft,
  accentDark,
}: {
  booking: BookingRow
  accent: string
  accentSoft: string
  accentDark: string
}) {
  const pill =
    booking.status === 'new'
      ? { t: 'NEW', bg: '#FBEAE1', fg: '#C2410C', bar: '#C2410C' }
      : booking.status === 'confirmed'
        ? { t: 'CONFIRMED', bg: accentSoft, fg: accentDark, bar: accent }
        : { t: booking.status.toUpperCase().replace('_', ' '), bg: '#FEF3D6', fg: '#9A6608', bar: '#E0A210' }

  return (
    <div
      style={{
        background: '#fff',
        border: '1px solid #E2E8E5',
        borderLeft: `3px solid ${pill.bar}`,
        borderRadius: 14,
        padding: '14px 16px',
      }}
    >
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start' }}>
        <div>
          <div style={{ fontWeight: 800, color: '#0F1A14' }}>{booking.customer_name}</div>
          <div style={{ fontSize: 13, color: '#7B857F' }}>{booking.vehicle}</div>
        </div>
        <span
          style={{
            fontSize: 11,
            fontWeight: 800,
            letterSpacing: 0.4,
            color: pill.fg,
            background: pill.bg,
            borderRadius: 999,
            padding: '4px 9px',
          }}
        >
          {pill.t}
        </span>
      </div>

      {booking.issues.length > 0 && (
        <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap', margin: '10px 0 0' }}>
          {booking.issues.map((i) => (
            <span
              key={i}
              style={{
                fontSize: 12,
                fontWeight: 600,
                color: '#33403A',
                background: '#F2F5F3',
                border: '1px solid #D7DEDA',
                borderRadius: 8,
                padding: '3px 8px',
              }}
            >
              {i}
            </span>
          ))}
        </div>
      )}

      {booking.ai_summary && (
        <p style={{ fontSize: 13, color: '#4A554F', lineHeight: 1.5, margin: '10px 0 0' }}>
          {booking.ai_summary}
        </p>
      )}

      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          marginTop: 12,
        }}
      >
        <span style={{ fontSize: 13, fontWeight: 700, color: '#0F1A14' }}>
          {booking.slot_label ?? '—'}
        </span>
        {booking.status === 'new' && (
          <form action={confirmBookingAction}>
            <input type="hidden" name="id" value={booking.id} />
            <button
              type="submit"
              style={{
                border: 'none',
                background: accent,
                color: '#fff',
                borderRadius: 10,
                padding: '8px 14px',
                fontSize: 13,
                fontWeight: 700,
                cursor: 'pointer',
              }}
            >
              Confirm
            </button>
          </form>
        )}
      </div>
    </div>
  )
}
