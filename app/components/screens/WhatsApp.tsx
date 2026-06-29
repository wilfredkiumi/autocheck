import type { VM } from '@/lib/state'

export function WhatsApp({ vm }: { vm: VM }) {
  return (
    <div className="scr" style={{ position: 'absolute', inset: 0, display: 'flex', flexDirection: 'column', background: '#E7DED5' }}>
      {/* header */}
      <div style={{ padding: '44px 12px 10px', background: '#008069', display: 'flex', alignItems: 'center', gap: 9, flex: 'none' }}>
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
          <path d="M15 6l-6 6 6 6" stroke="#fff" strokeWidth="2.2" strokeLinecap="round" />
        </svg>
        <div style={{ width: 38, height: 38, borderRadius: '50%', background: vm.waAvatarBg, color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', font: "800 15px 'Archivo'", flex: 'none' }}>
          {vm.waMark}
        </div>
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ font: "700 15px 'Manrope'", color: '#fff' }}>{vm.waName}</div>
          <div style={{ font: "400 11px 'Manrope'", color: '#CFE9E2' }}>{vm.waSub}</div>
        </div>
        <svg width="19" height="19" viewBox="0 0 24 24" fill="none">
          <path d="M23 7l-7 5 7 5V7z" stroke="#fff" strokeWidth="2" strokeLinejoin="round" />
          <rect x="1" y="5" width="15" height="14" rx="2" stroke="#fff" strokeWidth="2" />
        </svg>
        <svg width="19" height="19" viewBox="0 0 24 24" fill="none" style={{ marginLeft: 4 }}>
          <path d="M5 4h4l2 5-2.5 1.5a11 11 0 005 5L15 13l5 2v4a2 2 0 01-2 2A15 15 0 013 6a2 2 0 012-2z" stroke="#fff" strokeWidth="2" strokeLinejoin="round" />
        </svg>
      </div>

      {/* side toggle */}
      <div style={{ flex: 'none', background: '#E7DED5', padding: '8px 12px 4px', display: 'flex', justifyContent: 'center' }}>
        <div style={{ display: 'flex', background: '#D7CFC4', borderRadius: 9, padding: 3, gap: 3 }}>
          <div onClick={vm.setSideDriver} style={{ padding: '6px 14px', borderRadius: 7, font: "700 11px 'Manrope'", cursor: 'pointer', background: vm.waDrvBg, color: vm.waDrvFg }}>Driver's chat</div>
          <div onClick={vm.setSideOwner} style={{ padding: '6px 14px', borderRadius: 7, font: "700 11px 'Manrope'", cursor: 'pointer', background: vm.waOwnBg, color: vm.waOwnFg }}>Fundi's chat</div>
        </div>
      </div>

      {/* messages */}
      <div className="phscroll" ref={vm.chatRef} style={{ flex: 1, overflowY: 'auto', padding: '10px 12px' }}>
        <div style={{ textAlign: 'center', marginBottom: 11 }}>
          <span style={{ background: '#FCF4CB', color: '#54656F', font: "500 11px 'Manrope'", padding: '5px 11px', borderRadius: 7 }}>🔒 Messages are end-to-end encrypted</span>
        </div>
        {vm.waMsgs.map((m, i) => (
          <div key={i} style={{ display: 'flex', justifyContent: m.justify, marginBottom: 7 }}>
            {m.isMeta && (
              <span style={{ background: '#D7E9DF', color: '#54656F', font: "700 10px 'Manrope'", letterSpacing: '.05em', padding: '4px 11px', borderRadius: 7 }}>{m.text}</span>
            )}
            {m.isBot && (
              <div style={{ maxWidth: '80%', background: '#fff', borderRadius: '3px 9px 9px 9px', padding: '7px 10px 5px', boxShadow: '0 1px .8px rgba(0,0,0,.13)' }}>
                <div style={{ font: "400 13.5px 'Manrope'", color: '#111B21', lineHeight: 1.42 }}>{m.text}</div>
                <div style={{ font: "400 10px 'Manrope'", color: '#8696A0', textAlign: 'right', marginTop: 2 }}>{m.time}</div>
              </div>
            )}
            {m.isUser && (
              <div style={{ maxWidth: '80%', background: '#D9FDD3', borderRadius: '9px 3px 9px 9px', padding: '7px 10px 5px', boxShadow: '0 1px .8px rgba(0,0,0,.13)' }}>
                <div style={{ font: "400 13.5px 'Manrope'", color: '#111B21', lineHeight: 1.42 }}>{m.text}</div>
                <div style={{ font: "400 10px 'Manrope'", color: '#67928B', textAlign: 'right', marginTop: 2 }}>{m.time} ✓✓</div>
              </div>
            )}
            {m.isCard && (
              <div style={{ maxWidth: '85%', background: '#fff', borderRadius: 9, boxShadow: '0 1px .8px rgba(0,0,0,.13)', overflow: 'hidden' }}>
                <div style={{ background: 'var(--ac)', height: 5 }} />
                <div style={{ padding: '12px 13px' }}>
                  <div style={{ font: "800 15px 'Archivo'", color: '#111B21' }}>{m.title}</div>
                  <div style={{ font: "600 13px 'Manrope'", color: '#111B21', marginTop: 4 }}>{m.line}</div>
                  <div style={{ font: "500 11px 'Space Mono'", color: '#8696A0', marginTop: 2 }}>{m.ref}</div>
                  <div style={{ font: "400 12.5px 'Manrope'", color: '#54656F', marginTop: 8, lineHeight: 1.45 }}>{m.sub}</div>
                </div>
              </div>
            )}
            {m.isNote && (
              <div style={{ maxWidth: '88%', background: '#FCF4CB', borderRadius: 8, padding: '9px 11px' }}>
                <div style={{ font: "400 12px 'Manrope'", color: '#5B6168', lineHeight: 1.45 }}>{m.text}</div>
              </div>
            )}
            {m.isBook && (
              <div style={{ width: '88%', background: '#fff', borderRadius: 9, boxShadow: '0 1px .8px rgba(0,0,0,.13)', overflow: 'hidden' }}>
                <div style={{ padding: '12px 13px' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <span style={{ font: "800 14px 'Archivo'", color: '#111B21' }}>{m.name}</span>
                    <span style={{ font: "700 9px 'Manrope'", background: '#E7F3EC', color: '#0A6A44', padding: '4px 8px', borderRadius: 6 }}>{m.deposit}</span>
                  </div>
                  <div style={{ font: "500 12px 'Manrope'", color: '#54656F', marginTop: 3 }}>{m.car}</div>
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: 5, marginTop: 9 }}>
                    {m.chips?.map((c, j) => (
                      <span key={j} style={{ font: "600 10px 'Manrope'", background: '#F0F2F0', color: '#33403A', padding: '3px 8px', borderRadius: 6 }}>{c}</span>
                    ))}
                  </div>
                  <div style={{ marginTop: 9, background: '#F6F8F7', borderRadius: 8, padding: '9px 10px', font: "400 12px 'Manrope'", color: '#54656F', lineHeight: 1.45 }}>📋 {m.summary}</div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginTop: 10, paddingTop: 9, borderTop: '1px solid #EEF0EE' }}>
                    <svg width="13" height="13" viewBox="0 0 24 24" fill="none">
                      <circle cx="12" cy="12" r="9" stroke="#0E7C50" strokeWidth="2" />
                      <path d="M12 7v5l3 2" stroke="#0E7C50" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                    </svg>
                    <span style={{ font: "700 12px 'Manrope'", color: '#111B21' }}>{m.slot}</span>
                  </div>
                </div>
              </div>
            )}
          </div>
        ))}

        {vm.waHasReplies && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 6, marginTop: 5 }}>
            {vm.waReplies.map((r, i) => (
              <div key={i} onClick={r.onClick} style={{ background: r.bg, color: r.fg, border: `1px solid ${r.bd}`, borderRadius: 9, padding: 11, textAlign: 'center', font: "700 13px 'Manrope'", cursor: 'pointer', boxShadow: '0 1px .8px rgba(0,0,0,.1)' }}>
                {r.label}
              </div>
            ))}
          </div>
        )}
        {vm.waDone && (
          <div onClick={vm.waReset} style={{ textAlign: 'center', marginTop: 12, font: "600 12px 'Manrope'", color: '#008069', cursor: 'pointer', padding: 8 }}>
            ↻ Start the demo again
          </div>
        )}
        <div style={{ height: 6 }} />
      </div>

      {/* composer */}
      <div style={{ flex: 'none', background: '#F0F2F5', padding: '8px 10px 22px', display: 'flex', alignItems: 'center', gap: 8 }}>
        <div style={{ flex: 1, background: '#fff', borderRadius: 22, padding: '10px 15px', font: "400 13px 'Manrope'", color: '#8696A0', display: 'flex', alignItems: 'center', gap: 8 }}>😊 <span>Message</span></div>
        <div style={{ width: 42, height: 42, borderRadius: '50%', background: '#008069', display: 'flex', alignItems: 'center', justifyContent: 'center', flex: 'none' }}>
          <svg width="19" height="19" viewBox="0 0 24 24" fill="none">
            <rect x="9" y="3" width="6" height="11" rx="3" stroke="#fff" strokeWidth="2" />
            <path d="M6 11a6 6 0 0012 0M12 17v3" stroke="#fff" strokeWidth="2" strokeLinecap="round" />
          </svg>
        </div>
      </div>
    </div>
  )
}
