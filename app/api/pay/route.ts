import { NextResponse } from 'next/server';
import { parsePaymentIntent } from '@/lib/parser';
import { recordPaymentOnChain, executeHbarPayment } from '@/lib/hedera';
import { buildCrossChainPaymentFlow } from '@/lib/lifi';

export async function POST(request: Request) {
  try {
    const { intent, senderAddress } = await request.json();

    if (!intent || typeof intent !== 'string') {
      return NextResponse.json({ error: 'Intent is required' }, { status: 400 });
    }

    const parsed = await parsePaymentIntent(intent);

    // Abort if the parser detected an unsupported token or invalid intent
    if (parsed.error) {
      return NextResponse.json({ error: parsed.error }, { status: 422 });
    }

    const lifi = await buildCrossChainPaymentFlow(
      parsed.recipientAddress,
      senderAddress,
      parsed.fromToken,
      parsed.toToken,
      parsed.amount,
    );
    const hcs = await recordPaymentOnChain({
      intent: parsed.humanSummary,
      amount: parsed.amount,
      fromToken: parsed.fromToken,
      toToken: parsed.toToken,
      recipient: parsed.recipientAddress,
      memo: parsed.memo,
    });
    const payment = await executeHbarPayment(parsed.memo || parsed.humanSummary, {
      recipient: parsed.hederaRecipient,
      amount: parsed.amount,
      token: parsed.toToken,
    });

    return NextResponse.json({ success: true, parsed, lifi, hcs, payment });
  } catch (err) {
    console.error('[API/pay] Error:', err);
    return NextResponse.json(
      { error: err instanceof Error ? err.message : 'Processing failed' },
      { status: 500 }
    );
  }
}
