import type { Metadata } from 'next'
import Link from 'next/link'

export const metadata: Metadata = {
  title: 'AutoCheck — Book your car into a garage you trust',
  description:
    'Find verified garages near you, describe your issue, and reserve a bay — no calling around, no queues. The booking layer for African garages.',
}

export default function MarketingPage() {
  return (
    <div style={{ background: '#fff', color: '#0F1A14', fontFamily: "'Manrope', sans-serif" }}>
      <Nav />
      <Hero />
      <HowItWorks />
      <Trust />
      <Testimonials />
      <GarageOwnerCTA />
      <Footer />
    </div>
  )
}

/* ── Navigation ─────────────────────────────────────────────────── */

function Nav() {
  return (
    <nav
      style={{
        position: 'sticky',
        top: 0,
        zIndex: 40,
        background: 'rgba(255,255,255,.92)',
        backdropFilter: 'blur(12px)',
        borderBottom: '1px solid #E6EEEA',
      }}
    >
      <div style={{ maxWidth: 1100, margin: '0 auto', padding: '0 24px', height: 64, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 9 }}>
          <div style={{ width: 32, height: 32, borderRadius: 9, background: '#0E7C50', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
              <path d="M12 3l7 3v5c0 4.5-3 7.5-7 9-4-1.5-7-4.5-7-9V6z" fill="#fff" />
            </svg>
          </div>
          <span style={{ font: "800 18px 'Archivo'", letterSpacing: '-.02em' }}>AutoCheck</span>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 20 }}>
          <Link href="/register" style={{ font: "600 13px 'Manrope'", color: '#5A645E', textDecoration: 'none' }}>
            Own a garage?
          </Link>
          <Link
            href="/book"
            style={{
              font: "700 13px 'Manrope'",
              color: '#fff',
              background: '#0E7C50',
              borderRadius: 10,
              padding: '9px 18px',
              textDecoration: 'none',
            }}
          >
            Find a garage
          </Link>
        </div>
      </div>
    </nav>
  )
}

/* ── Hero ────────────────────────────────────────────────────────── */

function Hero() {
  return (
    <section
      style={{
        background: 'linear-gradient(160deg, #0A3D28 0%, #0E7C50 50%, #12A868 100%)',
        color: '#fff',
        padding: '80px 24px 90px',
        position: 'relative',
        overflow: 'hidden',
      }}
    >
      {/* Decorative car silhouette */}
      <svg
        style={{ position: 'absolute', right: -60, bottom: -20, opacity: 0.08 }}
        width="420"
        height="420"
        viewBox="0 0 24 24"
        fill="#fff"
      >
        <path d="M5 11l1.5-4.5A2 2 0 018.4 5h7.2a2 2 0 011.9 1.5L19 11m-14 0h14m-14 0a2 2 0 00-2 2v3h2m14-5a2 2 0 012 2v3h-2M7 16h10M6 16v2m12-2v2" />
      </svg>

      <div style={{ maxWidth: 700, margin: '0 auto', position: 'relative', textAlign: 'center' }}>
        <div
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: 8,
            background: 'rgba(255,255,255,.15)',
            border: '1px solid rgba(255,255,255,.2)',
            borderRadius: 999,
            padding: '6px 16px',
            marginBottom: 28,
            font: "600 12px 'Space Mono'",
            letterSpacing: '.04em',
          }}
        >
          <span style={{ width: 8, height: 8, borderRadius: '50%', background: '#4ADE80' }} />
          LIVE IN NAIROBI
        </div>

        <h1
          style={{
            font: "800 48px/1.08 'Archivo'",
            letterSpacing: '-.03em',
            margin: '0 0 18px',
          }}
        >
          Book your car into a garage you trust
        </h1>

        <p
          style={{
            font: "400 18px/1.55 'Manrope'",
            opacity: 0.9,
            margin: '0 auto 36px',
            maxWidth: 520,
          }}
        >
          Find verified garages near you, describe your issue, and reserve a bay.
          No calling around, no queues — just drive straight in.
        </p>

        <div style={{ display: 'flex', justifyContent: 'center', gap: 14, flexWrap: 'wrap' }}>
          <Link
            href="/book"
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: 10,
              background: '#fff',
              color: '#0E7C50',
              borderRadius: 14,
              padding: '16px 32px',
              font: "800 16px 'Manrope'",
              textDecoration: 'none',
              boxShadow: '0 8px 24px rgba(0,0,0,.18)',
            }}
          >
            Find a garage near you
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
              <path d="M5 12h14M13 6l6 6-6 6" stroke="#0E7C50" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </Link>
        </div>

        <div style={{ display: 'flex', justifyContent: 'center', gap: 32, marginTop: 44, opacity: 0.85 }}>
          {[
            { n: 'No deposit', icon: 'M12 2a10 10 0 100 20 10 10 0 000-20zM8 12l2.5 2.5L16 9' },
            { n: 'Transparent pricing', icon: 'M12 2a10 10 0 100 20 10 10 0 000-20zM8 12l2.5 2.5L16 9' },
            { n: 'Verified garages', icon: 'M12 2a10 10 0 100 20 10 10 0 000-20zM8 12l2.5 2.5L16 9' },
          ].map((item, i) => (
            <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 7, font: "500 13px 'Manrope'" }}>
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
                <path d={item.icon} stroke="#4ADE80" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
              {item.n}
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}

