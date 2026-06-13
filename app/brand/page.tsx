import Link from 'next/link';

const COLORS = [
  { name: 'Black',       hex: '#000000', text: '#444',    usage: 'Background — pure black'    },
  { name: 'Surface',     hex: '#0A0A0A', text: '#555',    usage: 'Page surface'               },
  { name: 'Card',        hex: '#141414', text: '#666',    usage: 'Cards, modules'             },
  { name: 'Flow Orange', hex: '#FF6B1A', text: '#fff',    usage: 'Brand accent — used alone'  },
  { name: 'AI Blue',     hex: '#0A84FF', text: '#fff',    usage: 'Claude AI layer indicator'  },
  { name: 'HCS Purple',  hex: '#BF5AF2', text: '#fff',    usage: 'Hedera HCS layer indicator' },
  { name: 'Settle Green',hex: '#32D74B', text: '#fff',    usage: 'Settlement / success'       },
  { name: 'Text Primary',hex: '#F5F5F7', text: '#000',    usage: 'Headlines, primary text'    },
  { name: 'Text Gray',   hex: '#86868B', text: '#fff',    usage: 'Body, secondary text'       },
];

const TYPE_SCALE = [
  { role: 'Display',   size: '80px', weight: 700,  tracking: '-3px',  sample: 'Move money at\nthe speed of thought.' },
  { role: 'Title 1',   size: '40px', weight: 700,  tracking: '-1.5px', sample: 'FlowPay Documentation' },
  { role: 'Title 2',   size: '28px', weight: 700,  tracking: '-0.8px', sample: 'The three layers'       },
  { role: 'Headline',  size: '17px', weight: 600,  tracking: '-0.1px', sample: 'Intent Parsed'         },
  { role: 'Body',      size: '17px', weight: 400,  tracking: '-0.1px', sample: 'Type what you want to pay. FlowPay handles the rest — routing, execution, and settlement.' },
  { role: 'Caption',   size: '12px', weight: 400,  tracking: '0.2px',  sample: 'Hedera Testnet · Topic 0.0.9217982' },
  { role: 'Label',     size: '11px', weight: 600,  tracking: '0.8px',  sample: 'PAYMENT TERMINAL',    textTransform: true },
  { role: 'Mono',      size: '12px', weight: 400,  tracking: '0px',    sample: '0x22aca0ca00000000...', mono: true },
];

const MOTION = [
  { name: 'Fade Up',        spec: '0.6s · cubic-bezier(0.4, 0, 0.2, 1)',   use: 'Result cards, page content entering' },
  { name: 'Fade In',        spec: '0.45s · ease',                           use: 'Overlays, tooltips, nav changes'     },
  { name: 'Step Fill',      spec: '0.55s · ease · width 0→100%',            use: 'Pipeline progress bars while processing' },
  { name: 'Spin',           spec: '0.7s · linear · infinite',               use: 'Loading states only — never decorative'  },
  { name: 'Blink',          spec: '2.2s · ease · infinite',                 use: 'Live status dot in the chip'         },
  { name: 'Card hover',     spec: 'background + border · 0.2s ease',        use: 'All interactive cards on hover'      },
];

