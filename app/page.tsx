'use client';

import { useState } from 'react';
import Link from 'next/link';

interface PaymentResult {
  success: boolean;
  parsed: {
    humanSummary: string;
    amount: number;
    fromToken: string;
    toToken: string;
    memo: string;
    senderName: string | null;
    recipientName: string | null;
  };
  lifi: {
    flowBuilt: boolean;
    steps: string[];
    compiled: boolean;
    calldataPreview?: string;
  };
  hcs: {
    topicId: string;
    sequenceNumber: string;
    explorerUrl: string;
  };
  payment: {
    transactionId: string;
    amount: string;
    explorerUrl: string;
  };
}

const EXAMPLES = [
  'Send 200 USDC from María in Buenos Aires to Juan in Mexico City for rent',
  'Pay 0.05 ETH to 0x742d35Cc6634C0532925a3b844Bc454e4438f44e for freelance design work',
  'Transfer 500 USDC to my sister in Colombia for school fees',
];

const STEPS = [
  { label: 'AI Intent',   sub: 'Claude parses your words',  color: '#1A6BFF', glow: 'rgba(26,107,255,0.4)',  icon: '◈' },
  { label: 'LI.FI Route', sub: 'Atomic cross-chain flow',   color: '#FF6B1A', glow: 'rgba(255,107,26,0.35)', icon: '⟳' },
  { label: 'HCS Record',  sub: 'Immutable audit trail',     color: '#7C3AED', glow: 'rgba(124,58,237,0.35)', icon: '◆' },
  { label: 'Settlement',  sub: '<3 sec · $0.001',           color: '#00D9A5', glow: 'rgba(0,217,165,0.35)',  icon: '✓' },
];

const STATS = [
  { val: '<3s',   label: 'Finality',   color: 'var(--teal)' },
  { val: '$0.001',label: 'Per Tx',     color: 'var(--gold)' },
  { val: '15+',   label: 'EVM Chains', color: 'var(--blue-light)' },
  { val: '0',     label: 'Solidity',   color: 'var(--orange)' },
];

function Orb({ size, color, x, y, blur, delay = '0s' }: {
  size: number; color: string; x: string; y: string; blur: number; delay?: string;
}) {
  return (
    <div style={{
      position: 'absolute', left: x, top: y, width: size, height: size,
      background: color, borderRadius: '50%', filter: `blur(${blur}px)`,
      animation: `orbFloat 9s ease-in-out ${delay} infinite`,
      pointerEvents: 'none', transform: 'translate(-50%,-50%)',
    }} />
  );
}

function StreamConnector({ color, active }: { color: string; active: boolean }) {
  return (
    <div className="stream-connector" style={{ marginTop: 8 }}>
      {active && [0, 0.55, 1.1].map((d, i) => (
        <div key={i} className="stream-dot" style={{ background: color, animationDelay: `${d}s` }} />
      ))}
    </div>
  );
}

