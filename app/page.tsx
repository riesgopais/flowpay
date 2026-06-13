'use client';

import { useState } from 'react';
import Link from 'next/link';
import { ConnectButton } from '@rainbow-me/rainbowkit';
import { useAccount, useSendTransaction } from 'wagmi';

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
    transactionRequest?: {
      to: string;
      data: string;
      value: string;
      chainId: number;
    };
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
  'Pay 0.05 ETH to 0x742d35Cc6634C0532925a3b844Bc454e4438f44e for freelance work',
  'Transfer 500 USDC to my sister in Colombia for school fees',
];

const PROCESSING_STEPS = [
  'Parsing intent with Claude AI',
  'Building cross-chain flow via LI.FI',
  'Recording on Hedera HCS',
  'Settling via HBAR transfer',
];

const HOW_IT_WORKS = [
  {
    n: '01',
    title: 'You type anything.',
    desc: 'Plain language. A name, an amount, a reason. No wallet addresses required, no chain selection, no token research.',
    sub: 'Powered by Claude Haiku',
  },
  {
    n: '02',
    title: 'FlowPay routes it.',
    desc: 'LI.FI Composer builds an atomic cross-chain flow — all steps in one transaction. If anything fails, the whole flow reverts.',
    sub: 'LI.FI Composer SDK',
  },
  {
    n: '03',
    title: 'Hedera confirms it.',
    desc: 'Finality in under 3 seconds. Every payment permanently recorded on a public audit trail. No Solidity required.',
    sub: 'Hedera HCS + HBAR',
  },
];

const STATS = [
  { val: '< 3s',   label: 'Finality'   },
  { val: '$0.001', label: 'Per tx'     },
  { val: '15+',    label: 'EVM chains' },
  { val: '0',      label: 'Solidity'   },
];

interface ParsedPreview {
  humanSummary: string;
  amount: number;
  fromToken: string;
  toToken: string;
  memo: string;
  senderName: string | null;
  recipientName: string | null;
  hederaRecipient: string | null;
}

