import { NextResponse } from 'next/server';
import { parsePaymentIntent } from '@/lib/claude';
import { recordPaymentOnChain, executeHbarPayment } from '@/lib/hedera';
import { buildCrossChainPaymentFlow } from '@/lib/lifi';

export async function POST(request: Request) {
  try {
    const { intent } = await request.json();

    if (!intent || typeof intent !== 'string') {
      return NextResponse.json({ error: 'Intent is required' }, { status: 400 });
    }

    const parsed = await parsePaymentIntent(intent);
    const lifi = await buildCrossChainPaymentFlow(parsed.recipientAddress);
    const hcs = await recordPaymentOnChain({
      intent: parsed.humanSummary,
      amount: parsed.amount,
      fromToken: parsed.fromToken,
      toToken: parsed.toToken,
      recipient: parsed.recipientAddress,
      memo: parsed.memo,
    });
    const payment = await executeHbarPayment(parsed.memo || parsed.humanSummary);

    return NextResponse.json({ success: true, parsed, lifi, hcs, payment });
  } catch (err) {
    console.error('[API/pay] Error:', err);
    return NextResponse.json(
      { error: err instanceof Error ? err.message : 'Processing failed' },
      { status: 500 }
    );
  }
}
