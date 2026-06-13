import Link from 'next/link';

const COLORS = [
  { name: 'Flow Blue',    hex: '#1A6BFF', var: '--blue',    usage: 'Primary actions, links, AI layer' },
  { name: 'Flow Orange',  hex: '#FF6B1A', var: '--orange',  usage: 'Accents, energy, LI.FI layer' },
  { name: 'Flow Purple',  hex: '#7C3AED', var: '--purple',  usage: 'Hedera HCS, audit, immutability' },
  { name: 'Flow Teal',    hex: '#00D9A5', var: '--teal',    usage: 'Success, settlement, finality' },
  { name: 'Gold',         hex: '#FFB800', var: '--gold',    usage: 'Stats, premium details' },
  { name: 'Space Black',  hex: '#030712', var: '--bg',      usage: 'Background — deep space' },
  { name: 'Night Blue',   hex: '#0A1628', var: '--card',    usage: 'Cards, surfaces' },
  { name: 'Muted Blue',   hex: '#5C7A9E', var: '--muted',   usage: 'Secondary text, labels' },
];

const TYPOGRAPHY = [
  { name: 'Display',   spec: 'Geist Sans · 72px · weight 900 · tracking -2.5px', sample: 'Move money at\nthe speed of thought.' },
  { name: 'Heading 1', spec: 'Geist Sans · 36px · weight 800 · tracking -1px',   sample: 'How it works' },
  { name: 'Heading 2', spec: 'Geist Sans · 26px · weight 800 · tracking -0.5px', sample: 'Three layers' },
  { name: 'Body',      spec: 'Geist Sans · 15px · weight 400 · leading 1.65',    sample: 'Type what you want to pay. FlowPay handles the rest.' },
  { name: 'Label',     spec: 'Geist Sans · 10px · weight 700 · tracking 1.5px · uppercase', sample: 'PAYMENT TERMINAL' },
  { name: 'Code',      spec: 'Geist Mono · 12px · weight 400',                   sample: '0x22aca0ca00000000...' },
];

const ANIMATIONS = [
  { name: 'Flow Gradient', desc: 'The brand text gradient cycles through Blue → Purple → Orange in 5s. Used for the hero headline.', class: 'flow-gradient-text', sample: 'the speed of thought.' },
  { name: 'Orb Float',     desc: 'Background orbs drift vertically ±20px over 9s. Creates depth without distraction.', sample: null },
  { name: 'Stream Dots',   desc: 'Dots travel left-to-right along pipeline connectors while a payment is processing. 3 dots staggered 0.55s apart.', sample: null },
  { name: 'Fade Slide Up', desc: 'Result cards animate in from 20px below with opacity 0→1. Staggered 80ms per card.', sample: null },
  { name: 'Pulse Ring',    desc: 'The live-status dot emits an expanding ring. Signals activity without being distracting.', sample: null },
];

