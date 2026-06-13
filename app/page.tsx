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

const PIPELINE = [
  { label: 'AI Intent',    sub: 'Claude Haiku',   color: 'var(--c-ai)'     },
  { label: 'LI.FI Route',  sub: 'Composer SDK',   color: 'var(--c-lifi)'   },
  { label: 'HCS Record',   sub: 'Hedera Audit',   color: 'var(--c-hcs)'    },
  { label: 'Settlement',   sub: '< 3 sec',        color: 'var(--c-settle)' },
];

const STATS = [
  { val: '< 3s',   label: 'Finality'  },
  { val: '$0.001', label: 'Per tx'    },
  { val: '15+',    label: 'EVM chains'},
  { val: '0',      label: 'Solidity'  },
];

export default function Home() {
  const [intent, setIntent]           = useState('');
  const [loading, setLoading]         = useState(false);
  const [activeStep, setActiveStep]   = useState(-1);
  const [result, setResult]           = useState<PaymentResult | null>(null);
  const [error, setError]             = useState<string | null>(null);
  const [visibleCards, setVisibleCards] = useState<number[]>([]);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!intent.trim() || loading) return;
    setLoading(true);
    setResult(null);
    setError(null);
    setVisibleCards([]);

    const wait = (ms: number) => new Promise(r => setTimeout(r, ms));

    const fetchPromise = fetch('/api/pay', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ intent }),
    }).then(r => r.json());

    for (let i = 0; i < 4; i++) {
      setActiveStep(i);
      await wait(560);
    }

    try {
      const data = await fetchPromise;
      if (data.error) {
        setError(data.error);
      } else {
        setResult(data);
        for (let i = 0; i < 4; i++) {
          await wait(100);
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
    setResult(null);
    setIntent('');
    setError(null);
    setVisibleCards([]);
    setActiveStep(-1);
  }

  const S: React.CSSProperties = { fontFamily: 'inherit' };

  return (
    <div style={{ background: 'var(--bg)', minHeight: '100vh' }}>

      {/* ── NAV ── */}
      <header style={{
        position: 'sticky', top: 0, zIndex: 50,
        background: 'rgba(0,0,0,0.82)',
        backdropFilter: 'saturate(180%) blur(20px)',
        WebkitBackdropFilter: 'saturate(180%) blur(20px)',
        borderBottom: '1px solid var(--separator)',
      }}>
        <div style={{ maxWidth: 960, margin: '0 auto', padding: '0 24px', height: 52, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <span style={{ fontSize: 18, fontWeight: 700, letterSpacing: '-0.4px' }}>
            Flow<span style={{ color: 'var(--accent)' }}>Pay</span>
          </span>
          <nav style={{ display: 'flex', alignItems: 'center', gap: 32 }}>
            <Link href="/docs"  className="nav-link">Docs</Link>
            <Link href="/brand" className="nav-link">Brand</Link>
            <a href="https://github.com/riesgopais/flowpay" target="_blank" rel="noopener noreferrer" className="nav-link">GitHub</a>
          </nav>
        </div>
      </header>

      {/* ── HERO ── */}
      <section style={{ textAlign: 'center', padding: '100px 24px 80px' }} className="animate-fade-up">
        <div style={{ display: 'inline-block', background: 'var(--card)', border: '1px solid var(--border)', borderRadius: 980, padding: '5px 14px', marginBottom: 32 }}>
          <span style={{ fontSize: 12, color: 'var(--text-2)', letterSpacing: '0.2px' }}>
            <span style={{ display: 'inline-block', width: 6, height: 6, borderRadius: '50%', background: 'var(--c-settle)', marginRight: 7, verticalAlign: 'middle', animation: 'blink 2.2s ease infinite' }} />
            Live on Hedera Testnet
          </span>
        </div>

        <h1 style={{ fontSize: 'clamp(44px, 8vw, 80px)', fontWeight: 700, letterSpacing: 'clamp(-2px, -0.04em, -3px)', lineHeight: 1.05, marginBottom: 24, color: 'var(--text-1)' }}>
          Move money at<br />the speed of thought.
        </h1>

        <p style={{ fontSize: 21, color: 'var(--text-2)', maxWidth: 520, margin: '0 auto 56px', lineHeight: 1.5, fontWeight: 400, letterSpacing: '-0.1px' }}>
          Type what you want to pay. FlowPay routes, executes, and settles across any chain — in plain language.
        </p>

        <div style={{ display: 'flex', justifyContent: 'center', gap: 48 }}>
          {STATS.map(({ val, label }) => (
            <div key={label}>
              <div style={{ fontSize: 28, fontWeight: 700, letterSpacing: '-0.8px', color: 'var(--text-1)' }}>{val}</div>
              <div style={{ fontSize: 12, color: 'var(--text-2)', marginTop: 2, letterSpacing: '0.2px' }}>{label}</div>
            </div>
          ))}
        </div>
      </section>

      {/* ── PIPELINE ── */}
      <section style={{ maxWidth: 760, margin: '0 auto', padding: '0 24px 64px' }}>
        <div style={{ display: 'flex', alignItems: 'center' }}>
          {PIPELINE.map((step, i) => (
            <div key={step.label} style={{ display: 'flex', alignItems: 'center', flex: i < 3 ? '0 0 auto' : undefined }}>
              <div style={{
                padding: '14px 18px',
                borderRadius: 14,
                background: activeStep === i ? 'var(--card-hover)' : result ? 'var(--card)' : 'var(--card)',
                border: `1px solid ${activeStep === i ? 'var(--border-strong)' : result ? step.color + '40' : 'var(--border)'}`,
                textAlign: 'center',
                minWidth: 110,
                transition: 'all 0.3s ease',
                opacity: loading && activeStep < i ? 0.4 : 1,
              }}>
                <div style={{ fontSize: 12, fontWeight: 600, color: activeStep === i || result ? 'var(--text-1)' : 'var(--text-2)', letterSpacing: '-0.1px', marginBottom: 3, transition: 'color 0.3s' }}>
                  {loading && activeStep === i
                    ? <span style={{ display: 'inline-flex', alignItems: 'center', gap: 6 }}>
                        <span style={{ width: 10, height: 10, border: '1.5px solid var(--text-3)', borderTopColor: 'var(--text-1)', borderRadius: '50%', animation: 'spin 0.7s linear infinite', display: 'inline-block', flexShrink: 0 }} />
                        {step.label}
                      </span>
                    : step.label}
                </div>
                <div style={{ fontSize: 11, color: 'var(--text-2)', letterSpacing: '0.1px' }}>{step.sub}</div>
              </div>
              {i < 3 && (
                <div className="step-bar" style={{ minWidth: 24 }}>
                  <div className={`step-bar-fill ${activeStep > i && loading ? 'active' : activeStep <= i && loading ? '' : result ? 'done' : ''}`} />
                </div>
              )}
            </div>
          ))}
        </div>
      </section>

      {/* ── TERMINAL ── */}
      <section style={{ maxWidth: 640, margin: '0 auto', padding: '0 24px 120px' }}>

        <div className="fp-card" style={{ padding: 28 }}>
          <form onSubmit={handleSubmit} style={S}>
            <textarea
              className="fp-input"
              value={intent}
              onChange={e => setIntent(e.target.value)}
              placeholder="Send 200 USDC from María in Buenos Aires to Juan in Mexico City for rent…"
              rows={3}
              disabled={loading}
              style={{ width: '100%', padding: '16px', resize: 'none', display: 'block', marginBottom: 14 }}
              onKeyDown={e => { if (e.key === 'Enter' && (e.metaKey || e.ctrlKey)) handleSubmit(e as unknown as React.FormEvent); }}
            />

            <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
              <button type="submit" disabled={!intent.trim() || loading} className="btn-primary" style={{ padding: '12px 26px' }}>
                {loading
                  ? <><span style={{ width: 14, height: 14, border: '1.5px solid rgba(0,0,0,0.25)', borderTopColor: '#000', borderRadius: '50%', animation: 'spin 0.7s linear infinite', display: 'inline-block' }} /> Processing</>
                  : 'Execute'}
              </button>
              <span style={{ fontSize: 12, color: 'var(--text-3)' }}>⌘ Return to send</span>
            </div>
          </form>

          {!result && !loading && !error && (
            <div style={{ marginTop: 24, paddingTop: 24, borderTop: '1px solid var(--separator)' }}>
              <p style={{ fontSize: 12, color: 'var(--text-3)', marginBottom: 10, letterSpacing: '0.3px', textTransform: 'uppercase', fontWeight: 500 }}>Examples</p>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                {EXAMPLES.map((ex, i) => (
                  <button key={i} onClick={() => setIntent(ex)} className="btn-ghost" style={{ padding: '11px 14px' }}>
                    {ex}
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>

        {error && (
          <div style={{ marginTop: 16, background: 'rgba(255,69,58,0.08)', border: '1px solid rgba(255,69,58,0.2)', borderRadius: 14, padding: '16px 20px', color: '#FF453A', fontSize: 14 }}>
            {error}
          </div>
        )}

        {/* ── RESULTS ── */}
        {result && (
          <div style={{ marginTop: 16, display: 'flex', flexDirection: 'column', gap: 10 }}>

            {[
              {
                idx: 0,
                label: 'Intent Parsed',
                service: 'Claude Haiku',
                accentColor: 'var(--c-ai)',
                body: (
                  <>
                    <p style={{ fontSize: 15, fontWeight: 500, color: 'var(--text-1)', marginBottom: 12 }}>{result.parsed.humanSummary}</p>
                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
                      {[
                        `${result.parsed.amount} ${result.parsed.fromToken}`,
                        `→ ${result.parsed.toToken}`,
                        result.parsed.memo,
                        result.parsed.senderName ? `From: ${result.parsed.senderName}` : null,
                        result.parsed.recipientName ? `To: ${result.parsed.recipientName}` : null,
                      ].filter(Boolean).map(t => (
                        <span key={t!} style={{ fontSize: 12, background: 'var(--surface)', border: '1px solid var(--border)', color: 'var(--text-2)', padding: '3px 10px', borderRadius: 980, letterSpacing: '-0.1px' }}>{t}</span>
                      ))}
                    </div>
                  </>
                ),
              },
              {
                idx: 1,
                label: 'Cross-chain Route',
                service: 'LI.FI Composer',
                accentColor: 'var(--c-lifi)',
                body: (
                  <>
                    <p style={{ fontSize: 15, fontWeight: 500, color: 'var(--text-1)', marginBottom: 10 }}>Atomic flow · {result.parsed.fromToken} → {result.parsed.toToken}</p>
                    {result.lifi.steps.map((s, i) => (
                      <p key={i} style={{ fontSize: 13, color: 'var(--text-2)', marginBottom: 4 }}>→ {s}</p>
                    ))}
                    {result.lifi.compiled && (
                      <div className="code-block" style={{ marginTop: 12 }}>{result.lifi.calldataPreview || '0x...'}</div>
                    )}
                  </>
                ),
              },
              {
                idx: 2,
                label: 'Audit Trail',
                service: 'Hedera HCS',
                accentColor: 'var(--c-hcs)',
                body: (
                  <>
                    <p style={{ fontSize: 15, fontWeight: 500, color: 'var(--text-1)', marginBottom: 10 }}>Recorded · immutable · public</p>
                    <p style={{ fontSize: 13, color: 'var(--text-2)', marginBottom: 12 }}>
                      Topic <span style={{ color: 'var(--text-1)', fontFamily: 'var(--font-geist-mono,monospace)' }}>{result.hcs.topicId}</span>
                      <span style={{ margin: '0 8px', color: 'var(--text-3)' }}>·</span>
                      Entry <span style={{ color: 'var(--text-1)' }}>#{result.hcs.sequenceNumber}</span>
                    </p>
                    <a href={result.hcs.explorerUrl} target="_blank" rel="noopener noreferrer" style={{ fontSize: 13, color: 'var(--text-1)', textDecoration: 'none', fontWeight: 500 }}>View on Hashscan →</a>
                  </>
                ),
              },
              {
                idx: 3,
                label: 'Settlement',
                service: 'Hedera Testnet',
                accentColor: 'var(--c-settle)',
                body: (
                  <>
                    <p style={{ fontSize: 15, fontWeight: 500, color: 'var(--text-1)', marginBottom: 10 }}>
                      {result.payment.amount} transferred · &lt;3 seconds · $0.001
                    </p>
                    <p style={{ fontSize: 12, fontFamily: 'var(--font-geist-mono,monospace)', color: 'var(--text-2)', marginBottom: 12, wordBreak: 'break-all' }}>
                      {result.payment.transactionId}
                    </p>
                    <a href={result.payment.explorerUrl} target="_blank" rel="noopener noreferrer" style={{ fontSize: 13, color: 'var(--text-1)', textDecoration: 'none', fontWeight: 500 }}>View on Hashscan →</a>
                  </>
                ),
              },
            ].map(({ idx, label, service, accentColor, body }) =>
              visibleCards.includes(idx) && (
                <div key={idx} className="fp-card animate-fade-up" style={{ padding: 22, borderLeft: `3px solid ${accentColor}`, borderRadius: '0 20px 20px 0', borderTopLeftRadius: 4, borderBottomLeftRadius: 4, animationDelay: `${idx * 80}ms` }}>
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 14 }}>
                    <span style={{ fontSize: 13, fontWeight: 600, color: 'var(--text-1)', letterSpacing: '-0.1px' }}>{label}</span>
                    <span style={{ fontSize: 11, color: 'var(--text-2)', letterSpacing: '0.1px' }}>{service}</span>
                  </div>
                  {body}
                </div>
              )
            )}

            {visibleCards.length === 4 && (
              <button
                onClick={reset}
                style={{ background: 'none', border: 'none', color: 'var(--text-2)', fontSize: 14, cursor: 'pointer', padding: '16px 0', fontFamily: 'inherit', letterSpacing: '-0.1px', transition: 'color 0.15s' }}
                onMouseEnter={e => (e.currentTarget.style.color = 'var(--text-1)')}
                onMouseLeave={e => (e.currentTarget.style.color = 'var(--text-2)')}>
                ← New payment
              </button>
            )}
          </div>
        )}
      </section>

      {/* ── FOOTER ── */}
      <footer style={{ borderTop: '1px solid var(--separator)', padding: '24px', textAlign: 'center' }}>
        <p style={{ fontSize: 13, color: 'var(--text-2)' }}>
          Built at <span style={{ color: 'var(--accent)' }}>ETHGlobal New York 2026</span>
          <span style={{ margin: '0 12px', color: 'var(--text-3)' }}>·</span>
          <a href="https://github.com/riesgopais/flowpay" target="_blank" rel="noopener noreferrer" className="nav-link">GitHub</a>
          <span style={{ margin: '0 12px', color: 'var(--text-3)' }}>·</span>
          <Link href="/docs" className="nav-link">Docs</Link>
          <span style={{ margin: '0 12px', color: 'var(--text-3)' }}>·</span>
          <a href="https://hashscan.io/testnet/topic/0.0.9217982" target="_blank" rel="noopener noreferrer" className="nav-link">Hashscan</a>
        </p>
      </footer>
    </div>
  );
}
