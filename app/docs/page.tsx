import Link from 'next/link';

const SECTIONS = [
  { id: 'what',    label: 'What is FlowPay'     },
  { id: 'how',     label: 'How it works'         },
  { id: 'layers',  label: 'The three layers'     },
  { id: 'results', label: 'Interpreting results' },
  { id: 'usecases',label: 'Use cases'            },
  { id: 'faq',     label: 'FAQ'                  },
];

export default function Docs() {
  return (
    <div style={{ background: 'var(--bg)', minHeight: '100vh', color: 'var(--text-1)' }}>

      <header style={{ background: 'rgba(0,0,0,0.82)', backdropFilter: 'saturate(180%) blur(20px)', WebkitBackdropFilter: 'saturate(180%) blur(20px)', borderBottom: '1px solid var(--separator)', position: 'sticky', top: 0, zIndex: 50 }}>
        <div style={{ maxWidth: 1060, margin: '0 auto', padding: '0 24px', height: 52, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <Link href="/" style={{ textDecoration: 'none', fontSize: 18, fontWeight: 700, letterSpacing: '-0.4px', color: 'var(--text-1)' }}>
            Flow<span style={{ color: 'var(--accent)' }}>Pay</span>
          </Link>
          <nav style={{ display: 'flex', gap: 32 }}>
            <Link href="/"      className="nav-link">App</Link>
            <Link href="/brand" className="nav-link">Brand</Link>
            <a href="https://github.com/riesgopais/flowpay" target="_blank" rel="noopener noreferrer" className="nav-link">GitHub</a>
          </nav>
        </div>
      </header>

      <div style={{ maxWidth: 1060, margin: '0 auto', padding: '56px 24px', display: 'flex', gap: 64 }}>

        {/* SIDEBAR */}
        <aside style={{ width: 200, flexShrink: 0, position: 'sticky', top: 72, alignSelf: 'flex-start' }}>
          <p style={{ fontSize: 11, color: 'var(--text-3)', fontWeight: 600, letterSpacing: '0.8px', textTransform: 'uppercase', marginBottom: 12 }}>On this page</p>
          <nav style={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
            {SECTIONS.map(s => (
              <a key={s.id} href={`#${s.id}`} className="docs-sidebar-link">{s.label}</a>
            ))}
          </nav>

          <div style={{ marginTop: 40, padding: '16px', background: 'var(--card)', border: '1px solid var(--border)', borderRadius: 14 }}>
            <p style={{ fontSize: 12, fontWeight: 600, color: 'var(--text-1)', marginBottom: 6 }}>Try it live</p>
            <p style={{ fontSize: 12, color: 'var(--text-2)', marginBottom: 14, lineHeight: 1.5 }}>All examples run on Hedera Testnet — no real funds.</p>
            <Link href="/" style={{ fontSize: 13, color: 'var(--text-1)', fontWeight: 500, textDecoration: 'none' }}>Open FlowPay →</Link>
          </div>
        </aside>

        {/* CONTENT */}
        <main style={{ flex: 1, maxWidth: 680 }}>

          <section id="what" style={{ marginBottom: 72 }}>
            <h1 style={{ fontSize: 40, fontWeight: 700, letterSpacing: '-1.5px', marginBottom: 20 }}>What is FlowPay?</h1>
            <p style={{ fontSize: 17, color: 'var(--text-2)', lineHeight: 1.65, marginBottom: 18 }}>
              FlowPay is an AI-powered cross-chain payment agent. You describe a payment in plain language — who, how much, for what — and FlowPay executes the full cross-chain operation in a single atomic flow.
            </p>
            <p style={{ fontSize: 17, color: 'var(--text-2)', lineHeight: 1.65, marginBottom: 24 }}>
              No wallet switching. No chain selection. No gas guessing.
            </p>
            <div style={{ background: 'var(--card)', border: '1px solid var(--border)', borderRadius: 16, padding: '20px 24px' }}>
              <p style={{ fontSize: 12, color: 'var(--text-3)', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.5px', marginBottom: 12 }}>Example</p>
              <p className="code-block" style={{ whiteSpace: 'normal', lineHeight: 1.6 }}>
                &quot;Send 200 USDC from María in Buenos Aires to Juan in Mexico City for rent&quot;
              </p>
              <p style={{ marginTop: 14, fontSize: 14, color: 'var(--text-2)' }}>
                → FlowPay routes cross-chain, records the intent on Hedera, and settles in &lt;3 seconds.
              </p>
            </div>
          </section>

          <div style={{ height: 1, background: 'var(--separator)', marginBottom: 72 }} />

          <section id="how" style={{ marginBottom: 72 }}>
            <h2 style={{ fontSize: 28, fontWeight: 700, letterSpacing: '-0.8px', marginBottom: 20 }}>How it works</h2>
            <p style={{ fontSize: 17, color: 'var(--text-2)', lineHeight: 1.65, marginBottom: 32 }}>
              Every payment goes through four sequential steps:
            </p>
            {[
              { n: '01', color: 'var(--c-ai)',     title: 'Natural language → Intent',   desc: 'Claude Haiku parses your sentence and extracts a structured PaymentIntent: amount, tokens, addresses, sender, recipient, and memo.' },
              { n: '02', color: 'var(--c-lifi)',   title: 'Intent → Atomic cross-chain flow', desc: 'LI.FI Composer builds a multi-step cross-chain operation as a single atomic Flow. If any step fails, the entire flow reverts.' },
              { n: '03', color: 'var(--c-hcs)',    title: 'Intent → Audit record',       desc: 'Hedera Consensus Service receives a JSON message with the full payment intent. Ordered, timestamped, permanently stored on a public topic.' },
              { n: '04', color: 'var(--c-settle)', title: 'HBAR → Settlement',           desc: 'A native HBAR TransferTransaction executes settlement. Finality in under 3 seconds. Fixed fee ~$0.001. No Solidity required.' },
            ].map(({ n, color, title, desc }) => (
              <div key={n} style={{ display: 'flex', gap: 18, marginBottom: 24 }}>
                <div style={{ width: 36, height: 36, borderRadius: 10, background: 'var(--card)', border: '1px solid var(--border)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 11, color, fontWeight: 700, flexShrink: 0, fontFamily: 'var(--font-geist-mono,monospace)' }}>{n}</div>
                <div>
                  <p style={{ fontSize: 15, fontWeight: 600, color: 'var(--text-1)', marginBottom: 5 }}>{title}</p>
                  <p style={{ fontSize: 14, color: 'var(--text-2)', lineHeight: 1.6 }}>{desc}</p>
                </div>
              </div>
            ))}
          </section>

          <div style={{ height: 1, background: 'var(--separator)', marginBottom: 72 }} />

          <section id="layers" style={{ marginBottom: 72 }}>
            <h2 style={{ fontSize: 28, fontWeight: 700, letterSpacing: '-0.8px', marginBottom: 20 }}>The three layers</h2>
            <p style={{ fontSize: 17, color: 'var(--text-2)', lineHeight: 1.65, marginBottom: 28 }}>
              FlowPay uses two platforms and three native services — each doing what it does best.
            </p>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
              {[
                { color: 'var(--c-ai)',     label: 'Claude AI (Anthropic)',    what: 'NL parsing',         why: 'Eliminates structured input. Users write like they text. Regex fallback ensures demos never break.', note: 'Model: claude-haiku-4-5-20251001' },
                { color: 'var(--c-lifi)',   label: 'LI.FI Composer SDK',       what: 'EVM atomic flows',   why: 'Multi-step DeFi compiled into one transaction. All-or-nothing execution. 15+ EVM networks.', note: '@lifi/composer-sdk @staging' },
                { color: 'var(--c-hcs)',    label: 'Hedera Consensus Service', what: 'Audit trail',        why: 'Ordered, timestamped, tamper-proof public message log. Any party can verify any payment.', note: 'Topic ID: 0.0.9217982' },
                { color: 'var(--c-settle)', label: 'Hedera / HBAR',            what: 'Settlement',         why: 'Sub-3-second absolute finality. Fixed USD fees (~$0.001). Native @hashgraph/sdk — zero Solidity.', note: 'TransferTransaction, no smart contracts' },
              ].map(({ color, label, what, why, note }) => (
                <div key={label} style={{ background: 'var(--card)', border: '1px solid var(--border)', borderLeft: `3px solid ${color}`, borderRadius: '0 16px 16px 0', borderTopLeftRadius: 4, borderBottomLeftRadius: 4, padding: '18px 20px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 8 }}>
                    <span style={{ fontWeight: 600, fontSize: 14 }}>{label}</span>
                    <span style={{ fontSize: 11, color: 'var(--text-2)', background: 'var(--surface)', border: '1px solid var(--border)', padding: '2px 9px', borderRadius: 980 }}>{what}</span>
                  </div>
                  <p style={{ fontSize: 13, color: 'var(--text-2)', lineHeight: 1.6, marginBottom: 6 }}>{why}</p>
                  <p style={{ fontSize: 11, color: 'var(--text-3)', fontFamily: 'var(--font-geist-mono,monospace)' }}>{note}</p>
                </div>
              ))}
            </div>
          </section>

          <div style={{ height: 1, background: 'var(--separator)', marginBottom: 72 }} />

          <section id="results" style={{ marginBottom: 72 }}>
            <h2 style={{ fontSize: 28, fontWeight: 700, letterSpacing: '-0.8px', marginBottom: 20 }}>Interpreting results</h2>
            <p style={{ fontSize: 17, color: 'var(--text-2)', lineHeight: 1.65, marginBottom: 28 }}>After executing a payment, FlowPay returns four cards. Here&apos;s what each field means:</p>
            {[
              { label: 'Intent Parsed',    color: 'var(--c-ai)',     fields: [['humanSummary', 'Plain-language confirmation of what Claude understood.'], ['amount', 'Numeric value extracted from your sentence.'], ['fromToken / toToken', 'Source and target tokens for the cross-chain route.'], ['memo', 'Purpose of payment: rent, salary, freelance, etc.'], ['senderName / recipientName', 'Names parsed from the sentence, if present.']] },
              { label: 'Cross-chain Route',color: 'var(--c-lifi)',   fields: [['flowBuilt', 'Whether LI.FI Composer successfully built the Flow document.'], ['steps', 'Human-readable description of each operation in the flow.'], ['compiled', 'Whether the flow compiled to EVM calldata.'], ['calldataPreview', 'First bytes of compiled calldata — real executable transaction data.']] },
              { label: 'Audit Trail',      color: 'var(--c-hcs)',    fields: [['topicId', 'Hedera HCS topic where all FlowPay payments are permanently recorded.'], ['sequenceNumber', 'Unique entry number for this payment. Monotonically increasing.'], ['explorerUrl', 'Direct link to verify the entry on Hashscan.']] },
              { label: 'Settlement',       color: 'var(--c-settle)', fields: [['transactionId', 'Hedera transaction ID in format accountId@seconds.nanos.'], ['amount', 'HBAR transferred (0.001 HBAR per demo payment).'], ['explorerUrl', 'Direct link to verify the transaction on Hashscan.']] },
            ].map(({ label, color, fields }) => (
              <div key={label} style={{ marginBottom: 28 }}>
                <p style={{ fontSize: 14, fontWeight: 600, marginBottom: 12, display: 'flex', alignItems: 'center', gap: 8 }}>
                  <span style={{ width: 6, height: 6, borderRadius: '50%', background: color, display: 'inline-block', flexShrink: 0 }} />
                  {label}
                </p>
                <div style={{ paddingLeft: 14, borderLeft: `1.5px solid ${color}40`, display: 'flex', flexDirection: 'column', gap: 8 }}>
                  {fields.map(([name, desc]) => (
                    <div key={name}>
                      <code style={{ fontSize: 12, background: 'var(--card)', border: '1px solid var(--border)', padding: '1px 8px', borderRadius: 6, fontFamily: 'var(--font-geist-mono,monospace)', color: 'var(--text-1)', marginRight: 10 }}>{name}</code>
                      <span style={{ fontSize: 13, color: 'var(--text-2)' }}>{desc}</span>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </section>

          <div style={{ height: 1, background: 'var(--separator)', marginBottom: 72 }} />

          <section id="usecases" style={{ marginBottom: 72 }}>
            <h2 style={{ fontSize: 28, fontWeight: 700, letterSpacing: '-0.8px', marginBottom: 20 }}>Use cases</h2>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14 }}>
              {[
                { title: 'Remittances',        desc: 'Send money home to family. Type it like a text message. No exchange account needed.' },
                { title: 'Freelance payroll',  desc: 'Pay global contractors in their preferred token. One sentence, cross-chain.' },
                { title: 'School fees',        desc: 'International tuition payments without wire transfers or 5% FX margins.' },
                { title: 'DAO contributions',  desc: 'Coordinate multi-chain treasury distributions with a permanent audit trail.' },
              ].map(({ title, desc }) => (
                <div key={title} style={{ background: 'var(--card)', border: '1px solid var(--border)', borderRadius: 16, padding: '20px 22px' }}>
                  <p style={{ fontWeight: 600, fontSize: 14, marginBottom: 6 }}>{title}</p>
                  <p style={{ fontSize: 13, color: 'var(--text-2)', lineHeight: 1.55 }}>{desc}</p>
                </div>
              ))}
            </div>
          </section>

          <div style={{ height: 1, background: 'var(--separator)', marginBottom: 72 }} />

          <section id="faq">
            <h2 style={{ fontSize: 28, fontWeight: 700, letterSpacing: '-0.8px', marginBottom: 24 }}>FAQ</h2>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
              {[
                ['Is this using real funds?', 'No. FlowPay runs on Hedera Testnet. HBAR transferred has no real value. LI.FI flows are compiled but not submitted to mainnet.'],
                ["Why doesn't LI.FI integrate directly with Hedera?", "LI.FI Composer is EVM-only. Hedera uses a different VM. FlowPay uses both at the application layer — LI.FI for EVM routing, Hedera for settlement and auditability. Each does what it's best at."],
                ['What happens if Claude AI is unavailable?', 'FlowPay includes a regex-based fallback parser. If the Anthropic API is unreachable, the demo continues to work using pattern matching on the input text.'],
                ['Can I use my own Hedera account?', 'Yes. Clone the repo, add your HEDERA_ACCOUNT_ID and HEDERA_PRIVATE_KEY (ECDSA) to .env.local, and run npm run dev. Leave HEDERA_TOPIC_ID blank on first run — a new topic is auto-created.'],
                ['What does "No Solidity" mean?', "FlowPay uses Hedera's native SDK — HCS for messages, HTS for transfers — without deploying any smart contracts. These are protocol-level primitives in @hashgraph/sdk."],
              ].map(([q, a]) => (
                <div key={q} style={{ background: 'var(--card)', border: '1px solid var(--border)', borderRadius: 14, padding: '18px 20px' }}>
                  <p style={{ fontWeight: 600, fontSize: 14, marginBottom: 8 }}>{q}</p>
                  <p style={{ fontSize: 13, color: 'var(--text-2)', lineHeight: 1.65 }}>{a}</p>
                </div>
              ))}
            </div>
          </section>
        </main>
      </div>
    </div>
  );
}
