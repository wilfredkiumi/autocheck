import { useCallback, useEffect, useRef, useState } from 'react'
import {
  BOOKINGS,
  DUR_PRESETS,
  fmtDur,
  fmtTime,
  Garage,
  ISSUE_MINS,
  SLOTS,
  STATIC_APP_DATA,
  TenantKey,
  ZONES,
  type AppData,
} from './data'

export type Persona = 'driver' | 'owner' | 'whatsapp'
export type OwnerTab = 'bookings' | 'hours' | 'settings'
export type WaSide = 'driver' | 'owner'

interface State {
  persona: Persona
  tenant: TenantKey
  s: number // driver screen index 0-8
  g: number // selected garage index
  away: Garage | null
  issues: string[]
  slot: number | null
  note: string
  aiDone: boolean
  aiLoading: boolean
  aiText: string
  photos: string[]
  recording: boolean
  recSecs: number
  voice: { dur: number } | null
  locPerm: boolean
  pin: { x: number; y: number }
  town: string
  located: boolean
  roadType: string | null
  ownerTab: OwnerTab
  accepting: boolean
  baysTotal: number
  bookingStatuses: Record<number, string>
  blocked: Record<number, boolean>
  copied: boolean
  fulfil: 'wait' | 'drop' | null
  durations: Record<string, number>
  waStep: number
  waSymptom: string
  waDetail: string
  waSlot: string
  waSide: WaSide
  waOwnerStep: number
}

const INITIAL: State = {
  persona: 'driver',
  tenant: 'autocheck',
  s: 0,
  g: 0,
  away: null,
  issues: [],
  slot: null,
  note: '',
  aiDone: false,
  aiLoading: false,
  aiText: '',
  photos: [],
  recording: false,
  recSecs: 0,
  voice: null,
  locPerm: true,
  pin: { x: 50, y: 46 },
  town: '',
  located: false,
  roadType: null,
  ownerTab: 'bookings',
  accepting: true,
  baysTotal: 4,
  bookingStatuses: {},
  blocked: {},
  copied: false,
  fulfil: null,
  durations: {},
  waStep: 0,
  waSymptom: '',
  waDetail: '',
  waSlot: '',
  waSide: 'driver',
  waOwnerStep: 0,
}

interface TrackRow {
  label: string
  time: string
  dot: string
  ring: string
  line: string
  fg: string
}

interface WaMessage {
  meta?: boolean
  from?: 'bot' | 'user'
  card?: boolean
  note?: boolean
  book?: boolean
  text?: string
  time?: string
  title?: string
  line?: string
  ref?: string
  sub?: string
  name?: string
  car?: string
  chips?: string[]
  summary?: string
  slot?: string
  deposit?: string
}

// Illustrative AI fallback (Claude API kept out of scope per build decision).
const AI_FALLBACK =
  'Likely front brake-pad wear with a possible wheel-alignment pull. Check front pads and discs, and test alignment on arrival.'

