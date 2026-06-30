import type { VM } from '@/lib/state'
import { BackButton } from '@/components/icons'

const bottomCta: React.CSSProperties = {
  position: 'absolute',
  left: 0,
  right: 0,
  bottom: 0,
  padding: '14px 20px 24px',
  background: 'linear-gradient(to top,#F6F8F7 72%,transparent)',
}

export function Detail({ vm }: { vm: VM }) {
  const g = vm.g
  return (
    <div className="scr phscroll" style={{ position: 'absolute', inset: 0, padding: '58px 0 96px', overflowY: 'auto', color: '#0F1A14' }}>
      <div style={{ padding: '0 20px', display: 'flex', alignItems: 'center', gap: 12, marginBottom: 16 }}>
        <BackButton onClick={vm.back} />
        <span style={{ font: "600 13px 'Manrope'", color: '#7B857F' }}>{vm.detailKicker}</span>
      </div>
      <div style={{ padding: '0 20px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 7 }}>
          <span style={{ font: "800 23px 'Archivo'" }}>{g.name}</span>
          <svg width="19" height="19" viewBox="0 0 24 24" fill="var(--ac)">
            <path d="M12 2l2.2 1.6 2.7-.2 1 2.5 2.3 1.4-.7 2.6.7 2.6-2.3 1.4-1 2.5-2.7-.2L12 22l-2.2-1.6-2.7.2-1-2.5L3.8 16.3l.7-2.6-.7-2.6 2.3-1.4 1-2.5 2.7.2z" />
            <path d="M9 12l2 2 4-4" stroke="#fff" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        </div>
        <div style={{ font: "400 13px 'Manrope'", color: '#7B857F', marginTop: 2 }}>
          {g.area} · {g.dist} · open till 6 PM
        </div>
      </div>

      <div style={{ margin: '16px 20px 0', background: '#fff', border: '1px solid #E2E8E5', borderRadius: 16, padding: 16 }}>
        <div style={{ font: "700 11px 'Space Mono'", color: '#7B857F', letterSpacing: '.06em', marginBottom: 11 }}>WHY YOU CAN TRUST THEM</div>
        {g.isVerifiedMode && (
          <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 13 }}>
            <div style={{ width: 34, height: 34, borderRadius: 10, background: 'var(--acs)', display: 'flex', alignItems: 'center', justifyContent: 'center', flex: 'none' }}>
              <svg width="19" height="19" viewBox="0 0 24 24" fill="none">
                <path d="M12 3l7 3v5c0 4.5-3 7.5-7 9-4-1.5-7-4.5-7-9V6z" stroke="var(--ac)" strokeWidth="2" strokeLinejoin="round" />
                <path d="M9.5 12l1.8 1.8L15 10" stroke="var(--ac)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </div>
            <div style={{ font: "500 13px 'Manrope'", color: '#33403A', lineHeight: 1.4 }}>{g.circleText}</div>
          </div>
        )}
        {g.isCircleMode && (
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
        )}
        <div style={{ background: '#F4F7F5', borderRadius: 12, padding: 13 }}>
          <div style={{ color: '#E8A33A', fontSize: 13, marginBottom: 6 }}>★★★★★</div>
          <div style={{ font: "400 13px 'Manrope'", color: '#33403A', lineHeight: 1.55 }}>"{g.quote}"</div>
          <div style={{ font: "600 11px 'Manrope'", color: '#7B857F', marginTop: 8 }}>— {g.quoteBy}</div>
        </div>
      </div>

      <div style={{ margin: '14px 20px 0', background: '#fff', border: '1px solid #E2E8E5', borderRadius: 16, padding: 16 }}>
        <div style={{ font: "700 11px 'Space Mono'", color: '#7B857F', letterSpacing: '.06em', marginBottom: 11 }}>VERIFIED</div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 9 }}>
          {[
            'NTSA-approved inspection centre',
            'Written quote before any work begins',
            'Pay by M-Pesa — receipt every time',
          ].map((t, i) => (
            <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 9 }}>
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
                <path d="M5 12.5l4 4L19 7" stroke="var(--ac)" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
              <span style={{ font: "500 13px 'Manrope'", color: '#33403A' }}>{t}</span>
            </div>
          ))}
        </div>
      </div>

      <div style={{ margin: '14px 20px 0', background: 'var(--acs)', borderRadius: 14, padding: 14, display: 'flex', alignItems: 'center', gap: 11 }}>
        <span className="pdot" style={{ width: 10, height: 10, borderRadius: '50%', background: 'var(--ac)', display: 'inline-block', flex: 'none' }} />
        <div style={{ font: "600 13px 'Manrope'", color: 'var(--acd)' }}>Next opening {g.next}</div>
        <span style={{ marginLeft: 'auto', font: "400 12px 'Manrope'", color: '#5A645E' }}>{g.bays} bays</span>
      </div>

      <div style={bottomCta}>
        <div onClick={vm.toIssue} style={{ background: 'var(--ac)', color: '#fff', borderRadius: 14, padding: 16, textAlign: 'center', font: "700 15px 'Manrope'", cursor: 'pointer', boxShadow: '0 8px 18px rgba(0,0,0,.14)' }}>
          Book your car in →
        </div>
      </div>
    </div>
  )
}

