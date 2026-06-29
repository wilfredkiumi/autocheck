// Static data ported verbatim from the design prototype's logic class.

export type TenantKey = 'autocheck' | 'juma' | 'westgate'

export interface Theme {
  name: string
  short: string
  label: string
  sub: string
  mark: string
  accent: string
  accentDark: string
  accentSoft: string
  domain: string
  plan: string
  price: string
  feats: string[]
}

export interface Avatar {
  i: string
  c: string
}

export interface Garage {
  id?: string // DB uuid when sourced from Supabase; undefined for static demo data
  name: string
  area: string
  dist: string
  bays: string
  next: string
  trustType?: 'visits' | 'referral' | 'circle'
  trust?: string
  avatars?: Avatar[]
  circleAvatars: Avatar[]
  circleText: string
  quote: string
  quoteBy: string
  mode: 'circle' | 'verified'
  rating?: string
  visits?: string
  open?: string
  avail?: string
}

export interface ServiceDef {
  key: string
  label: string
  def: number
}

export interface BookingDef {
  time: string
  ampm: string
  name: string
  car: string
  issues: string[]
  summary: string
  photo: boolean
  base: 'new' | 'confirmed'
}

// URL slug → tenant key. These back the per-tenant entry routes
// (e.g. /juma-auto), which is where a wa.me / QR link lands a driver.
export const TENANT_SLUGS: Record<string, TenantKey> = {
  autocheck: 'autocheck',
  'juma-auto': 'juma',
  juma: 'juma',
  westgate: 'westgate',
}

export const THEMES: Record<TenantKey, Theme> = {
  autocheck: {
    name: 'AutoCheck',
    short: 'AutoCheck',
    label: 'AutoCheck',
    sub: 'Consumer app',
    mark: 'A',
    accent: '#0E7C50',
    accentDark: '#0A6A44',
    accentSoft: '#EAF3EE',
    domain: 'autocheck.app',
    plan: 'Standard',
    price: 'KSh 2,500/mo',
    feats: ['AutoCheck sub-domain link', 'Bay & slot management', 'Issue intake + photos'],
  },
  juma: {
    name: 'Juma Auto Garage',
    short: 'Juma Auto',
    label: 'Juma Auto',
    sub: 'White-label tenant',
    mark: 'J',
    accent: '#C2410C',
    accentDark: '#9A330A',
    accentSoft: '#FBEAE1',
    domain: 'juma-auto.autocheck.app',
    plan: 'Branded',
    price: 'KSh 4,500/mo',
    feats: ['Your logo & colours', 'Branded sub-domain', 'Bay & slot management'],
  },
  westgate: {
    name: 'Westgate Auto Clinic',
    short: 'Westgate',
    label: 'Westgate',
    sub: 'White-label · own domain',
    mark: 'W',
    accent: '#0F766E',
    accentDark: '#0B5A54',
    accentSoft: '#E2F2F0',
    domain: 'book.westgateauto.co.ke',
    plan: 'Pro · custom domain',
    price: 'KSh 7,500/mo',
    feats: ['Your own domain + SSL', 'Full white-label branding', 'Priority listing when verified'],
  },
}

export const GARAGES: Garage[] = [
  {
    name: 'Juma Auto Garage',
    area: 'Ngong Rd',
    dist: '1.2 km',
    bays: '4',
    next: 'Today · 2:00 PM',
    trustType: 'visits',
    trust: 'You’ve booked here 6 times',
    avatars: [],
    circleAvatars: [
      { i: 'A', c: '#D9802B' },
      { i: 'W', c: '#0E7C50' },
      { i: '+3', c: '#7B857F' },
    ],
    circleText: 'Aisha, Wanjiku and 3 others in your network use this garage.',
    quote:
      'Been bringing my car here for years. Booking online means I just drive straight in now.',
    quoteBy: 'Aisha · your contact',
    mode: 'circle',
  },
  {
    name: 'Karanja Motors',
    area: 'Industrial Area',
    dist: '3.4 km',
    bays: '6',
    next: 'Today · 4:30 PM',
    trustType: 'referral',
    trust: 'Recommended by Aisha',
    avatars: [{ i: 'A', c: '#D9802B' }],
    circleAvatars: [
      { i: 'A', c: '#D9802B' },
      { i: 'M', c: '#0E7C50' },
    ],
    circleText: 'Aisha shared this garage with you. 2 people you know book here.',
    quote:
      'They never start work without calling me first with the price. Felt safe sending my daughter here.',
    quoteBy: 'Aisha · your contact',
    mode: 'circle',
  },
  {
    name: 'Westgate Auto Clinic',
    area: 'Westlands',
    dist: '2.1 km',
    bays: '5',
    next: 'Tomorrow · 9:00 AM',
    trustType: 'circle',
    trust: 'Used by 4 women in your network',
    avatars: [
      { i: 'N', c: '#0E7C50' },
      { i: 'F', c: '#D9802B' },
    ],
    circleAvatars: [
      { i: 'N', c: '#0E7C50' },
      { i: 'F', c: '#D9802B' },
      { i: '+2', c: '#7B857F' },
    ],
    circleText: '4 women in your network book here — a garage they trust.',
    quote: 'No one talks down to you here. Clear quote, M-Pesa receipt, done.',
    quoteBy: 'Njeri · your contact',
    mode: 'circle',
  },
]