export function useBooking(initialTenant?: TenantKey, data: AppData = STATIC_APP_DATA) {
  // Dynamic, tenant-scoped content — static demo arrays by default, or the
  // Supabase-loaded bundle when the caller injects one. The rest of the hook is
  // unchanged; it just reads these names instead of module-level constants.
  const { THEMES, GARAGES, NYERI, ISSUES, SERVICES } = data

  const [st, setSt] = useState<State>(() =>
    initialTenant
      ? {
          ...INITIAL,
          tenant: initialTenant,
          g: initialTenant === 'juma' ? 0 : initialTenant === 'westgate' ? 2 : INITIAL.g,
        }
      : INITIAL,
  )
  const timer = useRef<ReturnType<typeof setInterval> | null>(null)
  const chatRef = useRef<HTMLDivElement | null>(null)

  const patch = useCallback((p: Partial<State>) => setSt((s) => ({ ...s, ...p })), [])
  const update = useCallback(
    (fn: (s: State) => Partial<State>) => setSt((s) => ({ ...s, ...fn(s) })),
    [],
  )

  useEffect(() => {
    return () => {
      if (timer.current) clearInterval(timer.current)
    }
  }, [])

  // keep WhatsApp chat scrolled to the bottom as messages arrive
  useEffect(() => {
    if (st.persona === 'whatsapp' && chatRef.current) {
      chatRef.current.scrollTop = chatRef.current.scrollHeight
    }
  })

  // --- actions -----------------------------------------------------------
  const toggleIssue = (name: string) =>
    update((s) => ({
      issues: s.issues.includes(name)
        ? s.issues.filter((x) => x !== name)
        : [...s.issues, name],
    }))

  const setTenant = (t: TenantKey) => {
    const gIndex = t === 'juma' ? 0 : t === 'westgate' ? 2 : st.g
    patch({
      tenant: t,
      s: 0,
      g: gIndex,
      away: null,
      issues: [],
      slot: null,
      note: '',
      aiDone: false,
      aiText: '',
      photos: [],
      voice: null,
    })
  }
  const setPersona = (p: Persona) => patch({ persona: p })

  const cycleDur = (key: string, def: number) =>
    update((s) => {
      const cur = s.durations[key] ?? def
      const i = DUR_PRESETS.indexOf(cur)
      const next = DUR_PRESETS[(i + 1) % DUR_PRESETS.length]
      return { durations: { ...s.durations, [key]: next } }
    })

  const waPick = (value: string) => {
    const s = st.waStep
    if (s === 0) patch({ waStep: 1, waSymptom: value })
    else if (s === 1) patch({ waStep: 2, waDetail: value })
    else if (s === 2) patch({ waStep: 3, waSlot: value })
    else if (s === 3) patch({ waStep: 4 })
  }
  const waReset = () =>
    patch({ waStep: 0, waSymptom: '', waDetail: '', waSlot: '', waOwnerStep: 0 })
  const setWaSide = (side: WaSide) => patch({ waSide: side })
  const waOwnerPick = (_value: string) => {
    const s = st.waOwnerStep
    if (s === 0) patch({ waOwnerStep: 1 })
    else if (s === 1) patch({ waOwnerStep: 2 })
  }

  const onPhoto = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = [...(e.target.files || [])]
    files.forEach((f) => {
      const r = new FileReader()
      r.onload = () => update((s) => ({ photos: [...s.photos, r.result as string] }))
      r.readAsDataURL(f)
    })
    e.target.value = ''
  }
  const removePhoto = (i: number) =>
    update((s) => ({ photos: s.photos.filter((_, idx) => idx !== i) }))
  const startRec = () => {
    patch({ recording: true, recSecs: 0 })
    timer.current = setInterval(() => update((s) => ({ recSecs: s.recSecs + 1 })), 1000)
  }
  const stopRec = () => {
    if (timer.current) clearInterval(timer.current)
    update((s) => ({ recording: false, voice: { dur: s.recSecs || 3 } }))
  }
  const delVoice = () => patch({ voice: null })

  const runAI = async () => {
    if (st.aiLoading) return
    patch({ aiLoading: true, aiDone: false })
    // Illustrative only — show the canned technician summary after a beat.
    await new Promise((r) => setTimeout(r, 900))
    const clean = AI_FALLBACK
    patch({ aiLoading: false, aiDone: true, aiText: clean })
  }

  const onMapTap = (e: React.MouseEvent<HTMLDivElement>) => {
    const r = e.currentTarget.getBoundingClientRect()
    const x = Math.max(6, Math.min(94, ((e.clientX - r.left) / r.width) * 100))
    const y = Math.max(8, Math.min(92, ((e.clientY - r.top) / r.height) * 100))
    patch({ pin: { x, y }, town: '', located: true, locPerm: false })
  }
  const allowLoc = () =>
    patch({ pin: { x: 50, y: 46 }, town: '', located: true, locPerm: false })
  const onTown = (e: React.ChangeEvent<HTMLInputElement>) => patch({ town: e.target.value })

  const setStatus = (i: number) =>
    update((s) => ({ bookingStatuses: { ...s.bookingStatuses, [i]: 'confirmed' } }))
  const toggleBlock = (i: number) =>
    update((s) => ({ blocked: { ...s.blocked, [i]: !s.blocked[i] } }))
  const copyLink = () => {
    try {
      navigator.clipboard?.writeText(THEMES[st.tenant].domain)
    } catch {
      /* ignore */
    }
    patch({ copied: true })
    setTimeout(() => patch({ copied: false }), 1500)
  }

  // --- builders ----------------------------------------------------------
  const trackRows = (acc: string): TrackRow[] => {
    const done = (l: string, t: string): TrackRow => ({
      label: l,
      time: t,
      dot: acc,
      ring: acc,
      line: acc,
      fg: '#0F1A14',
    })
    const now = (l: string, t: string): TrackRow => ({
      label: l,
      time: t,
      dot: acc,
      ring: acc,
      line: '#DCE5E0',
      fg: '#0F1A14',
    })
    const soon = (l: string, t: string): TrackRow => ({
      label: l,
      time: t,
      dot: 'transparent',
      ring: '#CBD5CF',
      line: '#DCE5E0',
      fg: '#9AA6A0',
    })
    return [
      done('Request sent', 'just now'),
      done('Garage confirmed', 'just now'),
      now('Bay reserved for you', 'held till 20 min after your slot'),
      soon('Car received', 'at your slot'),
      soon('Ready for pickup', '—'),
    ]
  }

  const roadTrack = (): TrackRow[] => {
    const a = '#C2410C'
    return [
      { label: 'Request received', time: 'just now', dot: a, ring: a, line: a, fg: '#0F1A14' },
      {
        label: 'Samuel M. dispatched',
        time: 'just now',
        dot: a,
        ring: a,
        line: '#EAD9D0',
        fg: '#0F1A14',
      },
      {
        label: 'On the way to you',
        time: '~12 min',
        dot: 'transparent',
        ring: '#E0C3B6',
        line: '#EAD9D0',
        fg: '#9AA6A0',
      },
      {
        label: 'Arrived',
        time: '—',
        dot: 'transparent',
        ring: '#E0C3B6',
        line: 'transparent',
        fg: '#9AA6A0',
      },
    ]
  }

  const buildWA = () => {
    const T = THEMES[st.tenant]
    const garage = T.short
    const step = st.waStep
    const m: WaMessage[] = [
      { meta: true, text: 'TODAY' },
      {
        from: 'bot',
        text: `Karibu ${garage} 👋  Book your car straight in here — no calling around. What’s the problem?`,
        time: '9:40',
      },
    ]
    if (step >= 1) {
      m.push({ from: 'user', text: st.waSymptom, time: '9:40' })
      m.push({
        from: 'bot',
        text: 'Got it 👍  Add a photo or voice note if you can — or I’ll jump to available times.',
        time: '9:40',
      })
    }
    if (step >= 2) {
      m.push({ from: 'user', text: st.waDetail, time: '9:41' })
      m.push({
        from: 'bot',
        text: `Asante. That looks like ~a 2-hour job. Next openings at ${garage}:`,
        time: '9:41',
      })
    }
    if (step >= 3) {
      m.push({ from: 'user', text: st.waSlot, time: '9:42' })
      m.push({
        from: 'bot',
        text: 'Reserved ✅  Pay a KSh 500 deposit to hold your bay — it comes off your final bill.',
        time: '9:42',
      })
    }
    if (step >= 4) {
      m.push({ from: 'user', text: 'Paid KSh 500 — M-Pesa ✅', time: '9:43' })
      m.push({
        card: true,
        title: 'Booking confirmed 🎉',
        line: `${garage} · Today 2:00 PM`,
        ref: 'Ref #AG-4821',
        sub: 'Drive straight in — no queue. We’ll WhatsApp you the moment your car is ready.',
      })
      m.push({
        note: true,
        text: `📋  Sent to ${garage}’s WhatsApp too: “Brakes — likely worn front pads, check alignment.” They’re set up before you arrive.`,
      })
    }
    let replies: { label: string; value: string }[] = []
    let mpesa = false
    let done = false
    if (step === 0)
      replies = [
        { label: 'Brakes 🛑', value: 'Brakes' },
        { label: 'Engine / overheating', value: 'Engine / overheating' },
        { label: 'Something else', value: 'Something else' },
      ]
    else if (step === 1)
      replies = [
        { label: '📷 Send a photo', value: '📷 Photo sent' },
        { label: '🎤 Voice note', value: '🎤 Voice note · 0:09' },
        { label: 'Skip → see times', value: 'Just book me in' },
      ]
    else if (step === 2)
      replies = [
        { label: 'Today · 2:00 PM', value: 'Today · 2:00 PM' },
        { label: 'Today · 4:30 PM', value: 'Today · 4:30 PM' },
        { label: 'Tomorrow · 9:00 AM', value: 'Tomorrow · 9:00 AM' },
      ]
    else if (step === 3) {
      replies = [{ label: 'Pay KSh 500 · M-Pesa', value: 'pay' }]
      mpesa = true
    } else done = true
    const replyItems = replies.map((r) => ({
      label: r.label,
      onClick: () => waPick(r.value),
      bg: mpesa ? '#00A550' : '#fff',
      fg: mpesa ? '#fff' : '#008069',
      bd: mpesa ? '#00A550' : '#E6E1DA',
    }))
    return { msgs: m, replies: replyItems, done }
  }

  const buildWAOwner = () => {
    const T = THEMES[st.tenant]
    const step = st.waOwnerStep
    const m: WaMessage[] = [
      { meta: true, text: 'TODAY' },
      { from: 'bot', text: '🔔 New booking request', time: '9:43' },
      {
        book: true,
        name: 'Grace W.',
        car: 'Toyota Premio · KCA 123A',
        chips: ['Brakes', 'Suspension'],
        summary:
          'Likely worn front pads + alignment pull. Inspect on arrival, quote a pad set.',
        slot: 'Today · 2:00 PM',
        deposit: 'KSh 500 paid',
      },
    ]
    if (step >= 1) {
      m.push({ from: 'user', text: '✅ Confirm', time: '9:43' })
      m.push({
        from: 'bot',
        text: 'Asante! Grace is notified her bay is held for 2:00 PM, and we shared your location with her. Reply when the car is ready.',
        time: '9:43',
      })
    }
    if (step >= 2) {
      m.push({ from: 'user', text: 'Car is ready 👍', time: '2:10' })
      m.push({
        from: 'bot',
        text: 'Done ✅ Grace notified to collect. Her M-Pesa balance request has been sent.',
        time: '2:10',
      })
    }
    let replies: { label: string; value: string }[] = []
    if (step === 0)
      replies = [
        { label: 'Confirm ✅', value: 'confirm' },
        { label: 'Suggest another time', value: 'alt' },
        { label: 'Decline', value: 'decline' },
      ]
    else if (step === 1) replies = [{ label: 'Mark car ready', value: 'ready' }]
    void T
    const replyItems = replies.map((r) => ({
      label: r.label,
      onClick: () => waOwnerPick(r.value),
      bg: '#fff',
      fg: '#008069',
      bd: '#E6E1DA',
    }))
    return { msgs: m, replies: replyItems, done: step >= 2 }
  }

  // --- derived view model (mirrors renderVals) ---------------------------
  const T = THEMES[st.tenant]
  const wl = st.tenant !== 'autocheck'
  const driver = st.persona === 'driver'
  const owner = st.persona === 'owner'
  const isWA = st.persona === 'whatsapp'
  const waOwner = st.waSide === 'owner'
  const wa = waOwner ? buildWAOwner() : buildWA()
  const waMsgs = wa.msgs.map((x) => ({
    ...x,
    isMeta: !!x.meta,
    isBot: x.from === 'bot',
    isUser: x.from === 'user',
    isCard: !!x.card,
    isNote: !!x.note,
    isBook: !!x.book,
    justify:
      x.from === 'user'
        ? 'flex-end'
        : x.meta || x.note || x.card || x.book
          ? 'center'
          : 'flex-start',
  }))

  const tenants = (Object.keys(THEMES) as TenantKey[]).map((key) => {
    const th = THEMES[key]
    const active = st.tenant === key
    return {
      key,
      label: th.label,
      sub: th.sub,
      mark: th.mark,
      accent: th.accent,
      onClick: () => setTenant(key),
      bg: active ? th.accentSoft : '#fff',
      bd: active ? th.accent : '#E2E8E5',
      fg: active ? th.accentDark : '#0F1A14',
      subfg: active ? th.accentDark : '#7B857F',
    }
  })

  const decorate = (g: Garage) => ({
    ...g,
    hasAvatars: !!(g.avatars && g.avatars.length > 0),
    isVisits: g.trustType === 'visits',
    isVerifiedMode: g.mode === 'verified',
    isCircleMode: g.mode !== 'verified',
  })
  const garages = GARAGES.map((g, i) => ({
    ...decorate(g),
    onClick: () => patch({ away: null, g: i, s: 1 }),
  }))
  const nyeri = NYERI.map((g) => ({
    ...decorate(g),
    onClick: () => patch({ away: g, s: 1 }),
  }))
  const g = decorate(st.away || GARAGES[st.g])

  const issues = ISSUES.map((name) => {
    const active = st.issues.includes(name)
    return {
      name,
      onClick: () => toggleIssue(name),
      bg: active ? T.accent : '#F2F5F3',
      bd: active ? T.accent : '#D7DEDA',
      fg: active ? '#fff' : '#33403A',
    }
  })
  const slots = SLOTS.map((sl, i) => {
    const sel = st.slot === i
    return {
      ...sl,
      onClick: () => patch({ slot: i }),
      bg: sel ? T.accentSoft : '#fff',
      bd: sel ? T.accent : '#E2E8E5',
      fg: sel ? T.accentDark : '#0F1A14',
    }
  })
  const slotLabel = st.slot != null ? SLOTS[st.slot].day + ' · ' + SLOTS[st.slot].time : ''
  const canConfirm = st.slot != null

  const photoItems = st.photos.map((url, i) => ({
    url,
    bg: 'url("' + url + '")',
    onRemove: () => removePhoto(i),
  }))

  // duration estimate from described issues
  const selMins = st.issues.reduce((a, n) => a + (ISSUE_MINS[n] || 60), 0)
  const estMins = st.issues.length ? selMins : 45
  const durLow = estMins
  const durHigh = Math.ceil((estMins * 1.4) / 30) * 30
  const durWindow =
    estMins <= 45 ? '≈ 30–45 min' : '≈ ' + fmtDur(durLow) + '–' + fmtDur(durHigh)
  const waitAllowed = estMins <= 60
  const fulfil = st.fulfil || (waitAllowed ? 'wait' : 'drop')
  const waitSel = fulfil === 'wait' && waitAllowed
  const dropSel = fulfil === 'drop'

  const ownerServices = SERVICES.map((s) => {
    const cur = st.durations[s.key] ?? s.def
    return { label: s.label, dur: fmtDur(cur), onClick: () => cycleDur(s.key, s.def) }
  })

  const roadDefs = [
    { key: 'wont-start', emoji: '🔋', label: "Won't start" },
    { key: 'flat', emoji: '🛞', label: 'Flat tyre' },
    { key: 'overheat', emoji: '🌡️', label: 'Overheating / smoke' },
    { key: 'accident', emoji: '⚠️', label: 'Accident' },
  ]
  const roadOpts = roadDefs.map((o) => {
    const sel = st.roadType === o.key
    return {
      ...o,
      onClick: () => patch({ roadType: o.key }),
      sel,
      bg: sel ? T.accentSoft : '#fff',
      bd: sel ? T.accent : '#E2E8E5',
      fg: sel ? T.accentDark : '#0F1A14',
      iconbg: sel ? '#fff' : '#F2F5F3',
    }
  })

  const pinArea =
    st.town && st.town.trim() ? st.town.trim() : ZONES[Math.min(3, Math.floor(st.pin.y / 25))]

  // owner derived
  const statusOf = (i: number) =>
    BOOKINGS[i].base === 'new' ? st.bookingStatuses[i] || 'new' : BOOKINGS[i].base
  const bookings = BOOKINGS.map((b, i) => {
    const status = statusOf(i)
    const isNew = status === 'new'
    const pill =
      status === 'new'
        ? { t: 'NEW', bg: '#FBEAE1', fg: '#C2410C', bar: '#C2410C' }
        : status === 'confirmed'
          ? { t: 'CONFIRMED', bg: T.accentSoft, fg: T.accentDark, bar: T.accent }
          : { t: 'IN BAY', bg: '#FEF3D6', fg: '#9A6608', bar: '#E0A210' }
    return {
      ...b,
      status: pill.t,
      pillBg: pill.bg,
      pillFg: pill.fg,
      bar: pill.bar,
      isNew,
      confirm: () => setStatus(i),
    }
  })
  const newCount = BOOKINGS.filter((_, i) => statusOf(i) === 'new').length
  const baysUsed = Math.min(st.baysTotal, BOOKINGS.length - 1)

  const ownerSlotDefs = ['8:00', '9:00', '11:30', '1:00', '2:00', '4:30']
  const bookedTimes: Record<string, number> = { '9:00': 1, '11:30': 1, '2:00': 1, '4:30': 1 }
  const ownerSlots = ownerSlotDefs.map((t, i) => {
    const booked = !!bookedTimes[t]
    const blk = !!st.blocked[i]
    let bg = '#fff',
      bd = '#E2E8E5',
      fg = '#0F1A14',
      tag = 'Free',
      tagfg = '#0E9E64'
    if (booked) {
      bg = T.accentSoft
      bd = T.accent
      fg = T.accentDark
      tag = 'Booked'
      tagfg = T.accentDark
    } else if (blk) {
      bg = '#F2F2F0'
      bd = '#D7DBD8'
      fg = '#9AA6A0'
      tag = 'Blocked'
      tagfg = '#9AA6A0'
    }
    return {
      time: t,
      bg,
      bd,
      fg,
      tag,
      tagfg,
      onClick: booked ? () => {} : () => toggleBlock(i),
    }
  })

  const back = () => {
    const s = st.s
    if (s === 1) patch({ s: st.away ? 5 : 0 })
    else if (s === 5) patch({ s: 6 })
    else if (s === 6) patch({ s: 0 })
    else if (s === 7) patch({ s: 5 })
    else patch({ s: Math.max(0, s - 1) })
  }

  return {
    st,
    accent: T.accent,
    accentDark: T.accentDark,
    accentSoft: T.accentSoft,
    tenants,

    setDriver: () => setPersona('driver'),
    setOwner: () => setPersona('owner'),
    setWhatsApp: () => setPersona('whatsapp'),
    driverTabBg: driver ? '#fff' : 'transparent',
    driverTabFg: driver ? '#0F1A14' : '#7B857F',
    driverTabSh: driver ? '0 1px 3px rgba(0,0,0,.1)' : 'none',
    whatsappTabBg: isWA ? '#fff' : 'transparent',
    whatsappTabFg: isWA ? '#0F1A14' : '#7B857F',
    whatsappTabSh: isWA ? '0 1px 3px rgba(0,0,0,.1)' : 'none',
    ownerTabBg: owner ? '#fff' : 'transparent',
    ownerTabFg: owner ? '#0F1A14' : '#7B857F',
    ownerTabSh: owner ? '0 1px 3px rgba(0,0,0,.1)' : 'none',

    isWhatsApp: isWA,
    statusColor: isWA ? '#fff' : '#0F1A14',
    waMsgs,
    waReplies: wa.replies,
    waHasReplies: wa.replies.length > 0,
    waDone: wa.done,
    waReset: () => waReset(),
    chatRef,
    waName: waOwner ? 'AutoCheck Bookings' : T.short,
    waSub: waOwner ? 'notifications · online' : 'business account · online',
    waMark: waOwner ? 'A' : T.mark,
    waAvatarBg: waOwner ? '#0E7C50' : 'var(--ac)',
    setSideDriver: () => setWaSide('driver'),
    setSideOwner: () => setWaSide('owner'),
    waDrvBg: waOwner ? 'transparent' : '#008069',
    waDrvFg: waOwner ? '#54656F' : '#fff',
    waOwnBg: waOwner ? '#008069' : 'transparent',
    waOwnFg: waOwner ? '#fff' : '#54656F',

    brandName: T.name,
    brandShort: T.short,
    brandMark: T.mark,
    brandDomain: T.domain,

    isConsumerHome: driver && st.s === 0 && !wl,
    isBrandHome: driver && st.s === 0 && wl,
    isDetail: driver && st.s === 1,
    isIssue: driver && st.s === 2,
    isSlot: driver && st.s === 3,
    isDone: driver && st.s === 4,
    isDiscovery: driver && st.s === 5,
    isLocation: driver && st.s === 6,
    isRoadside: driver && st.s === 7,
    isRoadDone: driver && st.s === 8,
    isOwner: owner,

    detailKicker: st.away
      ? 'Verified · ' + pinArea.split(',').pop()!.trim()
      : wl
        ? T.short
        : 'Your garage',
    garages,
    nyeri,
    g,
    issues,
    note: st.note,
    onNote: (e: React.ChangeEvent<HTMLTextAreaElement>) => patch({ note: e.target.value }),
    runAI: () => runAI(),
    aiDone: st.aiDone,
    aiLoading: st.aiLoading,
    aiText: st.aiText,
    aiIdleIcon: !st.aiLoading,
    aiBtnTitle: st.aiLoading ? 'Thinking…' : st.aiDone ? 'Re-generate' : 'Help me describe it',
    onPhoto: (e: React.ChangeEvent<HTMLInputElement>) => onPhoto(e),
    photoItems,
    hasPhotos: st.photos.length > 0,
    voiceIdle: !st.recording && !st.voice,
    recording: st.recording,
    recTime: fmtTime(st.recSecs),
    hasVoice: !!st.voice,
    voiceTime: st.voice ? fmtTime(st.voice.dur) : '0:00',
    startRec: () => startRec(),
    stopRec: () => stopRec(),
    delVoice: () => delVoice(),

    slots,
    slotLabel,
    durWindow,
    waitAllowed,
    waitNoteShow: !waitAllowed,
    waitNote:
      'This looks like a longer job — best to leave the car and we’ll call you when it’s ready.',
    setWait: () => waitAllowed && patch({ fulfil: 'wait' }),
    setDrop: () => patch({ fulfil: 'drop' }),
    waitPillBg: waitSel ? T.accent : waitAllowed ? '#fff' : '#F2F2F0',
    waitPillFg: waitSel ? '#fff' : waitAllowed ? '#33403A' : '#B0B7B3',
    waitPillBd: waitSel ? T.accent : '#E2E8E5',
    dropPillBg: dropSel ? T.accent : '#fff',
    dropPillFg: dropSel ? '#fff' : '#33403A',
    dropPillBd: dropSel ? T.accent : '#E2E8E5',
    cta1: canConfirm ? 'Hold my bay · pay deposit' : 'Pick a slot to continue',
    cta1bg: canConfirm ? T.accent : '#D8DEDB',
    cta1fg: canConfirm ? '#fff' : '#9AA6A0',
    track: trackRows(T.accent),
    doneBack: wl ? 'Done' : 'Back to your garages',

    // location
    locPerm: st.locPerm,
    pinX: st.pin.x + '%',
    pinY: st.pin.y + '%',
    pinArea,
    town: st.town,
    onMapTap: (e: React.MouseEvent<HTMLDivElement>) => onMapTap(e),
    allowLoc: () => allowLoc(),
    onTown: (e: React.ChangeEvent<HTMLInputElement>) => onTown(e),
    confirmLocation: () => patch({ s: 5 }),

    // roadside
    roadOpts,
    roadTrack: roadTrack(),
    toRoadside: () => patch({ s: 7 }),
    requestRoad: () => patch({ s: 8 }),

    // owner
    ownerBookings: st.ownerTab === 'bookings',
    ownerHours: st.ownerTab === 'hours',
    ownerSettings: st.ownerTab === 'settings',
    tabBookings: () => patch({ ownerTab: 'bookings' }),
    tabHours: () => patch({ ownerTab: 'hours' }),
    tabSettings: () => patch({ ownerTab: 'settings' }),
    tabBookingsCol: st.ownerTab === 'bookings' ? T.accent : '#9AA6A0',
    tabHoursCol: st.ownerTab === 'hours' ? T.accent : '#9AA6A0',
    tabSettingsCol: st.ownerTab === 'settings' ? T.accent : '#9AA6A0',
    bookings,
    todayCount: BOOKINGS.length,
    newCount,
    baysUsed,
    baysTotal: st.baysTotal,
    acceptingLabel: st.accepting ? 'Open for bookings' : 'Paused',
    toggleAccepting: () => patch({ accepting: !st.accepting }),
    acceptingBg: st.accepting ? T.accent : '#CBD5CF',
    acceptingX: st.accepting ? '23px' : '3px',
    baysUp: () => patch({ baysTotal: Math.min(12, st.baysTotal + 1) }),
    baysDown: () => patch({ baysTotal: Math.max(1, st.baysTotal - 1) }),
    ownerSlots,
    ownerServices,
    copyLink: () => copyLink(),
    copyLabel: st.copied ? 'Copied!' : 'Copy',
    planName: T.plan,
    planPrice: T.price,
    planFeatures: T.feats,

    // nav
    toLocation: () => patch({ s: 6 }),
    toHome: () => patch({ s: 0, away: null }),
    back,
    toIssue: () => patch({ s: 2 }),
    toSlot: () => patch({ s: 3 }),
    confirm: () => canConfirm && patch({ s: 4 }),
    reset: () =>
      patch({
        s: 0,
        away: null,
        issues: [],
        slot: null,
        note: '',
        aiDone: false,
        aiText: '',
        photos: [],
        voice: null,
      }),
  }
}

export type VM = ReturnType<typeof useBooking>
