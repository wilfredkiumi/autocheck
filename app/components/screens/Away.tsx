import type { VM } from '@/lib/state'
import { BackButton, ShieldCheck } from '@/components/icons'

export function Location({ vm }: { vm: VM }) {
  return (
    <div className="scr" style={{ position: 'absolute', inset: 0, padding: '58px 0 0', overflow: 'hidden', color: '#0F1A14', display: 'flex', flexDirection: 'column' }}>
      <div style={{ padding: '0 20px', display: 'flex', alignItems: 'center', gap: 12, marginBottom: 14 }}>
        <BackButton onClick={vm.toHome} />
        <span style={{ font: "800 17px 'Archivo'" }}>Where are you?</span>
      </div>
      <div style={{ padding: '0 20px 12px' }}>
        <div style={{ font: "400 13px 'Manrope'", color: '#5A645E', lineHeight: 1.45 }}>
          Tap the map to drop a pin, or use your location. We'll find verified garages nearest to you.
        </div>
      </div>

      {vm.locPerm && (
        <div style={{ margin: '0 20px 12px', background: 'var(--acs)', border: '1px solid var(--ac)', borderRadius: 13, padding: '12px 13px', display: 'flex', alignItems: 'center', gap: 11 }}>
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" style={{ flex: 'none' }}>
            <path d="M12 21s7-5.5 7-11a7 7 0 10-14 0c0 5.5 7 11 7 11z" stroke="var(--acd)" strokeWidth="1.8" />
            <circle cx="12" cy="10" r="2.3" stroke="var(--acd)" strokeWidth="1.8" />
          </svg>
          <div style={{ flex: 1, font: "600 12px 'Manrope'", color: 'var(--acd)' }}>Allow precise location for the nearest help</div>
          <div onClick={vm.allowLoc} style={{ font: "700 12px 'Manrope'", color: '#fff', background: 'var(--ac)', padding: '7px 12px', borderRadius: 9, cursor: 'pointer' }}>Allow</div>
        </div>
      )}

      <div onClick={vm.onMapTap} style={{ position: 'relative', margin: '0 20px', flex: 1, minHeight: 0, borderRadius: 18, overflow: 'hidden', cursor: 'crosshair', background: '#DDE6DE', border: '1px solid #CBD5CF' }}>
        <div style={{ position: 'absolute', inset: 0, background: 'repeating-linear-gradient(0deg,transparent 0 38px,rgba(255,255,255,.5) 38px 41px),repeating-linear-gradient(90deg,transparent 0 46px,rgba(255,255,255,.5) 46px 49px)' }} />
        <div style={{ position: 'absolute', left: 0, right: 0, top: '33%', height: 13, background: '#EDEFEA', transform: 'rotate(-4deg)' }} />
        <div style={{ position: 'absolute', top: 0, bottom: 0, left: '58%', width: 15, background: '#EDEFEA' }} />
        <div style={{ position: 'absolute', left: '12%', top: '18%', width: 60, height: 42, background: '#C9D6CC', borderRadius: 3 }} />
        <div style={{ position: 'absolute', left: '66%', top: '54%', width: 74, height: 50, background: '#C9D6CC', borderRadius: 3 }} />
        <div style={{ position: 'absolute', left: '24%', top: '62%', width: 48, height: 40, background: '#C9D6CC', borderRadius: 3 }} />
        <div style={{ position: 'absolute', left: vm.pinX, top: vm.pinY, transform: 'translate(-50%,-100%)', pointerEvents: 'none' }}>
          <div style={{ position: 'absolute', left: '50%', top: '100%', transform: 'translate(-50%,-6px)', width: 26, height: 26, borderRadius: '50%', background: 'var(--ac)', opacity: 0.25, animation: 'ping 1.8s ease-out infinite' }} />
          <svg width="40" height="48" viewBox="0 0 24 28" fill="none">
            <path d="M12 27c0 0 9-8.5 9-16A9 9 0 103 11c0 7.5 9 16 9 16z" fill="var(--ac)" stroke="#fff" strokeWidth="1.5" />
            <circle cx="12" cy="11" r="3.4" fill="#fff" />
          </svg>
        </div>
        <div style={{ position: 'absolute', left: 12, bottom: 12, background: 'rgba(255,255,255,.92)', borderRadius: 9, padding: '7px 10px', font: "600 11px 'Manrope'", color: '#33403A', display: 'flex', alignItems: 'center', gap: 6 }}>
          <span className="pdot" style={{ width: 7, height: 7, borderRadius: '50%', background: 'var(--ac)' }} />
          {vm.pinArea}
        </div>
      </div>

      <div style={{ padding: '14px 20px 0' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, background: '#fff', border: '1px solid #E2E8E5', borderRadius: 13, padding: '11px 13px', marginBottom: 10 }}>
          <svg width="15" height="15" viewBox="0 0 24 24" fill="none">
            <circle cx="11" cy="11" r="7" stroke="#9AA6A0" strokeWidth="2" />
            <path d="M20 20l-3.5-3.5" stroke="#9AA6A0" strokeWidth="2" strokeLinecap="round" />
          </svg>
          <input value={vm.town} onChange={vm.onTown} placeholder="Or type a town / estate…" style={{ border: 'none', outline: 'none', flex: 1, font: "500 13px 'Manrope'", color: '#0F1A14', background: 'transparent' }} />
        </div>
        <div style={{ display: 'flex', gap: 9, paddingBottom: 16 }}>
          <div onClick={vm.allowLoc} style={{ flex: 'none', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 7, background: '#fff', border: '1px solid #E2E8E5', borderRadius: 13, padding: '14px 15px', cursor: 'pointer' }}>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
              <path d="M12 8v8M8 12h8" stroke="var(--ac)" strokeWidth="2" strokeLinecap="round" />
              <circle cx="12" cy="12" r="9" stroke="var(--ac)" strokeWidth="2" />
            </svg>
            <span style={{ font: "700 13px 'Manrope'", color: 'var(--ac)' }}>Use my location</span>
          </div>
          <div onClick={vm.confirmLocation} style={{ flex: 1, background: 'var(--ac)', color: '#fff', borderRadius: 13, padding: 14, textAlign: 'center', font: "700 14px 'Manrope'", cursor: 'pointer' }}>
            Find garages here →
          </div>
        </div>
      </div>
    </div>
  )
}

