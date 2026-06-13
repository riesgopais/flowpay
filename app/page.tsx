'use client';

import { useState } from 'react';

interface PaymentResult {
  success: boolean;
  parsed: {
    humanSummary: string;
    amount: number;
    fromToken: string;
    toToken: string;
    memo: string;
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

export default function Home() {
  const [intent, setIntent] = useState('');
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<PaymentResult | null>(null);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!intent.trim() || loading) return;
    setLoading(true);
    setResult(null);
    setError(null);

    try {
      const res = await fetch('/api/pay', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ intent }),
      });
      const data = await res.json();
      if (!res.ok) setError(data.error || 'Payment failed');
      else setResult(data);
    } catch {
      setError('Network error. Please try again.');
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="min-h-screen bg-black text-white flex flex-col items-center justify-center p-6">
      <div className="w-full max-w-xl">

        <div className="mb-10 text-center">
          <h1 className="text-5xl font-bold tracking-tight mb-3">
            Flow<span className="text-green-400">Pay</span>
          </h1>
          <p className="text-gray-400 text-sm leading-relaxed">
            Cross-chain remittances in plain language<br />
            <span className="text-gray-600">LI.FI Composer · Hedera · Claude AI</span>
          </p>
        </div>

        <div className="flex justify-center gap-6 mb-8 text-xs text-zinc-500">
          <span>⚡ &lt;3s finality</span>
          <span>💸 $0.001 fee</span>
          <span>🔗 Any chain → Any chain</span>
        </div>

        <form onSubmit={handleSubmit} className="mb-6">
          <div className="flex gap-2">
            <input
              type="text"
              value={intent}
              onChange={e => setIntent(e.target.value)}
              placeholder="Send 100 USDC from María to Juan for rent..."
              className="flex-1 bg-zinc-900 border border-zinc-700 rounded-xl px-4 py-3 text-sm placeholder-zinc-600 focus:outline-none focus:border-green-500 transition-colors"
              disabled={loading}
            />
            <button
              type="submit"
              disabled={!intent.trim() || loading}
              className="bg-green-500 hover:bg-green-400 disabled:bg-zinc-800 disabled:text-zinc-600 text-black font-bold px-5 py-3 rounded-xl text-sm transition-colors whitespace-nowrap"
            >
              {loading ? '···' : 'Send →'}
            </button>
          </div>

          {!result && !loading && (
            <div className="mt-3 flex flex-col gap-2">
              {EXAMPLES.map((ex, i) => (
                <button
                  key={i}
                  type="button"
                  onClick={() => setIntent(ex)}
                  className="text-xs text-zinc-500 hover:text-zinc-300 bg-zinc-900 hover:bg-zinc-800 border border-zinc-800 px-3 py-2 rounded-lg transition-colors text-left"
                >
                  {ex}
                </button>
              ))}
            </div>
          )}
        </form>

        {loading && (
          <div className="space-y-3">
            {[
              { label: 'Parsing payment intent with Claude AI...', color: 'text-blue-400' },
              { label: 'Building cross-chain route via LI.FI Composer...', color: 'text-orange-400' },
              { label: 'Recording audit trail on Hedera...', color: 'text-violet-400' },
            ].map((s, i) => (
              <div key={i} className="bg-zinc-900 border border-zinc-800 rounded-xl p-4 flex items-center gap-3">
                <span className={`text-xs animate-pulse ${s.color}`}>◈</span>
                <span className="text-sm text-zinc-400">{s.label}</span>
              </div>
            ))}
          </div>
        )}

        {error && (
          <div className="bg-red-950 border border-red-800 rounded-xl p-4 text-sm text-red-300">
            {error}
          </div>
        )}

        {result && (
          <div className="space-y-3">

            <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-4">
              <div className="flex items-center gap-2 mb-3">
                <span className="text-green-400 text-xs">✓</span>
                <span className="text-xs text-zinc-400 uppercase tracking-widest font-medium">Intent Parsed</span>
                <span className="ml-auto text-xs text-zinc-600 bg-zinc-800 px-2 py-0.5 rounded">Claude AI</span>
              </div>
              <p className="text-sm font-medium text-white mb-2">{result.parsed.humanSummary}</p>
              <div className="flex items-center gap-2 flex-wrap">
                <span className="text-xs bg-zinc-800 text-zinc-300 px-2 py-1 rounded-lg">{result.parsed.amount} {result.parsed.fromToken}</span>
                <span className="text-xs text-zinc-600">→</span>
                <span className="text-xs bg-zinc-800 text-zinc-300 px-2 py-1 rounded-lg">{result.parsed.toToken}</span>
                {result.parsed.memo && <span className="text-xs text-zinc-500 italic">· {result.parsed.memo}</span>}
              </div>
            </div>

            <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-4">
              <div className="flex items-center gap-2 mb-3">
                <span className={`text-xs ${result.lifi.flowBuilt ? 'text-green-400' : 'text-yellow-400'}`}>
                  {result.lifi.flowBuilt ? '✓' : '~'}
                </span>
                <span className="text-xs text-zinc-400 uppercase tracking-widest font-medium">Cross-chain Route</span>
                <span className="ml-auto text-xs text-zinc-600 bg-zinc-800 px-2 py-0.5 rounded">LI.FI Composer</span>
              </div>
              {result.lifi.flowBuilt ? (
                <>
                  <p className="text-sm font-medium text-white mb-2">
                    Atomic flow built · {result.parsed.fromToken} → {result.parsed.toToken}
                  </p>
                  <div className="space-y-1 mb-2">
                    {result.lifi.steps.map((step, i) => (
                      <div key={i} className="text-xs text-zinc-400 flex items-center gap-2">
                        <span className="text-orange-400">▸</span> {step}
                      </div>
                    ))}
                  </div>
                  <span className={`text-xs px-2 py-1 rounded-lg ${result.lifi.compiled ? 'bg-green-950 text-green-400 border border-green-900' : 'bg-zinc-800 text-zinc-400'}`}>
                    {result.lifi.compiled
                      ? `Calldata compiled: ${result.lifi.calldataPreview || '0x...'}`
                      : 'Flow built · execution requires funded wallet'}
                  </span>
                </>
              ) : (
                <p className="text-sm text-zinc-400">Add LIFI_API_KEY to enable routing</p>
              )}
            </div>

            <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-4">
              <div className="flex items-center gap-2 mb-3">
                <span className="text-green-400 text-xs">✓</span>
                <span className="text-xs text-zinc-400 uppercase tracking-widest font-medium">Audit Trail</span>
                <span className="ml-auto text-xs text-zinc-600 bg-zinc-800 px-2 py-0.5 rounded">Hedera HCS</span>
              </div>
              <p className="text-sm font-medium text-white mb-2">Payment recorded · immutable · public</p>
              <div className="text-xs text-zinc-400 mb-1">
                Topic: <span className="text-violet-400 font-mono">{result.hcs.topicId}</span>
                {' '}· Entry <span className="text-violet-400">#{result.hcs.sequenceNumber}</span>
              </div>
              <a href={result.hcs.explorerUrl} target="_blank" rel="noopener noreferrer"
                className="text-xs text-violet-400 hover:text-violet-300 transition-colors">
                View on Hashscan ↗
              </a>
            </div>

            <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-4">
              <div className="flex items-center gap-2 mb-3">
                <span className="text-green-400 text-xs">✓</span>
                <span className="text-xs text-zinc-400 uppercase tracking-widest font-medium">Settlement</span>
                <span className="ml-auto text-xs text-zinc-600 bg-zinc-800 px-2 py-0.5 rounded">Hedera Testnet</span>
              </div>
              <p className="text-sm font-medium text-white mb-2">
                {result.payment.amount} transferred · &lt;3 sec · $0.001 fee
              </p>
              <div className="text-xs text-zinc-500 font-mono truncate mb-1">
                {result.payment.transactionId}
              </div>
              <a href={result.payment.explorerUrl} target="_blank" rel="noopener noreferrer"
                className="text-xs text-violet-400 hover:text-violet-300 transition-colors">
                View on Hashscan ↗
              </a>
            </div>

            <button
              onClick={() => { setResult(null); setIntent(''); }}
              className="w-full text-xs text-zinc-600 hover:text-zinc-400 py-3 transition-colors"
            >
              Send another payment →
            </button>
          </div>
        )}
      </div>
    </main>
  );
}
