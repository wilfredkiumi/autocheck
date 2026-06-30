'use client'

import { useTransition } from 'react'
import { signOut } from '@/lib/auth/actions'
import type { VM } from '@/lib/state'

export function ProfileSheet({ vm }: { vm: VM }) {
  const [pending, start] = useTransition()

  if (!vm.profileOpen) return null

  return (
    <div
      style={{ position: 'absolute', inset: 0, zIndex: 60, display: 'flex', flexDirection: 'column', justifyContent: 'flex-end' }}
    >
      <div
        onClick={vm.closeProfile}
        style={{ position: 'absolute', inset: 0, background: 'rgba(15,26,20,.45)' }}
      />
      <div
        style={{ position: 'relative', background: '#fff', borderRadius: '22px 22px 0 0', padding: '20px 20px 30px', boxShadow: '0 -10px 40px rgba(15,40,30,.18)' }}
      >
        <div style={{ width: 38, height: 4, borderRadius: 2, background: '#DCE5E0', margin: '0 auto 18px' }} />

        {vm.isSignedIn ? <SignedInView vm={vm} pending={pending} start={start} /> : <SignedOutView />}

        <div
          onClick={vm.closeProfile}
          style={{ textAlign: 'center', marginTop: 14, font: "600 13px 'Manrope'", color: '#7B857F', cursor: 'pointer', padding: 6 }}
        >
          Close
        </div>
      </div>
    </div>
  )
}

function SignedInView({
  vm,
  pending,
  start,
}: {
  vm: VM
  pending: boolean
  start: (fn: () => Promise<void>) => void
}) {
  return (
    <>
      <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
        <div
          style={{
            width: 48,
            height: 48,
            borderRadius: '50%',
            background: 'var(--ac)',
            color: '#fff',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            font: "800 20px 'Archivo'",
            flex: 'none',
          }}
        >
          {vm.profileInitial}
        </div>
        <div>
          <div style={{ font: "800 17px 'Archivo'", color: '#0F1A14' }}>
            {vm.profileName || 'Driver'}
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginTop: 2 }}>
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none">
              <path d="M12 3l7 3v5c0 4.5-3 7.5-7 9-4-1.5-7-4.5-7-9V6z" stroke="var(--ac)" strokeWidth="2" strokeLinejoin="round" />
              <path d="M9.5 12l1.8 1.8L15 10" stroke="var(--ac)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
            <span style={{ font: "600 12px 'Manrope'", color: 'var(--acd)' }}>Verified via WhatsApp</span>
          </div>
        </div>
      </div>

      {vm.profilePlates.length > 0 && (
        <div style={{ marginTop: 18 }}>
          <div style={{ font: "700 11px 'Space Mono'", color: '#7B857F', letterSpacing: '.06em', marginBottom: 10 }}>
            YOUR CARS
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
            {vm.profilePlates.map((plate) => (
              <div
                key={plate}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: 12,
                  background: '#F4F7F5',
                  borderRadius: 12,
                  padding: '12px 14px',
                }}
              >
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" style={{ flex: 'none' }}>
                  <rect x="2" y="7" width="20" height="10" rx="2" stroke="var(--ac)" strokeWidth="2" />
                  <path d="M6 7V6a1 1 0 011-1h10a1 1 0 011 1v1" stroke="var(--ac)" strokeWidth="2" />
                  <circle cx="7" cy="12" r="1.5" fill="var(--ac)" />
                  <circle cx="17" cy="12" r="1.5" fill="var(--ac)" />
                </svg>
                <span style={{ font: "700 15px 'Space Mono'", color: '#0F1A14', letterSpacing: '.04em' }}>
                  {plate}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}

      <button
        onClick={() => start(() => signOut())}
        disabled={pending}
        style={{
          width: '100%',
          marginTop: 18,
          border: '1px solid #D7DEDA',
          background: '#fff',
          borderRadius: 14,
          padding: 14,
          font: "700 14px 'Manrope'",
          color: '#33403A',
          cursor: 'pointer',
        }}
      >
        {pending ? 'Signing out...' : 'Sign out'}
      </button>
    </>
  )
}

function SignedOutView() {
  return (
    <>
      <div style={{ textAlign: 'center', marginBottom: 6 }}>
        <div
          style={{
            width: 48,
            height: 48,
            borderRadius: '50%',
            background: '#DCE5E0',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            margin: '0 auto 12px',
          }}
        >
          <svg width="22" height="22" viewBox="0 0 24 24" fill="none">
            <circle cx="12" cy="8" r="4" stroke="#7B857F" strokeWidth="2" />
            <path d="M4 20c0-3.3 3.6-6 8-6s8 2.7 8 6" stroke="#7B857F" strokeWidth="2" strokeLinecap="round" />
          </svg>
        </div>
        <div style={{ font: "800 17px 'Archivo'", color: '#0F1A14' }}>Not signed in</div>
        <div style={{ font: "400 13px 'Manrope'", color: '#7B857F', marginTop: 4, lineHeight: 1.5 }}>
          Sign in to track your bookings and link your car to your account.
        </div>
      </div>

      <a
        href="/login"
        style={{
          display: 'block',
          textAlign: 'center',
          textDecoration: 'none',
          marginTop: 14,
          background: 'var(--ac)',
          color: '#fff',
          borderRadius: 14,
          padding: 15,
          font: "700 15px 'Manrope'",
        }}
      >
        Sign in with WhatsApp
      </a>

      <a
        href="/register"
        style={{
          display: 'block',
          textAlign: 'center',
          textDecoration: 'none',
          marginTop: 10,
          font: "600 13px 'Manrope'",
          color: 'var(--acd)',
          padding: 6,
        }}
      >
        Own a garage? Register here
      </a>
    </>
  )
}
