// Small reusable SVG icons used across multiple screens. Screen-specific
// one-off SVGs stay inline in their screens to keep visual fidelity obvious.

export const ChevronRight = ({ color = '#C2CBC6', size = 20 }: { color?: string; size?: number }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none">
    <path d="M9 6l6 6-6 6" stroke={color} strokeWidth="2" strokeLinecap="round" />
  </svg>
)

export const BackButton = ({ onClick }: { onClick: () => void }) => (
  <div
    onClick={onClick}
    style={{
      width: 38,
      height: 38,
      borderRadius: 12,
      background: '#fff',
      border: '1px solid #E2E8E5',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      cursor: 'pointer',
    }}
  >
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
      <path d="M15 6l-6 6 6 6" stroke="#0F1A14" strokeWidth="2.2" strokeLinecap="round" />
    </svg>
  </div>
)

export const ShieldCheck = ({ size = 15 }: { size?: number }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="var(--ac)">
    <path d="M12 2l2.2 1.6 2.7-.2 1 2.5 2.3 1.4-.7 2.6.7 2.6-2.3 1.4-1 2.5-2.7-.2L12 22l-2.2-1.6-2.7.2-1-2.5L3.8 16.3l.7-2.6-.7-2.6 2.3-1.4 1-2.5 2.7.2z" />
    <path
      d="M9 12l2 2 4-4"
      stroke="#fff"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </svg>
)