export function Issue({ vm }: { vm: VM }) {
  return (
    <div className="scr phscroll" style={{ position: 'absolute', inset: 0, padding: '58px 20px 96px', overflowY: 'auto', color: '#0F1A14' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 14 }}>
        <BackButton onClick={vm.back} />
        <span style={{ font: "600 13px 'Manrope'", color: '#7B857F' }}>Step 1 of 2 · {vm.g.name}</span>
      </div>
      <div style={{ display: 'flex', gap: 5, marginBottom: 16 }}>
        <div style={{ flex: 1, height: 4, borderRadius: 2, background: 'var(--ac)' }} />
        <div style={{ flex: 1, height: 4, borderRadius: 2, background: '#DCE5E0' }} />
      </div>
      <div style={{ font: "800 22px 'Archivo'", marginBottom: 4 }}>What needs attention?</div>
      <div style={{ font: "400 13px 'Manrope'", color: '#7B857F', marginBottom: 16 }}>
        Tell them now so the right bay and parts are ready when you arrive.
      </div>
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8, marginBottom: 18 }}>
        {vm.issues.map((it, i) => (
          <div key={i} onClick={it.onClick} style={{ font: "600 13px 'Manrope'", padding: '9px 14px', borderRadius: 11, cursor: 'pointer', border: `1px solid ${it.bd}`, background: it.bg, color: it.fg }}>
            {it.name}
          </div>
        ))}
      </div>

      <div style={{ font: "700 12px 'Space Mono'", color: '#7B857F', letterSpacing: '.06em', marginBottom: 8 }}>DESCRIBE IT</div>
      <textarea
        value={vm.note}
        onChange={vm.onNote}
        placeholder="e.g. Knocking from front-left when braking; steering pulls to one side…"
        style={{ width: '100%', height: 84, resize: 'none', background: '#fff', border: '1px solid #E2E8E5', borderRadius: 13, padding: 13, color: '#0F1A14', font: "400 13px 'Manrope'", outline: 'none' }}
      />

      <div style={{ display: 'flex', gap: 8, marginTop: 11 }}>
        <label style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8, background: '#fff', border: '1px solid #E2E8E5', borderRadius: 12, padding: 13, cursor: 'pointer' }}>
          <svg width="17" height="17" viewBox="0 0 24 24" fill="none">
            <rect x="3" y="6" width="18" height="13" rx="2" stroke="var(--ac)" strokeWidth="2" />
            <circle cx="12" cy="12.5" r="3.2" stroke="var(--ac)" strokeWidth="2" />
            <path d="M8 6l1.5-2h5L16 6" stroke="var(--ac)" strokeWidth="2" strokeLinejoin="round" />
          </svg>
          <span style={{ font: "600 13px 'Manrope'", color: '#33403A' }}>Photo</span>
          <input type="file" accept="image/*" capture="environment" multiple onChange={vm.onPhoto} style={{ display: 'none' }} />
        </label>
        {vm.voiceIdle && (
          <div onClick={vm.startRec} style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8, background: '#fff', border: '1px solid #E2E8E5', borderRadius: 12, padding: 13, cursor: 'pointer' }}>
            <svg width="17" height="17" viewBox="0 0 24 24" fill="none">
              <rect x="9" y="3" width="6" height="11" rx="3" stroke="var(--ac)" strokeWidth="2" />
              <path d="M6 11a6 6 0 0012 0M12 17v3" stroke="var(--ac)" strokeWidth="2" strokeLinecap="round" />
            </svg>
            <span style={{ font: "600 13px 'Manrope'", color: '#33403A' }}>Voice</span>
          </div>
        )}
        {vm.recording && (
          <div onClick={vm.stopRec} style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8, background: '#FBE9E7', border: '1px solid #F0B7AE', borderRadius: 12, padding: 13, cursor: 'pointer' }}>
            <span style={{ width: 10, height: 10, borderRadius: 2, background: '#D7382B', animation: 'recpulse 1s infinite' }} />
            <span style={{ font: "700 13px 'Space Mono'", color: '#B2261B' }}>{vm.recTime}</span>
            <span style={{ font: "600 12px 'Manrope'", color: '#B2261B' }}>Stop</span>
          </div>
        )}
      </div>

      {vm.hasVoice && (
        <div style={{ marginTop: 9, display: 'flex', alignItems: 'center', gap: 10, background: 'var(--acs)', border: '1px solid var(--ac)', borderRadius: 12, padding: '11px 13px' }}>
          <div style={{ width: 30, height: 30, borderRadius: '50%', background: 'var(--ac)', display: 'flex', alignItems: 'center', justifyContent: 'center', flex: 'none' }}>
            <svg width="13" height="13" viewBox="0 0 24 24" fill="#fff"><path d="M8 5v14l11-7z" /></svg>
          </div>
          <div style={{ display: 'flex', alignItems: 'flex-end', gap: 2, height: 20, flex: 1 }}>
            {[9, 15, 7, 17, 11, 14, 8].map((h, i) => (
              <span key={i} style={{ width: 3, height: h, background: 'var(--ac)', borderRadius: 2, animation: `wave 1s ease-in-out ${[0, 0.1, 0.2, 0.3, 0.15, 0.25, 0.05][i]}s infinite` }} />
            ))}
          </div>
          <span style={{ font: "700 12px 'Space Mono'", color: 'var(--acd)' }}>{vm.voiceTime}</span>
          <div onClick={vm.delVoice} style={{ cursor: 'pointer', color: '#9AA6A0', fontSize: 16, padding: '0 2px' }}>✕</div>
        </div>
      )}

      {vm.hasPhotos && (
        <div style={{ display: 'flex', gap: 8, marginTop: 9, flexWrap: 'wrap' }}>
          {vm.photoItems.map((p, i) => (
            <div key={i} style={{ position: 'relative', width: 62, height: 62, borderRadius: 11, overflow: 'hidden', border: '1px solid #E2E8E5', backgroundImage: p.bg, backgroundSize: 'cover', backgroundPosition: 'center' }}>
              <div onClick={p.onRemove} style={{ position: 'absolute', top: 3, right: 3, width: 18, height: 18, borderRadius: '50%', background: 'rgba(0,0,0,.6)', color: '#fff', fontSize: 11, display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer' }}>✕</div>
            </div>
          ))}
        </div>
      )}

      <div onClick={vm.runAI} style={{ marginTop: 11, display: 'flex', alignItems: 'center', gap: 10, background: 'var(--acs)', border: '1px solid var(--ac)', borderRadius: 13, padding: 13, cursor: 'pointer' }}>
        {vm.aiLoading && (
          <div className="spin" style={{ width: 18, height: 18, borderRadius: '50%', border: '2.5px solid var(--acs)', borderTopColor: 'var(--ac)', flex: 'none' }} />
        )}
        {vm.aiIdleIcon && (
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
            <path d="M12 3l1.6 4.4L18 9l-4.4 1.6L12 15l-1.6-4.4L6 9l4.4-1.6z" fill="var(--ac)" />
            <circle cx="18" cy="17" r="1.6" fill="var(--ac)" />
          </svg>
        )}
        <div style={{ flex: 1 }}>
          <div style={{ font: "700 13px 'Manrope'", color: '#0F1A14' }}>{vm.aiBtnTitle}</div>
          <div style={{ font: "400 12px 'Manrope'", color: '#5A645E' }}>AI helps you put it into words clearly</div>
        </div>
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
          <path d="M9 6l6 6-6 6" stroke="var(--ac)" strokeWidth="2" strokeLinecap="round" />
        </svg>
      </div>
      {vm.aiDone && (
        <div style={{ marginTop: 11, background: '#fff', border: '1px solid var(--ac)', borderRadius: 13, padding: 13 }}>
          <div style={{ font: "700 11px 'Space Mono'", color: 'var(--acd)', letterSpacing: '.06em', marginBottom: 6 }}>YOUR DESCRIPTION</div>
          <div style={{ font: "400 13px 'Manrope'", color: '#33403A', lineHeight: 1.55 }}>{vm.aiText}</div>
        </div>
      )}

      <div style={bottomCta}>
        <div onClick={vm.toSlot} style={{ background: 'var(--ac)', color: '#fff', borderRadius: 14, padding: 16, textAlign: 'center', font: "700 15px 'Manrope'", cursor: 'pointer' }}>
          Choose your slot →
        </div>
      </div>
    </div>
  )
}

