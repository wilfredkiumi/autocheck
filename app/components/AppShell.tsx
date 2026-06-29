'use client'

import type { CSSProperties } from 'react'
import { useBooking } from '@/lib/state'
import type { TenantKey } from '@/lib/data'
import { ConsumerHome, BrandHome } from '@/components/screens/Home'
import { Detail, Issue, Slot, Done } from '@/components/screens/Booking'
import { Location, Discovery, Roadside, RoadDone } from '@/components/screens/Away'
import { WhatsApp } from '@/components/screens/WhatsApp'
import { Owner } from '@/components/screens/Owner'

export default function App({ initialTenant }: { initialTenant?: TenantKey }) {
  const vm = useBooking(initialTenant)

  // CSS custom properties driving the per-tenant accent theme.
  const themeVars = {
    '--ac': vm.accent,
    '--acd': vm.accentDark,
    '--acs': vm.accentSoft,
  } as CSSProperties

  return (
    <div
      style={{
        minHeight: '100vh',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'flex-start',
        padding: '28px 24px 48px',
        fontFamily: "'Manrope',sans-serif",
        gap: 22,
      }}
    >
      {/* DEMO SWITCHER */}
      <div style={{ width: 520, maxWidth: '100%', background: '#fff', border: '1px solid #DCE2DF', borderRadius: 18, padding: '16px 18px', boxShadow: '0 6px 24px rgba(15,40,30,.06)' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 9, marginBottom: 3 }}>
          <span style={{ font: "700 11px 'Space Mono'", color: '#0E7C50', letterSpacing: '.08em' }}>MULTI-TENANT DEMO</span>
          <span style={{ height: 1, flex: 1, background: '#EAEFEC' }} />
        </div>
        <div style={{ font: "700 16px 'Archivo'", color: '#0F1A14', letterSpacing: '-.01em' }}>One platform. Two sides, three brands.</div>
        <div style={{ display: 'flex', gap: 6, marginTop: 12, background: '#F2F5F3', borderRadius: 11, padding: 4 }}>
          <div onClick={vm.setDriver} style={{ flex: 1, textAlign: 'center', cursor: 'pointer', borderRadius: 8, padding: 9, font: "700 12px 'Manrope'", background: vm.driverTabBg, color: vm.driverTabFg, boxShadow: vm.driverTabSh }}>Driver app</div>
          <div onClick={vm.setWhatsApp} style={{ flex: 1, textAlign: 'center', cursor: 'pointer', borderRadius: 8, padding: 9, font: "700 12px 'Manrope'", background: vm.whatsappTabBg, color: vm.whatsappTabFg, boxShadow: vm.whatsappTabSh }}>WhatsApp</div>
          <div onClick={vm.setOwner} style={{ flex: 1, textAlign: 'center', cursor: 'pointer', borderRadius: 8, padding: 9, font: "700 12px 'Manrope'", background: vm.ownerTabBg, color: vm.ownerTabFg, boxShadow: vm.ownerTabSh }}>Dashboard</div>
        </div>
        <div style={{ display: 'flex', gap: 8, marginTop: 10, flexWrap: 'wrap' }}>
          {vm.tenants.map((t) => (
            <div key={t.key} onClick={t.onClick} style={{ flex: 1, minWidth: 148, cursor: 'pointer', borderRadius: 12, padding: '10px 12px', border: `1.5px solid ${t.bd}`, background: t.bg }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <span style={{ width: 23, height: 23, borderRadius: 7, background: t.accent, color: '#fff', font: "800 11px 'Archivo'", display: 'flex', alignItems: 'center', justifyContent: 'center' }}>{t.mark}</span>
                <span style={{ font: "700 13px 'Manrope'", color: t.fg }}>{t.label}</span>
              </div>
              <div style={{ font: "500 11px 'Manrope'", color: t.subfg, marginTop: 4 }}>{t.sub}</div>
            </div>
          ))}
        </div>
      </div>

      {/* PHONE */}
      <div style={{ width: 390, height: 844, borderRadius: 46, background: '#F6F8F7', overflow: 'hidden', position: 'relative', boxShadow: '0 40px 90px -25px rgba(15,40,30,.35),0 0 0 1px rgba(0,0,0,.06)', border: '8px solid #E4E9E6' }}>
        {/* status bar */}
        <div style={{ position: 'absolute', top: 0, left: 0, right: 0, height: 52, display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between', padding: '0 32px 9px', zIndex: 30, color: vm.statusColor, font: "600 14px 'Manrope'" }}>
          <span>9:41</span>
          <span style={{ display: 'flex', gap: 6, alignItems: 'center', fontSize: 12 }}>●●● ▮▮ <span style={{ fontSize: 11 }}>100%</span></span>
        </div>

        <div style={{ position: 'absolute', inset: 0, ...themeVars }}>
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
          {vm.isWhatsApp && <WhatsApp vm={vm} />}
          {vm.isOwner && <Owner vm={vm} />}
        </div>
      </div>
    </div>
  )
}
