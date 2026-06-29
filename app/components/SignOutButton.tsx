'use client'

import { useTransition } from 'react'
import { signOut } from '@/lib/auth/actions'

export function SignOutButton() {
  const [pending, start] = useTransition()
  return (
    <button
      onClick={() => start(() => signOut())}
      disabled={pending}
      style={{
        border: '1px solid #D7DEDA',
        background: '#fff',
        color: '#33403A',
        borderRadius: 10,
        padding: '7px 12px',
        fontSize: 13,
        fontWeight: 700,
        cursor: 'pointer',
      }}
    >
      {pending ? 'Signing out…' : 'Sign out'}
    </button>
  )
}
