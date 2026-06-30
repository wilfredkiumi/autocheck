import { isSupabaseConfigured } from '@/lib/supabase/env'
import { LoginForm } from './login-form'

// Public sign-in page. Phone OTP (WhatsApp primary, SMS fallback) is the driver
// path; email / Google are offered for garage-owner and platform-admin logins.
// Accepts ?next= so the garage registration flow can bounce users back after login.
export const metadata = { title: 'Sign in · AutoCheck' }

export default async function LoginPage({
  searchParams,
}: {
  searchParams: Promise<{ next?: string }>
}) {
  const { next } = await searchParams
  const isRegisterRedirect = next === '/register'

  return (
    <main
      style={{
        minHeight: '100dvh',
        display: 'grid',
        placeItems: 'center',
        padding: '24px',
        background: '#F2F5F3',
        fontFamily: 'Manrope, system-ui, sans-serif',
      }}
    >
      <div
        style={{
          width: '100%',
          maxWidth: 380,
          background: '#fff',
          borderRadius: 20,
          border: '1px solid #E2E8E5',
          padding: '28px 24px',
          boxShadow: '0 8px 30px rgba(15,26,20,.06)',
        }}
      >
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
        <h1 style={{ fontSize: 20, fontWeight: 800, color: '#0F1A14', margin: '0 0 4px' }}>
          {isRegisterRedirect ? 'Sign in to register your garage' : 'Sign in'}
        </h1>
        <p style={{ fontSize: 14, color: '#7B857F', margin: '0 0 20px' }}>
          {isRegisterRedirect
            ? 'Sign in first, then we\'ll take you straight to the registration form.'
            : 'Book your car in — with a garage you already trust.'}
        </p>

        {isSupabaseConfigured ? (
          <>
            <LoginForm next={next} />
            {!isRegisterRedirect && (
              <div style={{ textAlign: 'center', marginTop: 16 }}>
                <a href="/register" style={{ fontSize: 13, fontWeight: 600, color: '#0E7C50', textDecoration: 'none' }}>
                  Own a garage? Register here
                </a>
              </div>
            )}
          </>
        ) : (
          <div
            style={{
              fontSize: 13,
              color: '#9A330A',
              background: '#FBEAE1',
              border: '1px solid #F2D2C2',
              borderRadius: 12,
              padding: '12px 14px',
              lineHeight: 1.5,
            }}
          >
            Authentication isn’t configured yet. Set <code>NEXT_PUBLIC_SUPABASE_URL</code> and{' '}
            <code>NEXT_PUBLIC_SUPABASE_ANON_KEY</code> (see{' '}
            <code>docs/supabase-setup.md</code>) to enable sign-in. The demo app runs
            without it.
          </div>
        )}
      </div>
    </main>
  )
}
