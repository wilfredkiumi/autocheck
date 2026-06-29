import type { VM } from '@/lib/state'

export function Owner({ vm }: { vm: VM }) {
  return (
    <div style={{ position: 'absolute', inset: 0, display: 'flex', flexDirection: 'column' }}>
      {/* header */}
      <div style={{ padding: '58px 20px 14px', background: '#fff', borderBottom: '1px solid #ECF0EE', display: 'flex', alignItems: 'center', gap: 10 }}>
        <div style={{ width: 34, height: 34, borderRadius: 9, background: 'var(--ac)', color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', font: "800 14px 'Archivo'" }}>{vm.brandMark}</div>
        <div style={{ flex: 1 }}>
          <div style={{ font: "800 16px 'Archivo'" }}>{vm.brandShort}</div>
          <div style={{ font: "500 11px 'Manrope'", color: '#7B857F' }}>Garage dashboard</div>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 6, background: 'var(--acs)', padding: '6px 10px', borderRadius: 9 }}>
          <span className="pdot" style={{ width: 7, height: 7, borderRadius: '50%', background: 'var(--ac)' }} />
          <span style={{ font: "700 11px 'Manrope'", color: 'var(--acd)' }}>{vm.acceptingLabel}</span>
        </div>
      </div>

      <div className="phscroll" style={{ flex: 1, overflowY: 'auto', background: '#F6F8F7' }}>
        {/* BOOKINGS TAB */}
        {vm.ownerBookings && (
          <div className="scr" style={{ padding: '16px 20px 20px' }}>
            <div style={{ display: 'flex', gap: 9, marginBottom: 16 }}>
              <div style={{ flex: 1, background: '#fff', border: '1px solid #E2E8E5', borderRadius: 13, padding: 13 }}>
                <div style={{ font: "800 22px 'Archivo'", color: 'var(--ac)' }}>{vm.todayCount}</div>
                <div style={{ font: "400 11px 'Manrope'", color: '#7B857F', marginTop: 2 }}>bookings today</div>
              </div>
              <div style={{ flex: 1, background: '#fff', border: '1px solid #E2E8E5', borderRadius: 13, padding: 13 }}>
                <div style={{ font: "800 22px 'Archivo'" }}>{vm.baysUsed}</div>
                <div style={{ font: "400 11px 'Manrope'", color: '#7B857F', marginTop: 2 }}>of {vm.baysTotal} bays booked</div>
              </div>
              <div style={{ flex: 1, background: '#fff', border: '1px solid #E2E8E5', borderRadius: 13, padding: 13 }}>
                <div style={{ font: "800 22px 'Archivo'", color: '#C2410C' }}>{vm.newCount}</div>
                <div style={{ font: "400 11px 'Manrope'", color: '#7B857F', marginTop: 2 }}>need confirming</div>
              </div>
            </div>
            <div style={{ font: "700 13px 'Archivo'", marginBottom: 11 }}>Today's bookings</div>
            {vm.bookings.map((b, i) => (
              <div key={i} style={{ background: '#fff', border: '1px solid #E2E8E5', borderLeft: `4px solid ${b.bar}`, borderRadius: 14, padding: 14, marginBottom: 11 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                  <div style={{ width: 46, textAlign: 'center', flex: 'none' }}>
                    <div style={{ font: "800 14px 'Archivo'", color: 'var(--ac)' }}>{b.time}</div>
                    <div style={{ font: "400 9px 'Manrope'", color: '#9AA6A0' }}>{b.ampm}</div>
                  </div>
                  <div style={{ width: 1, alignSelf: 'stretch', background: '#ECF0EE' }} />
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ font: "700 14px 'Manrope'" }}>{b.name}</div>
                    <div style={{ font: "400 12px 'Manrope'", color: '#7B857F' }}>{b.car}</div>
                  </div>
                  <span style={{ font: "700 10px 'Manrope'", background: b.pillBg, color: b.pillFg, padding: '5px 9px', borderRadius: 7, flex: 'none' }}>{b.status}</span>
                </div>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: 5, marginTop: 11 }}>
                  {b.issues.map((ic, j) => (
                    <span key={j} style={{ font: "600 10px 'Manrope'", background: '#F2F5F3', color: '#33403A', padding: '3px 8px', borderRadius: 6 }}>{ic}</span>
                  ))}
                  {b.photo && (
                    <span style={{ font: "600 10px 'Manrope'", background: 'var(--acs)', color: 'var(--acd)', padding: '3px 8px', borderRadius: 6 }}>📷 photo</span>
                  )}
                </div>
                <div style={{ marginTop: 10, background: '#F8FAF9', borderRadius: 10, padding: '10px 11px', display: 'flex', gap: 8 }}>
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" style={{ flex: 'none', marginTop: 1 }}>
                    <path d="M12 3l1.6 4.4L18 9l-4.4 1.6L12 15l-1.6-4.4L6 9l4.4-1.6z" fill="var(--ac)" />
                  </svg>
                  <div style={{ font: "400 12px 'Manrope'", color: '#5A645E', lineHeight: 1.45 }}>{b.summary}</div>
                </div>
                {b.isNew && (
                  <div style={{ display: 'flex', gap: 8, marginTop: 11 }}>
                    <div onClick={b.confirm} style={{ flex: 1, textAlign: 'center', background: 'var(--ac)', color: '#fff', borderRadius: 10, padding: 10, font: "700 12px 'Manrope'", cursor: 'pointer' }}>Confirm slot</div>
                    <div style={{ flex: 'none', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6, background: '#fff', border: '1px solid #E2E8E5', borderRadius: 10, padding: '10px 13px', font: "600 12px 'Manrope'", color: '#33403A', cursor: 'pointer' }}>Call</div>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}

        {/* AVAILABILITY TAB */}
        {vm.ownerHours && (
          <div className="scr" style={{ padding: '16px 20px 20px' }}>
            <div style={{ background: '#fff', border: '1px solid #E2E8E5', borderRadius: 14, padding: 16, marginBottom: 14, display: 'flex', alignItems: 'center', gap: 12 }}>
              <div style={{ flex: 1 }}>
                <div style={{ font: "700 14px 'Manrope'" }}>Accepting bookings</div>
                <div style={{ font: "400 12px 'Manrope'", color: '#7B857F', marginTop: 2 }}>Turn off when the yard is full</div>
              </div>
              <div onClick={vm.toggleAccepting} style={{ width: 48, height: 28, borderRadius: 16, background: vm.acceptingBg, position: 'relative', cursor: 'pointer', transition: 'background .2s' }}>
                <span style={{ position: 'absolute', top: 3, left: vm.acceptingX, width: 22, height: 22, borderRadius: '50%', background: '#fff', boxShadow: '0 1px 3px rgba(0,0,0,.2)', transition: 'left .2s' }} />
              </div>
            </div>
            <div style={{ background: '#fff', border: '1px solid #E2E8E5', borderRadius: 14, padding: 16, marginBottom: 14 }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <div>
                  <div style={{ font: "700 14px 'Manrope'" }}>Working bays</div>
                  <div style={{ font: "400 12px 'Manrope'", color: '#7B857F', marginTop: 2 }}>How many cars at once</div>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
                  <div onClick={vm.baysDown} style={{ width: 32, height: 32, borderRadius: 9, background: '#F2F5F3', display: 'flex', alignItems: 'center', justifyContent: 'center', font: "700 18px 'Manrope'", color: '#33403A', cursor: 'pointer' }}>−</div>
                  <span style={{ font: "800 20px 'Archivo'", width: 18, textAlign: 'center' }}>{vm.baysTotal}</span>
                  <div onClick={vm.baysUp} style={{ width: 32, height: 32, borderRadius: 9, background: 'var(--acs)', display: 'flex', alignItems: 'center', justifyContent: 'center', font: "700 18px 'Manrope'", color: 'var(--ac)', cursor: 'pointer' }}>+</div>
                </div>
              </div>
            </div>
            <div style={{ font: "700 13px 'Archivo'", marginBottom: 11 }}>Service durations</div>
            <div style={{ background: '#fff', border: '1px solid #E2E8E5', borderRadius: 14, padding: '4px 16px', marginBottom: 8 }}>
              {vm.ownerServices.map((sv, i) => (
                <div key={i} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '12px 0', borderBottom: '1px solid #F0F3F1' }}>
                  <span style={{ font: "600 13px 'Manrope'", color: '#33403A' }}>{sv.label}</span>
                  <div onClick={sv.onClick} style={{ font: "700 12px 'Manrope'", color: 'var(--acd)', background: 'var(--acs)', padding: '6px 13px', borderRadius: 8, cursor: 'pointer', minWidth: 62, textAlign: 'center' }}>{sv.dur}</div>
                </div>
              ))}
            </div>
            <div style={{ font: "400 12px 'Manrope'", color: '#7B857F', lineHeight: 1.5, marginBottom: 18 }}>
              Tap a duration to adjust. Each booking blocks this much bay-time — so drivers only see slots that actually fit, and you don't get double-booked.
            </div>

            <div style={{ font: "700 13px 'Archivo'", marginBottom: 11 }}>Today's slots</div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 9, marginBottom: 14 }}>
              {vm.ownerSlots.map((s, i) => (
                <div key={i} onClick={s.onClick} style={{ background: s.bg, border: `1px solid ${s.bd}`, borderRadius: 11, padding: '11px 13px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', cursor: 'pointer' }}>
                  <span style={{ font: "700 13px 'Manrope'", color: s.fg }}>{s.time}</span>
                  <span style={{ font: "600 10px 'Manrope'", color: s.tagfg }}>{s.tag}</span>
                </div>
              ))}
            </div>
            <div style={{ font: "400 12px 'Manrope'", color: '#7B857F', lineHeight: 1.5 }}>
              Tap a free slot to block it (lunch, parts run). Booked slots are held for drivers.
            </div>
          </div>
        )}

        {/* SETTINGS TAB */}
        {vm.ownerSettings && (
          <div className="scr" style={{ padding: '16px 20px 20px' }}>
            <div style={{ font: "700 13px 'Archivo'", marginBottom: 11 }}>Your booking link</div>
            <div style={{ background: '#fff', border: '1px solid #E2E8E5', borderRadius: 14, padding: 16, marginBottom: 14 }}>
              <div style={{ display: 'flex', gap: 14, alignItems: 'center' }}>
                <div style={{ width: 84, height: 84, borderRadius: 12, background: '#0F1A14', flex: 'none', padding: 9 }}>
                  <div style={{ width: '100%', height: '100%', borderRadius: 4, backgroundImage: 'radial-gradient(#fff 38%,transparent 40%)', backgroundSize: '9px 9px', position: 'relative' }}>
                    <span style={{ position: 'absolute', top: 0, left: 0, width: 22, height: 22, border: '4px solid #fff', borderRadius: 4 }} />
                    <span style={{ position: 'absolute', top: 0, right: 0, width: 22, height: 22, border: '4px solid #fff', borderRadius: 4 }} />
                    <span style={{ position: 'absolute', bottom: 0, left: 0, width: 22, height: 22, border: '4px solid #fff', borderRadius: 4 }} />
                  </div>
                </div>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ font: "700 13px 'Manrope'" }}>QR for your gate</div>
                  <div style={{ font: "400 12px 'Manrope'", color: '#7B857F', marginTop: 3, lineHeight: 1.4 }}>Print &amp; stick it up. Drivers scan to book straight in.</div>
                </div>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 9, marginTop: 14, background: '#F2F5F3', borderRadius: 10, padding: '11px 13px' }}>
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none">
                  <path d="M10 14a4 4 0 005.7 0l3-3a4 4 0 00-5.7-5.7L11 7" stroke="#7B857F" strokeWidth="2" strokeLinecap="round" />
                  <path d="M14 10a4 4 0 00-5.7 0l-3 3a4 4 0 005.7 5.7L13 17" stroke="#7B857F" strokeWidth="2" strokeLinecap="round" />
                </svg>
                <span style={{ flex: 1, font: "600 12px 'Space Mono'", color: '#33403A', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{vm.brandDomain}</span>
                <div onClick={vm.copyLink} style={{ font: "700 12px 'Manrope'", color: '#fff', background: 'var(--ac)', padding: '7px 12px', borderRadius: 8, cursor: 'pointer' }}>{vm.copyLabel}</div>
              </div>
            </div>
            <div style={{ font: "700 13px 'Archivo'", marginBottom: 11 }}>Branding</div>
            <div style={{ background: '#fff', border: '1px solid #E2E8E5', borderRadius: 14, padding: 16, marginBottom: 14, display: 'flex', alignItems: 'center', gap: 12 }}>
              <div style={{ width: 42, height: 42, borderRadius: 11, background: 'var(--ac)', color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', font: "800 16px 'Archivo'" }}>{vm.brandMark}</div>
              <div style={{ flex: 1 }}>
                <div style={{ font: "700 13px 'Manrope'" }}>{vm.brandName}</div>
                <div style={{ font: "400 11px 'Manrope'", color: '#7B857F' }}>Logo &amp; colour on your booking page</div>
              </div>
              <div style={{ width: 26, height: 26, borderRadius: 7, background: 'var(--ac)', border: '2px solid #fff', boxShadow: '0 0 0 1px #E2E8E5' }} />
            </div>
            <div style={{ font: "700 13px 'Archivo'", marginBottom: 11 }}>Subscription</div>
            <div style={{ background: 'linear-gradient(150deg,var(--ac),var(--acd))', borderRadius: 16, padding: 18, color: '#fff' }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <span style={{ font: "800 17px 'Archivo'" }}>{vm.planName}</span>
                <span style={{ font: "700 14px 'Manrope'" }}>{vm.planPrice}</span>
              </div>
              <div style={{ height: 1, background: 'rgba(255,255,255,.25)', margin: '13px 0' }} />
              {vm.planFeatures.map((f, i) => (
                <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 7 }}>
                  <svg width="15" height="15" viewBox="0 0 24 24" fill="none">
                    <path d="M5 12.5l4 4L19 7" stroke="#fff" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                  <span style={{ font: "500 13px 'Manrope'" }}>{f}</span>
                </div>
              ))}
              <div style={{ marginTop: 12, background: 'rgba(255,255,255,.16)', border: '1px solid rgba(255,255,255,.3)', borderRadius: 11, padding: 11, textAlign: 'center', font: "700 13px 'Manrope'", cursor: 'pointer' }}>Manage plan</div>
            </div>
          </div>
        )}
      </div>

      {/* OWNER TAB BAR */}
      <div style={{ display: 'flex', background: '#fff', borderTop: '1px solid #ECF0EE', padding: '9px 12px 22px' }}>
        <div onClick={vm.tabBookings} style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 4, cursor: 'pointer' }}>
          <svg width="22" height="22" viewBox="0 0 24 24" fill="none">
            <rect x="4" y="4" width="16" height="16" rx="3" stroke={vm.tabBookingsCol} strokeWidth="2" />
            <path d="M8 9h8M8 13h8M8 17h5" stroke={vm.tabBookingsCol} strokeWidth="2" strokeLinecap="round" />
          </svg>
          <span style={{ font: "600 10px 'Manrope'", color: vm.tabBookingsCol }}>Bookings</span>
        </div>
        <div onClick={vm.tabHours} style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 4, cursor: 'pointer' }}>
          <svg width="22" height="22" viewBox="0 0 24 24" fill="none">
            <circle cx="12" cy="12" r="9" stroke={vm.tabHoursCol} strokeWidth="2" />
            <path d="M12 7v5l3 2" stroke={vm.tabHoursCol} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
          <span style={{ font: "600 10px 'Manrope'", color: vm.tabHoursCol }}>Availability</span>
        </div>
        <div onClick={vm.tabSettings} style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 4, cursor: 'pointer' }}>
          <svg width="22" height="22" viewBox="0 0 24 24" fill="none">
            <circle cx="12" cy="12" r="3" stroke={vm.tabSettingsCol} strokeWidth="2" />
            <path d="M19 12a7 7 0 00-.1-1l2-1.5-2-3.5-2.4 1a7 7 0 00-1.7-1l-.3-2.5h-4l-.3 2.5a7 7 0 00-1.7 1l-2.4-1-2 3.5 2 1.5a7 7 0 000 2l-2 1.5 2 3.5 2.4-1a7 7 0 001.7 1l.3 2.5h4l.3-2.5a7 7 0 001.7-1l2.4 1 2-3.5-2-1.5a7 7 0 00.1-1z" stroke={vm.tabSettingsCol} strokeWidth="1.6" strokeLinejoin="round" />
          </svg>
          <span style={{ font: "600 10px 'Manrope'", color: vm.tabSettingsCol }}>Settings</span>
        </div>
      </div>
    </div>
  )
}