/* ── How it works ────────────────────────────────────────────────── */

function HowItWorks() {
  const steps = [
    {
      num: '1',
      title: 'Find your garage',
      desc: 'Search nearby or pick one your friends already use. Check reviews, trust signals, and availability.',
      icon: (
        <svg width="28" height="28" viewBox="0 0 24 24" fill="none">
          <path d="M12 21s7-5.5 7-11a7 7 0 10-14 0c0 5.5 7 11 7 11z" stroke="#0E7C50" strokeWidth="2" />
          <circle cx="12" cy="10" r="2.5" stroke="#0E7C50" strokeWidth="2" />
        </svg>
      ),
    },
    {
      num: '2',
      title: 'Describe the issue',
      desc: 'Select what needs attention, add a note or photo. AI helps you put it into clear words for the mechanic.',
      icon: (
        <svg width="28" height="28" viewBox="0 0 24 24" fill="none">
          <path d="M12 3l1.6 4.4L18 9l-4.4 1.6L12 15l-1.6-4.4L6 9l4.4-1.6z" stroke="#0E7C50" strokeWidth="2" strokeLinejoin="round" />
          <circle cx="18" cy="17" r="2" stroke="#0E7C50" strokeWidth="2" />
        </svg>
      ),
    },
    {
      num: '3',
      title: 'Reserve your bay',
      desc: 'Pick a time, hold your slot. Drive straight in — no queue, no calling ahead. Pay after they inspect.',
      icon: (
        <svg width="28" height="28" viewBox="0 0 24 24" fill="none">
          <rect x="3" y="4" width="18" height="16" rx="2" stroke="#0E7C50" strokeWidth="2" />
          <path d="M3 10h18M8 2v4M16 2v4" stroke="#0E7C50" strokeWidth="2" strokeLinecap="round" />
          <path d="M9 15l2 2 4-4" stroke="#0E7C50" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      ),
    },
  ]

  return (
    <section style={{ padding: '80px 24px', maxWidth: 1100, margin: '0 auto' }}>
      <div style={{ textAlign: 'center', marginBottom: 56 }}>
        <div style={{ font: "700 12px 'Space Mono'", color: '#0E7C50', letterSpacing: '.08em', marginBottom: 12 }}>
          HOW IT WORKS
        </div>
        <h2 style={{ font: "800 36px/1.15 'Archivo'", letterSpacing: '-.02em', margin: 0 }}>
          Three steps to a stress-free service
        </h2>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: 24 }}>
        {steps.map((step) => (
          <div
            key={step.num}
            style={{
              background: '#F6F8F7',
              borderRadius: 20,
              padding: '32px 28px',
              border: '1px solid #E6EEEA',
            }}
          >
            <div
              style={{
                width: 52,
                height: 52,
                borderRadius: 14,
                background: '#E8F5EE',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                marginBottom: 20,
              }}
            >
              {step.icon}
            </div>
            <div style={{ font: "700 11px 'Space Mono'", color: '#0E7C50', letterSpacing: '.06em', marginBottom: 8 }}>
              STEP {step.num}
            </div>
            <h3 style={{ font: "800 20px 'Archivo'", margin: '0 0 8px' }}>{step.title}</h3>
            <p style={{ font: "400 14px/1.6 'Manrope'", color: '#5A645E', margin: 0 }}>{step.desc}</p>
          </div>
        ))}
      </div>
    </section>
  )
}

