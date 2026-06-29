// Flat illustration for the home hero: a friendly mechanic with a car. Pure SVG
// so it's crisp at any size and themes to the tenant accent (var(--ac)/--acd).
export function HeroArt() {
  return (
    <svg
      viewBox="0 0 360 168"
      width="100%"
      style={{ display: 'block' }}
      role="img"
      aria-label="A mechanic standing next to a car"
    >
      {/* ground shadows */}
      <ellipse cx="150" cy="143" rx="120" ry="9" fill="rgba(15,40,30,.07)" />
      <ellipse cx="300" cy="146" rx="30" ry="6" fill="rgba(15,40,30,.07)" />

      {/* car */}
      <g>
        {/* wheels */}
        <circle cx="98" cy="122" r="18" fill="#222B30" />
        <circle cx="98" cy="122" r="7.5" fill="#8C99A2" />
        <circle cx="202" cy="122" r="18" fill="#222B30" />
        <circle cx="202" cy="122" r="7.5" fill="#8C99A2" />
        {/* body */}
        <path
          d="M44 122 V104 Q44 95 53 94 L100 90 Q111 70 134 70 L176 70 Q199 71 213 92 L249 99 Q259 101 259 112 V122 Z"
          fill="#33424D"
        />
        {/* body highlight */}
        <path d="M53 100 L246 100 Q256 101 256 110 L53 110 Z" fill="#3D4E5A" />
        {/* cabin window */}
        <path d="M112 90 L128 75 Q131 73 135 73 L165 73 Q170 73 172 77 L181 90 Z" fill="#CFE9EF" />
        <path d="M148 73 L150 90" stroke="#33424D" strokeWidth="3" />
        {/* headlight + grille */}
        <circle cx="252" cy="108" r="4" fill="#FFD36A" />
        <rect x="46" y="106" width="5" height="7" rx="2" fill="#FFD36A" />
        {/* door handle */}
        <rect x="196" y="104" width="14" height="3" rx="1.5" fill="#283139" />
      </g>

      {/* mechanic */}
      <g>
        {/* legs + boots */}
        <rect x="290" y="112" width="9" height="26" rx="3.5" fill="#2E3A42" />
        <rect x="303" y="112" width="9" height="26" rx="3.5" fill="#2E3A42" />
        <rect x="286" y="135" width="15" height="7" rx="2.5" fill="#1C2226" />
        <rect x="301" y="135" width="15" height="7" rx="2.5" fill="#1C2226" />
        {/* overalls */}
        <path d="M283 86 Q283 80 290 80 L312 80 Q319 80 319 86 L319 116 Q319 120 314 120 L288 120 Q283 120 283 116 Z" fill="var(--ac)" />
        {/* straps + pocket */}
        <path d="M290 100 L294 84" stroke="var(--acd)" strokeWidth="4" strokeLinecap="round" />
        <path d="M312 100 L308 84" stroke="var(--acd)" strokeWidth="4" strokeLinecap="round" />
        <rect x="295" y="101" width="12" height="11" rx="2" fill="var(--acd)" opacity="0.45" />
        {/* near arm + hand holding a wrench, reaching toward the car */}
        <path d="M285 90 Q272 96 268 110" stroke="var(--ac)" strokeWidth="9" strokeLinecap="round" fill="none" />
        <circle cx="267" cy="112" r="5.5" fill="#E8B07A" />
        <g transform="rotate(38 267 112)">
          <rect x="263" y="92" width="6" height="20" rx="3" fill="#9AA7AF" />
          <path d="M260 90 a6 6 0 0 1 12 0 l-3 0 a3 3 0 0 0 -6 0 Z" fill="#9AA7AF" />
        </g>
        {/* far arm */}
        <path d="M316 90 Q326 98 322 112" stroke="var(--acd)" strokeWidth="8" strokeLinecap="round" fill="none" />
        {/* head + cap + face */}
        <circle cx="301" cy="69" r="14" fill="#E8B07A" />
        <path d="M287 68 Q301 50 315 68 Z" fill="var(--acd)" />
        <rect x="299" y="64" width="18" height="5" rx="2.5" fill="var(--acd)" />
        <circle cx="296" cy="70" r="1.5" fill="#3A2A1C" />
        <circle cx="305" cy="70" r="1.5" fill="#3A2A1C" />
        <path d="M296 76 Q300 79 305 76" stroke="#3A2A1C" strokeWidth="1.6" fill="none" strokeLinecap="round" />
      </g>

      {/* service sparkle */}
      <path d="M150 40 l2.4 5.6 5.6 2.4 -5.6 2.4 -2.4 5.6 -2.4 -5.6 -5.6 -2.4 5.6 -2.4 Z" fill="var(--ac)" opacity="0.5" />
    </svg>
  )
}