export default function Brand() {
  return (
    <div style={{ background: 'var(--bg)', minHeight: '100vh', color: 'var(--text-1)' }}>

      <header style={{ background: 'rgba(0,0,0,0.82)', backdropFilter: 'saturate(180%) blur(20px)', WebkitBackdropFilter: 'saturate(180%) blur(20px)', borderBottom: '1px solid var(--separator)', position: 'sticky', top: 0, zIndex: 50 }}>
        <div style={{ maxWidth: 960, margin: '0 auto', padding: '0 24px', height: 52, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <Link href="/" style={{ textDecoration: 'none', fontSize: 18, fontWeight: 700, letterSpacing: '-0.4px', color: 'var(--text-1)' }}>
            Flow<span style={{ color: 'var(--accent)' }}>Pay</span>
          </Link>
          <nav style={{ display: 'flex', gap: 32 }}>
            <Link href="/"     className="nav-link">App</Link>
            <Link href="/docs" className="nav-link">Docs</Link>
            <a href="https://github.com/riesgopais/flowpay" target="_blank" rel="noopener noreferrer" className="nav-link">GitHub</a>
          </nav>
        </div>
      </header>

      <main style={{ maxWidth: 960, margin: '0 auto', padding: '80px 24px 120px' }}>

        {/* HEADER */}
        <div style={{ marginBottom: 96 }}>
          <p style={{ fontSize: 12, color: 'var(--text-3)', fontWeight: 600, letterSpacing: '0.8px', textTransform: 'uppercase', marginBottom: 20 }}>Brand Manual · v1.0</p>
          <h1 style={{ fontSize: 64, fontWeight: 700, letterSpacing: '-2.5px', lineHeight: 1.05, marginBottom: 24 }}>
            Flow<span style={{ color: 'var(--accent)' }}>Pay</span><br />Brand System
          </h1>
          <p style={{ fontSize: 21, color: 'var(--text-2)', maxWidth: 540, lineHeight: 1.5, fontWeight: 400 }}>
            FlowPay is built on the idea that moving money across blockchains should feel like sending a message — fast, intentional, frictionless. Every design decision reinforces that feeling.
          </p>
        </div>

        {/* LOGO */}
        <section style={{ marginBottom: 96 }}>
          <h2 style={{ fontSize: 28, fontWeight: 700, letterSpacing: '-0.8px', marginBottom: 8 }}>Logo</h2>
          <p style={{ fontSize: 17, color: 'var(--text-2)', lineHeight: 1.65, maxWidth: 600, marginBottom: 32 }}>
            The wordmark is set in Geist Sans weight 700. &ldquo;Flow&rdquo; appears in primary white; &ldquo;Pay&rdquo; in Flow Orange — the single brand accent color. The split communicates movement + transaction.
          </p>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 12 }}>
            {[
              { bg: '#000000', border: 'rgba(255,255,255,0.1)', label: 'On black (primary)'  },
              { bg: '#141414', border: 'rgba(255,255,255,0.08)', label: 'On card surface'    },
              { bg: '#0A0A0A', border: 'rgba(255,255,255,0.06)', label: 'On page surface'   },
            ].map(({ bg, border, label }) => (
              <div key={label} style={{ background: bg, border: `1px solid ${border}`, borderRadius: 16, padding: '40px 24px', textAlign: 'center' }}>
                <div style={{ fontSize: 28, fontWeight: 700, letterSpacing: '-0.8px', marginBottom: 16 }}>
                  Flow<span style={{ color: 'var(--accent)' }}>Pay</span>
                </div>
                <p style={{ fontSize: 11, color: 'rgba(255,255,255,0.3)', letterSpacing: '0.3px' }}>{label}</p>
              </div>
            ))}
          </div>
          <div style={{ marginTop: 14, padding: '14px 18px', background: 'var(--card)', border: '1px solid var(--border)', borderRadius: 12 }}>
            <p style={{ fontSize: 13, color: 'var(--text-2)' }}>
              <strong style={{ color: 'var(--text-1)', fontWeight: 600 }}>Never use</strong> the logo on light backgrounds. Never separate &ldquo;Flow&rdquo; and &ldquo;Pay&rdquo; into different sizes or weights. Never recolor &ldquo;Pay&rdquo; to any color other than Flow Orange (#FF6B1A).
            </p>
          </div>
        </section>

        {/* COLORS */}
        <section style={{ marginBottom: 96 }}>
          <h2 style={{ fontSize: 28, fontWeight: 700, letterSpacing: '-0.8px', marginBottom: 8 }}>Color</h2>
          <p style={{ fontSize: 17, color: 'var(--text-2)', lineHeight: 1.65, maxWidth: 600, marginBottom: 32 }}>
            One accent color. Everything else is black, gray, or white. The four service colors (blue, orange, purple, green) appear only as thin left-border indicators on result cards — never as fills or backgrounds.
          </p>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 12 }}>
            {COLORS.map(({ name, hex, text, usage }) => (
              <div key={name}>
                <div className="brand-swatch" style={{ background: hex, border: hex === '#000000' ? '1px solid rgba(255,255,255,0.1)' : hex === '#0A0A0A' ? '1px solid rgba(255,255,255,0.06)' : hex === '#141414' ? '1px solid rgba(255,255,255,0.08)' : 'none', display: 'flex', alignItems: 'flex-end', padding: '10px 12px', marginBottom: 8 }}>
                  <span style={{ fontSize: 11, fontFamily: 'var(--font-geist-mono,monospace)', color: text, fontWeight: 600 }}>{hex}</span>
                </div>
                <p style={{ fontSize: 12, fontWeight: 600, marginBottom: 2 }}>{name}</p>
                <p style={{ fontSize: 11, color: 'var(--text-2)' }}>{usage}</p>
              </div>
            ))}
          </div>
        </section>

        {/* TYPOGRAPHY */}
        <section style={{ marginBottom: 96 }}>
          <h2 style={{ fontSize: 28, fontWeight: 700, letterSpacing: '-0.8px', marginBottom: 8 }}>Typography</h2>
          <p style={{ fontSize: 17, color: 'var(--text-2)', lineHeight: 1.65, maxWidth: 600, marginBottom: 40 }}>
            Geist Sans for all UI text — SF Pro&rsquo;s spiritual cousin. Geist Mono for technical values. High weight contrast (700/600 display vs 400 body) creates visual hierarchy without decoration.
          </p>
          <div style={{ borderTop: '1px solid var(--separator)' }}>
            {TYPE_SCALE.map(({ role, size, weight, tracking, sample, textTransform, mono }) => (
              <div key={role} style={{ padding: '28px 0', borderBottom: '1px solid var(--separator)', display: 'grid', gridTemplateColumns: '140px 1fr', gap: 32, alignItems: 'start' }}>
                <div>
                  <p style={{ fontSize: 13, fontWeight: 600, marginBottom: 4 }}>{role}</p>
                  <p style={{ fontSize: 11, color: 'var(--text-3)', lineHeight: 1.5, fontFamily: 'var(--font-geist-mono,monospace)' }}>{size} · {weight}</p>
                </div>
                <p style={{
                  fontFamily: mono ? 'var(--font-geist-mono,"SF Mono",monospace)' : undefined,
                  fontSize: parseInt(size) > 40 ? 36 : parseInt(size) > 25 ? 22 : parseInt(size) > 16 ? 16 : parseInt(size) > 13 ? 13 : 12,
                  fontWeight: weight,
                  letterSpacing: tracking,
                  textTransform: textTransform ? 'uppercase' as const : undefined,
                  color: mono ? 'var(--text-2)' : role === 'Caption' || role === 'Label' ? 'var(--text-2)' : 'var(--text-1)',
                  lineHeight: 1.2,
                  whiteSpace: 'pre-line',
                }}>{sample}</p>
              </div>
            ))}
          </div>
        </section>

        {/* MOTION */}
        <section style={{ marginBottom: 96 }}>
          <h2 style={{ fontSize: 28, fontWeight: 700, letterSpacing: '-0.8px', marginBottom: 8 }}>Motion</h2>
          <p style={{ fontSize: 17, color: 'var(--text-2)', lineHeight: 1.65, maxWidth: 600, marginBottom: 32 }}>
            Every animation communicates state or progress — never decorates. Animations should feel like money flowing through a pipe: directional, purposeful, and visible only when relevant.
          </p>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 0, borderTop: '1px solid var(--separator)' }}>
            {MOTION.map(({ name, spec, use }) => (
              <div key={name} style={{ padding: '20px 0', borderBottom: '1px solid var(--separator)', display: 'grid', gridTemplateColumns: '160px 220px 1fr', gap: 24, alignItems: 'center' }}>
                <p style={{ fontSize: 14, fontWeight: 600 }}>{name}</p>
                <p style={{ fontSize: 12, color: 'var(--text-2)', fontFamily: 'var(--font-geist-mono,monospace)' }}>{spec}</p>
                <p style={{ fontSize: 13, color: 'var(--text-2)' }}>{use}</p>
              </div>
            ))}
          </div>
          <div style={{ marginTop: 24, display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
            {[
              ['Easing',    'cubic-bezier(0.4, 0, 0.2, 1) — fast out, slow settle. The Apple standard. Never linear.'],
              ['Direction', 'Left-to-right for data flow. Bottom-to-top for content entering the screen.'],
              ['Scale',     'No element animates its font-size. Only opacity, transform, and color.'],
              ['Restraint', 'If you can remove the animation and nothing feels broken, remove it.'],
            ].map(([title, desc]) => (
              <div key={title} style={{ background: 'var(--card)', border: '1px solid var(--border)', borderRadius: 14, padding: '18px 20px' }}>
                <p style={{ fontSize: 13, fontWeight: 600, marginBottom: 6 }}>{title}</p>
                <p style={{ fontSize: 13, color: 'var(--text-2)', lineHeight: 1.55 }}>{desc}</p>
              </div>
            ))}
          </div>
        </section>

        {/* VOICE */}
        <section style={{ marginBottom: 96 }}>
          <h2 style={{ fontSize: 28, fontWeight: 700, letterSpacing: '-0.8px', marginBottom: 8 }}>Voice & Tone</h2>
          <p style={{ fontSize: 17, color: 'var(--text-2)', lineHeight: 1.65, maxWidth: 600, marginBottom: 32 }}>
            FlowPay speaks like a precision instrument. Confident, minimal, no filler.
          </p>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
            {[
              ['Precise',    'Every word earns its place. "&lt;3s finality" — not "super fast payments".',                                              true  ],
              ['Honest',     'Acknowledge limitations directly. Never hide behind vagueness.',                                                           true  ],
              ['Technical',  'Name the tech explicitly — HCS, HBAR, Claude Haiku, LI.FI Composer. Specificity is credibility.',                        true  ],
              ['No hype',    'Never say "revolutionary". Let the on-chain receipts on Hashscan speak. The product is the pitch.',                        false ],
            ].map(([title, desc, good]) => (
              <div key={title as string} style={{ background: 'var(--card)', border: '1px solid var(--border)', borderRadius: 14, padding: '20px 22px' }}>
                <p style={{ fontSize: 13, fontWeight: 600, color: good ? 'var(--text-1)' : 'var(--text-1)', marginBottom: 8, display: 'flex', alignItems: 'center', gap: 8 }}>
                  {title as string}
                </p>
                <p style={{ fontSize: 13, color: 'var(--text-2)', lineHeight: 1.6 }}>{desc as string}</p>
              </div>
            ))}
          </div>
        </section>

        {/* TAGLINE */}
        <section>
          <h2 style={{ fontSize: 28, fontWeight: 700, letterSpacing: '-0.8px', marginBottom: 32 }}>Core Tagline</h2>
          <div style={{ background: 'var(--card)', border: '1px solid var(--border)', borderRadius: 24, padding: '64px 48px', textAlign: 'center' }}>
            <p style={{ fontSize: 'clamp(28px, 4vw, 48px)', fontWeight: 700, letterSpacing: '-1.5px', lineHeight: 1.1, color: 'var(--text-1)', marginBottom: 20 }}>
              Move money at the speed of thought.
            </p>
            <p style={{ fontSize: 17, color: 'var(--text-2)', fontWeight: 400 }}>
              Secondary: <em>&ldquo;Type what you want to pay. FlowPay handles the rest.&rdquo;</em>
            </p>
          </div>
        </section>

      </main>
    </div>
  );
}