/* ── Trust section ───────────────────────────────────────────────── */

function Trust() {
  const points = [
    {
      title: 'NTSA-verified garages',
      desc: 'Every garage on AutoCheck is verified — licensed, inspected, and trusted by drivers in your network.',
    },
    {
      title: 'Written quotes before work',
      desc: 'No surprises. The garage inspects your car and gives you a written quote before touching anything.',
    },
    {
      title: 'Pay after, not before',
      desc: 'No deposit to book. Pay by M-Pesa at the garage after you approve the quote. Receipt every time.',
    },
    {
      title: 'Referred by people you know',
      desc: 'See which friends and contacts already use a garage. Real trust from real relationships.',
    },
  ]

  return (
    <section style={{ background: '#0F1A14', color: '#fff', padding: '80px 24px' }}>
      <div style={{ maxWidth: 1100, margin: '0 auto' }}>
        <div style={{ textAlign: 'center', marginBottom: 56 }}>
          <div style={{ font: "700 12px 'Space Mono'", color: '#4ADE80', letterSpacing: '.08em', marginBottom: 12 }}>
            WHY AUTOCHECK
          </div>
          <h2 style={{ font: "800 36px/1.15 'Archivo'", letterSpacing: '-.02em', margin: 0 }}>
            Booking a garage should be simple
          </h2>
          <p style={{ font: "400 16px/1.6 'Manrope'", color: '#9AA6A0', marginTop: 14, maxWidth: 500, marginLeft: 'auto', marginRight: 'auto' }}>
            We built AutoCheck because drivers in Kenya deserve better than calling
            around and hoping for the best.
          </p>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: 20 }}>
          {points.map((p, i) => (
            <div
              key={i}
              style={{
                background: 'rgba(255,255,255,.06)',
                border: '1px solid rgba(255,255,255,.1)',
                borderRadius: 18,
                padding: '28px 24px',
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 14 }}>
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
                  <path d="M12 3l7 3v5c0 4.5-3 7.5-7 9-4-1.5-7-4.5-7-9V6z" stroke="#4ADE80" strokeWidth="2" strokeLinejoin="round" />
                  <path d="M9.5 12l1.8 1.8L15 10" stroke="#4ADE80" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
                <h3 style={{ font: "700 16px 'Archivo'", margin: 0 }}>{p.title}</h3>
              </div>
              <p style={{ font: "400 13px/1.6 'Manrope'", color: '#9AA6A0', margin: 0 }}>{p.desc}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}

/* ── Testimonials ────────────────────────────────────────────────── */

function Testimonials() {
  const reviews = [
    {
      name: 'Grace W.',
      car: 'Toyota Premio',
      text: 'I used to dread taking my car in — now I just book on AutoCheck and drive straight in. No more waiting.',
      garage: 'Juma Auto Garage',
    },
    {
      name: 'David K.',
      car: 'Subaru Forester',
      text: 'My friend referred me to this garage through AutoCheck. Knowing someone I trust goes there made all the difference.',
      garage: 'Karanja Motors',
    },
    {
      name: 'Aisha M.',
      car: 'Honda Fit',
      text: 'The AI helped me describe my brake issue clearly. The mechanic knew exactly what to expect before I arrived.',
      garage: 'Westgate Auto',
    },
  ]

  return (
    <section style={{ padding: '80px 24px', maxWidth: 1100, margin: '0 auto' }}>
      <div style={{ textAlign: 'center', marginBottom: 48 }}>
        <div style={{ font: "700 12px 'Space Mono'", color: '#0E7C50', letterSpacing: '.08em', marginBottom: 12 }}>
          DRIVERS LOVE IT
        </div>
        <h2 style={{ font: "800 36px/1.15 'Archivo'", letterSpacing: '-.02em', margin: 0 }}>
          Real drivers, real bookings
        </h2>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: 20 }}>
        {reviews.map((r, i) => (
          <div
            key={i}
            style={{
              background: '#fff',
              border: '1px solid #E2E8E5',
              borderRadius: 20,
              padding: '28px 24px',
              boxShadow: '0 2px 12px rgba(15,40,30,.04)',
            }}
          >
            <div style={{ color: '#E8A33A', fontSize: 15, marginBottom: 14 }}>
              {'★'.repeat(5)}
            </div>
            <p style={{ font: "400 14px/1.65 'Manrope'", color: '#33403A', margin: '0 0 20px' }}>
              &ldquo;{r.text}&rdquo;
            </p>
            <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
              <div
                style={{
                  width: 36,
                  height: 36,
                  borderRadius: '50%',
                  background: '#0E7C50',
                  color: '#fff',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  font: "700 14px 'Manrope'",
                  flex: 'none',
                }}
              >
                {r.name[0]}
              </div>
              <div>
                <div style={{ font: "700 14px 'Manrope'" }}>{r.name}</div>
                <div style={{ font: "400 12px 'Manrope'", color: '#7B857F' }}>
                  {r.car} · {r.garage}
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </section>
  )
}

/* ── Garage owner CTA ────────────────────────────────────────────── */

function GarageOwnerCTA() {
  return (
    <section style={{ padding: '0 24px 80px', maxWidth: 1100, margin: '0 auto' }}>
      <div
        style={{
          background: 'linear-gradient(135deg, #E8F5EE 0%, #F6F8F7 100%)',
          border: '1px solid #D0E5DA',
          borderRadius: 24,
          padding: '56px 40px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          gap: 40,
          flexWrap: 'wrap',
        }}
      >
        <div style={{ flex: 1, minWidth: 280 }}>
          <div style={{ font: "700 12px 'Space Mono'", color: '#0E7C50', letterSpacing: '.08em', marginBottom: 12 }}>
            FOR GARAGE OWNERS
          </div>
          <h2 style={{ font: "800 32px/1.15 'Archivo'", letterSpacing: '-.02em', margin: '0 0 12px' }}>
            Fill your bays, not your phone
          </h2>
          <p style={{ font: "400 15px/1.6 'Manrope'", color: '#5A645E', margin: 0, maxWidth: 440 }}>
            Get a branded booking page, manage your schedule, and let drivers book
            themselves in. Bookings come with a structured diagnosis — your team
            knows what to prep before the car arrives.
          </p>
        </div>
        <Link
          href="/register"
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: 10,
            background: '#0E7C50',
            color: '#fff',
            borderRadius: 14,
            padding: '16px 32px',
            font: "700 15px 'Manrope'",
            textDecoration: 'none',
            boxShadow: '0 8px 18px rgba(14,124,80,.25)',
            flex: 'none',
          }}
        >
          Register your garage
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
            <path d="M5 12h14M13 6l6 6-6 6" stroke="#fff" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        </Link>
      </div>
    </section>
  )
}

/* ── Footer ──────────────────────────────────────────────────────── */

function Footer() {
  return (
    <footer style={{ background: '#0F1A14', color: '#9AA6A0', padding: '48px 24px' }}>
      <div
        style={{
          maxWidth: 1100,
          margin: '0 auto',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          flexWrap: 'wrap',
          gap: 20,
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: 9 }}>
          <div style={{ width: 28, height: 28, borderRadius: 8, background: '#0E7C50', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <svg width="15" height="15" viewBox="0 0 24 24" fill="none">
              <path d="M12 3l7 3v5c0 4.5-3 7.5-7 9-4-1.5-7-4.5-7-9V6z" fill="#fff" />
            </svg>
          </div>
          <span style={{ font: "700 15px 'Archivo'", color: '#fff' }}>AutoCheck</span>
        </div>

        <div style={{ display: 'flex', gap: 24, font: "500 13px 'Manrope'" }}>
          <Link href="/book" style={{ color: '#9AA6A0', textDecoration: 'none' }}>Find a garage</Link>
          <Link href="/register" style={{ color: '#9AA6A0', textDecoration: 'none' }}>For garages</Link>
          <Link href="/login" style={{ color: '#9AA6A0', textDecoration: 'none' }}>Sign in</Link>
        </div>

        <div style={{ font: "400 12px 'Manrope'", color: '#5A645E' }}>
          Built for drivers in Kenya
        </div>
      </div>
    </footer>
  )
}
