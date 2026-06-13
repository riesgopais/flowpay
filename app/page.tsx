'use client';

import React, { useState } from 'react';
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

interface ParsedPreview {
  humanSummary: string;
  amount: number;
  fromToken: string;
  toToken: string;
  memo: string;
  senderName: string | null;
  recipientName: string | null;
  hederaRecipient: string | null;
  recipientAddress: string;
  warnings?: string[];
  resolvedAddressLabel?: string | null;
}

const PIPELINE = ['Input', 'Gemini', 'LI.FI', 'Hedera'];

const STEP_LABELS = [
  'Parsing intent with Gemini…',
  'Building cross-chain route via LI.FI…',
  'Executing settlement on Hedera…',
  'Recording audit trail on Hedera HCS…',
];

const EXAMPLES = [
  'Pay 0.05 ETH for dev work',
  'Send 200 USDC from María to Juan in Mexico for rent',
  'Transfer 500 USDT to 0x742d35Cc6634C0532925a3b844Bc454e4438f44e',
];

const Chip = ({ children }: { children: React.ReactNode }) => (
  <span style={{
    fontSize: 11, background: 'rgba(255,255,255,0.04)', border: '1px solid #27272a',
    color: '#71717a', padding: '3px 10px', borderRadius: 980, whiteSpace: 'nowrap',
  }}>
    {children}
  </span>
);

