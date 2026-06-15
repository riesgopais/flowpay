'use client';

import Link from 'next/link';

// ── Sidebar navigation ─────────────────────────────────────────────────────────

const NAV = [
  {
    group: 'Introduction',
    items: [
      { id: 'what',       label: 'What is FlowPay' },
      { id: 'quickstart', label: 'Quickstart'       },
    ],
  },
  {
    group: 'Core Concepts',
    items: [
      { id: 'pipeline',   label: 'Payment pipeline'     },
      { id: 'parser',     label: 'Hybrid intent parser' },
      { id: 'ens',        label: 'Name resolution & ENS', badge: 'New' },
      { id: 'atomicity',  label: 'HCS atomicity'        },
    ],
  },
  {
    group: 'API Reference',
    items: [
      { id: 'api-parse',  label: 'POST /api/parse'      },
      { id: 'api-stream', label: 'POST /api/pay-stream' },
    ],
  },
  {
    group: 'Integrations',
    items: [
      { id: 'gemini',     label: 'Google Gemini 2.0 Flash' },
      { id: 'lifi',       label: 'LI.FI Composer SDK'      },
      { id: 'hedera',     label: 'Hedera HCS + HBAR'       },
      { id: 'ens-int',    label: 'ENS via viem'            },
    ],
  },
  {
    group: 'More',
    items: [
      { id: 'tokens',     label: 'Supported tokens' },
      { id: 'usecases',   label: 'Use cases'        },
      { id: 'faq',        label: 'FAQ'              },
    ],
  },
];

// ── Small reusable components ──────────────────────────────────────────────────

function Divider() {
  return <div style={{ height: 1, background: '#18181b', margin: '64px 0' }} />;
}

function SectionLabel({ children }: { children: React.ReactNode }) {
  return (
    <p style={{
      fontSize: 10, color: '#3f3f46', fontWeight: 700,
      letterSpacing: '0.9px', textTransform: 'uppercase', marginBottom: 8,
    }}>
      {children}
    </p>
  );
}

function Callout({ type = 'info', children }: { type?: 'info' | 'warning' | 'tip'; children: React.ReactNode }) {
  const colors = {
    info:    { border: '#0ea5e9', bg: 'rgba(14,165,233,0.06)',  text: '#7dd3fc' },
    warning: { border: '#f59e0b', bg: 'rgba(245,158,11,0.06)',  text: '#fcd34d' },
    tip:     { border: '#10b981', bg: 'rgba(16,185,129,0.06)',  text: '#6ee7b7' },
  }[type];
  const icons = { info: 'ℹ', warning: '⚠', tip: '✦' }[type];
  return (
    <div style={{
      background: colors.bg, borderLeft: `3px solid ${colors.border}`,
      borderRadius: '0 10px 10px 0', padding: '14px 18px', margin: '20px 0',
      display: 'flex', gap: 12,
    }}>
      <span style={{ color: colors.border, fontSize: 14, flexShrink: 0 }}>{icons}</span>
      <div style={{ fontSize: 13, color: '#a1a1aa', lineHeight: 1.65 }}>{children}</div>
    </div>
  );
}

function Code({ children }: { children: React.ReactNode }) {
  return (
    <code style={{
      fontSize: 12, background: '#0a0a0a', border: '1px solid #27272a',
      padding: '2px 7px', borderRadius: 5,
      fontFamily: 'var(--font-geist-mono, monospace)', color: '#e4e4e7',
    }}>
      {children}
    </code>
  );
}

function JsonBlock({ children, label }: { children: string; label?: string }) {
  return (
    <div style={{ margin: '16px 0' }}>
      {label && (
        <p style={{ fontSize: 10, color: '#3f3f46', fontWeight: 700, letterSpacing: '0.6px', textTransform: 'uppercase', marginBottom: 6 }}>
          {label}
        </p>
      )}
      <pre style={{
        background: '#09090b', border: '1px solid #27272a', borderRadius: 10,
        padding: '16px 18px', fontSize: 12,
        fontFamily: 'var(--font-geist-mono, monospace)',
        color: '#a1a1aa', lineHeight: 1.75, overflowX: 'auto', margin: 0,
        whiteSpace: 'pre',
      }}>
        {children}
      </pre>
    </div>
  );
}

function Field({ name, desc }: { name: string; desc: string }) {
  return (
    <div style={{ display: 'flex', gap: 12, alignItems: 'flex-start', paddingBottom: 10, borderBottom: '1px solid #18181b' }}>
      <Code>{name}</Code>
      <span style={{ fontSize: 13, color: '#71717a', lineHeight: 1.6, flex: 1 }}>{desc}</span>
    </div>
  );
}

// ── Page ───────────────────────────────────────────────────────────────────────

