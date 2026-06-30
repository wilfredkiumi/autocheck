'use client'

import type { CSSProperties } from 'react'
import { useBooking } from '@/lib/state'
import type { AppData, TenantKey } from '@/lib/data'
import { ConsumerHome, BrandHome } from '@/components/screens/Home'
import { Detail, Issue, Slot, Done } from '@/components/screens/Booking'
import { Location, Discovery, Roadside, RoadDone } from '@/components/screens/Away'
import { BookSheet } from '@/components/BookSheet'
import { ProfileSheet } from '@/components/ProfileSheet'

// The consumer (driver) app. A driver lands here from a garage's QR code, its
// wa.me link, or a branded link (/ for AutoCheck, /juma-auto, /westgate). There
// is no persona/tenant switcher — the route fixes the tenant, and owners/staff/
// admins sign in at /login for the dashboard. Full-bleed on phones; a centered
// app column on wider screens.
export default function App({
  initialTenant,
  data,
}: {
  initialTenant?: TenantKey
  data?: AppData
}) {
  const vm = useBooking(initialTenant, data)

  // CSS custom properties driving the per-tenant accent theme.
  const themeVars = {
    '--ac': vm.accent,
    '--acd': vm.accentDark,
    '--acs': vm.accentSoft,
  } as CSSProperties

  return (
    <div
      style={{
        minHeight: '100dvh',
        display: 'flex',
        justifyContent: 'center',
        background: '#EDF1EF',
        fontFamily: "'Manrope',sans-serif",
      }}
    >
      <main
        style={{
          width: 'min(430px, 100%)',
          minHeight: '100dvh',
          position: 'relative',
          overflow: 'hidden',
          background: '#F6F8F7',
          boxShadow: '0 0 0 1px rgba(15,40,30,.06)',
          ...themeVars,
        }}
      >
        {vm.isConsumerHome && <ConsumerHome vm={vm} />}
        {vm.isBrandHome && <BrandHome vm={vm} />}
        {vm.isLocation && <Location vm={vm} />}
        {vm.isDiscovery && <Discovery vm={vm} />}
        {vm.isRoadside && <Roadside vm={vm} />}
        {vm.isRoadDone && <RoadDone vm={vm} />}
        {vm.isDetail && <Detail vm={vm} />}
        {vm.isIssue && <Issue vm={vm} />}
        {vm.isSlot && <Slot vm={vm} />}
        {vm.isDone && <Done vm={vm} />}
        <BookSheet vm={vm} />
        <ProfileSheet vm={vm} />
      </main>
    </div>
  )
}