export function Discovery({ vm }: { vm: VM }) {
  return (
    <div className="scr phscroll" style={{ position: 'absolute', inset: 0, padding: '58px 0 18px', overflowY: 'auto', color: '#0F1A14' }}>
      <div style={{ padding: '0 20px', display: 'flex', alignItems: 'center', gap: 12, marginBottom: 14 }}>
        <BackButton onClick={vm.toLocation} />
        <span style={{ font: "600 13px 'Manrope'", color: '#7B857F' }}>Verified garages</span>
      </div>
      <div style={{ padding: '0 20px', marginBottom: 14 }}>
        <div style={{ font: "400 12px 'Manrope'", color: '#7B857F', display: 'flex', alignItems: 'center', gap: 5 }}>
          <svg width="12" height="12" viewBox="0 0 24 24" fill="none">
            <path d="M12 21s7-5.5 7-11a7 7 0 10-14 0c0 5.5 7 11 7 11z" stroke="#7B857F" strokeWidth="2" />
          </svg>
          {vm.pinArea} · not your usual area
        </div>
        <div style={{ font: "800 22px 'Archivo'", marginTop: 5 }}>Verified garages near you</div>
        <div style={{ font: "400 13px 'Manrope'", color: '#5A645E', marginTop: 5, lineHeight: 1.45 }}>
          No one in your network here — so these are{' '}
          <b style={{ color: 'var(--ac)' }}>AutoCheck-verified</b>: vetted by us, rated only by drivers who actually booked through the app.
        </div>
      </div>
      <div style={{ padding: '0 20px 14px' }}>
        <div onClick={vm.toRoadside} style={{ display: 'flex', alignItems: 'center', gap: 12, background: '#FBEAE1', border: '1px solid #F2C9B5', borderRadius: 14, padding: '13px 14px', cursor: 'pointer' }}>
          <div style={{ width: 36, height: 36, borderRadius: 10, background: '#C2410C', display: 'flex', alignItems: 'center', justifyContent: 'center', flex: 'none' }}>
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
              <path d="M5 11l1.5-4.5A2 2 0 018.4 5h7.2a2 2 0 011.9 1.5L19 11m-14 0h14m-14 0a2 2 0 00-2 2v3h2m14-5a2 2 0 012 2v3h-2M7 16h10" stroke="#fff" strokeWidth="1.8" strokeLinejoin="round" />
            </svg>
          </div>
          <div style={{ flex: 1 }}>
            <div style={{ font: "700 14px 'Manrope'", color: '#7C2D12' }}>Can't move the car?</div>
            <div style={{ font: "400 12px 'Manrope'", color: '#9A4422', marginTop: 1 }}>Request roadside help or a tow</div>
          </div>
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
            <path d="M9 6l6 6-6 6" stroke="#C2410C" strokeWidth="2" strokeLinecap="round" />
          </svg>
        </div>
      </div>
      <div style={{ padding: '0 20px' }}>
        {vm.nyeri.map((g, i) => (
          <div key={i} onClick={g.onClick} style={{ background: '#fff', border: '1px solid #E2E8E5', borderRadius: 18, padding: 16, marginBottom: 12, cursor: 'pointer', boxShadow: '0 2px 10px rgba(15,40,30,.03)' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                  <span style={{ font: "700 16px 'Archivo'" }}>{g.name}</span>
                  <ShieldCheck />
                </div>
                <div style={{ font: "400 12px 'Manrope'", color: '#7B857F', marginTop: 2 }}>{g.area} · {g.dist}</div>
              </div>
              <span style={{ display: 'flex', alignItems: 'center', gap: 3, flex: 'none' }}>
                <svg width="13" height="13" viewBox="0 0 24 24" fill="#E8A33A">
                  <path d="M12 2l2.9 6.3 6.9.7-5.1 4.6 1.4 6.8L12 17.8 5.9 20.4l1.4-6.8L2.2 9l6.9-.7z" />
                </svg>
                <span style={{ font: "700 13px 'Manrope'", color: '#33403A' }}>{g.rating}</span>
              </span>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 7, marginTop: 11 }}>
              <span style={{ font: "600 10px 'Manrope'", background: 'var(--acs)', color: 'var(--acd)', padding: '4px 8px', borderRadius: 7 }}>✓ AutoCheck-verified</span>
              <span style={{ font: "500 11px 'Manrope'", color: '#7B857F' }}>{g.visits} verified visits</span>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginTop: 12, paddingTop: 12, borderTop: '1px solid #EDF1EF' }}>
              <span style={{ display: 'flex', alignItems: 'center', gap: 7 }}>
                <span className="pdot" style={{ width: 8, height: 8, borderRadius: '50%', background: 'var(--ac)', display: 'inline-block' }} />
                <span style={{ font: "600 12px 'Manrope'", color: 'var(--ac)' }}>{g.avail}</span>
              </span>
              <span style={{ font: "500 12px 'Manrope'", color: '#7B857F' }}>{g.open}</span>
            </div>
          </div>
        ))}
      </div>
      <div style={{ height: 8 }} />
    </div>
  )
}

