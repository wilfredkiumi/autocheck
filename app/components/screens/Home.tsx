import type { VM } from '@/lib/state'
import { ChevronRight, ShieldCheck } from '@/components/icons'
import { HeroArt } from '@/components/HeroArt'

export function ConsumerHome({ vm }: { vm: VM }) {
  return (
    <div
      className="scr phscroll"
      style={{ position: 'absolute', inset: 0, padding: '58px 0 18px', overflowY: 'auto', color: '#0F1A14' }}
    >
      <div style={{ padding: '6px 20px 16px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 9 }}>
          <div style={{ width: 32, height: 32, borderRadius: 9, background: 'var(--ac)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
              <path d="M12 3l7 3v5c0 4.5-3 7.5-7 9-4-1.5-7-4.5-7-9V6z" fill="#fff" />
            </svg>
          </div>
          <span style={{ font: "800 19px 'Archivo'", letterSpacing: '-.02em' }}>AutoCheck</span>
        </div>
        <div style={{ width: 36, height: 36, borderRadius: '50%', background: '#DCE5E0', display: 'flex', alignItems: 'center', justifyContent: 'center', font: "700 14px 'Manrope'", color: 'var(--ac)' }}>
          D
        </div>
      </div>

      <div style={{ padding: '0 20px', marginBottom: 14 }}>
        <div style={{ font: "800 27px 'Archivo'", letterSpacing: '-.02em', lineHeight: 1.1 }}>Book your car in.</div>
        <div style={{ font: "400 14px 'Manrope'", color: '#5A645E', marginTop: 6, lineHeight: 1.45 }}>
          Reserve your spot with a garage you — or someone you trust — already know.
        </div>
      </div>

      <div style={{ padding: '0 20px 16px' }}>
        <div style={{ borderRadius: 18, background: 'linear-gradient(135deg, var(--acs) 0%, #FBFDFC 78%)', border: '1px solid #E6EEEA', overflow: 'hidden', padding: '6px 8px 0' }}>
          <HeroArt />
        </div>
      </div>

      <div style={{ padding: '0 20px 16px' }}>
        <div onClick={vm.toLocation} style={{ display: 'flex', alignItems: 'center', gap: 12, background: '#161B18', borderRadius: 16, padding: '14px 15px', cursor: 'pointer' }}>
          <div style={{ width: 38, height: 38, borderRadius: 11, background: '#2A2E2B', display: 'flex', alignItems: 'center', justifyContent: 'center', flex: 'none' }}>
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
              <path d="M12 21s7-5.5 7-11a7 7 0 10-14 0c0 5.5 7 11 7 11z" stroke="#fff" strokeWidth="1.8" />
              <circle cx="12" cy="10" r="2.3" stroke="#fff" strokeWidth="1.8" />
            </svg>
          </div>
          <div style={{ flex: 1 }}>
            <div style={{ font: "700 14px 'Manrope'", color: '#fff' }}>Away from home or broken down?</div>
            <div style={{ font: "400 12px 'Manrope'", color: '#9AA6A0', marginTop: 1 }}>Find a verified garage near you</div>
          </div>
          <ChevronRight color="#6B756F" size={18} />
        </div>
      </div>

      <div style={{ padding: '0 20px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 11 }}>
        <span style={{ font: "700 13px 'Archivo'", color: '#0F1A14' }}>Your garages</span>
        <span style={{ font: "600 12px 'Manrope'", color: 'var(--ac)' }}>Manage</span>
      </div>

      <div style={{ padding: '0 20px' }}>
        {vm.garages.map((g, i) => (
          <div key={i} onClick={g.onClick} style={{ background: '#fff', border: '1px solid #E2E8E5', borderRadius: 18, padding: 16, marginBottom: 12, cursor: 'pointer', boxShadow: '0 2px 10px rgba(15,40,30,.03)' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                  <span style={{ font: "700 16px 'Archivo'" }}>{g.name}</span>
                  <ShieldCheck />
                </div>
                <div style={{ font: "400 12px 'Manrope'", color: '#7B857F', marginTop: 2 }}>
                  {g.area} · {g.dist}
                </div>
              </div>
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" style={{ flex: 'none', marginTop: 2 }}>
                <path d="M9 6l6 6-6 6" stroke="#C2CBC6" strokeWidth="2" strokeLinecap="round" />
              </svg>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginTop: 12, background: '#F4F7F5', borderRadius: 11, padding: '9px 11px' }}>
              {g.hasAvatars && (
                <div style={{ display: 'flex', flex: 'none' }}>
                  {g.avatars!.map((av, j) => (
                    <span key={j} style={{ width: 22, height: 22, borderRadius: '50%', background: av.c, color: '#fff', font: "700 10px 'Manrope'", display: 'flex', alignItems: 'center', justifyContent: 'center', border: '2px solid #F4F7F5', marginLeft: -6 }}>
                      {av.i}
                    </span>
                  ))}
                </div>
              )}
              {g.isVisits && (
                <svg width="15" height="15" viewBox="0 0 24 24" fill="none" style={{ flex: 'none' }}>
                  <path d="M3 12a9 9 0 109-9" stroke="var(--ac)" strokeWidth="2" strokeLinecap="round" />
                  <path d="M3 4v4h4" stroke="var(--ac)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                  <path d="M12 8v4l3 2" stroke="var(--ac)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
              )}
              <span style={{ font: "600 12px 'Manrope'", color: '#33403A' }}>{g.trust}</span>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginTop: 11, paddingTop: 11, borderTop: '1px solid #EDF1EF' }}>
              <span style={{ display: 'flex', alignItems: 'center', gap: 7 }}>
                <span className="pdot" style={{ width: 8, height: 8, borderRadius: '50%', background: 'var(--ac)', display: 'inline-block' }} />
                <span style={{ font: "400 12px 'Manrope'", color: '#7B857F' }}>Next opening</span>
              </span>
              <span style={{ font: "700 13px 'Manrope'", color: '#0F1A14' }}>{g.next}</span>
            </div>
          </div>
        ))}
      </div>

      <div style={{ padding: '2px 20px 0' }}>
        <div style={{ border: '1.5px dashed #CBD5CF', borderRadius: 16, padding: 15, display: 'flex', alignItems: 'center', gap: 12, cursor: 'pointer' }}>
          <div style={{ width: 38, height: 38, borderRadius: 11, background: 'var(--acs)', display: 'flex', alignItems: 'center', justifyContent: 'center', flex: 'none' }}>
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
              <path d="M12 5v14M5 12h14" stroke="var(--ac)" strokeWidth="2.2" strokeLinecap="round" />
            </svg>
          </div>
          <div>
            <div style={{ font: "700 14px 'Manrope'", color: '#0F1A14' }}>Add a garage</div>
            <div style={{ font: "400 12px 'Manrope'", color: '#7B857F', marginTop: 1 }}>From a friend's referral link or phone number</div>
          </div>
        </div>
      </div>
      <div style={{ height: 8 }} />
    </div>
  )
}

export function BrandHome({ vm }: { vm: VM }) {
  const g = vm.g
  return (
    <div
      className="scr phscroll"
      style={{ position: 'absolute', inset: 0, padding: '0 0 18px', overflowY: 'auto', color: '#0F1A14' }}
    >
      <div style={{ background: 'linear-gradient(150deg,var(--ac),var(--acd))', padding: '64px 22px 24px', color: '#fff', position: 'relative', overflow: 'hidden' }}>
        <svg style={{ position: 'absolute', right: -30, top: -20, opacity: 0.12 }} width="190" height="190" viewBox="0 0 24 24" fill="#fff">
          <path d="M5 11l1.5-4.5A2 2 0 018.4 5h7.2a2 2 0 011.9 1.5L19 11m-14 0h14m-14 0a2 2 0 00-2 2v3h2m14-5a2 2 0 012 2v3h-2M7 16h10M6 16v2m12-2v2" />
        </svg>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <div style={{ width: 40, height: 40, borderRadius: 11, background: 'rgba(255,255,255,.18)', border: '1px solid rgba(255,255,255,.35)', display: 'flex', alignItems: 'center', justifyContent: 'center', font: "800 17px 'Archivo'" }}>
            {vm.brandMark}
          </div>
          <div>
            <div style={{ font: "800 19px 'Archivo'", letterSpacing: '-.01em' }}>{vm.brandName}</div>
            <div style={{ font: "500 11px 'Manrope'", opacity: 0.85 }}>{g.area}</div>
          </div>
        </div>
        <div style={{ font: "800 25px 'Archivo'", lineHeight: 1.12, marginTop: 22, letterSpacing: '-.01em' }}>
          Book your car in<br />at {vm.brandShort}.
        </div>
        <div style={{ font: "400 13px 'Manrope'", opacity: 0.9, marginTop: 7 }}>
          Your slot, reserved. Drive straight in — no queue, no calling ahead.
        </div>
      </div>

      <div style={{ padding: '18px 20px 0' }}>
        <div style={{ background: '#fff', border: '1px solid #E2E8E5', borderRadius: 16, padding: 16 }}>
          <div style={{ font: "700 11px 'Space Mono'", color: '#7B857F', letterSpacing: '.06em', marginBottom: 11 }}>TRUSTED HERE</div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 13 }}>
            <div style={{ display: 'flex', flex: 'none' }}>
              {g.circleAvatars.map((av, j) => (
                <span key={j} style={{ width: 30, height: 30, borderRadius: '50%', background: av.c, color: '#fff', font: "700 12px 'Manrope'", display: 'flex', alignItems: 'center', justifyContent: 'center', border: '2.5px solid #fff', marginLeft: -8 }}>
                  {av.i}
                </span>
              ))}
            </div>
            <div style={{ font: "500 13px 'Manrope'", color: '#33403A', lineHeight: 1.4 }}>{g.circleText}</div>
          </div>
          <div style={{ background: '#F4F7F5', borderRadius: 12, padding: 13 }}>
            <div style={{ color: '#E8A33A', fontSize: 13, marginBottom: 6 }}>★★★★★</div>
            <div style={{ font: "400 13px 'Manrope'", color: '#33403A', lineHeight: 1.55 }}>"{g.quote}"</div>
            <div style={{ font: "600 11px 'Manrope'", color: '#7B857F', marginTop: 8 }}>— {g.quoteBy}</div>
          </div>
        </div>
      </div>

      <div style={{ padding: '13px 20px 0' }}>
        <div style={{ display: 'flex', gap: 9 }}>
          <div style={{ flex: 1, background: '#fff', border: '1px solid #E2E8E5', borderRadius: 13, padding: 13, textAlign: 'center' }}>
            <div style={{ font: "800 17px 'Archivo'", color: 'var(--ac)' }}>{g.next}</div>
            <div style={{ font: "400 10px 'Manrope'", color: '#7B857F', marginTop: 3 }}>next opening</div>
          </div>
          <div style={{ flex: 1, background: '#fff', border: '1px solid #E2E8E5', borderRadius: 13, padding: 13, textAlign: 'center' }}>
            <div style={{ font: "800 17px 'Archivo'" }}>{g.bays} bays</div>
            <div style={{ font: "400 10px 'Manrope'", color: '#7B857F', marginTop: 3 }}>open till 6 PM</div>
          </div>
        </div>
      </div>

      <div style={{ padding: '16px 20px 0' }}>
        <div onClick={vm.openBrandSheet} style={{ background: 'var(--ac)', color: '#fff', borderRadius: 14, padding: 16, textAlign: 'center', font: "700 15px 'Manrope'", cursor: 'pointer', boxShadow: '0 8px 18px rgba(0,0,0,.14)' }}>
          Book your car in →
        </div>
      </div>

      <div style={{ padding: '18px 20px 0', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 7, opacity: 0.6 }}>
        <svg width="13" height="13" viewBox="0 0 24 24" fill="none">
          <path d="M12 3l7 3v5c0 4.5-3 7.5-7 9-4-1.5-7-4.5-7-9V6z" stroke="#6B756F" strokeWidth="2" strokeLinejoin="round" />
        </svg>
        <span style={{ font: "500 11px 'Space Mono'", color: '#6B756F' }}>Powered by AutoCheck · {vm.brandDomain}</span>
      </div>
    </div>
  )
}
