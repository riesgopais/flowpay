import { parsePaymentIntent } from '@/lib/parser';
import type { PaymentIntent } from '@/lib/keyword-parser';
import { recordPaymentOnChain, executeHbarPayment } from '@/lib/hedera';
import { buildCrossChainPaymentFlow } from '@/lib/lifi';
import { resolveRecipientName } from '@/lib/resolver';
import { checkRateLimit, getClientIp } from '@/lib/rate-limit';

// Shape of the pre-parsed object sent from the frontend's /api/parse step
interface ClientParsed {
  amount: number;
  fromToken: string;
  toToken: string;
  recipientAddress: string;
  hederaRecipient: string | null;
  senderName: string | null;
  recipientName: string | null;
  memo: string;
  humanSummary: string;
  error?: string | null;
  _parsedBy?: 'keyword' | 'gemini' | 'fallback';
}

function isValidClientParsed(p: unknown): p is ClientParsed {
  if (!p || typeof p !== 'object') return false;
  const o = p as Record<string, unknown>;
  return (
    typeof o.humanSummary === 'string' && o.humanSummary.length > 0 &&
    typeof o.amount === 'number' && o.amount > 0 &&
    typeof o.fromToken === 'string' && typeof o.toToken === 'string' &&
    !o.error
  );
}

function sse(data: object): Uint8Array {
  return new TextEncoder().encode(`data: ${JSON.stringify(data)}\n\n`);
}

export async function POST(request: Request) {
  // Rate limit: 10 payment executions per minute per IP
  const { allowed, retryAfter } = checkRateLimit(getClientIp(request), 10);
  if (!allowed) {
    return new Response(
      JSON.stringify({ error: `Too many requests — please wait ${retryAfter}s before retrying.` }),
      { status: 429, headers: { 'Content-Type': 'application/json', 'Retry-After': String(retryAfter) } },
    );
  }

  const body = await request.json().catch(() => ({}));
  const { intent, senderAddress, parsed: clientParsed, manualAddress } = body as {
    intent?: string;
    senderAddress?: string;
    parsed?: unknown;
    manualAddress?: string;
  };

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
        // ── Step 0: Intent validation / parse ─────────────────────────────
        emit({ type: 'step', index: 0 });

        let parsed: PaymentIntent;

        if (isValidClientParsed(clientParsed)) {
          // Reuse the already-parsed result from the /api/parse preview step.
          // This skips the Gemini API call entirely for the execute phase.
          parsed = {
            amount:           clientParsed.amount,
            fromToken:        clientParsed.fromToken,
            toToken:          clientParsed.toToken,
            recipientAddress: clientParsed.recipientAddress,
            hederaRecipient:  clientParsed.hederaRecipient ?? null,
            senderName:       clientParsed.senderName ?? null,
            recipientName:    clientParsed.recipientName ?? null,
            memo:             clientParsed.memo,
            humanSummary:     clientParsed.humanSummary,
            error:            null,
            _parsedBy:        clientParsed._parsedBy,
          };
        } else {
          // Fallback: full re-parse when clientParsed is absent or invalid
          parsed = await parsePaymentIntent(intent);
          if (parsed.error) {
            emit({ type: 'error', error: parsed.error, status: 422 });
            return;
          }
          if (!parsed.amount || isNaN(parsed.amount) || parsed.amount <= 0) {
            emit({ type: 'error', error: 'Invalid amount — please specify a number greater than 0.', status: 422 });
            return;
          }
          // Name resolution (only needed in fallback — already done in preview step)
          if (parsed.recipientName) {
            const resolved = await resolveRecipientName(parsed.recipientName);
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
        }

        // If the user manually entered a native Hedera account (0.0.X) and the
        // parsed object has no Hedera recipient yet, apply it now.
        if (!parsed.hederaRecipient && manualAddress && /^\d+\.\d+\.\d+$/.test(manualAddress.trim())) {
          parsed.hederaRecipient = manualAddress.trim();
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

        // ── Step 3: HCS audit record (only on SUCCESS) ────────────────────
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