const Spinner = () => (
  <span style={{
    width: 11, height: 11, border: '1.5px solid rgba(0,0,0,0.15)',
    borderTopColor: '#000', borderRadius: '50%',
    animation: 'spin 0.7s linear infinite', display: 'inline-block', flexShrink: 0,
  }} />
);

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
  const [unknownName, setUnknownName]   = useState<string | null>(null);
  const [manualAddress, setManualAddress] = useState('');
  const [copiedKey, setCopiedKey]       = useState<string | null>(null);

  async function runPreview(intentText: string) {
    setStage('previewing');
    setError(null);
    try {
      const res = await fetch('/api/parse', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ intent: intentText }),
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

  async function handlePreview(e: React.FormEvent) {
    e.preventDefault();
    if (!intent.trim() || loading) return;
    await runPreview(intent);
  }

  async function handleRetryWithAddress() {
    if (!manualAddress.trim() || !unknownName) return;
    const augmented = `${intent.trim()} (${unknownName}: ${manualAddress.trim()})`;
    setIntent(augmented);
    setUnknownName(null);
    setManualAddress('');
    setError(null);
    await runPreview(augmented);
  }

  function copyToClipboard(text: string, key: string) {
    navigator.clipboard.writeText(text).then(() => {
      setCopiedKey(key);
      setTimeout(() => setCopiedKey(null), 2000);
    }).catch(() => {});
  }

  async function handleExecute() {
    if (!preview) return;
    setStage('executing');
    setLoading(true);
    setResult(null);
    setError(null);
    setVisibleCards([]);

    const wait = (ms: number) => new Promise(r => setTimeout(r, ms));

    // Watchdog: reset on each SSE event. If 25s pass without progress → abort.
    const abortCtrl = new AbortController();
    let watchdog = setTimeout(() => abortCtrl.abort(), 25_000);
    const resetWatchdog = () => {
      clearTimeout(watchdog);
      watchdog = setTimeout(() => abortCtrl.abort(), 25_000);
    };

    try {
      const res = await fetch('/api/pay-stream', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ intent, senderAddress: walletAddress }),
        signal: abortCtrl.signal,
      });

      if (!res.body) throw new Error('No response body');

      const reader  = res.body.getReader();
      const decoder = new TextDecoder();
      let buffer = '';

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        resetWatchdog();
        buffer += decoder.decode(value, { stream: true });

        const lines = buffer.split('\n');
        buffer = lines.pop() ?? '';

        for (const line of lines) {
          if (!line.startsWith('data: ')) continue;
          let event: { type: string; index?: number; error?: string; message?: string; data?: PaymentResult };
          try { event = JSON.parse(line.slice(6)); } catch { continue; }

          if (event.type === 'step' && event.index !== undefined) {
            setStepIndex(event.index);
          } else if (event.type === 'done' && event.data) {
            setResult(event.data);
            setStage('done');
            for (let i = 0; i < 4; i++) {
              await wait(110);
              setVisibleCards(prev => [...prev, i]);
            }
          } else if (event.type === 'error') {
            const displayMsg = event.message ?? event.error ?? 'Unknown error';
            const nameMatch = displayMsg.match(/"([^"]+)" is not in the FlowPay registry/);
            if (nameMatch) {
              setUnknownName(nameMatch[1]);
              setManualAddress('');
            }
            setError(displayMsg);
            setStage('idle');
          }
        }
      }
    } catch (err) {
      const isTimeout = err instanceof Error && err.name === 'AbortError';
      setError(
        isTimeout
          ? 'Network congestion detected — the on-chain route is taking longer than usual. Please retry.'
          : 'Network error. Please try again.',
      );
      setStage('idle');
    } finally {
      clearTimeout(watchdog);
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
    setUnknownName(null);
    setManualAddress('');
    setCopiedKey(null);
  }

  const isExecuting = stage === 'executing';

  // node 0=Input, 1=Gemini, 2=LI.FI, 3=Hedera
  function nodeActive(i: number): boolean {
    if (stage === 'done') return true;
    if (!isExecuting) return false;
    return i <= stepIndex + 1;
  }

  return (
    <div style={{ background: '#000', minHeight: '100vh', color: '#fafafa' }}>

      {/* ── NAV ── */}
      <header style={{
        position: 'sticky', top: 0, zIndex: 100,
        background: 'rgba(0,0,0,0.92)',
        backdropFilter: 'blur(20px)',
        WebkitBackdropFilter: 'blur(20px)',
        borderBottom: '1px solid #18181b',
      }}>
        <div style={{ maxWidth: 960, margin: '0 auto', padding: '0 24px', height: 52, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <span style={{ fontSize: 16, fontWeight: 700, letterSpacing: '-0.5px' }}>
            Flow<span style={{ color: '#FF6B1A' }}>Pay</span>
          </span>
          <nav style={{ display: 'flex', alignItems: 'center', gap: 20 }}>
            <Link href="/docs" className="nav-link" style={{ fontSize: 13 }}>Docs</Link>
            <a href="https://github.com/riesgopais/flowpay" target="_blank" rel="noopener noreferrer" className="nav-link" style={{ fontSize: 13 }}>GitHub</a>
            <ConnectButton accountStatus="avatar" chainStatus="icon" showBalance={false} />
          </nav>
        </div>
      </header>

      {/* ── HERO ── */}
      <section style={{ maxWidth: 720, margin: '0 auto', padding: '92px 24px 0', textAlign: 'center' }} className="animate-fade-in">
        <div style={{
          display: 'inline-flex', alignItems: 'center', gap: 8,
          border: '1px solid #27272a', borderRadius: 980,
          padding: '5px 16px', marginBottom: 40,
        }}>
          <span style={{ width: 6, height: 6, borderRadius: '50%', background: '#10b981', display: 'inline-block', animation: 'blink 2.2s ease infinite' }} />
          <span style={{ fontSize: 11, color: '#52525b', fontWeight: 600, letterSpacing: '0.8px', textTransform: 'uppercase' }}>
            Live on Hedera Testnet
          </span>
        </div>

        <h1 style={{
          fontSize: 'clamp(48px, 7.5vw, 80px)', fontWeight: 700,
          letterSpacing: 'clamp(-2px, -0.04em, -3.5px)', lineHeight: 1.04,
          marginBottom: 22, color: '#fafafa',
        }}>
          Intent-Based Settlement.
        </h1>

        <p style={{ fontSize: 18, color: '#71717a', maxWidth: 520, margin: '0 auto 64px', lineHeight: 1.6, letterSpacing: '-0.1px' }}>
          Type in plain language. Powered by Google Gemini, routed via LI.FI, and settled instantly on Hedera.
        </p>
      </section>

      {/* ── PIPELINE VISUAL ── */}
      <div style={{ maxWidth: 560, margin: '0 auto', padding: '0 32px 56px' }}>
        <div style={{ display: 'flex', alignItems: 'flex-start' }}>
          {PIPELINE.map((label, i) => (
            <React.Fragment key={label}>
              {/* Node */}
              <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 8, flexShrink: 0 }}>
                <div style={{
                  width: 8, height: 8, borderRadius: '50%', flexShrink: 0,
                  background: nodeActive(i) ? '#10b981' : '#27272a',
                  boxShadow: nodeActive(i) ? '0 0 10px rgba(16,185,129,0.5)' : 'none',
                  transition: 'background 0.35s ease, box-shadow 0.35s ease',
                }} />
                <span style={{
                  fontSize: 10, fontWeight: 600, letterSpacing: '0.5px', textTransform: 'uppercase',
                  color: nodeActive(i) ? '#a1a1aa' : '#3f3f46',
                  transition: 'color 0.35s ease',
                }}>
                  {label}
                </span>
              </div>

              {/* Connector line */}
              {i < 3 && (
                <div style={{
                  flex: 1, height: 2, background: '#18181b',
                  alignSelf: 'flex-start', marginTop: 3,
                  overflow: 'hidden', position: 'relative', minWidth: 20,
                }}>
                  {isExecuting && (
                    <div className="shimmer-beam" style={{
                      position: 'absolute', height: '100%', width: '33%',
                      background: 'linear-gradient(to right, transparent, #10b981, transparent)',
                    }} />
                  )}
                  {stage === 'done' && (
                    <div style={{ position: 'absolute', inset: 0, background: 'rgba(16,185,129,0.4)' }} />
                  )}
                </div>
              )}
            </React.Fragment>
          ))}
        </div>
      </div>

      {/* ── TERMINAL ── */}
      <section style={{ maxWidth: 680, margin: '0 auto', padding: '0 24px 120px' }}>

        {/* Input card */}
        <div style={{ border: '1px solid #27272a', borderRadius: 16, background: '#09090b', overflow: 'hidden', marginBottom: 16 }}>
          <textarea
            className="fp-input"
            value={intent}
            onChange={e => setIntent(e.target.value)}
            placeholder="e.g., Pay 0.05 ETH for dev work or send 100 USDT to Sofia..."
            rows={3}
            disabled={loading}
            style={{
              width: '100%', padding: '22px 24px', fontSize: 16, resize: 'none',
              display: 'block', lineHeight: 1.55, background: 'transparent',
              border: 'none', borderRadius: 0, color: '#fafafa',
            }}
            onKeyDown={e => { if (e.key === 'Enter' && (e.metaKey || e.ctrlKey)) handlePreview(e as unknown as React.FormEvent); }}
          />

          {/* Emergency address input — shown when a name is unresolved */}
          {unknownName && stage === 'idle' && (
            <div style={{ padding: '14px 22px 0', borderTop: '1px solid #18181b' }}>
              <p style={{ fontSize: 12, color: '#a1a1aa', marginBottom: 10, lineHeight: 1.5 }}>
                We couldn&apos;t find <strong style={{ color: '#fafafa' }}>{unknownName}</strong>.
                Paste their <span style={{ fontFamily: 'var(--font-geist-mono,monospace)', fontSize: 11 }}>0x…</span> or{' '}
                <span style={{ fontFamily: 'var(--font-geist-mono,monospace)', fontSize: 11 }}>0.0.X</span> address here to complete the intent.
              </p>
              <div style={{ display: 'flex', gap: 8, marginBottom: 14 }}>
                <input
                  type="text"
                  value={manualAddress}
                  onChange={e => setManualAddress(e.target.value)}
                  onKeyDown={e => { if (e.key === 'Enter') handleRetryWithAddress(); }}
                  placeholder={`${unknownName}'s 0x... or 0.0.X address`}
                  style={{
                    flex: 1, background: 'rgba(255,255,255,0.03)', border: '1px solid #27272a',
                    borderRadius: 8, padding: '9px 14px', fontSize: 13, color: '#fafafa',
                    fontFamily: 'var(--font-geist-mono,monospace)', outline: 'none',
                  }}
                />
                <button
                  onClick={handleRetryWithAddress}
                  disabled={!manualAddress.trim()}
                  className="btn-primary"
                  style={{ padding: '9px 18px', fontSize: 13, borderRadius: 8, flexShrink: 0, opacity: manualAddress.trim() ? 1 : 0.4 }}
                >
                  Retry →
                </button>
              </div>
            </div>
          )}

          {/* Shimmer track — synced to execution stage */}
          <div style={{ height: 2, background: '#18181b', position: 'relative', overflow: 'hidden' }}>
            {isExecuting && (
              <div className="shimmer-beam" style={{
                position: 'absolute', height: '100%', width: '33%',
                background: 'linear-gradient(to right, transparent, #10b981, transparent)',
              }} />
            )}
            {stage === 'done' && (
              <div style={{ position: 'absolute', inset: 0, background: 'rgba(16,185,129,0.3)' }} />
            )}
          </div>

          {/* CTA bar */}
          <div style={{ padding: '14px 22px', display: 'flex', alignItems: 'center', gap: 12, borderTop: '1px solid #18181b' }}>
            {stage !== 'done' ? (
              <>
                <button
                  onClick={stage === 'idle' ? handlePreview : undefined}
                  disabled={!intent.trim() || stage !== 'idle'}
                  className="btn-primary"
                  style={{ padding: '10px 22px', fontSize: 14, borderRadius: 8 }}
                >
                  {stage === 'previewing' ? <><Spinner /> Parsing…</>
                    : stage === 'executing' ? <><Spinner /> Executing…</>
                    : 'Preview Intent →'}
                </button>
                <span style={{ fontSize: 11, color: '#3f3f46' }}>⌘ Return</span>
              </>
            ) : (
              <button
                onClick={reset}
                style={{ background: 'none', border: 'none', color: '#52525b', fontSize: 13, cursor: 'pointer', fontFamily: 'inherit', letterSpacing: '-0.1px', transition: 'color 0.15s', padding: 0 }}
                onMouseEnter={e => (e.currentTarget.style.color = '#e4e4e7')}
                onMouseLeave={e => (e.currentTarget.style.color = '#52525b')}
              >
                ← New payment
              </button>
            )}
          </div>
        </div>

        {/* Dynamic content area — min-height prevents footer jump between states */}
        <div style={{ minHeight: 460 }}>

        {/* Step label during execution */}
        {isExecuting && stepIndex >= 0 && (
          <p style={{ fontSize: 12, color: '#52525b', marginBottom: 16, letterSpacing: '-0.1px' }} className="animate-fade-in">
            {STEP_LABELS[stepIndex]}
            <span style={{ animation: 'blink 1s ease infinite', display: 'inline-block', marginLeft: 2 }}>_</span>
          </p>
        )}

        {/* Examples */}
        {stage === 'idle' && !error && (
          <div style={{ marginBottom: 16 }}>
            <p style={{ fontSize: 10, color: '#3f3f46', fontWeight: 600, letterSpacing: '0.8px', textTransform: 'uppercase', marginBottom: 10 }}>
              Try an example
            </p>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
              {EXAMPLES.map((ex, i) => (
                <button key={i} onClick={() => setIntent(ex)} className="btn-ghost" style={{ padding: '11px 16px', fontSize: 13, textAlign: 'left', borderRadius: 10 }}>
                  {ex}
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Error */}
        {error && (
          <div className="animate-fade-in" style={{
            background: 'rgba(239,68,68,0.06)', border: '1px solid rgba(239,68,68,0.15)',
            borderRadius: 12, padding: '14px 18px', color: '#f87171', fontSize: 14, marginBottom: 16,
          }}>
            {error}
          </div>
        )}

        {/* ── CONFIRMATION CARD ── */}
        {stage === 'confirming' && preview && (
          <div className="animate-fade-up" style={{
            border: '1px solid #27272a',
            borderLeft: '2px solid #FF6B1A',
            borderRadius: '2px 14px 14px 2px',
            background: '#09090b',
            padding: '20px 22px',
            marginBottom: 16,
          }}>
            <p style={{ fontSize: 10, color: '#52525b', fontWeight: 600, letterSpacing: '0.8px', textTransform: 'uppercase', marginBottom: 10 }}>
              FlowPay understood
            </p>
            <p style={{ fontSize: 15, fontWeight: 600, color: '#fafafa', marginBottom: 14, lineHeight: 1.45 }}>
              {preview.humanSummary}
            </p>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6, marginBottom: preview.warnings?.length ? 14 : 18 }}>
              {[
                `${preview.amount} ${preview.toToken}`,
                preview.fromToken !== preview.toToken ? `via ${preview.fromToken}` : null,
                preview.senderName ? `From: ${preview.senderName}` : null,
                preview.recipientName ? `To: ${preview.recipientName}` : null,
                preview.hederaRecipient ? `Hedera: ${preview.hederaRecipient}` : null,
                preview.memo,
                'Fee: $0.001',
              ].filter(Boolean).map(t => <Chip key={t!}>{t}</Chip>)}
            </div>

            {/* AI assumption warnings */}
            {preview.warnings && preview.warnings.length > 0 && (
              <div style={{
                background: 'rgba(234,179,8,0.06)', border: '1px solid rgba(234,179,8,0.18)',
                borderRadius: 10, padding: '10px 14px', marginBottom: 16,
              }}>
                {preview.warnings.map((w, i) => (
                  <p key={i} style={{ fontSize: 11, color: '#ca8a04', lineHeight: 1.5 }}>
                    ⚠ {w}
                  </p>
                ))}
              </div>
            )}
            <div style={{ display: 'flex', gap: 10 }}>
              <button
                onClick={() => setStage('idle')}
                style={{
                  background: 'none', border: '1px solid #27272a', color: '#71717a',
                  borderRadius: 8, padding: '9px 18px', fontSize: 13,
                  cursor: 'pointer', fontFamily: 'inherit',
                }}
              >
                ← Edit
              </button>
              <button onClick={handleExecute} className="btn-primary" style={{ padding: '9px 22px', fontSize: 13, borderRadius: 8 }}>
                Confirm & Execute →
              </button>
            </div>
          </div>
        )}

        {/* ── RESULT CARDS ── */}
        {result && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 8, marginBottom: 24 }}>
            {([
              {
                idx: 0, label: 'Intent Parsed', service: 'Google Gemini', accent: '#0ea5e9',
                body: (
                  <>
                    <p style={{ fontSize: 14, fontWeight: 500, color: '#fafafa', marginBottom: 10, lineHeight: 1.5 }}>{result.parsed.humanSummary}</p>
                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: 5 }}>
                      {[
                        `${result.parsed.amount} ${result.parsed.toToken}`,
                        result.parsed.fromToken !== result.parsed.toToken ? `via ${result.parsed.fromToken}` : null,
                        result.parsed.memo,
                        result.parsed.senderName ? `From: ${result.parsed.senderName}` : null,
                        result.parsed.recipientName ? `To: ${result.parsed.recipientName}` : null,
                      ].filter(Boolean).map(t => <Chip key={t!}>{t}</Chip>)}
                    </div>
                  </>
                ),
              },
              {
                idx: 1, label: 'Cross-chain Route', service: 'LI.FI Composer', accent: '#FF6B1A',
                body: (
                  <>
                    <p style={{ fontSize: 14, fontWeight: 500, color: '#fafafa', marginBottom: 8 }}>
                      Atomic flow · {result.parsed.fromToken} → {result.parsed.toToken}
                    </p>
                    {result.lifi.steps.map((s, i) => (
                      <p key={i} style={{ fontSize: 12, color: '#71717a', marginBottom: 3, lineHeight: 1.5 }}>→ {s}</p>
                    ))}
                    {result.lifi.compiled && result.lifi.calldataPreview && (
                      <div className="code-block" style={{ marginTop: 10 }}>{result.lifi.calldataPreview}</div>
                    )}
                    {result.lifi.transactionRequest && walletAddress && (
                      <div style={{ marginTop: 12 }}>
                        {txHash ? (
                          <a href={`https://etherscan.io/tx/${txHash}`} target="_blank" rel="noopener noreferrer"
                            style={{ fontSize: 13, color: '#10b981', textDecoration: 'none', fontWeight: 500 }}>
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
                idx: 2, label: 'Audit Trail', service: 'Hedera HCS', accent: '#a855f7',
                body: (
                  <>
                    <p style={{ fontSize: 14, fontWeight: 500, color: '#fafafa', marginBottom: 8 }}>Recorded · immutable · public</p>
                    <p style={{ fontSize: 12, color: '#71717a', marginBottom: 10, lineHeight: 1.5, display: 'flex', alignItems: 'center', flexWrap: 'wrap', gap: 6 }}>
                      <span>Topic</span>
                      <span style={{ color: '#e4e4e7', fontFamily: 'var(--font-geist-mono,monospace)', fontSize: 11 }}>{result.hcs.topicId}</span>
                      <button onClick={() => copyToClipboard(result.hcs.topicId, 'hcs-topic')} title="Copy topic ID"
                        style={{ background: 'none', border: 'none', cursor: 'pointer', padding: '1px 4px', fontSize: 11, color: copiedKey === 'hcs-topic' ? '#10b981' : '#52525b', transition: 'color 0.2s', fontFamily: 'inherit' }}>
                        {copiedKey === 'hcs-topic' ? '✓' : '⧉'}
                      </button>
                      <span style={{ color: '#27272a' }}>·</span>
                      <span>Entry <strong style={{ color: '#fafafa' }}>#{result.hcs.sequenceNumber}</strong></span>
                    </p>
                    <a href={result.hcs.explorerUrl} target="_blank" rel="noopener noreferrer"
                      style={{ fontSize: 13, color: '#e4e4e7', textDecoration: 'none', fontWeight: 500 }}>
                      View on Hashscan →
                    </a>
                  </>
                ),
              },
              {
                idx: 3, label: 'Settlement', service: 'Hedera Testnet', accent: '#10b981',
                body: (
                  <>
                    <p style={{ fontSize: 14, fontWeight: 500, color: '#fafafa', marginBottom: 8 }}>
                      {result.payment.amount} · &lt;3 seconds · $0.001
                    </p>
                    <div style={{ display: 'flex', alignItems: 'flex-start', gap: 6, marginBottom: 10 }}>
                      <p style={{ fontSize: 11, fontFamily: 'var(--font-geist-mono,monospace)', color: '#71717a', wordBreak: 'break-all', lineHeight: 1.6, margin: 0, flex: 1 }}>
                        {result.payment.transactionId}
                      </p>
                      <button onClick={() => copyToClipboard(result.payment.transactionId, 'tx-id')} title="Copy transaction ID"
                        style={{ background: 'none', border: 'none', cursor: 'pointer', padding: '2px 4px', fontSize: 11, color: copiedKey === 'tx-id' ? '#10b981' : '#52525b', transition: 'color 0.2s', fontFamily: 'inherit', flexShrink: 0 }}>
                        {copiedKey === 'tx-id' ? '✓' : '⧉'}
                      </button>
                    </div>
                    <a href={result.payment.explorerUrl} target="_blank" rel="noopener noreferrer"
                      style={{ fontSize: 13, color: '#e4e4e7', textDecoration: 'none', fontWeight: 500 }}>
                      View on Hashscan →
                    </a>
                  </>
                ),
              },
            ] as { idx: number; label: string; service: string; accent: string; body: React.ReactNode }[]).map(({ idx, label, service, accent, body }) =>
              visibleCards.includes(idx) && (
                <div key={idx} className="animate-fade-up" style={{
                  background: '#09090b',
                  border: '1px solid #27272a',
                  borderLeft: `2px solid ${accent}`,
                  borderRadius: '2px 12px 12px 2px',
                  padding: '18px 20px',
                  animationDelay: `${idx * 60}ms`,
                }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10 }}>
                    <span style={{ fontSize: 12, fontWeight: 600, color: '#e4e4e7', letterSpacing: '-0.1px' }}>{label}</span>
                    <span style={{ fontSize: 10, color: '#3f3f46', letterSpacing: '0.2px' }}>{service}</span>
                  </div>
                  {body}
                </div>
              )
            )}
          </div>
        )}

        </div>{/* end dynamic content area */}
      </section>

      {/* ── HOW IT WORKS ── */}
      <section style={{ maxWidth: 960, margin: '0 auto', padding: '96px 24px 88px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 16, marginBottom: 56 }}>
          <div style={{ flex: 1, height: 1, background: '#18181b' }} />
          <span style={{ fontSize: 10, color: '#3f3f46', fontWeight: 600, letterSpacing: '1px', textTransform: 'uppercase', whiteSpace: 'nowrap' }}>How it works</span>
          <div style={{ flex: 1, height: 1, background: '#18181b' }} />
        </div>

        <div className="hiw-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 2 }}>
          {[
            {
              n: '01', title: 'You type anything.',
              desc: 'Plain language. A name, an amount, a reason. No wallet addresses, no chain selection, no token research.',
              sub: 'Google Gemini 2.0 Flash',
            },
            {
              n: '02', title: 'FlowPay routes it.',
              desc: 'LI.FI Composer builds an atomic cross-chain flow — all steps in one transaction. If anything fails, the whole flow reverts.',
              sub: 'LI.FI Composer SDK',
            },
            {
              n: '03', title: 'Hedera confirms it.',
              desc: 'Finality in under 3 seconds. Every payment permanently recorded on a public audit trail. No Solidity required.',
              sub: 'Hedera HCS + HBAR',
            },
          ].map(({ n, title, desc, sub }) => (
            <div key={n} style={{ padding: '36px 30px', background: '#09090b', borderRadius: 4, border: '1px solid #18181b' }}>
              <div style={{ fontSize: 12, color: '#3f3f46', fontWeight: 600, fontFamily: 'var(--font-geist-mono,monospace)', marginBottom: 28, letterSpacing: '0.2px' }}>{n}</div>
              <h3 style={{ fontSize: 20, fontWeight: 700, letterSpacing: '-0.5px', marginBottom: 12, lineHeight: 1.2, color: '#fafafa' }}>{title}</h3>
              <p style={{ fontSize: 14, color: '#71717a', lineHeight: 1.65, marginBottom: 20 }}>{desc}</p>
              <span style={{ fontSize: 10, color: '#3f3f46', fontWeight: 600, letterSpacing: '0.3px' }}>{sub}</span>
            </div>
          ))}
        </div>
      </section>

      {/* ── FOOTER ── */}
      <footer style={{ borderTop: '1px solid #18181b', padding: '28px 24px', textAlign: 'center' }}>
        <p style={{ fontSize: 12, color: '#3f3f46' }}>
          Built at <span style={{ color: '#FF6B1A' }}>ETHGlobal New York 2026</span>
          <span style={{ margin: '0 12px', color: '#27272a' }}>·</span>
          <a href="https://github.com/riesgopais/flowpay" target="_blank" rel="noopener noreferrer" className="nav-link" style={{ fontSize: 12 }}>GitHub</a>
          <span style={{ margin: '0 12px', color: '#27272a' }}>·</span>
          <Link href="/docs" className="nav-link" style={{ fontSize: 12 }}>Docs</Link>
          <span style={{ margin: '0 12px', color: '#27272a' }}>·</span>
          <a href="https://hashscan.io/testnet/topic/0.0.9217982" target="_blank" rel="noopener noreferrer" className="nav-link" style={{ fontSize: 12 }}>Hashscan</a>
        </p>
        <p style={{ fontSize: 10, color: '#27272a', marginTop: 10 }}>
          Executed via FlowPay Relayer Account (Hedera Testnet) · LI.FI Composer Staging · Name resolution: demo registry
        </p>
      </footer>

    </div>
  );
}
