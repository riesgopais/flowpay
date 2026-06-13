import { NextResponse } from 'next/server';
import { parsePaymentIntent } from '@/lib/parser';
import { resolveRecipientName, isKnownName } from '@/lib/resolver';

export async function POST(request: Request) {
  try {
    const { intent } = await request.json();
    if (!intent || typeof intent !== 'string') {
      return NextResponse.json({ error: 'Intent is required' }, { status: 400 });
    }

    const parsed = await parsePaymentIntent(intent);
    if (parsed.error) return NextResponse.json(parsed);

    const warnings: string[] = [];

    // Detect assumed defaults and warn the user
    const hasNumber = /\d/.test(intent);
    if (!hasNumber && parsed.amount === 0.01) {
      warnings.push('Amount not specified — defaulting to 0.01');
    }
    const hasToken = /\b(eth|weth|usdc|usdt|dai|wbtc|hbar|matic|pol)\b/i.test(intent);
    if (!hasToken) {
      warnings.push('Token not specified — defaulting to ETH');
    }

    // Name resolution: try registry first, then ENS
    let resolvedAddressLabel: string | null = null;
    if (parsed.recipientName) {
      const resolved = await resolveRecipientName(parsed.recipientName);
      if (resolved) {
        parsed.recipientAddress = resolved.evm;
        parsed.hederaRecipient  = resolved.hedera ?? parsed.hederaRecipient;
        if (resolved.source === 'ens') {
          const ensName = parsed.recipientName.toLowerCase().includes('.')
            ? parsed.recipientName
            : `${parsed.recipientName}.eth`;
          resolvedAddressLabel = `Resolved via ENS (${ensName})`;
          warnings.push(`Sending to ${ensName} — resolved on Ethereum Name Service`);
        } else {
          resolvedAddressLabel = `Resolved from demo registry`;
          warnings.push(`Sending to ${parsed.recipientName}'s registered testnet address`);
        }
      } else if (!isKnownName(parsed.recipientName)) {
        const hasExplicitAddress = /0x[a-fA-F0-9]{40}/.test(intent) || /\b0\.\d+\.\d+\b/.test(intent);
        if (!hasExplicitAddress) {
          warnings.push(`"${parsed.recipientName}" has no registered address — using demo fallback`);
        }
      }
    }

    return NextResponse.json({ ...parsed, warnings, resolvedAddressLabel });
  } catch (err) {
    return NextResponse.json(
      { error: err instanceof Error ? err.message : 'Parse failed' },
      { status: 500 }
    );
  }
}
