import Link from 'next/link'
import { redirect } from 'next/navigation'
import { isSupabaseConfigured } from '@/lib/supabase/env'
import { createClient } from '@/lib/supabase/server'
import { listMyBookings } from '@/lib/db/bookings'
import { signOut } from '@/lib/auth/actions'
import type { BookingStatus, UserRole } from '@/lib/supabase/types'

export const metadata = { title: 'Your account · AutoCheck' }

// The driver's home after sign-in: identity + their bookings, with a link back
// into the booking funnel. Owners/staff/admins are bounced to their own areas so
// each role stays in its lane. Self-gates on auth like /register does.
export default async function ProfilePage() {
  if (!isSupabaseConfigured) redirect('/login')

  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) redirect('/login?next=/profile')

  const { data: profile } = await supabase
    .from('profiles')
    .select('role')
    .eq('id', user.id)
    .returns<{ role: UserRole }[]>()
    .single()
  const role: UserRole = profile?.role ?? 'driver'
  if (role === 'owner' || role === 'staff') redirect('/dashboard')
  if (role === 'admin') redirect('/admin')

  const bookings = await listMyBookings()

  return (
    <main
      style={{
        minHeight: '100dvh',
        display: 'grid',
        placeItems: 'start center',
        padding: '24px',
        background: '#F2F5F3',
        fontFamily: 'Manrope, system-ui, sans-serif',
      }}
    >
      <div style={{ width: '100%', maxWidth: 460 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 18 }}>
          <div
            style={{
              width: 36,
              height: 36,
              borderRadius: 10,
              background: '#0E7C50',
              color: '#fff',
              display: 'grid',
              placeItems: 'center',
              fontWeight: 800,
            }}
          >
            A
          </div>
          <div style={{ fontWeight: 800, fontSize: 18, color: '#0F1A14' }}>AutoCheck</div>
        </div>

        {/* Identity card */}
        <div style={cardStyle}>
          <div style={{ fontSize: 12, fontWeight: 800, color: '#7B857F', textTransform: 'uppercase', letterSpacing: '.06em' }}>
            Your account
          </div>
          <div style={{ fontSize: 18, fontWeight: 800, color: '#0F1A14', marginTop: 6 }}>
            {user.phone ? `+${user.phone}` : user.email ?? 'Signed in'}
          </div>
          {user.email && user.phone && (
            <div style={{ fontSize: 13, color: '#7B857F', marginTop: 2 }}>{user.email}</div>
          )}
        </div>

        {/* Bookings */}
        <div style={{ display: 'flex', alignItems: 'baseline', justifyContent: 'space-between', margin: '22px 2px 12px' }}>
          <h1 style={{ fontSize: 18, fontWeight: 800, color: '#0F1A14', margin: 0 }}>Your bookings</h1>
          <Link href="/" style={{ fontSize: 13, fontWeight: 700, color: '#0E7C50', textDecoration: 'none' }}>
            + Book a car
          </Link>
        </div>

        {bookings.length === 0 ? (
          <div style={{ ...cardStyle, textAlign: 'center' }}>
            <div style={{ fontSize: 14, color: '#33403A', fontWeight: 600 }}>No bookings yet</div>
            <div style={{ fontSize: 13, color: '#7B857F', margin: '6px 0 14px' }}>
              Book your car in at a garage you trust — track its status here.
            </div>
            <Link href="/" style={primaryLink}>
              Book a car
            </Link>
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
            {bookings.map((b) => (
              <div key={b.id} style={cardStyle}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 10 }}>
                  <div style={{ fontSize: 15, fontWeight: 800, color: '#0F1A14' }}>
                    {b.garageName ?? 'Your garage'}
                  </div>
                  <StatusBadge status={b.status} />
                </div>
                <div style={{ fontSize: 13, color: '#7B857F', marginTop: 4 }}>
                  {b.slot_label ?? formatDate(b.created_at)}
                  {b.plate ? ` · ${b.plate}` : b.vehicle ? ` · ${b.vehicle}` : ''}
                </div>
                {b.issues.length > 0 && (
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6, marginTop: 10 }}>
                    {b.issues.map((label) => (
                      <span key={label} style={chip}>
                        {label}
                      </span>
                    ))}
                  </div>
                )}
              </div>
            ))}
          </div>
        )}

        {/* Sign out */}
        <form action={signOut} style={{ marginTop: 22 }}>
          <button type="submit" style={signOutBtn}>
            Sign out
          </button>
        </form>
      </div>
    </main>
  )
}

// Human-friendly labels + colours for each stage of a booking's lifecycle.
const STATUS_META: Record<BookingStatus, { label: string; bg: string; fg: string }> = {
  new: { label: 'Requested', bg: '#EEF2FF', fg: '#3538CD' },
  confirmed: { label: 'Confirmed', bg: '#E7F5EE', fg: '#0E7C50' },
  in_bay: { label: 'In the bay', bg: '#FEF6E7', fg: '#B54708' },
  ready: { label: 'Ready', bg: '#E7F5EE', fg: '#0E7C50' },
  collected: { label: 'Collected', bg: '#EEF1F0', fg: '#5B665F' },
  cancelled: { label: 'Cancelled', bg: '#FBEAE1', fg: '#9A330A' },
}

function StatusBadge({ status }: { status: BookingStatus }) {
  const meta = STATUS_META[status] ?? STATUS_META.new
  return (
    <span
      style={{
        fontSize: 12,
        fontWeight: 800,
        color: meta.fg,
        background: meta.bg,
        borderRadius: 999,
        padding: '4px 10px',
        whiteSpace: 'nowrap',
      }}
    >
      {meta.label}
    </span>
  )
}

function formatDate(iso: string): string {
  return new Date(iso).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })
}

const cardStyle: React.CSSProperties = {
  background: '#fff',
  borderRadius: 16,
  border: '1px solid #E2E8E5',
  padding: '16px 18px',
  boxShadow: '0 8px 30px rgba(15,26,20,.05)',
}

const chip: React.CSSProperties = {
  fontSize: 12,
  fontWeight: 600,
  color: '#33403A',
  background: '#F2F5F3',
  border: '1px solid #E2E8E5',
  borderRadius: 999,
  padding: '3px 10px',
}

const primaryLink: React.CSSProperties = {
  display: 'inline-block',
  background: '#0E7C50',
  color: '#fff',
  fontSize: 14,
  fontWeight: 700,
  textDecoration: 'none',
  borderRadius: 12,
  padding: '11px 18px',
}

const signOutBtn: React.CSSProperties = {
  width: '100%',
  border: '1px solid #E2E8E5',
  background: '#fff',
  color: '#9A330A',
  fontSize: 14,
  fontWeight: 700,
  borderRadius: 12,
  padding: '12px 14px',
  cursor: 'pointer',
}
