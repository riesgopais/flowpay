import { NextResponse } from 'next/server';
import { parsePaymentIntent } from '@/lib/parser';
import { recordPaymentOnChain, executeHbarPayment } from '@/lib/hedera';
import { buildCrossChainPaymentFlow } from '@/lib/lifi';
import { resolveRecipientName } from '@/lib/resolver';
import { checkRateLimit, getClientIp } from '@/lib/rate-limit';

export async function POST(request: Request) {
  // Rate limit: 10 payment executions per minute per IP
  const { allowed, retryAfter } = checkRateLimit(getClientIp(request), 10);
  if (!allowed) {
    return NextResponse.json(
      { error: `Too many requests — please wait ${retryAfter}s before retrying.` },
      { status: 429, headers: { 'Retry-After': String(retryAfter) } },
    );
  }

  try {
    const { intent, senderAddress } = await request.json();

    if (!intent || typeof intent !== 'string') {
      return NextResponse.json({ error: 'Intent is required' }, { status: 400 });
    }

    const parsed = await parsePaymentIntent(intent);
    if (parsed.error) {
      return NextResponse.json({ error: parsed.error }, { status: 422 });
    }

    // Issue 3: amount guard — Gemini schema forces NUMBER but defense-in-depth
    if (!parsed.amount || isNaN(parsed.amount) || parsed.amount <= 0) {
      return NextResponse.json(
        { error: 'Invalid amount — please specify a number greater than 0.' },
        { status: 422 },
      );
    }

    // Resolve recipient name → registry or ENS
    if (parsed.recipientName) {
      const resolved = await resolveRecipientName(parsed.recipientName);
      if (resolved) {
        parsed.recipientAddress = resolved.evm;
        parsed.hederaRecipient  = resolved.hedera ?? parsed.hederaRecipient;
      } else {
        // Name given but not in registry — require an explicit address in the intent
        const hasExplicitEVM    = /0x[a-fA-F0-9]{40}/.test(intent);
        const hasExplicitHedera = /\b0\.\d+\.\d+\b/.test(intent);
        if (!hasExplicitEVM && !hasExplicitHedera) {
          return NextResponse.json(
            {
              error: `"${parsed.recipientName}" is not in the FlowPay registry. ` +
                     `Please include a wallet address (0x…) or Hedera account (0.0.X).`,
            },
            { status: 422 },
          );
        }
        // Explicit address present → Gemini parsed it correctly, use as-is
      }
    }

    const hcsData = {
      intent: parsed.humanSummary,
      amount: parsed.amount,
      fromToken: parsed.fromToken,
      toToken: parsed.toToken,
      recipient: parsed.recipientAddress,
      memo: parsed.memo,
    };

    // Step 1: Build cross-chain route
    let lifi;
    try {
      lifi = await buildCrossChainPaymentFlow(
        parsed.recipientAddress,
        senderAddress,
        parsed.fromToken,
        parsed.toToken,
        parsed.amount,
      );
    } catch (err) {
      // Record routing failure to HCS — best effort, don't throw if HCS also fails
      await recordPaymentOnChain(hcsData, 'ROUTING_FAILED').catch(() => {});
      throw err;
    }

    // Step 2: Execute HBAR settlement — only write success to HCS if this works
    let payment;
    try {
      payment = await executeHbarPayment(parsed.memo || parsed.humanSummary, {
        recipient: parsed.hederaRecipient,
        amount: parsed.amount,
        token: parsed.toToken,
      });
    } catch (err) {
      await recordPaymentOnChain(hcsData, 'PAYMENT_FAILED').catch(() => {});
      throw err;
    }

    // Step 3: Record SUCCESS to HCS — only reached if payment confirmed
    const hcs = await recordPaymentOnChain(hcsData, 'SUCCESS');

    return NextResponse.json({ success: true, parsed, lifi, hcs, payment });
  } catch (err) {
    console.error('[API/pay] Error:', err);
    return NextResponse.json(
      { error: err instanceof Error ? err.message : 'Processing failed' },
      { status: 500 }
    );
  }
}