export default function Home() {
  const { address: walletAddress } = useAccount();
  const { sendTransaction, isPending: isSigning, data: txHash } = useSendTransaction();
  const [intent, setIntent]             = useState('');
  const [stage, setStage]               = useState<'idle' | 'previewing' | 'confirming' | 'executing' | 'done'>('idle');
  const [preview, setPreview]           = useState<ParsedPreview | null>(null);
  const [loading, setLoading]           = useState(false);
  const [stepIndex, setStepIndex]       = useState(-1);
  const [result, setResult]             = useState<PaymentResult | null>(null);
  const [error, setError]               = useState<string | null>(null);
  const [visibleCards, setVisibleCards] = useState<number[]>([]);

  async function handlePreview(e: React.FormEvent) {
    e.preventDefault();
    if (!intent.trim() || loading) return;
    setStage('previewing');
    setError(null);
    try {
      const res = await fetch('/api/parse', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ intent }),
      });
      const data = await res.json();
      if (data.error) { setError(data.error); setStage('idle'); return; }
      setPreview(data);
      setStage('confirming');
    } catch {
      setError('Network error. Please try again.');
      setStage('idle');
    }
  }

  async function handleExecute() {
    if (!preview) return;
    setStage('executing');
    setLoading(true);
    setResult(null);
    setError(null);
    setVisibleCards([]);

    const wait = (ms: number) => new Promise(r => setTimeout(r, ms));

    const fetchPromise = fetch('/api/pay', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ intent, senderAddress: walletAddress }),
    }).then(r => r.json());

    // Steps 1-2 animate freely; steps 3-4 wait for the real API response
    setStepIndex(0); await wait(700);
    setStepIndex(1); await wait(700);
    setStepIndex(2);

    try {
      const [data] = await Promise.all([fetchPromise, wait(500)]);
      setStepIndex(3); await wait(300);

      if (data.error) {
        setError(data.error);
        setStage('idle');
      } else {
        setResult(data);
        setStage('done');
        for (let i = 0; i < 4; i++) {
          await wait(110);
          setVisibleCards(prev => [...prev, i]);
        }
      }
    } catch {
      setError('Network error. Please try again.');
      setStage('idle');
    } finally {
      setLoading(false);
      setStepIndex(-1);
    }
  }

  function reset() {
    setResult(null);
    setPreview(null);
    setIntent('');
    setError(null);
    setVisibleCards([]);
    setStepIndex(-1);
    setStage('idle');
  }

  const isExecuting = stage === 'executing';
  const progress = isExecuting ? ((stepIndex + 1) / 4) * 100 : stage === 'done' ? 100 : 0;

  return (
    <div style={{ background: '#000', minHeight: '100vh', color: '#F5F5F7' }}>

      {/* ── NAV ── */}
      <header style={{
        position: 'sticky', top: 0, zIndex: 100,
        background: 'rgba(0,0,0,0.85)',
        backdropFilter: 'saturate(180%) blur(20px)',
        WebkitBackdropFilter: 'saturate(180%) blur(20px)',
        borderBottom: '1px solid rgba(255,255,255,0.07)',
      }}>
        <div style={{ maxWidth: 960, margin: '0 auto', padding: '0 24px', height: 52, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <span style={{ fontSize: 17, fontWeight: 600, letterSpacing: '-0.3px' }}>
            Flow<span style={{ color: '#FF6B1A' }}>Pay</span>
          </span>
          <nav style={{ display: 'flex', alignItems: 'center', gap: 20 }}>
            <Link href="/docs"  className="nav-link" style={{ fontSize: 13 }}>Docs</Link>
            <a href="https://github.com/riesgopais/flowpay" target="_blank" rel="noopener noreferrer" className="nav-link" style={{ fontSize: 13 }}>GitHub</a>
            <ConnectButton
              accountStatus="avatar"
              chainStatus="icon"
              showBalance={false}
            />
          </nav>
        </div>
      </header>

      {/* ── HERO ── */}
      <section style={{ maxWidth: 960, margin: '0 auto', padding: '96px 24px 0', textAlign: 'center' }} className="animate-fade-in">
        <div style={{ display: 'inline-flex', alignItems: 'center', gap: 8, background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 980, padding: '5px 14px', marginBottom: 36 }}>
          <span style={{ width: 6, height: 6, borderRadius: '50%', background: '#32D74B', display: 'inline-block', animation: 'blink 2.2s ease infinite' }} />
          <span style={{ fontSize: 12, color: '#86868B', letterSpacing: '0.1px' }}>Live on Hedera Testnet</span>
        </div>

        <h1 style={{ fontSize: 'clamp(48px, 8.5vw, 84px)', fontWeight: 700, letterSpacing: 'clamp(-2px, -0.04em, -3.5px)', lineHeight: 1.04, marginBottom: 20, color: '#F5F5F7' }}>
          Move money at<br />the speed of thought.
        </h1>

        <p style={{ fontSize: 19, color: '#86868B', maxWidth: 500, margin: '0 auto 56px', lineHeight: 1.55, fontWeight: 400, letterSpacing: '-0.1px' }}>
          Type what you want to pay. FlowPay routes, executes, and settles across any chain — in plain language.
        </p>

        {/* Stats */}
        <div style={{ display: 'flex', justifyContent: 'center', gap: 56, marginBottom: 72 }}>
          {STATS.map(({ val, label }) => (
            <div key={label}>
              <div style={{ fontSize: 26, fontWeight: 700, letterSpacing: '-0.5px', color: '#F5F5F7' }}>{val}</div>
              <div style={{ fontSize: 11, color: '#86868B', marginTop: 3, letterSpacing: '0.1px' }}>{label}</div>
            </div>
          ))}
        </div>
      </section>

      {/* ── TERMINAL ── */}
      <section style={{ maxWidth: 720, margin: '0 auto', padding: '0 24px 0' }}>

        {/* Input */}
        <div style={{ position: 'relative', marginBottom: 16 }}>
          <textarea
            className="fp-input"
            value={intent}
            onChange={e => setIntent(e.target.value)}
            placeholder="Send 200 USDC from María in Buenos Aires to Juan in Mexico City for rent…"
            rows={3}
            disabled={loading}
            style={{ width: '100%', padding: '20px', fontSize: 16, resize: 'none', display: 'block', lineHeight: 1.5 }}
            onKeyDown={e => { if (e.key === 'Enter' && (e.metaKey || e.ctrlKey)) handlePreview(e as unknown as React.FormEvent); }}
          />
        </div>

        {/* CTA row */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 14, marginBottom: stage === 'confirming' ? 16 : 40 }}>
          <button
            onClick={stage === 'idle' ? handlePreview : undefined}
            disabled={!intent.trim() || stage === 'previewing' || stage === 'executing'}
            className="btn-primary"
            style={{ padding: '13px 30px', fontSize: 15 }}
          >
            {stage === 'previewing'
              ? <><span style={{ width: 13, height: 13, border: '1.5px solid rgba(0,0,0,0.2)', borderTopColor: '#000', borderRadius: '50%', animation: 'spin 0.7s linear infinite', display: 'inline-block' }} />Parsing…</>
              : stage === 'executing'
              ? <><span style={{ width: 13, height: 13, border: '1.5px solid rgba(0,0,0,0.2)', borderTopColor: '#000', borderRadius: '50%', animation: 'spin 0.7s linear infinite', display: 'inline-block' }} />Processing</>
              : 'Execute'}
          </button>
          <span style={{ fontSize: 12, color: '#3A3A3C', letterSpacing: '0.1px' }}>⌘ Return</span>
          {stage === 'done' && (
            <button onClick={reset} style={{ marginLeft: 'auto', background: 'none', border: 'none', color: '#86868B', fontSize: 13, cursor: 'pointer', fontFamily: 'inherit', letterSpacing: '-0.1px', transition: 'color 0.15s' }}
              onMouseEnter={e => (e.currentTarget.style.color = '#F5F5F7')}
              onMouseLeave={e => (e.currentTarget.style.color = '#86868B')}>
              ← New payment
            </button>
          )}
        </div>

        {/* ── CONFIRMATION CARD ── */}
        {stage === 'confirming' && preview && (
          <div className="animate-fade-up" style={{
            background: '#0A0A0A',
            border: '1px solid rgba(255,255,255,0.1)',
            borderLeft: '3px solid #FF6B1A',
            borderRadius: '2px 16px 16px 2px',
            padding: '20px 22px',
            marginBottom: 24,
          }}>
            <p style={{ fontSize: 11, color: '#86868B', fontWeight: 600, letterSpacing: '0.8px', textTransform: 'uppercase', marginBottom: 12 }}>
              FlowPay understood
            </p>
            <p style={{ fontSize: 16, fontWeight: 600, color: '#F5F5F7', marginBottom: 16, lineHeight: 1.4 }}>
              {preview.humanSummary}
            </p>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6, marginBottom: 20 }}>
              {[
                `${preview.amount} ${preview.toToken}`,
                preview.senderName ? `From: ${preview.senderName}` : null,
                preview.recipientName ? `To: ${preview.recipientName}` : null,
                preview.hederaRecipient ? `Hedera: ${preview.hederaRecipient}` : null,
                preview.memo,
                'Fee: $0.001',
              ].filter(Boolean).map(t => (
                <span key={t!} style={{ fontSize: 12, background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.1)', color: '#86868B', padding: '3px 10px', borderRadius: 980 }}>{t}</span>
              ))}
            </div>
            <div style={{ display: 'flex', gap: 10 }}>
              <button
                onClick={() => setStage('idle')}
                style={{ background: 'none', border: '1px solid rgba(255,255,255,0.12)', color: '#86868B', borderRadius: 8, padding: '9px 18px', fontSize: 13, cursor: 'pointer', fontFamily: 'inherit' }}
              >
                ← Edit
              </button>
              <button
                onClick={handleExecute}
                className="btn-primary"
                style={{ padding: '9px 22px', fontSize: 13 }}
              >
                Confirm & Execute →
              </button>
            </div>
          </div>
        )}

        {/* Progress bar + step label */}
        {isExecuting && (
          <div style={{ marginBottom: 32 }} className="animate-fade-in">
            <div style={{ height: 2, background: 'rgba(255,255,255,0.08)', borderRadius: 2, marginBottom: 10, overflow: 'hidden' }}>
              <div style={{ height: '100%', background: '#F5F5F7', borderRadius: 2, width: `${progress}%`, transition: 'width 0.5s ease' }} />
            </div>
            <p style={{ fontSize: 13, color: '#86868B' }}>
              {stepIndex >= 0 ? PROCESSING_STEPS[stepIndex] : ''}
              <span style={{ animation: 'blink 1s ease infinite', display: 'inline-block', marginLeft: 2 }}>_</span>
            </p>
          </div>
        )}

        {/* Examples */}
        {stage === 'idle' && !error && (
          <div style={{ marginBottom: 16 }}>
            <p style={{ fontSize: 11, color: '#3A3A3C', fontWeight: 600, letterSpacing: '0.8px', textTransform: 'uppercase', marginBottom: 12 }}>Examples</p>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
              {EXAMPLES.map((ex, i) => (
                <button key={i} onClick={() => setIntent(ex)} className="btn-ghost" style={{ padding: '12px 16px', fontSize: 13, textAlign: 'left' }}>
                  {ex}
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Error */}
        {error && (
          <div style={{ background: 'rgba(255,69,58,0.08)', border: '1px solid rgba(255,69,58,0.18)', borderRadius: 14, padding: '16px 20px', color: '#FF453A', fontSize: 14, marginBottom: 16 }}>
            {error}
          </div>
        )}

        {/* Results */}
        {result && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 10, marginBottom: 24 }}>
            {[
              {
                idx: 0, label: 'Intent Parsed', service: 'Claude Haiku', accent: '#0A84FF',
                body: (
                  <>
                    <p style={{ fontSize: 15, fontWeight: 500, color: '#F5F5F7', marginBottom: 12, lineHeight: 1.5 }}>{result.parsed.humanSummary}</p>
                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
                      {[
                        `${result.parsed.amount} ${result.parsed.toToken}`,
                        `via ${result.parsed.fromToken}`,
                        result.parsed.memo,
                        result.parsed.senderName ? `From: ${result.parsed.senderName}` : null,
                        result.parsed.recipientName ? `To: ${result.parsed.recipientName}` : null,
                      ].filter(Boolean).map(t => (
                        <span key={t!} style={{ fontSize: 12, background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.1)', color: '#86868B', padding: '3px 10px', borderRadius: 980 }}>{t}</span>
                      ))}
                    </div>
                  </>
                ),
              },
              {
                idx: 1, label: 'Cross-chain Route', service: 'LI.FI Composer', accent: '#FF6B1A',
                body: (
                  <>
                    <p style={{ fontSize: 15, fontWeight: 500, color: '#F5F5F7', marginBottom: 8 }}>Atomic flow · {result.parsed.fromToken} → {result.parsed.toToken}</p>
                    {result.lifi.steps.map((s, i) => (
                      <p key={i} style={{ fontSize: 13, color: '#86868B', marginBottom: 4, lineHeight: 1.5 }}>→ {s}</p>
                    ))}
                    {result.lifi.compiled && result.lifi.calldataPreview && (
                      <div className="code-block" style={{ marginTop: 10 }}>{result.lifi.calldataPreview}</div>
                    )}
                    {result.lifi.transactionRequest && walletAddress && (
                      <div style={{ marginTop: 14 }}>
                        {txHash ? (
                          <a
                            href={`https://etherscan.io/tx/${txHash}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            style={{ fontSize: 13, color: '#32D74B', textDecoration: 'none', fontWeight: 500 }}
                          >
                            ✓ Executed on-chain → Etherscan
                          </a>
                        ) : (
                          <button
                            onClick={() => sendTransaction({
                              to: result.lifi.transactionRequest!.to as `0x${string}`,
                              data: result.lifi.transactionRequest!.data as `0x${string}`,
                              value: BigInt(result.lifi.transactionRequest!.value ?? '0'),
                              chainId: result.lifi.transactionRequest!.chainId,
                            })}
                            disabled={isSigning}
                            style={{
                              background: '#FF6B1A', color: '#000', border: 'none',
                              borderRadius: 8, padding: '9px 18px', fontSize: 13,
                              fontWeight: 600, cursor: isSigning ? 'not-allowed' : 'pointer',
                              opacity: isSigning ? 0.7 : 1, fontFamily: 'inherit',
                            }}
                          >
                            {isSigning ? 'Waiting for signature…' : 'Sign & Execute on-chain →'}
                          </button>
                        )}
                      </div>
                    )}
                  </>
                ),
              },
              {
                idx: 2, label: 'Audit Trail', service: 'Hedera HCS', accent: '#BF5AF2',
                body: (
                  <>
                    <p style={{ fontSize: 15, fontWeight: 500, color: '#F5F5F7', marginBottom: 8 }}>Recorded · immutable · public</p>
                    <p style={{ fontSize: 13, color: '#86868B', marginBottom: 12, lineHeight: 1.5 }}>
                      Topic <span style={{ color: '#F5F5F7', fontFamily: 'var(--font-geist-mono,monospace)', fontSize: 12 }}>{result.hcs.topicId}</span>
                      <span style={{ margin: '0 8px', color: '#3A3A3C' }}>·</span>
                      Entry <span style={{ color: '#F5F5F7', fontWeight: 600 }}>#{result.hcs.sequenceNumber}</span>
                    </p>
                    <a href={result.hcs.explorerUrl} target="_blank" rel="noopener noreferrer"
                      style={{ fontSize: 13, color: '#F5F5F7', textDecoration: 'none', fontWeight: 500, letterSpacing: '-0.1px' }}>
                      View on Hashscan →
                    </a>
                  </>
                ),
              },
              {
                idx: 3, label: 'Settlement', service: 'Hedera Testnet', accent: '#32D74B',
                body: (
                  <>
                    <p style={{ fontSize: 15, fontWeight: 500, color: '#F5F5F7', marginBottom: 8 }}>
                      {result.payment.amount} · &lt;3 seconds · $0.001
                    </p>
                    <p style={{ fontSize: 11, fontFamily: 'var(--font-geist-mono,monospace)', color: '#86868B', marginBottom: 12, wordBreak: 'break-all', lineHeight: 1.6 }}>
                      {result.payment.transactionId}
                    </p>
                    <a href={result.payment.explorerUrl} target="_blank" rel="noopener noreferrer"
                      style={{ fontSize: 13, color: '#F5F5F7', textDecoration: 'none', fontWeight: 500, letterSpacing: '-0.1px' }}>
                      View on Hashscan →
                    </a>
                  </>
                ),
              },
            ].map(({ idx, label, service, accent, body }) =>
              visibleCards.includes(idx) && (
                <div key={idx} className="animate-fade-up" style={{
                  background: '#111',
                  border: '1px solid rgba(255,255,255,0.08)',
                  borderLeft: `3px solid ${accent}`,
                  borderRadius: '2px 16px 16px 2px',
                  padding: '20px 22px',
                  animationDelay: `${idx * 80}ms`,
                }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
                    <span style={{ fontSize: 13, fontWeight: 600, color: '#F5F5F7', letterSpacing: '-0.1px' }}>{label}</span>
                    <span style={{ fontSize: 11, color: '#3A3A3C', letterSpacing: '0.1px' }}>{service}</span>
                  </div>
                  {body}
                </div>
              )
            )}
          </div>
        )}
      </section>

      {/* ── HOW IT WORKS ── */}
      <section style={{ maxWidth: 960, margin: '0 auto', padding: '120px 24px 100px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 16, marginBottom: 64 }}>
          <div style={{ flex: 1, height: 1, background: 'rgba(255,255,255,0.07)' }} />
          <span style={{ fontSize: 11, color: '#3A3A3C', fontWeight: 600, letterSpacing: '1px', textTransform: 'uppercase', whiteSpace: 'nowrap' }}>How it works</span>
          <div style={{ flex: 1, height: 1, background: 'rgba(255,255,255,0.07)' }} />
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 2 }}>
          {HOW_IT_WORKS.map(({ n, title, desc, sub }) => (
            <div key={n} style={{ padding: '40px 32px', background: '#0A0A0A', borderRadius: 4, border: '1px solid rgba(255,255,255,0.06)' }}>
              <div style={{ fontSize: 13, color: '#3A3A3C', fontWeight: 600, fontFamily: 'var(--font-geist-mono,monospace)', marginBottom: 32, letterSpacing: '0.2px' }}>{n}</div>
              <h3 style={{ fontSize: 22, fontWeight: 700, letterSpacing: '-0.5px', marginBottom: 14, lineHeight: 1.2, color: '#F5F5F7' }}>{title}</h3>
              <p style={{ fontSize: 15, color: '#86868B', lineHeight: 1.65, marginBottom: 24 }}>{desc}</p>
              <span style={{ fontSize: 11, color: '#3A3A3C', fontWeight: 600, letterSpacing: '0.3px' }}>{sub}</span>
            </div>
          ))}
        </div>
      </section>

      {/* ── FOOTER ── */}
      <footer style={{ borderTop: '1px solid rgba(255,255,255,0.07)', padding: '28px 24px', textAlign: 'center' }}>
        <p style={{ fontSize: 12, color: '#3A3A3C' }}>
          Built at <span style={{ color: '#FF6B1A' }}>ETHGlobal New York 2026</span>
          <span style={{ margin: '0 12px' }}>·</span>
          <a href="https://github.com/riesgopais/flowpay" target="_blank" rel="noopener noreferrer" className="nav-link" style={{ fontSize: 12 }}>GitHub</a>
          <span style={{ margin: '0 12px' }}>·</span>
          <Link href="/docs" className="nav-link" style={{ fontSize: 12 }}>Docs</Link>
          <span style={{ margin: '0 12px' }}>·</span>
          <a href="https://hashscan.io/testnet/topic/0.0.9217982" target="_blank" rel="noopener noreferrer" className="nav-link" style={{ fontSize: 12 }}>Hashscan</a>
        </p>
      </footer>
    </div>
  );
}