export function Slot({ vm }: { vm: VM }) {
  return (
    <div className="scr phscroll" style={{ position: 'absolute', inset: 0, padding: '58px 20px 110px', overflowY: 'auto', color: '#0F1A14' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 14 }}>
        <BackButton onClick={vm.back} />
        <span style={{ font: "600 13px 'Manrope'", color: '#7B857F' }}>Step 2 of 2</span>
      </div>
      <div style={{ display: 'flex', gap: 5, marginBottom: 16 }}>
        <div style={{ flex: 1, height: 4, borderRadius: 2, background: 'var(--ac)' }} />
        <div style={{ flex: 1, height: 4, borderRadius: 2, background: 'var(--ac)' }} />
      </div>
      <div style={{ font: "800 22px 'Archivo'", marginBottom: 4 }}>Reserve your spot</div>
      <div style={{ font: "400 13px 'Manrope'", color: '#7B857F', marginBottom: 14 }}>
        A bay is held in your name — drive in and skip the wait.
      </div>

      <div style={{ background: 'var(--acs)', borderRadius: 13, padding: '13px 14px', marginBottom: 14 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <svg width="17" height="17" viewBox="0 0 24 24" fill="none" style={{ flex: 'none' }}>
            <circle cx="12" cy="12" r="9" stroke="var(--acd)" strokeWidth="2" />
            <path d="M12 7v5l3 2" stroke="var(--acd)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
          <span style={{ font: "700 13px 'Manrope'", color: 'var(--acd)' }}>Estimated time in bay: {vm.durWindow}</span>
        </div>
        <div style={{ font: "400 12px 'Manrope'", color: 'var(--acd)', opacity: 0.82, marginTop: 5, lineHeight: 1.4 }}>
          Based on what you described — the garage confirms the exact time once they inspect.
        </div>
      </div>

      <div style={{ font: "700 12px 'Space Mono'", color: '#7B857F', letterSpacing: '.06em', marginBottom: 8 }}>WAIT OR LEAVE IT?</div>
      <div style={{ display: 'flex', gap: 8, marginBottom: 6 }}>
        <div onClick={vm.setWait} style={{ flex: 1, textAlign: 'center', borderRadius: 11, padding: 12, font: "700 12.5px 'Manrope'", border: `1px solid ${vm.waitPillBd}`, background: vm.waitPillBg, color: vm.waitPillFg, cursor: 'pointer' }}>
          I'll wait for it
        </div>
        <div onClick={vm.setDrop} style={{ flex: 1, textAlign: 'center', borderRadius: 11, padding: 12, font: "700 12.5px 'Manrope'", border: `1px solid ${vm.dropPillBd}`, background: vm.dropPillBg, color: vm.dropPillFg, cursor: 'pointer' }}>
          Leave the car
        </div>
      </div>
      {vm.waitNoteShow && (
        <div style={{ font: "400 11px 'Manrope'", color: '#7B857F', marginBottom: 14, lineHeight: 1.4 }}>{vm.waitNote}</div>
      )}

      <div style={{ font: "700 12px 'Space Mono'", color: '#7B857F', letterSpacing: '.06em', margin: '6px 0 9px' }}>PICK A TIME</div>
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 9, marginBottom: 8 }}>
        {vm.slots.map((sl, i) => (
          <div key={i} onClick={sl.onClick} style={{ background: sl.bg, border: `1px solid ${sl.bd}`, borderRadius: 13, padding: 14, cursor: 'pointer' }}>
            <div style={{ font: "700 11px 'Manrope'", color: '#7B857F', textTransform: 'uppercase', letterSpacing: '.04em' }}>{sl.day}</div>
            <div style={{ font: "800 17px 'Archivo'", color: sl.fg, marginTop: 3 }}>{sl.time}</div>
            <div style={{ font: "400 11px 'Manrope'", color: '#7B857F', marginTop: 4 }}>{sl.note}</div>
          </div>
        ))}
      </div>

      <div style={{ marginTop: 10, background: '#fff', border: '1px solid #E2E8E5', borderRadius: 14, padding: 16 }}>
        <div style={{ font: "700 11px 'Space Mono'", color: '#7B857F', letterSpacing: '.06em', marginBottom: 11 }}>ESTIMATED COST</div>
        <div style={{ display: 'flex', justifyContent: 'space-between', font: "400 13px 'Manrope'", color: '#33403A', marginBottom: 7 }}>
          <span>Inspection</span><span>KSh 500</span>
        </div>
        <div style={{ display: 'flex', justifyContent: 'space-between', font: "400 13px 'Manrope'", color: '#33403A', marginBottom: 7 }}>
          <span>Labour (est.)</span><span>KSh 1,500–3,000</span>
        </div>
        <div style={{ display: 'flex', justifyContent: 'space-between', font: "400 13px 'Manrope'", color: '#33403A' }}>
          <span>Parts</span><span>confirmed after check</span>
        </div>
        <div style={{ height: 1, background: '#EDF1EF', margin: '12px 0' }} />
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <span style={{ font: "700 14px 'Archivo'" }}>Likely total</span>
          <span style={{ font: "800 18px 'Archivo'", color: 'var(--ac)' }}>KSh 2,000–3,500</span>
        </div>
        <div style={{ font: "400 11px 'Manrope'", color: '#7B857F', marginTop: 8 }}>
          No deposit to book — pay at the garage after you approve the written quote.
        </div>
      </div>

      <div style={bottomCta}>
        {vm.needSignIn && (
          <a
            href="/login"
            style={{ display: 'block', textDecoration: 'none', background: '#FBEAE1', border: '1px solid #F2D2C2', color: '#9A330A', borderRadius: 11, padding: '10px 12px', marginBottom: 9, font: "600 12.5px 'Manrope'", lineHeight: 1.4 }}
          >
            Verify your phone via WhatsApp to lock this car to your account and hold your bay.
          </a>
        )}
        {vm.bookingError && (
          <div style={{ background: '#FBEAE1', border: '1px solid #F2D2C2', color: '#9A330A', borderRadius: 11, padding: '10px 12px', marginBottom: 9, font: "600 12.5px 'Manrope'", lineHeight: 1.4 }}>
            {vm.bookingError}
          </div>
        )}
        <div
          onClick={vm.submitBooking}
          style={{ background: vm.cta1bg, color: vm.cta1fg, borderRadius: 14, padding: 16, textAlign: 'center', font: "700 15px 'Manrope'", cursor: vm.submitting ? 'default' : 'pointer', opacity: vm.submitting ? 0.85 : 1 }}
        >
          {vm.cta1}
        </div>
      </div>
    </div>
  )
}

