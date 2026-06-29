import { redirect } from 'next/navigation'
import { getSessionContext } from '@/lib/db/profiles'
import { listTenantsWithGarages } from '@/lib/db/tenants'
import { toggleGarageVerifiedAction } from './actions'
import { SignOutButton } from '@/components/SignOutButton'

export const metadata = { title: 'Platform admin · AutoCheck' }
export const dynamic = 'force-dynamic'

// Platform admin — the trust layer. Lists every tenant and garage and lets an
// admin verify garages. Guarded by middleware (role = admin) and RLS.
export default async function AdminPage() {
  const ctx = await getSessionContext()
  if (!ctx) redirect('/login')
  if (ctx.profile.role !== 'admin') redirect('/')

  const tenants = await listTenantsWithGarages()

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
          background: '#0F1A14',
          color: '#fff',
          padding: '16px 20px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
        }}
      >
        <div>
          <div style={{ fontWeight: 800 }}>AutoCheck · Platform admin</div>
          <div style={{ fontSize: 12, color: '#9AA6A0' }}>Verify garages · manage tenants</div>
        </div>
        <SignOutButton />
      </header>

      <div style={{ maxWidth: 720, margin: '0 auto', padding: '20px 16px', display: 'flex', flexDirection: 'column', gap: 16 }}>
        {tenants.map((t) => (
          <section
            key={t.id}
            style={{ background: '#fff', border: '1px solid #E2E8E5', borderRadius: 16, overflow: 'hidden' }}
          >
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: 10,
                padding: '14px 16px',
                borderBottom: '1px solid #EEF2F0',
              }}
            >
              <div
                style={{
                  width: 32,
                  height: 32,
                  borderRadius: 9,
                  background: t.accent,
                  color: '#fff',
                  display: 'grid',
                  placeItems: 'center',
                  fontWeight: 800,
                }}
              >
                {t.mark}
              </div>
              <div style={{ flex: 1 }}>
                <div style={{ fontWeight: 800, color: '#0F1A14' }}>{t.name}</div>
                <div style={{ fontSize: 12, color: '#7B857F' }}>
                  {t.plan} · {t.price ?? '—'} · /{t.slug}
                </div>
              </div>
              {t.is_verified && <Badge>Tenant verified</Badge>}
            </div>

            <div style={{ padding: '8px 16px 14px' }}>
              {t.garages.length === 0 ? (
                <div style={{ fontSize: 13, color: '#9AA6A0', padding: '8px 0' }}>
                  No garages.
                </div>
              ) : (
                t.garages.map((g) => (
                  <div
                    key={g.id}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      padding: '10px 0',
                      borderTop: '1px solid #F2F5F3',
                    }}
                  >
                    <div>
                      <div style={{ fontWeight: 700, color: '#0F1A14', fontSize: 14 }}>
                        {g.name}
                      </div>
                      <div style={{ fontSize: 12, color: '#7B857F' }}>
                        {g.area} · {g.bays_total} bays
                        {g.rating ? ` · ★ ${g.rating}` : ''}
                      </div>
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                      {g.is_verified && <Badge>Verified</Badge>}
                      <form action={toggleGarageVerifiedAction}>
                        <input type="hidden" name="id" value={g.id} />
                        <input type="hidden" name="verified" value={String(!g.is_verified)} />
                        <button
                          type="submit"
                          style={{
                            border: '1px solid #D7DEDA',
                            background: g.is_verified ? '#fff' : '#0E7C50',
                            color: g.is_verified ? '#33403A' : '#fff',
                            borderRadius: 10,
                            padding: '7px 12px',
                            fontSize: 12,
                            fontWeight: 700,
                            cursor: 'pointer',
                          }}
                        >
                          {g.is_verified ? 'Unverify' : 'Verify'}
                        </button>
                      </form>
                    </div>
                  </div>
                ))
              )}
            </div>
          </section>
        ))}
      </div>
    </main>
  )
}

function Badge({ children }: { children: React.ReactNode }) {
  return (
    <span
      style={{
        fontSize: 11,
        fontWeight: 800,
        letterSpacing: 0.3,
        color: '#0A6A44',
        background: '#EAF3EE',
        border: '1px solid #CDE5D8',
        borderRadius: 999,
        padding: '4px 9px',
      }}
    >
      {children}
    </span>
  )
}
