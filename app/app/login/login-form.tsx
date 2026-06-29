'use client'

import { useState, useTransition } from 'react'
import {
  requestEmailOtp,
  requestPhoneOtp,
  signInWithGoogle,
  verifyPhoneOtp,
} from '@/lib/auth/actions'

type Mode = 'phone' | 'email'
type PhoneStep = 'enter' | 'verify'

const ACCENT = '#0E7C50'

export function LoginForm() {
  const [mode, setMode] = useState<Mode>('phone')
  const [step, setStep] = useState<PhoneStep>('enter')
  const [phone, setPhone] = useState('')
  const [code, setCode] = useState('')
  const [email, setEmail] = useState('')
  const [channel, setChannel] = useState<'whatsapp' | 'sms'>('whatsapp')
  const [msg, setMsg] = useState<string | null>(null)
  const [err, setErr] = useState<string | null>(null)
  const [pending, start] = useTransition()

  const sendCode = (via: 'whatsapp' | 'sms') =>
    start(async () => {
      setErr(null)
      setMsg(null)
      const res = await requestPhoneOtp(phone.trim(), via)
      if (res.ok) {
        setChannel(via)
        setStep('verify')
        setMsg(`Code sent via ${via === 'whatsapp' ? 'WhatsApp' : 'SMS'} to ${phone.trim()}.`)
      } else {
        setErr(res.error)
      }
    })

  const verify = () =>
    start(async () => {
      setErr(null)
      const res = await verifyPhoneOtp(phone.trim(), code.trim())
      // On success the action redirects; we only land here on failure.
      if (!res.ok) setErr(res.error)
    })

  const sendEmail = () =>
    start(async () => {
      setErr(null)
      setMsg(null)
      const res = await requestEmailOtp(email.trim())
      if (res.ok) setMsg(`Magic link sent to ${email.trim()}. Check your inbox.`)
      else setErr(res.error)
    })

  const google = () =>
    start(async () => {
      setErr(null)
      const res = await signInWithGoogle()
      if (!res.ok) setErr(res.error)
    })

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
      <div style={{ display: 'flex', gap: 6, background: '#F2F5F3', borderRadius: 12, padding: 4 }}>
        <Tab active={mode === 'phone'} onClick={() => setMode('phone')}>
          Phone
        </Tab>
        <Tab active={mode === 'email'} onClick={() => setMode('email')}>
          Email / Google
        </Tab>
      </div>

      {mode === 'phone' && step === 'enter' && (
        <>
          <Field
            label="Phone number"
            value={phone}
            onChange={setPhone}
            placeholder="+254700000000"
            type="tel"
          />
          <button style={primaryBtn} disabled={pending} onClick={() => sendCode('whatsapp')}>
            {pending ? 'Sending…' : 'Send code on WhatsApp'}
          </button>
          <button style={secondaryBtn} disabled={pending} onClick={() => sendCode('sms')}>
            Use SMS instead
          </button>
        </>
      )}

      {mode === 'phone' && step === 'verify' && (
        <>
          <Field
            label={`Enter the ${channel === 'whatsapp' ? 'WhatsApp' : 'SMS'} code`}
            value={code}
            onChange={setCode}
            placeholder="123456"
            type="text"
          />
          <button style={primaryBtn} disabled={pending} onClick={verify}>
            {pending ? 'Verifying…' : 'Verify & sign in'}
          </button>
          <button
            style={linkBtn}
            disabled={pending}
            onClick={() => {
              setStep('enter')
              setCode('')
              setMsg(null)
            }}
          >
            ← Change number
          </button>
        </>
      )}

      {mode === 'email' && (
        <>
          <Field
            label="Email"
            value={email}
            onChange={setEmail}
            placeholder="owner@garage.co.ke"
            type="email"
          />
          <button style={primaryBtn} disabled={pending} onClick={sendEmail}>
            {pending ? 'Sending…' : 'Email me a magic link'}
          </button>
          <button style={secondaryBtn} disabled={pending} onClick={google}>
            Continue with Google
          </button>
        </>
      )}

      {msg && <Note tone="ok">{msg}</Note>}
      {err && <Note tone="err">{err}</Note>}
    </div>
  )
}

function Tab({
  active,
  onClick,
  children,
}: {
  active: boolean
  onClick: () => void
  children: React.ReactNode
}) {
  return (
    <button
      onClick={onClick}
      style={{
        flex: 1,
        border: 'none',
        borderRadius: 9,
        padding: '8px 10px',
        fontSize: 13,
        fontWeight: 700,
        cursor: 'pointer',
        background: active ? '#fff' : 'transparent',
        color: active ? '#0F1A14' : '#7B857F',
        boxShadow: active ? '0 1px 3px rgba(0,0,0,.1)' : 'none',
      }}
    >
      {children}
    </button>
  )
}

function Field({
  label,
  value,
  onChange,
  placeholder,
  type,
}: {
  label: string
  value: string
  onChange: (v: string) => void
  placeholder: string
  type: string
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
          marginTop: 6,
          width: '100%',
          boxSizing: 'border-box',
          border: '1px solid #D7DEDA',
          borderRadius: 12,
          padding: '12px 14px',
          fontSize: 15,
          outlineColor: ACCENT,
        }}
      />
    </label>
  )
}

function Note({ tone, children }: { tone: 'ok' | 'err'; children: React.ReactNode }) {
  const c =
    tone === 'ok'
      ? { bg: '#EAF3EE', bd: '#CDE5D8', fg: '#0A6A44' }
      : { bg: '#FBEAE1', bd: '#F2D2C2', fg: '#9A330A' }
  return (
    <div
      style={{
        fontSize: 13,
        background: c.bg,
        border: `1px solid ${c.bd}`,
        color: c.fg,
        borderRadius: 12,
        padding: '10px 12px',
        lineHeight: 1.5,
      }}
    >
      {children}
    </div>
  )
}

const primaryBtn: React.CSSProperties = {
  border: 'none',
  borderRadius: 12,
  padding: '12px 14px',
  fontSize: 15,
  fontWeight: 700,
  cursor: 'pointer',
  background: ACCENT,
  color: '#fff',
}
const secondaryBtn: React.CSSProperties = {
  border: '1px solid #D7DEDA',
  borderRadius: 12,
  padding: '11px 14px',
  fontSize: 14,
  fontWeight: 700,
  cursor: 'pointer',
  background: '#fff',
  color: '#0F1A14',
}
const linkBtn: React.CSSProperties = {
  border: 'none',
  background: 'transparent',
  color: '#7B857F',
  fontSize: 13,
  fontWeight: 600,
  cursor: 'pointer',
  padding: 4,
}
