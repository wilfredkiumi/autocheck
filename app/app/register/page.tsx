import { isSupabaseConfigured } from '@/lib/supabase/env'
import { RegisterForm } from './register-form'

export const metadata = { title: 'Register your garage · AutoCheck' }

export default function RegisterPage() {
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
          maxWidth: 420,
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
          Register your garage
        </h1>
        <p style={{ fontSize: 14, color: '#7B857F', margin: '0 0 20px' }}>
          Get listed and start receiving bookings from drivers near you.
        </p>

        {isSupabaseConfigured ? (
          <RegisterForm />
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
            Authentication is not configured. Set Supabase environment variables to enable registration.
          </div>
        )}
      </div>
    </main>
  )
}
