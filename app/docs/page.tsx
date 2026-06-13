import Link from 'next/link';

const NAV_SECTIONS = [
  { id: 'what', label: 'What is FlowPay' },
  { id: 'how', label: 'How it works' },
  { id: 'layers', label: 'The three layers' },
  { id: 'results', label: 'Interpreting results' },
  { id: 'usecases', label: 'Use cases' },
  { id: 'faq', label: 'FAQ' },
];

export default function Docs() {
  return (
    <div style={{ background: 'var(--bg)', minHeight: '100vh', color: 'var(--text)' }}>

      {/* NAV */}
      <nav style={{ background: 'rgba(3,7,18,0.9)', backdropFilter: 'blur(16px)', borderBottom: '1px solid var(--border)', position: 'sticky', top: 0, zIndex: 50 }}>
        <div style={{ maxWidth: 1100, margin: '0 auto', padding: '0 24px', height: 60, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <Link href="/" style={{ textDecoration: 'none', fontSize: 19, fontWeight: 900, letterSpacing: '-0.5px' }}>
            Flow<span style={{ color: 'var(--orange)' }}>Pay</span>
          </Link>
          <div style={{ display: 'flex', gap: 24 }}>
            <Link href="/" className="nav-link">App</Link>
            <Link href="/brand" className="nav-link">Brand</Link>
            <a href="https://github.com/riesgopais/flowpay" target="_blank" rel="noopener noreferrer" className="nav-link">GitHub ↗</a>
          </div>
        </div>
      </nav>

      <div style={{ maxWidth: 1100, margin: '0 auto', padding: '48px 24px', display: 'flex', gap: 56 }}>

        {/* SIDEBAR */}
        <aside style={{ width: 220, flexShrink: 0, position: 'sticky', top: 80, alignSelf: 'flex-start' }}>
          <div style={{ fontSize: 10, color: 'var(--muted)', fontWeight: 700, letterSpacing: '1.5px', textTransform: 'uppercase', marginBottom: 14 }}>Documentation</div>
          <nav style={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
            {NAV_SECTIONS.map(s => (
              <a key={s.id} href={`#${s.id}`} className="docs-sidebar-link">{s.label}</a>
            ))}
          </nav>

          <div style={{ marginTop: 40, padding: 16, background: 'var(--blue-dim)', border: '1px solid var(--blue-border)', borderRadius: 12 }}>
            <div style={{ fontSize: 11, color: 'var(--blue-light)', fontWeight: 700, marginBottom: 8 }}>Try it live</div>
            <div style={{ fontSize: 12, color: 'var(--muted)', marginBottom: 12, lineHeight: 1.5 }}>All examples below work on Hedera Testnet.</div>
            <Link href="/" style={{ fontSize: 12, color: 'var(--blue-light)', fontWeight: 700, textDecoration: 'none' }}>Open FlowPay →</Link>
          </div>
        </aside>

        {/* CONTENT */}
        <main style={{ flex: 1, maxWidth: 720 }}>

          {/* WHAT */}
          <section id="what" style={{ marginBottom: 64 }}>
            <h1 style={{ fontSize: 36, fontWeight: 900, letterSpacing: '-1px', marginBottom: 16 }}>What is FlowPay?</h1>
            <p style={{ fontSize: 16, color: 'var(--muted-light)', lineHeight: 1.7, marginBottom: 20 }}>
              FlowPay is an AI-powered cross-chain payment agent. You describe a payment in plain language — who, how much, for what — and FlowPay executes the full cross-chain operation in a single atomic flow.
            </p>
            <p style={{ fontSize: 16, color: 'var(--muted-light)', lineHeight: 1.7, marginBottom: 20 }}>
              No wallet switching. No chain selection. No gas guessing. No 6-step bridging tutorial.
            </p>
            <div style={{ background: 'var(--card)', border: '1px solid var(--border)', borderRadius: 14, padding: '20px 24px' }}>
              <div style={{ fontSize: 11, color: 'var(--blue-light)', fontWeight: 700, letterSpacing: '1px', textTransform: 'uppercase', marginBottom: 12 }}>Example</div>
              <p className="code-block" style={{ margin: 0 }}>
                &quot;Send 200 USDC from María in Buenos Aires to Juan in Mexico City for rent&quot;
              </p>
              <div style={{ marginTop: 12, fontSize: 13, color: 'var(--muted-light)' }}>
                → FlowPay routes cross-chain, records the intent on Hedera, and settles in &lt;3 seconds.
              </div>
            </div>
          </section>

          <div style={{ height: 1, background: 'var(--border)', marginBottom: 64 }} />

          {/* HOW IT WORKS */}
          <section id="how" style={{ marginBottom: 64 }}>
            <h2 style={{ fontSize: 26, fontWeight: 800, letterSpacing: '-0.5px', marginBottom: 16 }}>How it works</h2>
            <p style={{ fontSize: 15, color: 'var(--muted-light)', lineHeight: 1.7, marginBottom: 28 }}>
              Every payment goes through four sequential steps, each handled by a specialized system:
            </p>
            {[
              { step: '01', color: '#1A6BFF', title: 'Natural language → Intent', desc: 'Claude Haiku parses your sentence and extracts a structured PaymentIntent: amount, tokens, addresses, sender name, recipient name, and memo.' },
              { step: '02', color: '#FF6B1A', title: 'Intent → Atomic flow', desc: 'LI.FI Composer SDK takes the intent and builds a multi-step cross-chain operation as a single atomic Flow document. If any step fails, the entire flow reverts.' },
              { step: '03', color: '#7C3AED', title: 'Intent → Audit record', desc: 'Hedera Consensus Service (HCS) receives a JSON message with the full payment intent. The message is ordered, timestamped, and permanently stored on a public topic.' },
              { step: '04', color: '#00D9A5', title: 'HBAR → Settlement', desc: 'A native HBAR TransferTransaction executes the settlement. Finality in under 3 seconds. Fixed fee of ~$0.001 regardless of network load. No Solidity required.' },
            ].map(({ step, color, title, desc }) => (
              <div key={step} style={{ display: 'flex', gap: 20, marginBottom: 24 }}>
                <div style={{ width: 40, height: 40, borderRadius: 10, background: color + '20', border: `1px solid ${color}40`, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 11, color, fontWeight: 800, flexShrink: 0 }}>{step}</div>
                <div>
                  <div style={{ fontSize: 15, fontWeight: 700, marginBottom: 6 }}>{title}</div>
                  <div style={{ fontSize: 14, color: 'var(--muted-light)', lineHeight: 1.6 }}>{desc}</div>
                </div>
              </div>
            ))}
          </section>

          <div style={{ height: 1, background: 'var(--border)', marginBottom: 64 }} />

          {/* THREE LAYERS */}
          <section id="layers" style={{ marginBottom: 64 }}>
            <h2 style={{ fontSize: 26, fontWeight: 800, letterSpacing: '-0.5px', marginBottom: 16 }}>The three layers</h2>
            <p style={{ fontSize: 15, color: 'var(--muted-light)', lineHeight: 1.7, marginBottom: 28 }}>
              FlowPay uses a two-platform, three-service architecture — each component doing what it does best:
            </p>

            <div style={{ display: 'grid', gap: 16 }}>
              {[
                {
                  color: '#1A6BFF', label: 'Claude AI (Anthropic)',
                  what: 'Natural language parsing',
                  why: 'Eliminates the need for structured input. Users write like they text.',
                  note: 'Fallback regex parser activates if API key is unavailable, so the demo never breaks.',
                },
                {
                  color: '#FF6B1A', label: 'LI.FI Composer SDK',
                  what: 'EVM cross-chain atomic flows',
                  why: 'Multi-step operations compiled into a single transaction. All-or-nothing execution prevents partial failures.',
                  note: 'Currently EVM-only. LI.FI handles the on-chain routing; Hedera handles settlement and audit.',
                },
                {
                  color: '#7C3AED', label: 'Hedera Consensus Service',
                  what: 'Immutable payment audit trail',
                  why: 'HCS is an ordered, timestamped public message log. Any party can verify any payment without trusting FlowPay.',
                  note: 'Topic ID: 0.0.9217982 — verifiable on Hashscan.',
                },
                {
                  color: '#00D9A5', label: 'Hedera Token Service / HBAR',
                  what: 'Fast, cheap settlement',
                  why: 'Sub-3-second absolute finality. Fixed USD-denominated fees (~$0.001). Native SDK — no Solidity.',
                  note: 'Uses @hashgraph/sdk TransferTransaction. No smart contracts deployed.',
                },
              ].map(({ color, label, what, why, note }) => (
                <div key={label} style={{ background: 'var(--card)', border: `1px solid ${color}30`, borderRadius: 14, padding: 20 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 12 }}>
                    <span style={{ width: 8, height: 8, borderRadius: '50%', background: color, display: 'inline-block', flexShrink: 0 }} />
                    <span style={{ fontWeight: 700, fontSize: 14 }}>{label}</span>
                    <span style={{ marginLeft: 'auto', fontSize: 11, color, background: color + '18', border: `1px solid ${color}30`, padding: '2px 9px', borderRadius: 20, fontWeight: 600 }}>{what}</span>
                  </div>
                  <p style={{ fontSize: 13, color: 'var(--muted-light)', marginBottom: 10, lineHeight: 1.6 }}><strong style={{ color: 'var(--text)' }}>Why:</strong> {why}</p>
                  <p style={{ fontSize: 12, color: 'var(--muted)', lineHeight: 1.5, fontStyle: 'italic' }}>{note}</p>
                </div>
              ))}
            </div>
          </section>

          <div style={{ height: 1, background: 'var(--border)', marginBottom: 64 }} />

          {/* INTERPRETING RESULTS */}
          <section id="results" style={{ marginBottom: 64 }}>
            <h2 style={{ fontSize: 26, fontWeight: 800, letterSpacing: '-0.5px', marginBottom: 16 }}>Interpreting results</h2>
            <p style={{ fontSize: 15, color: 'var(--muted-light)', lineHeight: 1.7, marginBottom: 28 }}>
              After executing a payment, FlowPay returns four cards. Here&apos;s what each field means:
            </p>

            {[
              {
                color: '#1A6BFF', title: 'Intent Parsed',
                fields: [
                  { name: 'humanSummary', desc: 'A plain-language confirmation of what Claude understood.' },
                  { name: 'amount', desc: 'Numeric value extracted from your sentence.' },
                  { name: 'fromToken / toToken', desc: 'Source and target tokens for the cross-chain route.' },
                  { name: 'memo', desc: 'Purpose of payment (rent, salary, freelance, etc.)' },
                  { name: 'senderName / recipientName', desc: 'Names parsed from the sentence if present.' },
                ],
              },
              {
                color: '#FF6B1A', title: 'Cross-chain Route',
                fields: [
                  { name: 'flowBuilt', desc: 'Whether LI.FI Composer successfully built the Flow document.' },
                  { name: 'steps', desc: 'Human-readable description of each operation in the flow (e.g. "Swap WETH → USDC").' },
                  { name: 'compiled', desc: 'Whether the flow was successfully compiled to EVM calldata.' },
                  { name: 'calldataPreview', desc: 'First bytes of the compiled calldata (0x...). This is real, executable transaction data.' },
                ],
              },
              {
                color: '#7C3AED', title: 'Audit Trail (HCS)',
                fields: [
                  { name: 'topicId', desc: 'The Hedera HCS topic where all FlowPay payments are recorded (0.0.9217982).' },
                  { name: 'sequenceNumber', desc: 'The unique entry number for this payment in the topic. Monotonically increasing.' },
                  { name: 'explorerUrl', desc: 'Direct link to view this entry on Hashscan.' },
                ],
              },
              {
                color: '#00D9A5', title: 'Settlement',
                fields: [
                  { name: 'transactionId', desc: 'The Hedera transaction ID in format accountId@seconds.nanos.' },
                  { name: 'amount', desc: 'HBAR amount transferred (0.001 HBAR per demo payment).' },
                  { name: 'explorerUrl', desc: 'Direct link to verify the transaction on Hashscan.' },
                ],
              },
            ].map(({ color, title, fields }) => (
              <div key={title} style={{ marginBottom: 28 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 14 }}>
                  <span style={{ width: 8, height: 8, borderRadius: '50%', background: color, display: 'inline-block' }} />
                  <h3 style={{ fontSize: 15, fontWeight: 700, margin: 0 }}>{title}</h3>
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 8, paddingLeft: 16, borderLeft: `2px solid ${color}30` }}>
                  {fields.map(({ name, desc }) => (
                    <div key={name}>
                      <code style={{ fontSize: 12, color, background: color + '15', padding: '1px 7px', borderRadius: 5, fontFamily: 'var(--font-geist-mono,monospace)' }}>{name}</code>
                      <span style={{ fontSize: 13, color: 'var(--muted-light)', marginLeft: 10 }}>{desc}</span>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </section>

          <div style={{ height: 1, background: 'var(--border)', marginBottom: 64 }} />

          {/* USE CASES */}
          <section id="usecases" style={{ marginBottom: 64 }}>
            <h2 style={{ fontSize: 26, fontWeight: 800, letterSpacing: '-0.5px', marginBottom: 16 }}>Use cases</h2>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
              {[
                { icon: '🏠', title: 'Remittances', desc: 'Send money home to family. Type it like a text message. No exchange account needed.' },
                { icon: '💼', title: 'Freelance payroll', desc: 'Pay global contractors in their preferred token. One sentence, cross-chain.' },
                { icon: '🎓', title: 'School fees', desc: 'International tuition payments without wire transfers or 5% FX margins.' },
                { icon: '🤝', title: 'DAO contributions', desc: 'Coordinate multi-chain treasury distributions with audit trail for governance.' },
              ].map(({ icon, title, desc }) => (
                <div key={title} style={{ background: 'var(--card)', border: '1px solid var(--border)', borderRadius: 14, padding: 20 }}>
                  <div style={{ fontSize: 24, marginBottom: 10 }}>{icon}</div>
                  <div style={{ fontWeight: 700, fontSize: 14, marginBottom: 6 }}>{title}</div>
                  <div style={{ fontSize: 13, color: 'var(--muted-light)', lineHeight: 1.5 }}>{desc}</div>
                </div>
              ))}
            </div>
          </section>

          <div style={{ height: 1, background: 'var(--border)', marginBottom: 64 }} />

          {/* FAQ */}
          <section id="faq">
            <h2 style={{ fontSize: 26, fontWeight: 800, letterSpacing: '-0.5px', marginBottom: 24 }}>FAQ</h2>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
              {[
                { q: 'Is this using real funds?', a: 'No. FlowPay runs on Hedera Testnet. HBAR transferred has no real value. LI.FI flows are compiled but not submitted to mainnet.' },
                { q: 'Why doesn\'t LI.FI integrate directly with Hedera?', a: 'LI.FI Composer is EVM-only. Hedera uses a different VM (not EVM-native). FlowPay intentionally uses both at the application layer — LI.FI for EVM routing, Hedera for settlement and auditability. Each does what it\'s best at.' },
                { q: 'What happens if Claude AI is unavailable?', a: 'FlowPay includes a regex-based fallback parser. If the Anthropic API is unreachable, the demo continues to work using pattern matching on the input text.' },
                { q: 'Can I use this with my own Hedera account?', a: 'Yes. Clone the repo, add your HEDERA_ACCOUNT_ID and HEDERA_PRIVATE_KEY (ECDSA) to .env.local, and run npm run dev. Leave HEDERA_TOPIC_ID blank on first run — FlowPay auto-creates a new topic.' },
                { q: 'What does "No Solidity" mean?', a: 'FlowPay uses Hedera\'s native SDK services — HCS for messages and HTS for transfers — without deploying any smart contracts. These are protocol-level primitives available via @hashgraph/sdk.' },
              ].map(({ q, a }) => (
                <div key={q} style={{ background: 'var(--card)', border: '1px solid var(--border)', borderRadius: 12, padding: '18px 20px' }}>
                  <div style={{ fontWeight: 700, fontSize: 14, marginBottom: 8 }}>{q}</div>
                  <div style={{ fontSize: 13, color: 'var(--muted-light)', lineHeight: 1.65 }}>{a}</div>
                </div>
              ))}
            </div>
          </section>
        </main>
      </div>
    </div>
  );
}