export const NYERI: Garage[] = [
  {
    name: 'Mt Kenya Auto Repairs',
    area: 'Kimathi Way, Nyeri',
    dist: '0.6 km',
    bays: '5',
    rating: '4.8',
    visits: '128',
    open: 'Open now',
    avail: 'Can receive you now',
    next: 'Now',
    circleAvatars: [],
    circleText: 'Vetted by AutoCheck · 128 drivers booked here through the app.',
    quote:
      'Stranded on the highway, booked in 2 minutes, they sorted my car the same afternoon.',
    quoteBy: 'Verified booking · May 2026',
    mode: 'verified',
  },
  {
    name: 'Dedan Motors',
    area: 'Gakere Rd, Nyeri',
    dist: '1.4 km',
    bays: '3',
    rating: '4.6',
    visits: '74',
    open: 'Open now',
    avail: '1 bay free',
    next: 'Today · 1:30 PM',
    circleAvatars: [],
    circleText: 'Vetted by AutoCheck · 74 verified visits, written quotes every time.',
    quote: 'Fair price, showed me the worn part before replacing it. Trustworthy.',
    quoteBy: 'Verified booking · Apr 2026',
    mode: 'verified',
  },
  {
    name: 'Highlands Garage',
    area: 'Ring Rd, Nyeri',
    dist: '2.2 km',
    bays: '6',
    rating: '4.9',
    visits: '203',
    open: 'Open till 7 PM',
    avail: 'Book ahead',
    next: 'Today · 5:00 PM',
    circleAvatars: [],
    circleText: 'Vetted by AutoCheck · 203 verified visits, top-rated in Nyeri.',
    quote:
      'Best garage in town. Clean, professional, and they actually pick up the phone.',
    quoteBy: 'Verified booking · Jun 2026',
    mode: 'verified',
  },
]

export const ISSUES = [
  'Brakes',
  'Engine',
  'Suspension',
  'Electrical',
  'Tyres',
  'Overheating',
  'Aircon',
  'Service / oil',
]

export interface SlotDef {
  day: string
  time: string
  note: string
}

export const SLOTS: SlotDef[] = [
  { day: 'Today', time: '2:00 PM', note: '1 bay free · soonest' },
  { day: 'Today', time: '4:30 PM', note: '2 bays free' },
  { day: 'Tomorrow', time: '9:00 AM', note: 'Quietest · in & out fast' },
  { day: 'Tomorrow', time: '4:30 PM', note: 'After work' },
]

export const ZONES = [
  'Kenyatta Rd, Nyeri',
  'Kimathi Way, Nyeri',
  'Gakere Rd, Nyeri',
  'Ring Rd, Nyeri',
]

export const ISSUE_MINS: Record<string, number> = {
  Brakes: 120,
  Engine: 180,
  Suspension: 120,
  Electrical: 90,
  Tyres: 45,
  Overheating: 120,
  Aircon: 90,
  'Service / oil': 45,
}

export const SERVICES: ServiceDef[] = [
  { key: 'oil', label: 'Oil & routine service', def: 45 },
  { key: 'brakes', label: 'Brakes & pads', def: 120 },
  { key: 'diag', label: 'Diagnostics / warning light', def: 60 },
  { key: 'susp', label: 'Suspension & steering', def: 120 },
  { key: 'elec', label: 'Electrical / battery', def: 90 },
  { key: 'body', label: 'Bodywork & welding', def: 480 },
]

export const DUR_PRESETS = [30, 45, 60, 90, 120, 180, 480]

export const BOOKINGS: BookingDef[] = [
  {
    time: '9:00',
    ampm: 'AM',
    name: 'Grace W.',
    car: 'Toyota Premio · KCA 123A',
    issues: ['Brakes', 'Suspension'],
    summary: 'Likely worn front pads + alignment pull. Inspect on arrival, quote pad set.',
    photo: true,
    base: 'new',
  },
  {
    time: '11:30',
    ampm: 'AM',
    name: 'David K.',
    car: 'Subaru Forester · KDJ 456B',
    issues: ['Engine', 'Overheating'],
    summary: 'Possible coolant leak / thermostat. Pressure-test cooling system first.',
    photo: false,
    base: 'confirmed',
  },
  {
    time: '2:00',
    ampm: 'PM',
    name: 'Aisha M.',
    car: 'Mazda Demio · KCB 789C',
    issues: ['Service / oil'],
    summary: 'Routine 10,000 km service + oil and filter change.',
    photo: false,
    base: 'confirmed',
  },
  {
    time: '4:30',
    ampm: 'PM',
    name: 'Peter N.',
    car: 'Nissan Note · KDK 321D',
    issues: ['Electrical'],
    summary: 'Battery not holding charge overnight. Test alternator + battery health.',
    photo: true,
    base: 'new',
  },
]

// Injectable data bundle --------------------------------------------------
// The dynamic, tenant-scoped content the booking screens render. In the demo
// these are the static arrays above; with Supabase configured, the server
// loader (lib/db/catalog.ts) supplies the same shapes from Postgres. Everything
// else (SLOTS, ZONES, ISSUE_MINS, DUR_PRESETS, the sample BOOKINGS) stays static.
export interface AppData {
  THEMES: Record<TenantKey, Theme>
  GARAGES: Garage[]
  NYERI: Garage[]
  ISSUES: string[]
  SERVICES: ServiceDef[]
}

export const STATIC_APP_DATA: AppData = { THEMES, GARAGES, NYERI, ISSUES, SERVICES }

// Duration helpers --------------------------------------------------------
export function fmtDur(m: number): string {
  if (m >= 480) return 'Drop-off'
  if (m < 60) return m + ' min'
  const h = m / 60
  return (h % 1 === 0 ? h : h.toFixed(1).replace(/\.0$/, '')) + ' hr'
}

export function fmtTime(n: number): string {
  const m = Math.floor(n / 60)
  const s = n % 60
  return m + ':' + (s < 10 ? '0' : '') + s
}