export function Done({ vm }: { vm: VM }) {
  return (
    <div className="scr phscroll" style={{ position: 'absolute', inset: 0, padding: '58px 20px 18px', overflowY: 'auto', color: '#0F1A14' }}>
      <div style={{ textAlign: 'center', padding: '18px 0 8px' }}>
        <div style={{ width: 76, height: 76, borderRadius: '50%', background: 'var(--ac)', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 14px' }}>
          <svg width="38" height="38" viewBox="0 0 24 24" fill="none">
            <path d="M5 12.5l4.5 4.5L19 7" stroke="#fff" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        </div>
        <div style={{ font: "800 23px 'Archivo'" }}>Your bay is reserved</div>
        <div style={{ font: "400 13px 'Manrope'", color: '#7B857F', marginTop: 4 }}>
          {vm.g.name} · {vm.slotLabel}{vm.plate ? ` · ${vm.plate}` : ''}
        </div>
        {vm.bookingRef && (
          <div style={{ display: 'inline-block', marginTop: 8, font: "700 12px 'Space Mono'", color: 'var(--acd)', background: 'var(--acs)', borderRadius: 999, padding: '4px 12px' }}>
            Ref #{vm.bookingRef}
          </div>
        )}
      </div>
      <div style={{ background: 'var(--acs)', borderRadius: 14, padding: '13px 15px', marginTop: 6, display: 'flex', flexDirection: 'column', gap: 8 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" style={{ flex: 'none' }}>
            <path d="M5 12.5l4 4L19 7" stroke="var(--acd)" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
          <div style={{ font: "500 12px 'Manrope'", color: 'var(--acd)' }}>Drive straight in — no queue. They've seen your issue already.</div>
        </div>
        {vm.plate && (
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" style={{ flex: 'none' }}>
              <path d="M12 3l7 3v5c0 4.5-3 7.5-7 9-4-1.5-7-4.5-7-9V6z" stroke="var(--acd)" strokeWidth="2" strokeLinejoin="round" />
              <path d="M9.5 12l1.8 1.8L15 10" stroke="var(--acd)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
            <div style={{ font: "500 12px 'Manrope'", color: 'var(--acd)' }}>
              {vm.plate} is linked to your verified account — track all bookings for this car.
            </div>
          </div>
        )}
      </div>
      <div style={{ background: '#fff', border: '1px solid #E2E8E5', borderRadius: 14, padding: 16, marginTop: 13 }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 4 }}>
          <span style={{ font: "700 11px 'Space Mono'", color: '#7B857F', letterSpacing: '.06em' }}>LIVE STATUS</span>
          <span style={{ font: "500 11px 'Space Mono'", color: 'var(--ac)' }}>#AG-4821</span>
        </div>
        <div style={{ marginTop: 14 }}>
          {vm.track.map((t, i) => (
            <div key={i} style={{ display: 'flex', gap: 12 }}>
              <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                <span style={{ width: 14, height: 14, borderRadius: '50%', background: t.dot, border: `2px solid ${t.ring}`, flex: 'none' }} />
                <span style={{ width: 2, flex: 1, background: t.line, minHeight: 18 }} />
              </div>
              <div style={{ paddingBottom: 14 }}>
                <div style={{ font: "700 14px 'Manrope'", color: t.fg }}>{t.label}</div>
                <div style={{ font: "400 12px 'Manrope'", color: '#7B857F' }}>{t.time}</div>
              </div>
            </div>
          ))}
        </div>
      </div>
      <div style={{ display: 'flex', gap: 9, marginTop: 13 }}>
        <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8, background: '#fff', border: '1px solid #E2E8E5', borderRadius: 13, padding: 14, cursor: 'pointer' }}>
          <svg width="17" height="17" viewBox="0 0 24 24" fill="none">
            <path d="M5 4h4l2 5-2.5 1.5a11 11 0 005 5L15 13l5 2v4a2 2 0 01-2 2A15 15 0 013 6a2 2 0 012-2z" stroke="var(--ac)" strokeWidth="2" strokeLinejoin="round" />
          </svg>
          <span style={{ font: "600 13px 'Manrope'", color: '#33403A' }}>Call</span>
        </div>
        <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8, background: '#fff', border: '1px solid #E2E8E5', borderRadius: 13, padding: 14, cursor: 'pointer' }}>
          <svg width="17" height="17" viewBox="0 0 24 24" fill="none">
            <path d="M21 11.5a8.5 8.5 0 01-12 7.5L3 21l2-6a8.5 8.5 0 1116-3.5z" stroke="var(--ac)" strokeWidth="2" strokeLinejoin="round" />
          </svg>
          <span style={{ font: "600 13px 'Manrope'", color: '#33403A' }}>Message</span>
        </div>
      </div>
      <div onClick={vm.reset} style={{ marginTop: 11, textAlign: 'center', font: "600 13px 'Manrope'", color: '#7B857F', cursor: 'pointer', padding: 10 }}>
        {vm.doneBack}
      </div>
    </div>
  )
}
