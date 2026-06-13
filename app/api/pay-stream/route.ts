import { parsePaymentIntent } from '@/lib/parser';
import { recordPaymentOnChain, executeHbarPayment } from '@/lib/hedera';
import { buildCrossChainPaymentFlow } from '@/lib/lifi';
import { resolveRecipientName } from '@/lib/resolver';

function sse(data: object): Uint8Array {
  return new TextEncoder().encode(`data: ${JSON.stringify(data)}\n\n`);
}

export async function POST(request: Request) {
  const body = await request.json().catch(() => ({}));
  const { intent, senderAddress } = body as { intent?: string; senderAddress?: string };

  if (!intent || typeof intent !== 'string') {
    const stream = new ReadableStream({
      start(c) { c.enqueue(sse({ type: 'error', error: 'Intent is required', status: 400 })); c.close(); },
    });
    return new Response(stream, { headers: sseHeaders() });
  }

  const readableStream = new ReadableStream({
    async start(controller) {
      const emit = (data: object) => controller.enqueue(sse(data));

      try {
        // ── Step 0: Gemini parse ──────────────────────────────────────────
        emit({ type: 'step', index: 0 });
        const parsed = await parsePaymentIntent(intent);

        if (parsed.error) {
          emit({ type: 'error', error: parsed.error, status: 422 });
          return;
        }
        if (!parsed.amount || isNaN(parsed.amount) || parsed.amount <= 0) {
          emit({ type: 'error', error: 'Invalid amount — please specify a number greater than 0.', status: 422 });
          return;
        }

        // Name resolution
        if (parsed.recipientName) {
          const resolved = resolveRecipientName(parsed.recipientName);
          if (resolved) {
            parsed.recipientAddress = resolved.evm;
            parsed.hederaRecipient  = resolved.hedera ?? parsed.hederaRecipient;
          } else {
            const hasExplicitEVM    = /0x[a-fA-F0-9]{40}/.test(intent);
            const hasExplicitHedera = /\b0\.\d+\.\d+\b/.test(intent);
            if (!hasExplicitEVM && !hasExplicitHedera) {
              emit({
                type: 'error',
                error: `"${parsed.recipientName}" is not in the FlowPay registry. ` +
                       `Please include a wallet address (0x…) or Hedera account (0.0.X).`,
                status: 422,
              });
              return;
            }
          }
        }

        const hcsPayload = {
          intent: parsed.humanSummary,
          amount: parsed.amount,
          fromToken: parsed.fromToken,
          toToken: parsed.toToken,
          recipient: parsed.recipientAddress,
          memo: parsed.memo,
        };

        // ── Step 1: LI.FI routing ─────────────────────────────────────────
        emit({ type: 'step', index: 1 });
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
          await recordPaymentOnChain(hcsPayload, 'ROUTING_FAILED').catch(() => {});
          const rawMsg = err instanceof Error ? err.message : 'Routing failed';
          const isLiquidity = /no route|no pool|liquidity|insufficient|dry|unavailable|not found|quote/i.test(rawMsg);
          if (isLiquidity) {
            emit({
              type: 'error',
              error: 'STAGING_LIQUIDITY_DRY',
              message: 'Staging liquidity pool dry for this swap pair. Please try matching tokens (e.g., USDC to USDC) for a direct transfer demo.',
              status: 500,
            });
          } else {
            emit({ type: 'error', error: rawMsg, status: 500 });
          }
          return;
        }

        // ── Step 2: HBAR settlement ───────────────────────────────────────
        emit({ type: 'step', index: 2 });
        let payment;
        try {
          payment = await executeHbarPayment(parsed.memo || parsed.humanSummary, {
            recipient: parsed.hederaRecipient,
            amount: parsed.amount,
            token: parsed.toToken,
          });
        } catch (err) {
          await recordPaymentOnChain(hcsPayload, 'PAYMENT_FAILED').catch(() => {});
          emit({ type: 'error', error: err instanceof Error ? err.message : 'Payment failed', status: 500 });
          return;
        }

        // ── Step 3: HCS audit record (only on success) ───────────────────
        emit({ type: 'step', index: 3 });
        const hcs = await recordPaymentOnChain(hcsPayload, 'SUCCESS');

        emit({ type: 'done', data: { success: true, parsed, lifi, hcs, payment } });

      } catch (err) {
        emit({ type: 'error', error: err instanceof Error ? err.message : 'Processing failed', status: 500 });
      } finally {
        controller.close();
      }
    },
  });

  return new Response(readableStream, { headers: sseHeaders() });
}

function sseHeaders() {
  return {
    'Content-Type': 'text/event-stream',
    'Cache-Control': 'no-cache',
    'Connection': 'keep-alive',
    'X-Accel-Buffering': 'no',
  };
}