export default function Brand() {
  return (
    <div style={{ background: 'var(--bg)', minHeight: '100vh', color: 'var(--text)' }}>

      {/* NAV */}
      <nav style={{ background: 'rgba(3,7,18,0.9)', backdropFilter: 'blur(16px)', borderBottom: '1px solid var(--border)', position: 'sticky', top: 0, zIndex: 50 }}>
        <div style={{ maxWidth: 1000, margin: '0 auto', padding: '0 24px', height: 60, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <Link href="/" style={{ textDecoration: 'none', fontSize: 19, fontWeight: 900, letterSpacing: '-0.5px' }}>
            Flow<span style={{ color: 'var(--orange)' }}>Pay</span>
          </Link>
          <div style={{ display: 'flex', gap: 24 }}>
            <Link href="/" className="nav-link">App</Link>
            <Link href="/docs" className="nav-link">Docs</Link>
            <a href="https://github.com/riesgopais/flowpay" target="_blank" rel="noopener noreferrer" className="nav-link">GitHub ↗</a>
          </div>
        </div>
      </nav>

      <div style={{ maxWidth: 1000, margin: '0 auto', padding: '64px 24px 120px' }}>

        {/* HEADER */}
        <div style={{ marginBottom: 72 }}>
          <div style={{ fontSize: 10, color: 'var(--muted)', fontWeight: 700, letterSpacing: '2px', textTransform: 'uppercase', marginBottom: 16 }}>Brand Manual · v1.0 · ETHGlobal NYC 2026</div>
          <h1 style={{ fontSize: 48, fontWeight: 900, letterSpacing: '-2px', marginBottom: 20 }}>
            Flow<span style={{ color: 'var(--orange)' }}>Pay</span> Brand System
          </h1>
          <p style={{ fontSize: 17, color: 'var(--muted-light)', maxWidth: 580, lineHeight: 1.6 }}>
            FlowPay is built on the idea that moving money across blockchains should feel like sending a message — fast, intentional, and frictionless. Every design decision reinforces that feeling.
          </p>
        </div>

        {/* LOGO */}
        <section style={{ marginBottom: 72 }}>
          <h2 style={{ fontSize: 22, fontWeight: 800, letterSpacing: '-0.5px', marginBottom: 8 }}>Logo</h2>
          <p style={{ fontSize: 14, color: 'var(--muted-light)', marginBottom: 28, lineHeight: 1.6 }}>
            The wordmark is set in Geist Sans weight 900. &ldquo;Flow&rdquo; appears in the primary text color; &ldquo;Pay&rdquo; in Flow Orange. The split reinforces the two-part nature of the product: movement (Flow) + transaction (Pay).
          </p>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 16 }}>
            {[
              { bg: '#030712', border: 'var(--border)', label: 'Dark background (primary)' },
              { bg: '#060F20', border: 'var(--border)', label: 'Surface background' },
              { bg: '#0A1628', border: 'var(--border)', label: 'Card background' },
            ].map(({ bg, border, label }) => (
              <div key={label} style={{ background: bg, border: `1px solid ${border}`, borderRadius: 14, padding: '32px 24px', textAlign: 'center' }}>
                <div style={{ fontSize: 28, fontWeight: 900, letterSpacing: '-1px', marginBottom: 16 }}>
                  Flow<span style={{ color: 'var(--orange)' }}>Pay</span>
                </div>
                <div style={{ fontSize: 10, color: 'var(--muted)', fontWeight: 600, letterSpacing: '0.5px' }}>{label}</div>
              </div>
            ))}
          </div>

          <div style={{ marginTop: 20, padding: '16px 20px', background: 'rgba(255,107,26,0.08)', border: '1px solid var(--orange-border)', borderRadius: 12 }}>
            <p style={{ fontSize: 13, color: 'var(--muted-light)', margin: 0 }}>
              <strong style={{ color: 'var(--text)' }}>Do not use</strong> the logo on light backgrounds. Do not separate &ldquo;Flow&rdquo; and &ldquo;Pay&rdquo; with different weights or sizes. Do not recolor &ldquo;Pay&rdquo; to any color other than Flow Orange.
            </p>
          </div>
        </section>

        {/* COLORS */}
        <section style={{ marginBottom: 72 }}>
          <h2 style={{ fontSize: 22, fontWeight: 800, letterSpacing: '-0.5px', marginBottom: 8 }}>Color Palette</h2>
          <p style={{ fontSize: 14, color: 'var(--muted-light)', marginBottom: 28, lineHeight: 1.6 }}>
            Inspired by New York Knicks' signature blue and orange — elevated for a technical, premium context. Deep space backgrounds create contrast and depth; the four semantic accent colors map directly to FlowPay's four functional layers.
          </p>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 14 }}>
            {COLORS.map(({ name, hex, usage }) => (
              <div key={name}>
                <div className="brand-swatch" style={{ background: hex, marginBottom: 10, border: hex === '#030712' ? '1px solid var(--border)' : 'none' }}>
                  <div style={{ position: 'absolute', bottom: 10, left: 12, fontSize: 11, fontFamily: 'var(--font-geist-mono,monospace)', color: hex === '#030712' || hex === '#0A1628' ? 'var(--muted)' : 'rgba(0,0,0,0.7)', fontWeight: 700 }}>{hex}</div>
                </div>
                <div style={{ fontSize: 12, fontWeight: 700, marginBottom: 3 }}>{name}</div>
                <div style={{ fontSize: 11, color: 'var(--muted)', lineHeight: 1.4 }}>{usage}</div>
              </div>
            ))}
          </div>
        </section>

        {/* TYPOGRAPHY */}
        <section style={{ marginBottom: 72 }}>
          <h2 style={{ fontSize: 22, fontWeight: 800, letterSpacing: '-0.5px', marginBottom: 8 }}>Typography</h2>
          <p style={{ fontSize: 14, color: 'var(--muted-light)', marginBottom: 28, lineHeight: 1.6 }}>
            Geist Sans (variable) for all UI text. Geist Mono for code, transaction IDs, and technical values. High font-weight contrast (900 display / 400 body) creates visual rhythm.
          </p>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 0 }}>
            {TYPOGRAPHY.map(({ name, spec, sample }) => (
              <div key={name} style={{ padding: '24px 0', borderBottom: '1px solid var(--border)', display: 'grid', gridTemplateColumns: '160px 1fr', gap: 24, alignItems: 'start' }}>
                <div>
                  <div style={{ fontSize: 12, fontWeight: 700, marginBottom: 4 }}>{name}</div>
                  <div style={{ fontSize: 10, color: 'var(--muted)', lineHeight: 1.5 }}>{spec}</div>
                </div>
                <div style={{
                  fontFamily: name === 'Code' ? 'var(--font-geist-mono,monospace)' : undefined,
                  fontSize: name === 'Display' ? 28 : name === 'Heading 1' ? 22 : name === 'Heading 2' ? 17 : name === 'Label' ? 10 : name === 'Code' ? 12 : 14,
                  fontWeight: name === 'Display' ? 900 : name.startsWith('Heading') ? 800 : name === 'Label' ? 700 : 400,
                  letterSpacing: name === 'Display' ? '-1px' : name === 'Label' ? '1.5px' : undefined,
                  textTransform: name === 'Label' ? 'uppercase' as const : undefined,
                  color: name === 'Display' ? 'var(--text)' : name === 'Code' ? 'var(--muted-light)' : undefined,
                  lineHeight: name === 'Body' ? 1.65 : 1.2,
                  whiteSpace: 'pre-line',
                }}>
                  {sample}
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* ANIMATION */}
        <section style={{ marginBottom: 72 }}>
          <h2 style={{ fontSize: 22, fontWeight: 800, letterSpacing: '-0.5px', marginBottom: 8 }}>Motion & Flow</h2>
          <p style={{ fontSize: 14, color: 'var(--muted-light)', marginBottom: 28, lineHeight: 1.6 }}>
            Every animation in FlowPay communicates <em>movement</em> or <em>progress</em>. Nothing animates for decoration alone. The core principle: animations should feel like money flowing through a pipe — directional, purposeful, and visible only when relevant.
          </p>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
            {ANIMATIONS.map(({ name, desc, sample }) => (
              <div key={name} style={{ background: 'var(--card)', border: '1px solid var(--border)', borderRadius: 14, padding: '18px 20px', display: 'grid', gridTemplateColumns: '1fr auto', gap: 20, alignItems: 'center' }}>
                <div>
                  <div style={{ fontSize: 13, fontWeight: 700, marginBottom: 5 }}>{name}</div>
                  <div style={{ fontSize: 12, color: 'var(--muted-light)', lineHeight: 1.5 }}>{desc}</div>
                </div>
                {sample && (
                  <div className="flow-gradient-text" style={{ fontSize: 16, fontWeight: 900, whiteSpace: 'nowrap' }}>
                    {sample}
                  </div>
                )}
              </div>
            ))}
          </div>
          <div style={{ marginTop: 24, padding: '16px 20px', background: 'var(--blue-dim)', border: '1px solid var(--blue-border)', borderRadius: 12 }}>
            <div style={{ fontSize: 11, color: 'var(--blue-light)', fontWeight: 700, marginBottom: 6, letterSpacing: '0.5px' }}>ANIMATION PRINCIPLES</div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
              {['Easing: cubic-bezier(0.22, 1, 0.36, 1) — fast out, slow settle (never linear)', 'Duration: 300–550ms for UI transitions. 1.6–9s for ambient/background.', 'Direction: always left-to-right for data flow, bottom-to-top for card reveals.', 'Never animate text size, only opacity and transform.'].map(p => (
                <div key={p} style={{ fontSize: 12, color: 'var(--muted-light)', display: 'flex', gap: 10 }}>
                  <span style={{ color: 'var(--blue)' }}>→</span>{p}
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* VOICE */}
        <section style={{ marginBottom: 72 }}>
          <h2 style={{ fontSize: 22, fontWeight: 800, letterSpacing: '-0.5px', marginBottom: 8 }}>Voice & Tone</h2>
          <p style={{ fontSize: 14, color: 'var(--muted-light)', marginBottom: 28, lineHeight: 1.6 }}>
            FlowPay speaks like a precision instrument — confident, minimal, no filler.
          </p>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
            {[
              { label: 'Precise', desc: 'Every word earns its place. "<3 sec finality" not "super fast payments".' },
              { label: 'Honest', desc: 'Acknowledge limitations directly. "LI.FI flow compiled — execution requires funded wallet." Not hidden.' },
              { label: 'Technical', desc: 'Name the tech explicitly: HCS, HBAR, Claude Haiku, LI.FI Composer. The audience values specificity.' },
              { label: 'No hype', desc: 'Never say "revolutionary" or "game-changing". Let the on-chain receipts speak.' },
            ].map(({ label, desc }) => (
              <div key={label} style={{ background: 'var(--card)', border: '1px solid var(--border)', borderRadius: 12, padding: '18px 20px' }}>
                <div style={{ fontSize: 13, fontWeight: 700, color: 'var(--blue-light)', marginBottom: 6 }}>{label}</div>
                <div style={{ fontSize: 13, color: 'var(--muted-light)', lineHeight: 1.5 }}>{desc}</div>
              </div>
            ))}
          </div>
        </section>

        {/* TAGLINE */}
        <section>
          <h2 style={{ fontSize: 22, fontWeight: 800, letterSpacing: '-0.5px', marginBottom: 28 }}>Core Tagline</h2>
          <div style={{ background: 'var(--card)', border: '1px solid var(--border)', borderRadius: 18, padding: '48px', textAlign: 'center' }}>
            <div style={{ fontSize: 36, fontWeight: 900, letterSpacing: '-1.5px', marginBottom: 16 }}>
              <span className="flow-gradient-text">Move money at the speed of thought.</span>
            </div>
            <div style={{ fontSize: 14, color: 'var(--muted)', maxWidth: 400, margin: '0 auto', lineHeight: 1.6 }}>
              Secondary: <em>&ldquo;Type what you want to pay. FlowPay handles the rest.&rdquo;</em>
            </div>
          </div>
        </section>

      </div>
    </div>
  );
}