export default function Home() {
  const [intent, setIntent] = useState('');
  const [loading, setLoading] = useState(false);
  const [activeStep, setActiveStep] = useState(-1);
  const [result, setResult] = useState<PaymentResult | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [visibleCards, setVisibleCards] = useState<number[]>([]);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!intent.trim() || loading) return;
    setLoading(true);
    setResult(null);
    setError(null);
    setVisibleCards([]);

    const stepDelay = (ms: number) => new Promise(r => setTimeout(r, ms));

    const fetchPromise = fetch('/api/pay', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ intent }),
    }).then(r => r.json());

    for (let i = 0; i < 4; i++) {
      setActiveStep(i);
      await stepDelay(550);
    }

    try {
      const data = await fetchPromise;
      if (data.error) {
        setError(data.error);
      } else {
        setResult(data);
        for (let i = 0; i < 4; i++) {
          await stepDelay(120);
          setVisibleCards(prev => [...prev, i]);
        }
      }
    } catch {
      setError('Network error. Please try again.');
    } finally {
      setLoading(false);
      setActiveStep(-1);
    }
  }

  function reset() {
    setResult(null); setIntent(''); setError(null);
    setVisibleCards([]); setActiveStep(-1);
  }

  const resultCards = result ? [
    {
      label: 'Intent Parsed', tag: 'Claude Haiku',
      color: '#1A6BFF', dim: 'rgba(26,107,255,0.12)', border: 'rgba(26,107,255,0.25)', icon: '◈',
      body: (
        <>
          <p style={{ fontSize: 15, fontWeight: 600, marginBottom: 10 }}>{result.parsed.humanSummary}</p>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
            {[
              `${result.parsed.amount} ${result.parsed.fromToken}`,
              `→ ${result.parsed.toToken}`,
              result.parsed.memo,
              result.parsed.senderName ? `From: ${result.parsed.senderName}` : null,
              result.parsed.recipientName ? `To: ${result.parsed.recipientName}` : null,
            ].filter(Boolean).map(t => (
              <span key={t!} style={{ fontSize: 11, background: 'rgba(26,107,255,0.1)', border: '1px solid rgba(26,107,255,0.2)', color: '#93BBFF', padding: '3px 10px', borderRadius: 20, fontWeight: 600 }}>{t}</span>
            ))}
          </div>
        </>
      ),
    },
    {
      label: 'Cross-chain Route', tag: 'LI.FI Composer',
      color: '#FF6B1A', dim: 'rgba(255,107,26,0.12)', border: 'rgba(255,107,26,0.25)', icon: '⟳',
      body: (
        <>
          <p style={{ fontSize: 15, fontWeight: 600, marginBottom: 8 }}>
            Atomic flow · {result.parsed.fromToken} → {result.parsed.toToken}
          </p>
          {result.lifi.steps.map((s, i) => (
            <div key={i} style={{ fontSize: 12, color: 'var(--muted-light)', display: 'flex', gap: 8, marginBottom: 4 }}>
              <span style={{ color: '#FF6B1A' }}>▸</span>{s}
            </div>
          ))}
          {result.lifi.compiled && (
            <div className="code-block" style={{ marginTop: 10, fontSize: 11, color: '#FFB380' }}>
              {result.lifi.calldataPreview || '0x...'}
            </div>
          )}
        </>
      ),
    },
    {
      label: 'Audit Trail', tag: 'Hedera HCS',
      color: '#7C3AED', dim: 'rgba(124,58,237,0.12)', border: 'rgba(124,58,237,0.25)', icon: '◆',
      body: (
        <>
          <p style={{ fontSize: 15, fontWeight: 600, marginBottom: 8 }}>Payment recorded · immutable · public</p>
          <p style={{ fontSize: 12, color: 'var(--muted-light)', marginBottom: 10 }}>
            Topic: <span style={{ color: '#B49EFF', fontFamily: 'var(--font-geist-mono,monospace)' }}>{result.hcs.topicId}</span>
            <span style={{ marginLeft: 10 }}>Entry <span style={{ color: '#B49EFF', fontWeight: 700 }}>#{result.hcs.sequenceNumber}</span></span>
          </p>
          <a href={result.hcs.explorerUrl} target="_blank" rel="noopener noreferrer"
            style={{ fontSize: 12, color: '#7C3AED', textDecoration: 'none', fontWeight: 700 }}>
            View on Hashscan ↗
          </a>
        </>
      ),
    },
    {
      label: 'Settlement', tag: 'Hedera Testnet',
      color: '#00D9A5', dim: 'rgba(0,217,165,0.12)', border: 'rgba(0,217,165,0.25)', icon: '✓',
      body: (
        <>
          <p style={{ fontSize: 15, fontWeight: 600, marginBottom: 8 }}>
            {result.payment.amount} transferred · &lt;3 seconds · $0.001
          </p>
          <p style={{ fontSize: 11, fontFamily: 'var(--font-geist-mono,monospace)', color: 'var(--muted)', marginBottom: 10, wordBreak: 'break-all' }}>
            {result.payment.transactionId}
          </p>
          <a href={result.payment.explorerUrl} target="_blank" rel="noopener noreferrer"
            style={{ fontSize: 12, color: '#00D9A5', textDecoration: 'none', fontWeight: 700 }}>
            View on Hashscan ↗
          </a>
        </>
      ),
    },
  ] : [];

  return (
    <div className="grid-bg" style={{ background: 'var(--bg)', minHeight: '100vh', position: 'relative', overflowX: 'hidden' }}>

      {/* Background orbs */}
      <div style={{ position: 'fixed', inset: 0, pointerEvents: 'none', zIndex: 0, overflow: 'hidden' }}>
        <Orb size={700} color="rgba(26,107,255,0.11)" x="15%" y="35%" blur={130} delay="0s" />
        <Orb size={550} color="rgba(255,107,26,0.08)" x="82%" y="65%" blur={110} delay="3s" />
        <Orb size={450} color="rgba(124,58,237,0.07)" x="65%" y="18%" blur={90}  delay="6s" />
      </div>

      {/* NAV */}
      <nav style={{
        position: 'sticky', top: 0, zIndex: 50,
        background: 'rgba(3,7,18,0.85)', backdropFilter: 'blur(16px)',
        borderBottom: '1px solid var(--border)',
      }}>
        <div style={{ maxWidth: 1100, margin: '0 auto', padding: '0 24px', height: 60, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <span style={{ fontSize: 19, fontWeight: 900, letterSpacing: '-0.5px' }}>
              Flow<span style={{ color: 'var(--orange)' }}>Pay</span>
            </span>
            <span style={{ fontSize: 10, color: 'var(--blue-light)', background: 'var(--blue-dim)', border: '1px solid var(--blue-border)', padding: '2px 8px', borderRadius: 20, fontWeight: 700, letterSpacing: '0.5px' }}>
              TESTNET
            </span>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 28 }}>
            <Link href="/docs" className="nav-link">Docs</Link>
            <Link href="/brand" className="nav-link">Brand</Link>
            <a href="https://github.com/riesgopais/flowpay" target="_blank" rel="noopener noreferrer" className="nav-link">GitHub ↗</a>
            <span style={{ fontSize: 11, color: 'var(--orange)', background: 'var(--orange-dim)', border: '1px solid var(--orange-border)', padding: '4px 12px', borderRadius: 20, fontWeight: 700 }}>
              ETHGlobal NYC 2026
            </span>
          </div>
        </div>
      </nav>

      {/* MAIN */}
      <main style={{ position: 'relative', zIndex: 1, maxWidth: 720, margin: '0 auto', padding: '72px 24px 120px' }}>

        {/* HERO */}
        <div style={{ textAlign: 'center', marginBottom: 64 }} className="animate-fade-up">
          <div style={{ display: 'inline-flex', alignItems: 'center', gap: 7, background: 'rgba(26,107,255,0.08)', border: '1px solid var(--blue-border)', borderRadius: 24, padding: '6px 14px', marginBottom: 28 }}>
            <span style={{ width: 6, height: 6, borderRadius: '50%', background: 'var(--blue)', display: 'inline-block', animation: 'pulseRing 1.8s ease-out infinite' }} />
            <span style={{ fontSize: 12, color: 'var(--blue-light)', fontWeight: 700, letterSpacing: '0.3px' }}>Live on Hedera Testnet</span>
          </div>

          <h1 style={{ fontSize: 'clamp(38px, 7.5vw, 72px)', fontWeight: 900, lineHeight: 1.04, letterSpacing: '-2.5px', marginBottom: 22 }}>
            Move money at<br />
            <span className="flow-gradient-text">the speed of thought.</span>
          </h1>

          <p style={{ fontSize: 17, color: 'var(--muted-light)', maxWidth: 480, margin: '0 auto 40px', lineHeight: 1.65 }}>
            Type what you want to pay. FlowPay&apos;s AI agent handles the routing, cross-chain execution, and on-chain settlement — in a single flow.
          </p>

          <div style={{ display: 'flex', justifyContent: 'center', gap: 32, flexWrap: 'wrap' }}>
            {STATS.map(({ val, label, color }) => (
              <div key={label} style={{ textAlign: 'center' }}>
                <div style={{ fontSize: 24, fontWeight: 900, color, letterSpacing: '-0.5px' }}>{val}</div>
                <div style={{ fontSize: 10, color: 'var(--muted)', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '1px', marginTop: 2 }}>{label}</div>
              </div>
            ))}
          </div>
        </div>

        {/* PIPELINE */}
        <div style={{ marginBottom: 48 }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            {STEPS.map((step, i) => (
              <div key={step.label} style={{ display: 'flex', alignItems: 'center', flex: i < 3 ? '0 0 auto' : undefined }}>
                <div className="fp-card" style={{
                  padding: '14px 16px', textAlign: 'center', minWidth: 108,
                  borderColor: activeStep === i ? step.color : activeStep > i && loading ? step.color + '80' : 'var(--border)',
                  boxShadow: activeStep === i ? `0 0 28px ${step.glow}` : 'none',
                  transition: 'all 0.3s ease',
                  transform: activeStep === i ? 'translateY(-3px)' : 'none',
                }}>
                  <div style={{ fontSize: 20, marginBottom: 5, color: activeStep >= i && loading ? step.color : result ? step.color : 'var(--muted)', transition: 'color 0.3s' }}>
                    {loading && activeStep === i
                      ? <span style={{ display: 'inline-block', animation: 'spin 0.8s linear infinite' }}>◌</span>
                      : step.icon}
                  </div>
                  <div style={{ fontSize: 11, fontWeight: 700, color: activeStep >= i && loading ? 'var(--text)' : result ? 'var(--text)' : 'var(--muted)', letterSpacing: '0.2px', transition: 'color 0.3s' }}>{step.label}</div>
                  <div style={{ fontSize: 10, color: 'var(--muted)', marginTop: 3 }}>{step.sub}</div>
                </div>
                {i < 3 && <StreamConnector color={step.color} active={loading && activeStep >= i} />}
              </div>
            ))}
          </div>
        </div>

        {/* TERMINAL */}
        <div className="fp-card" style={{ padding: 24, marginBottom: 20 }}>
          <div style={{ fontSize: 10, color: 'var(--muted)', fontWeight: 700, letterSpacing: '1.5px', textTransform: 'uppercase', marginBottom: 16, display: 'flex', alignItems: 'center', gap: 8 }}>
            <span style={{ width: 6, height: 6, borderRadius: '50%', background: loading ? 'var(--orange)' : result ? 'var(--teal)' : 'var(--muted)', display: 'inline-block', transition: 'background 0.3s', animation: loading ? 'pulseRing 1.2s ease-out infinite' : 'none' }} />
            Payment Terminal
          </div>

          <form onSubmit={handleSubmit}>
            <textarea
              className="fp-input"
              value={intent}
              onChange={e => setIntent(e.target.value)}
              placeholder="Send 200 USDC from María in Buenos Aires to Juan in Mexico City for rent…"
              rows={3}
              disabled={loading}
              style={{ width: '100%', padding: '14px 16px', fontSize: 15, resize: 'none', marginBottom: 12, display: 'block' }}
              onKeyDown={e => { if (e.key === 'Enter' && (e.metaKey || e.ctrlKey)) handleSubmit(e as unknown as React.FormEvent); }}
            />
            <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
              <button type="submit" disabled={!intent.trim() || loading} className="btn-primary" style={{ padding: '12px 28px', fontSize: 14 }}>
                {loading
                  ? <span style={{ display: 'inline-flex', alignItems: 'center', gap: 8 }}>
                      <span style={{ width: 14, height: 14, border: '2px solid rgba(255,255,255,0.25)', borderTopColor: '#fff', borderRadius: '50%', animation: 'spin 0.7s linear infinite', display: 'inline-block' }} />
                      Processing
                    </span>
                  : 'Execute →'}
              </button>
              <span style={{ fontSize: 11, color: 'var(--muted)' }}>⌘ Enter</span>
            </div>
          </form>

          {!result && !loading && !error && (
            <div style={{ marginTop: 22 }}>
              <div style={{ fontSize: 10, color: 'var(--muted)', fontWeight: 700, letterSpacing: '1.2px', textTransform: 'uppercase', marginBottom: 10 }}>Quick examples</div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 7 }}>
                {EXAMPLES.map((ex, i) => (
                  <button key={i} onClick={() => setIntent(ex)} className="btn-ghost"
                    style={{ padding: '10px 14px', fontSize: 12, textAlign: 'left' }}>
                    ↗ {ex}
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>

        {error && (
          <div style={{ background: 'rgba(239,68,68,0.08)', border: '1px solid rgba(239,68,68,0.3)', borderRadius: 12, padding: '16px 20px', color: '#FCA5A5', fontSize: 14, marginBottom: 16 }}>
            {error}
          </div>
        )}

        {/* RESULT CARDS */}
        {result && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
            {resultCards.map((card, i) => visibleCards.includes(i) && (
              <div key={i} className="fp-card animate-fade-up"
                style={{ padding: 20, borderColor: card.border, animationDelay: `${i * 80}ms` }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 14 }}>
                  <span style={{ color: card.color, fontSize: 15 }}>{card.icon}</span>
                  <span style={{ fontSize: 10, fontWeight: 700, color: 'var(--muted)', textTransform: 'uppercase', letterSpacing: '1.2px' }}>{card.label}</span>
                  <span style={{ marginLeft: 'auto', fontSize: 11, color: card.color, background: card.dim, border: `1px solid ${card.border}`, padding: '2px 9px', borderRadius: 20, fontWeight: 700 }}>{card.tag}</span>
                </div>
                {card.body}
              </div>
            ))}

            {visibleCards.length === 4 && (
              <button onClick={reset} style={{ background: 'none', border: 'none', color: 'var(--muted)', fontSize: 13, cursor: 'pointer', padding: '14px 0', fontFamily: 'inherit', textAlign: 'left', transition: 'color 0.15s' }}
                onMouseEnter={e => (e.currentTarget.style.color = 'var(--text)')}
                onMouseLeave={e => (e.currentTarget.style.color = 'var(--muted)')}>
                ← Send another payment
              </button>
            )}
          </div>
        )}
      </main>

      {/* FOOTER */}
      <footer style={{ position: 'relative', zIndex: 1, borderTop: '1px solid var(--border)', padding: '28px 24px', textAlign: 'center' }}>
        <div style={{ fontSize: 12, color: 'var(--muted)' }}>
          Built at <span style={{ color: 'var(--orange)', fontWeight: 700 }}>ETHGlobal New York 2026</span>
          <span style={{ margin: '0 14px', opacity: 0.3 }}>·</span>
          <a href="https://github.com/riesgopais/flowpay" target="_blank" rel="noopener noreferrer" className="nav-link">GitHub</a>
          <span style={{ margin: '0 14px', opacity: 0.3 }}>·</span>
          <Link href="/docs" className="nav-link">Docs</Link>
          <span style={{ margin: '0 14px', opacity: 0.3 }}>·</span>
          <a href="https://hashscan.io/testnet/topic/0.0.9217982" target="_blank" rel="noopener noreferrer" className="nav-link">Hashscan ↗</a>
        </div>
      </footer>
    </div>
  );
}