export function Roadside({ vm }: { vm: VM }) {
  return (
    <div className="scr phscroll" style={{ position: 'absolute', inset: 0, padding: '58px 20px 96px', overflowY: 'auto', color: '#0F1A14' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 14 }}>
        <BackButton onClick={vm.back} />
        <span style={{ font: "600 13px 'Manrope'", color: '#7B857F' }}>Roadside help</span>
      </div>
      <div style={{ font: "800 22px 'Archivo'", marginBottom: 4 }}>What's happened?</div>
      <div style={{ font: "400 13px 'Manrope'", color: '#7B857F', marginBottom: 16 }}>
        We'll send the nearest verified garage or tow to your pin.
      </div>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 9, marginBottom: 16 }}>
        {vm.roadOpts.map((o, i) => (
          <div key={i} onClick={o.onClick} style={{ display: 'flex', alignItems: 'center', gap: 12, background: o.bg, border: `1.5px solid ${o.bd}`, borderRadius: 14, padding: 14, cursor: 'pointer' }}>
            <div style={{ width: 34, height: 34, borderRadius: 10, background: o.iconbg, display: 'flex', alignItems: 'center', justifyContent: 'center', flex: 'none', fontSize: 17 }}>{o.emoji}</div>
            <span style={{ font: "600 14px 'Manrope'", color: o.fg }}>{o.label}</span>
            {o.sel && (
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" style={{ marginLeft: 'auto' }}>
                <circle cx="12" cy="12" r="10" fill="var(--ac)" />
                <path d="M7 12.5l3 3 7-7" stroke="#fff" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            )}
          </div>
        ))}
      </div>
      <div style={{ background: '#fff', border: '1px solid #E2E8E5', borderRadius: 14, padding: 14, display: 'flex', alignItems: 'center', gap: 11, marginBottom: 8 }}>
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" style={{ flex: 'none' }}>
          <path d="M12 21s7-5.5 7-11a7 7 0 10-14 0c0 5.5 7 11 7 11z" stroke="var(--ac)" strokeWidth="1.8" />
          <circle cx="12" cy="10" r="2.3" stroke="var(--ac)" strokeWidth="1.8" />
        </svg>
        <div style={{ flex: 1 }}>
          <div style={{ font: "700 13px 'Manrope'" }}>Your location</div>
          <div style={{ font: "400 12px 'Manrope'", color: '#7B857F' }}>{vm.pinArea} · pin shared</div>
        </div>
        <span className="pdot" style={{ width: 9, height: 9, borderRadius: '50%', background: 'var(--ac)' }} />
      </div>
      <div style={{ position: 'absolute', left: 0, right: 0, bottom: 0, padding: '14px 20px 24px', background: 'linear-gradient(to top,#F6F8F7 72%,transparent)' }}>
        <div onClick={vm.requestRoad} style={{ background: '#C2410C', color: '#fff', borderRadius: 14, padding: 16, textAlign: 'center', font: "700 15px 'Manrope'", cursor: 'pointer', boxShadow: '0 8px 18px rgba(194,65,12,.28)' }}>
          Request help now
        </div>
      </div>
    </div>
  )
}