export default function Docs() {
  return (
    <div style={{ background: '#000', minHeight: '100vh', color: '#fafafa' }}>

      {/* NAV */}
      <header style={{
        background: 'rgba(0,0,0,0.90)', backdropFilter: 'blur(20px)',
        WebkitBackdropFilter: 'blur(20px)', borderBottom: '1px solid #18181b',
        position: 'sticky', top: 0, zIndex: 50,
      }}>
        <div style={{ maxWidth: 1100, margin: '0 auto', padding: '0 24px', height: 52, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <Link href="/" style={{ textDecoration: 'none', fontSize: 16, fontWeight: 700, letterSpacing: '-0.5px', color: '#fafafa' }}>
            Flow<span style={{ color: '#FF6B1A' }}>Pay</span>
            <span style={{ fontSize: 11, color: '#3f3f46', fontWeight: 400, marginLeft: 8 }}>docs</span>
          </Link>
          <nav style={{ display: 'flex', alignItems: 'center', gap: 24 }}>
            <Link href="/" style={{ fontSize: 13, color: '#52525b', textDecoration: 'none', transition: 'color 0.15s' }}>App</Link>
            <a href="https://github.com/riesgopais/flowpay" target="_blank" rel="noopener noreferrer" style={{ fontSize: 13, color: '#52525b', textDecoration: 'none' }}>GitHub</a>
            <a href="https://hashscan.io/testnet/topic/0.0.9217982" target="_blank" rel="noopener noreferrer"
              style={{ fontSize: 12, color: '#10b981', border: '1px solid rgba(16,185,129,0.25)', borderRadius: 980, padding: '4px 12px', textDecoration: 'none', fontWeight: 600 }}>
              Live on Hedera ↗
            </a>
          </nav>
        </div>
      </header>

      <div className="docs-layout" style={{ maxWidth: 1100, margin: '0 auto', padding: '48px 24px', display: 'flex', gap: 72 }}>

        {/* ── SIDEBAR ── */}
        <aside className="hidden md:block" style={{ width: 220, flexShrink: 0, position: 'sticky', top: 72, alignSelf: 'flex-start', maxHeight: 'calc(100vh - 100px)', overflowY: 'auto' }}>
          {NAV.map(({ group, items }) => (
            <div key={group} style={{ marginBottom: 28 }}>
              <SectionLabel>{group}</SectionLabel>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
                {items.map(({ id, label, badge }) => (
                  <a key={id} href={`#${id}`} style={{
                    display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                    padding: '6px 10px', borderRadius: 7, fontSize: 13, color: '#71717a',
                    textDecoration: 'none', transition: 'background 0.15s, color 0.15s',
                  }}
                    onMouseEnter={e => { e.currentTarget.style.background = '#09090b'; e.currentTarget.style.color = '#e4e4e7'; }}
                    onMouseLeave={e => { e.currentTarget.style.background = 'transparent'; e.currentTarget.style.color = '#71717a'; }}
                  >
                    <span>{label}</span>
                    {badge && (
                      <span style={{ fontSize: 9, fontWeight: 700, color: '#10b981', background: 'rgba(16,185,129,0.1)', border: '1px solid rgba(16,185,129,0.2)', borderRadius: 980, padding: '1px 6px', letterSpacing: '0.3px' }}>
                        {badge}
                      </span>
                    )}
                  </a>
                ))}
              </div>
            </div>
          ))}

          {/* Try it live card */}
          <div style={{ marginTop: 16, padding: '16px', background: '#09090b', border: '1px solid #27272a', borderRadius: 12 }}>
            <p style={{ fontSize: 12, fontWeight: 600, color: '#fafafa', marginBottom: 6 }}>Try it live</p>
            <p style={{ fontSize: 12, color: '#52525b', marginBottom: 14, lineHeight: 1.55 }}>
              Hedera Testnet — no real funds required.
            </p>
            <Link href="/" style={{ fontSize: 12, color: '#FF6B1A', fontWeight: 600, textDecoration: 'none' }}>Open FlowPay →</Link>
          </div>
        </aside>

        {/* ── MAIN CONTENT ── */}
        <main style={{ flex: 1, maxWidth: 720, minWidth: 0 }}>

          {/* ─── WHAT IS FLOWPAY ─── */}
          <section id="what" style={{ marginBottom: 64 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 20 }}>
              <h1 style={{ fontSize: 36, fontWeight: 700, letterSpacing: '-1.2px', margin: 0 }}>What is FlowPay?</h1>
              <span style={{ fontSize: 11, fontWeight: 700, color: '#FF6B1A', background: 'rgba(255,107,26,0.1)', border: '1px solid rgba(255,107,26,0.2)', borderRadius: 980, padding: '3px 10px' }}>
                ETHGlobal NYC 2026
              </span>
            </div>
            <p style={{ fontSize: 16, color: '#71717a', lineHeight: 1.7, marginBottom: 16 }}>
              FlowPay is an intent-based cross-chain payment engine. You describe a payment in plain language — who, how much, in what token, and why — and FlowPay parses the intent, resolves names, builds a cross-chain route, executes settlement on Hedera, and records a permanent audit trail.
            </p>
            <p style={{ fontSize: 16, color: '#71717a', lineHeight: 1.7, marginBottom: 24 }}>
              No wallet switching. No chain selection. No gas guessing. One sentence.
            </p>
            <JsonBlock label="Example intent">
{`"Send 200 USDC from María to Juan in Mexico for rent"

→ Parsed by Google Gemini 2.0 Flash
→ Juan resolved via ENS (juan.eth) or demo registry
→ Cross-chain route built by LI.FI Composer SDK
→ Settled on Hedera (< 3s, $0.001)
→ Audit record written to HCS topic 0.0.9217982`}
            </JsonBlock>
            <Callout type="tip">
              FlowPay is a UX and settlement layer — not a protocol. It composes Google Gemini, LI.FI, and Hedera into a single user interaction.
            </Callout>
          </section>

          <Divider />

          {/* ─── QUICKSTART ─── */}
          <section id="quickstart" style={{ marginBottom: 64 }}>
            <h2 style={{ fontSize: 26, fontWeight: 700, letterSpacing: '-0.8px', marginBottom: 16 }}>Quickstart</h2>
            <p style={{ fontSize: 15, color: '#71717a', lineHeight: 1.7, marginBottom: 20 }}>Run FlowPay locally in under 5 minutes.</p>

            <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
              {[
                { n: '1', title: 'Clone & install', code: 'git clone https://github.com/riesgopais/flowpay\ncd flowpay\nnpm install' },
                { n: '2', title: 'Configure environment', code: 'cp .env.example .env.local\n# Fill in GOOGLE_API_KEY, HEDERA_ACCOUNT_ID,\n# HEDERA_PRIVATE_KEY, LIFI_API_KEY' },
                { n: '3', title: 'Run dev server', code: 'npm run dev\n# Open http://localhost:3000' },
              ].map(({ n, title, code }) => (
                <div key={n} style={{ display: 'flex', gap: 16 }}>
                  <div style={{
                    width: 28, height: 28, borderRadius: 8, flexShrink: 0,
                    background: '#09090b', border: '1px solid #27272a',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    fontSize: 11, color: '#FF6B1A', fontWeight: 700,
                  }}>{n}</div>
                  <div style={{ flex: 1 }}>
                    <p style={{ fontSize: 14, fontWeight: 600, color: '#e4e4e7', marginBottom: 8 }}>{title}</p>
                    <pre style={{
                      background: '#09090b', border: '1px solid #27272a', borderRadius: 8,
                      padding: '12px 14px', fontSize: 12, fontFamily: 'var(--font-geist-mono, monospace)',
                      color: '#a1a1aa', lineHeight: 1.7, margin: 0, overflowX: 'auto',
                    }}>{code}</pre>
                  </div>
                </div>
              ))}
            </div>
            <Callout type="info">
              If <Code>GOOGLE_API_KEY</Code> is absent, the fallback regex parser activates automatically. The demo still works without any API keys for basic testing.
            </Callout>
          </section>

          <Divider />

          {/* ─── PAYMENT PIPELINE ─── */}
          <section id="pipeline" style={{ marginBottom: 64 }}>
            <h2 style={{ fontSize: 26, fontWeight: 700, letterSpacing: '-0.8px', marginBottom: 8 }}>Payment pipeline</h2>
            <p style={{ fontSize: 15, color: '#71717a', lineHeight: 1.7, marginBottom: 28 }}>
              Every payment goes through four sequential steps, streamed in real time via Server-Sent Events.
            </p>
            {[
              {
                n: '01', accent: '#0ea5e9', title: 'Intent parsing — Google Gemini',
                desc: 'Gemini 2.0 Flash parses the plain language input using Structured Outputs (responseMimeType: application/json + responseSchema). Returns a fully typed PaymentIntent object. The hybrid parser checks a keyword fast-path first — Gemini is only called for ambiguous intents.',
              },
              {
                n: '02', accent: '#FF6B1A', title: 'Route building — LI.FI Composer',
                desc: 'LI.FI Composer SDK builds an atomic cross-chain EVM flow. Same token → direct transfer. Different tokens → swap via aggregator. Returns a compiled transactionRequest ready for wallet signing.',
              },
              {
                n: '03', accent: '#a855f7', title: 'Settlement — Hedera HBAR',
                desc: 'A native HBAR TransferTransaction executes on Hedera Testnet from the relayer account. 0.001 HBAR for EVM token payments, up to 1 HBAR for HBAR-native payments. Finality in < 3 seconds.',
              },
              {
                n: '04', accent: '#10b981', title: 'Audit record — Hedera HCS',
                desc: 'A TopicMessageSubmitTransaction writes the full payment intent to HCS topic 0.0.9217982. Includes status: SUCCESS | ROUTING_FAILED | PAYMENT_FAILED. HCS only writes SUCCESS after the HBAR payment confirms — atomicity guaranteed.',
              },
            ].map(({ n, accent, title, desc }) => (
              <div key={n} style={{
                display: 'flex', gap: 16, marginBottom: 20, paddingBottom: 20,
                borderBottom: '1px solid #0a0a0a',
              }}>
                <div style={{
                  width: 32, height: 32, borderRadius: 8, flexShrink: 0,
                  background: '#09090b', border: `1px solid ${accent}40`,
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  fontSize: 10, color: accent, fontWeight: 700,
                  fontFamily: 'var(--font-geist-mono, monospace)',
                }}>{n}</div>
                <div>
                  <p style={{ fontSize: 14, fontWeight: 600, color: '#e4e4e7', marginBottom: 6 }}>{title}</p>
                  <p style={{ fontSize: 13, color: '#71717a', lineHeight: 1.65 }}>{desc}</p>
                </div>
              </div>
            ))}
          </section>

          <Divider />

          {/* ─── HYBRID PARSER ─── */}
          <section id="parser" style={{ marginBottom: 64 }}>
            <h2 style={{ fontSize: 26, fontWeight: 700, letterSpacing: '-0.8px', marginBottom: 8 }}>Hybrid intent parser</h2>
            <p style={{ fontSize: 15, color: '#71717a', lineHeight: 1.7, marginBottom: 20 }}>
              FlowPay uses a two-stage parser to minimize latency and API costs while maintaining accuracy.
            </p>
            <div className="docs-grid-2" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12, marginBottom: 20 }}>
              {[
                {
                  label: '⚡ Keyword engine', accent: '#10b981',
                  desc: 'Deterministic regex parser. Returns HIGH confidence when intent contains an explicit amount + token + known recipient. No AI call. Instant response.',
                  when: 'When to use: "Send 100 USDC to Sofia for rent"',
                },
                {
                  label: '🤖 Gemini 2.0 Flash', accent: '#0ea5e9',
                  desc: 'Called only when the keyword engine returns LOW confidence: missing amount, ambiguous phrasing, complex multi-clause sentences, or unknown constructs.',
                  when: 'When to use: "Maybe send some funds to my friend in Mexico"',
                },
              ].map(({ label, accent, desc, when }) => (
                <div key={label} style={{
                  background: '#09090b', border: '1px solid #27272a',
                  borderTop: `2px solid ${accent}`, borderRadius: '0 0 12px 12px',
                  padding: '18px 16px',
                }}>
                  <p style={{ fontSize: 13, fontWeight: 700, color: '#e4e4e7', marginBottom: 8 }}>{label}</p>
                  <p style={{ fontSize: 12, color: '#71717a', lineHeight: 1.6, marginBottom: 10 }}>{desc}</p>
                  <p style={{ fontSize: 11, color: '#3f3f46', fontFamily: 'var(--font-geist-mono, monospace)', lineHeight: 1.5 }}>{when}</p>
                </div>
              ))}
            </div>
            <Callout type="tip">
              The confirmation card shows a badge: <strong style={{ color: '#10b981' }}>⚡ instant</strong> when the keyword engine resolved the intent, or <strong style={{ color: '#52525b' }}>AI-assisted</strong> when Gemini was invoked.
            </Callout>
          </section>

          <Divider />

          {/* ─── ENS ─── */}
          <section id="ens" style={{ marginBottom: 64 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 8 }}>
              <h2 style={{ fontSize: 26, fontWeight: 700, letterSpacing: '-0.8px', margin: 0 }}>Name resolution & ENS</h2>
              <span style={{ fontSize: 10, fontWeight: 700, color: '#10b981', background: 'rgba(16,185,129,0.1)', border: '1px solid rgba(16,185,129,0.2)', borderRadius: 980, padding: '2px 8px' }}>New</span>
            </div>
            <p style={{ fontSize: 15, color: '#71717a', lineHeight: 1.7, marginBottom: 20 }}>
              FlowPay resolves human names to wallet addresses in two stages, in order:
            </p>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 10, marginBottom: 20 }}>
              {[
                { n: '1', label: 'Demo registry', desc: '14 hardcoded names (ES + EN) with testnet EVM and Hedera addresses. Instant — no network call.', badge: 'instant' },
                { n: '2', label: 'ENS on Ethereum mainnet', desc: 'If name not in registry, resolves via viem.getEnsAddress(). Accepts "vitalik" (auto-appends .eth) and "nick.eth" (explicit). Returns null if not found → 422.', badge: 'on-chain' },
              ].map(({ n, label, desc, badge }) => (
                <div key={n} style={{
                  display: 'flex', gap: 14, padding: '14px 16px',
                  background: '#09090b', border: '1px solid #27272a', borderRadius: 10,
                }}>
                  <span style={{ fontSize: 11, fontWeight: 700, color: '#3f3f46', fontFamily: 'var(--font-geist-mono, monospace)', flexShrink: 0, marginTop: 2 }}>{n}</span>
                  <div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 4 }}>
                      <span style={{ fontSize: 13, fontWeight: 600, color: '#e4e4e7' }}>{label}</span>
                      <span style={{ fontSize: 10, color: '#52525b', border: '1px solid #27272a', borderRadius: 980, padding: '1px 7px' }}>{badge}</span>
                    </div>
                    <p style={{ fontSize: 12, color: '#71717a', lineHeight: 1.6, margin: 0 }}>{desc}</p>
                  </div>
                </div>
              ))}
            </div>
            <JsonBlock label="Resolution examples">
{`"Send 100 USDC to Sofia"     → registry   → 0x742d35… (instant)
"Send 100 USDC to vitalik"   → ENS lookup → vitalik.eth → 0xd8dA6B…
"Send 100 USDC to nick.eth"  → ENS lookup → nick.eth    → 0xb8c2C8…
"Send 100 USDC to Roberto"   → registry miss → ENS miss → 422`}
            </JsonBlock>
            <Callout type="warning">
              ENS resolution uses Ethereum mainnet. Ensure <Code>ETHEREUM_RPC_URL</Code> is set for production use, or the default Cloudflare public endpoint will be used (may rate-limit under heavy traffic).
            </Callout>
          </section>

          <Divider />

          {/* ─── HCS ATOMICITY ─── */}
          <section id="atomicity" style={{ marginBottom: 64 }}>
            <h2 style={{ fontSize: 26, fontWeight: 700, letterSpacing: '-0.8px', marginBottom: 8 }}>HCS atomicity</h2>
            <p style={{ fontSize: 15, color: '#71717a', lineHeight: 1.7, marginBottom: 20 }}>
              The audit record on Hedera Consensus Service reflects actual payment outcome — never a false positive.
            </p>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 8, marginBottom: 20 }}>
              {[
                { status: 'SUCCESS',        accent: '#10b981', desc: 'Written only after the HBAR TransferTransaction confirms on-chain.' },
                { status: 'ROUTING_FAILED', accent: '#f59e0b', desc: 'Written if LI.FI Composer fails to build or compile the cross-chain flow.' },
                { status: 'PAYMENT_FAILED', accent: '#ef4444', desc: 'Written if the HBAR transfer itself fails after routing succeeded.' },
              ].map(({ status, accent, desc }) => (
                <div key={status} style={{
                  display: 'flex', alignItems: 'flex-start', gap: 12, padding: '12px 14px',
                  background: '#09090b', border: `1px solid ${accent}30`, borderRadius: 8,
                }}>
                  <code style={{ fontSize: 12, color: accent, background: `${accent}15`, border: `1px solid ${accent}30`, padding: '2px 7px', borderRadius: 5, fontFamily: 'var(--font-geist-mono, monospace)', flexShrink: 0 }}>{status}</code>
                  <span style={{ fontSize: 13, color: '#71717a', lineHeight: 1.6 }}>{desc}</span>
                </div>
              ))}
            </div>
            <Callout type="info">
              HCS records are publicly verifiable at{' '}
              <a href="https://hashscan.io/testnet/topic/0.0.9217982" target="_blank" rel="noopener noreferrer" style={{ color: '#a855f7', textDecoration: 'none' }}>
                hashscan.io/testnet/topic/0.0.9217982
              </a>
            </Callout>
          </section>

          <Divider />

          {/* ─── API PARSE ─── */}
          <section id="api-parse" style={{ marginBottom: 64 }}>
            <h2 style={{ fontSize: 26, fontWeight: 700, letterSpacing: '-0.8px', marginBottom: 6 }}>
              <Code>POST /api/parse</Code>
            </h2>
            <p style={{ fontSize: 15, color: '#71717a', lineHeight: 1.7, marginBottom: 20 }}>
              Parses a natural language intent and returns a structured preview for user confirmation. Does not execute any blockchain transaction.
            </p>
            <JsonBlock label="Request">
{`{
  "intent": "Send 100 USDC to Sofia for rent"
}`}
            </JsonBlock>
            <JsonBlock label="Response (200)">
{`{
  "amount": 100,
  "fromToken": "USDC",
  "toToken": "USDC",
  "recipientAddress": "0x742d35Cc6634C0532925a3b844Bc454e4438f44e",
  "hederaRecipient": "0.0.98",
  "senderName": null,
  "recipientName": "Sofia",
  "memo": "rent",
  "humanSummary": "Send 100 USDC to Sofia for rent",
  "error": null,
  "_parsedBy": "keyword",
  "warnings": ["Sending to Sofia's registered testnet address"],
  "resolvedAddressLabel": "Resolved from demo registry"
}`}
            </JsonBlock>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 10, marginBottom: 8 }}>
              <Field name="error" desc="Non-null when intent cannot be processed: unsupported token, invalid amount, ambiguous input." />
              <Field name="_parsedBy" desc='"keyword" when the fast-path engine resolved it. "gemini" when AI was invoked. "fallback" when no API key is present.' />
              <Field name="warnings[]" desc="Array of AI assumption warnings shown to the user before confirmation: defaulted amount, defaulted token, ENS/registry resolution notice." />
              <Field name="resolvedAddressLabel" desc='Human-readable source of address resolution: "Resolved via ENS (sofia.eth)" or "Resolved from demo registry".' />
            </div>
            <Callout type="warning">
              <Code>400</Code> for empty or missing <Code>intent</Code>. Unsupported tokens (BTC, SOL, XRP…) return <Code>200</Code> with <Code>error</Code> field set, not a 4xx — the frontend reads the field to show the error in-context.
            </Callout>
          </section>

          <Divider />

          {/* ─── API STREAM ─── */}
          <section id="api-stream" style={{ marginBottom: 64 }}>
            <h2 style={{ fontSize: 26, fontWeight: 700, letterSpacing: '-0.8px', marginBottom: 6 }}>
              <Code>POST /api/pay-stream</Code>
            </h2>
            <p style={{ fontSize: 15, color: '#71717a', lineHeight: 1.7, marginBottom: 20 }}>
              Executes a payment and streams real-time progress via Server-Sent Events. Each event corresponds to an actual backend step completing — no fake delays.
            </p>
            <JsonBlock label="Request">
{`{
  "intent": "Send 100 USDC to Sofia for rent",
  "senderAddress": "0x..."   // optional — enables on-chain wallet signing
}`}
            </JsonBlock>
            <JsonBlock label="SSE stream">
{`data: {"type":"step","index":0}         // Gemini parsed
data: {"type":"step","index":1}         // LI.FI route built
data: {"type":"step","index":2}         // HBAR settlement executed
data: {"type":"step","index":3}         // HCS audit record written

data: {
  "type": "done",
  "data": {
    "success": true,
    "parsed":  { "humanSummary": "...", "amount": 100, ... },
    "lifi":    { "flowBuilt": true, "steps": [...], "compiled": true },
    "hcs":     { "topicId": "0.0.9217982", "sequenceNumber": "42",
                 "explorerUrl": "https://hashscan.io/testnet/topic/0.0.9217982" },
    "payment": { "transactionId": "0.0.9185784@1749812345.000000000",
                 "amount": "0.001 HBAR",
                 "explorerUrl": "https://hashscan.io/testnet/transaction/..." }
  }
}

// On error:
data: {"type":"error","error":"STAGING_LIQUIDITY_DRY",
       "message":"Staging liquidity pool dry — try matching tokens (USDC→USDC).",
       "status":500}`}
            </JsonBlock>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
              <Field name="400" desc="Empty or missing intent." />
              <Field name="422" desc="Unsupported token · amount ≤ 0 · unknown name with no explicit address." />
              <Field name="500 ROUTING_FAILED" desc="LI.FI Composer failed to build or compile the route. HCS records ROUTING_FAILED." />
              <Field name="500 PAYMENT_FAILED" desc="HBAR transfer failed. HCS records PAYMENT_FAILED." />
            </div>
            <Callout type="tip">
              The frontend uses a 25-second per-step watchdog via <Code>AbortController</Code>. If no SSE event arrives for 25s, the request is aborted and the user sees <em>Network congestion detected — please retry</em>.
            </Callout>
          </section>

          <Divider />

          {/* ─── INTEGRATIONS ─── */}
          <section id="gemini" style={{ marginBottom: 40 }}>
            <h2 style={{ fontSize: 26, fontWeight: 700, letterSpacing: '-0.8px', marginBottom: 8 }}>Google Gemini 2.0 Flash</h2>
            <p style={{ fontSize: 15, color: '#71717a', lineHeight: 1.7, marginBottom: 16 }}>
              Used as the NL parsing layer. Called only when the keyword engine returns low confidence.
            </p>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
              <Field name="Model" desc="gemini-2.0-flash via @google/generative-ai" />
              <Field name="Structured Outputs" desc="responseMimeType: 'application/json' + responseSchema. No prompt engineering for JSON format — the schema enforces structure." />
              <Field name="Single-token rule" desc='If user mentions one token, both fromToken and toToken are set to that token. No invented swap.' />
              <Field name="Fallback" desc="regex-based fallbackParse() activates when GOOGLE_API_KEY is absent. Demo-safe." />
            </div>
          </section>

          <section id="lifi" style={{ marginBottom: 40 }}>
            <h2 style={{ fontSize: 26, fontWeight: 700, letterSpacing: '-0.8px', marginBottom: 8 }}>LI.FI Composer SDK</h2>
            <p style={{ fontSize: 15, color: '#71717a', lineHeight: 1.7, marginBottom: 16 }}>
              Builds atomic cross-chain EVM payment flows. ETHGlobal staging endpoint.
            </p>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
              <Field name="Endpoint" desc="ethglobal-composer.li.quest (ETHGlobal-specific staging)" />
              <Field name="toWei()" desc="Handles decimals: USDC/USDT=6, ETH/WETH/DAI=18, WBTC=8." />
              <Field name="Staging limits" desc="Pools can be dry for cross-token swaps. Use matching tokens (USDC→USDC) for reliable demo runs." />
            </div>
          </section>

          <section id="hedera" style={{ marginBottom: 40 }}>
            <h2 style={{ fontSize: 26, fontWeight: 700, letterSpacing: '-0.8px', marginBottom: 8 }}>Hedera HCS + HBAR</h2>
            <p style={{ fontSize: 15, color: '#71717a', lineHeight: 1.7, marginBottom: 16 }}>
              Zero Solidity. All Hedera interaction via native <Code>@hashgraph/sdk</Code>.
            </p>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
              <Field name="HCS Topic" desc="0.0.9217982 — public, immutable, verifiable on Hashscan." />
              <Field name="HBAR operator" desc="0.0.9185784 — the FlowPay relayer account. Pays all transaction fees." />
              <Field name="Settlement amount" desc="0.001 HBAR for EVM token payments (settlement signal). Up to 1 HBAR for HBAR-native payments." />
              <Field name="Finality" desc="< 3 seconds. Fixed USD fee ~$0.001. No variable gas." />
            </div>
          </section>

          <section id="ens-int" style={{ marginBottom: 64 }}>
            <h2 style={{ fontSize: 26, fontWeight: 700, letterSpacing: '-0.8px', marginBottom: 8 }}>ENS via viem</h2>
            <p style={{ fontSize: 15, color: '#71717a', lineHeight: 1.7, marginBottom: 16 }}>
              ENS resolution runs on Ethereum mainnet via <Code>viem.getEnsAddress()</Code>.
            </p>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
              <Field name="RPC" desc="Configurable via ETHEREUM_RPC_URL. Defaults to https://cloudflare-eth.com." />
              <Field name="normalize()" desc="viem/ens normalize() applied before lookup — handles unicode names correctly." />
              <Field name="Auto-suffix" desc='Plain names auto-append .eth. "vitalik" → resolves as "vitalik.eth".' />
              <Field name="Production path" desc="Swap hardcoded registry for full ENS + Hedera Name Service lookup." />
            </div>
          </section>

          <Divider />

          {/* ─── TOKENS ─── */}
          <section id="tokens" style={{ marginBottom: 64 }}>
            <h2 style={{ fontSize: 26, fontWeight: 700, letterSpacing: '-0.8px', marginBottom: 16 }}>Supported tokens</h2>
            <div style={{ border: '1px solid #27272a', borderRadius: 12, overflow: 'auto' }}>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', background: '#09090b', padding: '10px 16px', borderBottom: '1px solid #27272a' }}>
                {['Token', 'Decimals', 'Notes'].map(h => (
                  <span key={h} style={{ fontSize: 11, fontWeight: 700, color: '#3f3f46', textTransform: 'uppercase', letterSpacing: '0.6px' }}>{h}</span>
                ))}
              </div>
              {[
                ['ETH / WETH', '18', ''],
                ['USDC', '6', ''],
                ['USDT', '6', ''],
                ['DAI', '18', ''],
                ['WBTC', '8', 'Capped at 0.01 in demo'],
                ['HBAR', '—', 'Native Hedera, up to 1 HBAR'],
                ['MATIC / POL', '18', ''],
                ['BTC, SOL, XRP, ADA…', '—', 'Returns 422 — not supported'],
              ].map(([token, decimals, notes], i) => (
                <div key={token} style={{
                  display: 'grid', gridTemplateColumns: '1fr 1fr 1fr',
                  padding: '10px 16px', borderBottom: i < 7 ? '1px solid #18181b' : 'none',
                  background: i % 2 === 0 ? 'transparent' : '#0a0a0a',
                }}>
                  <span style={{ fontSize: 12, fontFamily: 'var(--font-geist-mono, monospace)', color: token.includes('BTC') ? '#52525b' : '#e4e4e7' }}>{token}</span>
                  <span style={{ fontSize: 12, color: '#52525b' }}>{decimals}</span>
                  <span style={{ fontSize: 12, color: '#52525b' }}>{notes}</span>
                </div>
              ))}
            </div>
          </section>

          <Divider />

          {/* ─── USE CASES ─── */}
          <section id="usecases" style={{ marginBottom: 64 }}>
            <h2 style={{ fontSize: 26, fontWeight: 700, letterSpacing: '-0.8px', marginBottom: 16 }}>Use cases</h2>
            <div className="docs-grid-2" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
              {[
                { title: 'Remittances',       desc: 'Send money home to family in plain language. No exchange account, no FX margin, no wire delays.' },
                { title: 'Freelance payroll', desc: 'Pay global contractors in their preferred token. One sentence, cross-chain, permanent audit record.' },
                { title: 'School fees',       desc: 'International tuition without wire transfers or 3–5% conversion margins.' },
                { title: 'DAO payouts',       desc: 'Coordinate multi-chain treasury distributions with a tamper-proof audit trail on HCS.' },
                { title: 'AI agent payments', desc: 'Autonomous agents can execute payments via a single API call. Intent in → settlement out.' },
                { title: 'B2B invoicing',     desc: 'Enterprise-to-enterprise cross-border payments with immutable proof of execution.' },
              ].map(({ title, desc }) => (
                <div key={title} style={{ background: '#09090b', border: '1px solid #27272a', borderRadius: 12, padding: '18px 20px' }}>
                  <p style={{ fontWeight: 600, fontSize: 13, color: '#e4e4e7', marginBottom: 6 }}>{title}</p>
                  <p style={{ fontSize: 13, color: '#71717a', lineHeight: 1.6, margin: 0 }}>{desc}</p>
                </div>
              ))}
            </div>
          </section>

          <Divider />

          {/* ─── FAQ ─── */}
          <section id="faq">
            <h2 style={{ fontSize: 26, fontWeight: 700, letterSpacing: '-0.8px', marginBottom: 20 }}>FAQ</h2>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
              {[
                ['Is this using real funds?',
                  'No. FlowPay runs on Hedera Testnet. HBAR transferred has no real monetary value. LI.FI routes are compiled but the wallet signing step is optional and not submitted to mainnet in the demo flow.'],
                ['Why does FlowPay use Gemini instead of other AI models?',
                  'Gemini 2.0 Flash offers Structured Outputs (responseMimeType + responseSchema) which enforces a typed PaymentIntent without prompt engineering for JSON formatting. This is more reliable than asking any model to "return JSON". Also: ETHGlobal Google Cloud track.'],
                ['What is the keyword engine and when does it skip Gemini?',
                  'lib/keyword-parser.ts runs first on every intent. If it finds an explicit amount + token + known recipient (registry name or 0x address), it returns HIGH confidence and the result is used directly. Gemini is never called. For ambiguous or incomplete intents, the keyword engine returns LOW confidence and Gemini handles it.'],
                ['How does ENS resolution work?',
                  'lib/resolver.ts checks the mock registry first (instant). If the name is not found there, it calls viem.getEnsAddress() on Ethereum mainnet. Plain names like "vitalik" are auto-suffixed to "vitalik.eth". If ENS also returns null, the API returns 422 and the UI shows an address input field.'],
                ['What happens if LI.FI staging has no liquidity?',
                  'The SSE stream emits { type: "error", error: "STAGING_LIQUIDITY_DRY" } with a human-readable message suggesting the user try matching tokens (USDC→USDC instead of ETH→USDC). The HCS record is written as ROUTING_FAILED.'],
                ['Can I run this with my own Hedera account?',
                  'Yes. Clone the repo, fill in HEDERA_ACCOUNT_ID and HEDERA_PRIVATE_KEY (ECDSA) in .env.local, and run npm run dev. Leave HEDERA_TOPIC_ID blank on first run — a new HCS topic is auto-created.'],
                ['What does "No Solidity" mean?',
                  'FlowPay uses Hedera\'s native @hashgraph/sdk for everything: TransferTransaction for HBAR, TopicMessageSubmitTransaction for HCS. No EVM bytecode, no compiled contracts, no Solidity.'],
              ].map(([q, a]) => (
                <div key={q as string} style={{ background: '#09090b', border: '1px solid #27272a', borderRadius: 12, padding: '18px 20px' }}>
                  <p style={{ fontWeight: 600, fontSize: 14, color: '#e4e4e7', marginBottom: 8 }}>{q}</p>
                  <p style={{ fontSize: 13, color: '#71717a', lineHeight: 1.7, margin: 0 }}>{a}</p>
                </div>
              ))}
            </div>
          </section>

          {/* Footer */}
          <div style={{ marginTop: 80, paddingTop: 32, borderTop: '1px solid #18181b', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <span style={{ fontSize: 12, color: '#3f3f46' }}>
              Built at <span style={{ color: '#FF6B1A' }}>ETHGlobal New York 2026</span>
            </span>
            <div style={{ display: 'flex', gap: 20 }}>
              <Link href="/" style={{ fontSize: 12, color: '#3f3f46', textDecoration: 'none' }}>App</Link>
              <a href="https://github.com/riesgopais/flowpay" target="_blank" rel="noopener noreferrer" style={{ fontSize: 12, color: '#3f3f46', textDecoration: 'none' }}>GitHub</a>
              <a href="https://hashscan.io/testnet/topic/0.0.9217982" target="_blank" rel="noopener noreferrer" style={{ fontSize: 12, color: '#3f3f46', textDecoration: 'none' }}>Hashscan</a>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}
