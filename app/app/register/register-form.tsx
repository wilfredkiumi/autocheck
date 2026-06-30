'use client'

import { useState, useTransition } from 'react'
import { registerGarage } from '@/lib/auth/register'

const ACCENT = '#0E7C50'

export function RegisterForm() {
  const [businessName, setBusinessName] = useState('')
  const [garageName, setGarageName] = useState('')
  const [area, setArea] = useState('')
  const [city, setCity] = useState('')
  const [region, setRegion] = useState('')
  const [ownerName, setOwnerName] = useState('')
  const [phone, setPhone] = useState('')
  const [err, setErr] = useState<string | null>(null)
  const [pending, start] = useTransition()

  const submit = () =>
    start(async () => {
      setErr(null)
      const res = await registerGarage({ businessName, garageName, area, city, region, ownerName, phone })
      if (!res.ok) setErr(res.error)
    })

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
      <SectionLabel>Business details</SectionLabel>
      <Field label="Business name" value={businessName} onChange={setBusinessName} placeholder="e.g. Juma Auto Centre" />
      <Field label="Garage name" value={garageName} onChange={setGarageName} placeholder="e.g. Juma Main Workshop" />

      <SectionLabel>Location</SectionLabel>
      <Field label="Area / neighbourhood" value={area} onChange={setArea} placeholder="e.g. Westlands" />
      <Field label="City / town" value={city} onChange={setCity} placeholder="e.g. Nairobi" />
      <Field label="County / province / region" value={region} onChange={setRegion} placeholder="e.g. Nairobi County" />

      <SectionLabel>Owner details</SectionLabel>
      <Field label="Your name" value={ownerName} onChange={setOwnerName} placeholder="e.g. Juma Ochieng" />
      <Field label="Phone number (optional)" value={phone} onChange={setPhone} placeholder="+254700000000" type="tel" />

      <div
        style={{
          fontSize: 13,
          color: '#0A6A44',
          background: '#EAF3EE',
          border: '1px solid #CDE5D8',
          borderRadius: 12,
          padding: '12px 14px',
          lineHeight: 1.5,
        }}
      >
        Not signed in yet?{' '}
        <a href="/login?next=/register" style={{ color: '#0E7C50', fontWeight: 700, textDecoration: 'underline' }}>
          Sign in first
        </a>{' '}
        — you&apos;ll come straight back here.
      </div>

      <button style={primaryBtn} disabled={pending} onClick={submit}>
        {pending ? 'Registering...' : 'Register garage'}
      </button>

      <a href="/login" style={{ fontSize: 13, color: '#7B857F', textAlign: 'center', textDecoration: 'none' }}>
        Already have an account? Sign in
      </a>

      {err && (
        <div
          style={{
            fontSize: 13,
            color: '#9A330A',
            background: '#FBEAE1',
            border: '1px solid #F2D2C2',
            borderRadius: 12,
            padding: '10px 12px',
            lineHeight: 1.5,
          }}
        >
          {err}
        </div>
      )}
    </div>
  )
}

function SectionLabel({ children }: { children: React.ReactNode }) {
  return (
    <div style={{ fontSize: 11, fontWeight: 800, color: '#7B857F', textTransform: 'uppercase', letterSpacing: '.06em', marginTop: 4 }}>
      {children}
    </div>
  )
}

function Field({
  label,
  value,
  onChange,
  placeholder,
  type = 'text',
}: {
  label: string
  value: string
  onChange: (v: string) => void
  placeholder: string
  type?: string
}) {
  return (
    <label style={{ display: 'block' }}>
      <span style={{ fontSize: 12, fontWeight: 700, color: '#33403A' }}>{label}</span>
      <input
        type={type}
        value={value}
        placeholder={placeholder}
        onChange={(e) => onChange(e.target.value)}
        style={{
          marginTop: 4,
          width: '100%',
          boxSizing: 'border-box',
          border: '1px solid #D7DEDA',
          borderRadius: 12,
          padding: '11px 14px',
          fontSize: 14,
          outlineColor: ACCENT,
        }}
      />
    </label>
  )
}

const primaryBtn: React.CSSProperties = {
  border: 'none',
  borderRadius: 12,
  padding: '13px 14px',
  fontSize: 15,
  fontWeight: 700,
  cursor: 'pointer',
  background: ACCENT,
  color: '#fff',
  marginTop: 4,
}