export function RoadDone({ vm }: { vm: VM }) {
  return (
    <div className="scr phscroll" style={{ position: 'absolute', inset: 0, padding: '58px 20px 18px', overflowY: 'auto', color: '#0F1A14' }}>
      <div style={{ textAlign: 'center', padding: '14px 0 8px' }}>
        <div style={{ width: 76, height: 76, borderRadius: '50%', background: '#C2410C', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 14px', position: 'relative' }}>
          <div style={{ position: 'absolute', inset: 0, borderRadius: '50%', background: '#C2410C', opacity: 0.3, animation: 'ping 1.8s ease-out infinite' }} />
          <svg width="38" height="38" viewBox="0 0 24 24" fill="none">
            <path d="M5 11l1.5-4.5A2 2 0 018.4 5h7.2a2 2 0 011.9 1.5L19 11m-14 0h14m-14 0a2 2 0 00-2 2v3h2m14-5a2 2 0 012 2v3h-2M7 16h10" stroke="#fff" strokeWidth="1.8" strokeLinejoin="round" />
          </svg>
        </div>
        <div style={{ font: "800 22px 'Archivo'" }}>Help is on the way</div>
        <div style={{ font: "400 13px 'Manrope'", color: '#7B857F', marginTop: 4 }}>Mt Kenya Auto Repairs · {vm.pinArea}</div>
      </div>
      <div style={{ background: '#fff', border: '1px solid #E2E8E5', borderRadius: 16, padding: 16, marginTop: 8, display: 'flex', alignItems: 'center', gap: 13 }}>
        <div style={{ width: 46, height: 46, borderRadius: '50%', background: '#FBEAE1', display: 'flex', alignItems: 'center', justifyContent: 'center', font: "700 16px 'Manrope'", color: '#C2410C' }}>SM</div>
        <div style={{ flex: 1 }}>
          <div style={{ font: "700 15px 'Archivo'" }}>Samuel M.</div>
          <div style={{ font: "400 12px 'Manrope'", color: '#7B857F' }}>Recovery driver · ⭐ 4.9</div>
        </div>
        <div style={{ textAlign: 'right' }}>
          <div style={{ font: "800 18px 'Archivo'", color: '#C2410C' }}>12 min</div>
          <div style={{ font: "400 11px 'Manrope'", color: '#7B857F' }}>away</div>
        </div>
      </div>
      <div style={{ background: '#fff', border: '1px solid #E2E8E5', borderRadius: 14, padding: 16, marginTop: 13 }}>
        <div style={{ font: "700 11px 'Space Mono'", color: '#7B857F', letterSpacing: '.06em', marginBottom: 14 }}>STATUS</div>
        {vm.roadTrack.map((t, i) => (
          <div key={i} style={{ display: 'flex', gap: 12 }}>
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
              <span style={{ width: 14, height: 14, borderRadius: '50%', background: t.dot, border: `2px solid ${t.ring}`, flex: 'none' }} />
              <span style={{ width: 2, flex: 1, background: t.line, minHeight: 16 }} />
            </div>
            <div style={{ paddingBottom: 14 }}>
              <div style={{ font: "700 14px 'Manrope'", color: t.fg }}>{t.label}</div>
              <div style={{ font: "400 12px 'Manrope'", color: '#7B857F' }}>{t.time}</div>
            </div>
          </div>
        ))}
      </div>
      <div style={{ display: 'flex', gap: 9, marginTop: 13 }}>
        <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8, background: '#C2410C', borderRadius: 13, padding: 14, cursor: 'pointer' }}>
          <svg width="17" height="17" viewBox="0 0 24 24" fill="none">
            <path d="M5 4h4l2 5-2.5 1.5a11 11 0 005 5L15 13l5 2v4a2 2 0 01-2 2A15 15 0 013 6a2 2 0 012-2z" stroke="#fff" strokeWidth="2" strokeLinejoin="round" />
          </svg>
          <span style={{ font: "700 13px 'Manrope'", color: '#fff' }}>Call driver</span>
        </div>
        <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8, background: '#fff', border: '1px solid #E2E8E5', borderRadius: 13, padding: 14, cursor: 'pointer' }}>
          <svg width="17" height="17" viewBox="0 0 24 24" fill="none">
            <path d="M21 11.5a8.5 8.5 0 01-12 7.5L3 21l2-6a8.5 8.5 0 1116-3.5z" stroke="#0F1A14" strokeWidth="2" strokeLinejoin="round" />
          </svg>
          <span style={{ font: "600 13px 'Manrope'", color: '#33403A' }}>Message</span>
        </div>
      </div>
      <div onClick={vm.toHome} style={{ marginTop: 11, textAlign: 'center', font: "600 13px 'Manrope'", color: '#7B857F', cursor: 'pointer', padding: 10 }}>
        Back to home
      </div>
    </div>
  )
}
