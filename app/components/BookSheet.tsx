import type { VM } from '@/lib/state'

// "How do you want to book?" sheet. The driver declares intent on the home
// screen; this captures the car's number plate (the booking's identity) and
// lets them finish in the app or hop to WhatsApp — both write the same booking,
// keyed by plate, to Supabase.
export function BookSheet({ vm }: { vm: VM }) {
  if (!vm.sheetOpen) return null
  return (
    <div
      style={{ position: 'absolute', inset: 0, zIndex: 50, display: 'flex', flexDirection: 'column', justifyContent: 'flex-end' }}
    >
      <div
        onClick={vm.closeSheet}
        style={{ position: 'absolute', inset: 0, background: 'rgba(15,26,20,.45)' }}
      />
      <div
        style={{ position: 'relative', background: '#fff', borderRadius: '22px 22px 0 0', padding: '20px 20px 26px', boxShadow: '0 -10px 40px rgba(15,40,30,.18)' }}
      >
        <div style={{ width: 38, height: 4, borderRadius: 2, background: '#DCE5E0', margin: '0 auto 16px' }} />
        <div style={{ font: "800 19px 'Archivo'", color: '#0F1A14' }}>Book your car in</div>
        <div style={{ font: "400 13px 'Manrope'", color: '#7B857F', marginTop: 3 }}>
          {vm.sheetGarageName} · finish in the app or on WhatsApp
        </div>

        <label style={{ display: 'block', marginTop: 16 }}>
          <span style={{ font: "700 12px 'Manrope'", color: '#33403A' }}>Car number plate</span>
          <input
            value={vm.plate}
            onChange={vm.onPlate}
            placeholder="KDA 123A"
            autoCapitalize="characters"
            style={{ marginTop: 6, width: '100%', boxSizing: 'border-box', border: '1px solid #D7DEDA', borderRadius: 12, padding: '13px 14px', font: "700 16px 'Space Mono'", letterSpacing: '.04em', textTransform: 'uppercase', outlineColor: 'var(--ac)' }}
          />
          <span style={{ font: "400 11px 'Manrope'", color: '#9AA6A0', marginTop: 6, display: 'block' }}>
            Optional for WhatsApp — the bot will ask. Needed to finish in the app.
            We book against the car, so anyone you send with it can be served.
          </span>
        </label>

        {/* WhatsApp is the primary path — most drivers are already there. Carries
            the plate in the link if entered, so they don't re-type it. */}
        {vm.sheetWaAvailable && (
          <a
            href={vm.sheetWaHref}
            target="_blank"
            rel="noopener noreferrer"
            onClick={vm.closeSheet}
            style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 9, marginTop: 16, background: '#25D366', color: '#fff', borderRadius: 14, padding: 16, textDecoration: 'none', font: "800 16px 'Manrope'" }}
          >
            <WaGlyph /> Book on WhatsApp
          </a>
        )}

        <button
          onClick={vm.canBook ? vm.continueInApp : undefined}
          disabled={!vm.canBook}
          style={{ width: '100%', marginTop: 10, background: '#fff', border: `1.5px solid ${vm.canBook ? 'var(--ac)' : '#E2E8E5'}`, borderRadius: 14, padding: 14, font: "700 14px 'Manrope'", cursor: vm.canBook ? 'pointer' : 'default', color: vm.canBook ? 'var(--acd)' : '#B0B7B3' }}
        >
          {vm.canBook ? 'Finish here in the app →' : 'Enter plate to finish in the app'}
        </button>

        <div onClick={vm.closeSheet} style={{ textAlign: 'center', marginTop: 12, font: "600 13px 'Manrope'", color: '#7B857F', cursor: 'pointer', padding: 6 }}>
          Cancel
        </div>
      </div>
    </div>
  )
}

function WaGlyph() {
  return (
    <svg width="18" height="18" viewBox="0 0 32 32" fill="currentColor" aria-hidden="true">
      <path d="M16 3C9 3 3.5 8.5 3.5 15.5c0 2.4.7 4.7 1.9 6.7L3 29l7-1.8c1.9 1 4 1.6 6 1.6 7 0 12.5-5.5 12.5-12.5S23 3 16 3zm0 22.7c-1.9 0-3.7-.5-5.3-1.5l-.4-.2-3.9 1 1-3.8-.2-.4a10.2 10.2 0 01-1.6-5.6C5.6 9.8 10.2 5.3 16 5.3S26.4 9.8 26.4 15.6 21.8 25.7 16 25.7zm5.7-7.7c-.3-.2-1.8-.9-2.1-1-.3-.1-.5-.2-.7.2-.2.3-.8 1-.9 1.2-.2.2-.3.2-.6.1-1.8-.9-3-1.6-4.2-3.6-.3-.5.3-.5.8-1.6.1-.2 0-.4 0-.5l-1-2.3c-.2-.6-.5-.5-.7-.5h-.6c-.2 0-.5.1-.8.4-.3.3-1 1-1 2.5s1.1 2.9 1.2 3.1c.2.2 2.2 3.4 5.3 4.7 2 .8 2.7.9 3.7.8.6-.1 1.8-.8 2.1-1.5.3-.7.3-1.4.2-1.5-.1-.2-.3-.2-.6-.4z" />
    </svg>
  )
}
