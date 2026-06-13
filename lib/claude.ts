import Anthropic from '@anthropic-ai/sdk';

export interface PaymentIntent {
  amount: number;
  fromToken: string;
  toToken: string;
  recipientAddress: string;
  senderName: string | null;
  recipientName: string | null;
  memo: string;
  humanSummary: string;
}

function fallbackParse(text: string): PaymentIntent {
  const lower = text.toLowerCase();

  const amountMatch = text.match(/(\d+(?:\.\d+)?)\s*(usdc|usdt|eth|btc|hbar)?/i);
  const amount = amountMatch ? parseFloat(amountMatch[1]) : 100;

  const tokenMatch = text.match(/\b(usdc|usdt|eth|btc|hbar)\b/i);
  const toToken = tokenMatch ? tokenMatch[1].toUpperCase() : 'USDC';
  const fromToken = toToken === 'ETH' ? 'USDC' : 'ETH';

  const evmMatch = text.match(/0x[a-fA-F0-9]{40}/);
  const recipientAddress = evmMatch ? evmMatch[0] : '0x742d35Cc6634C0532925a3b844Bc454e4438f44e';

  const SKIP_WORDS = new Set(['my', 'the', 'a', 'an', 'his', 'her', 'our', 'your', 'their']);
  const fromMatch = text.match(/from\s+([A-ZÁÉÍÓÚÑ][a-záéíóúñ]+)/i);
  const toMatch = text.match(/to\s+([A-ZÁÉÍÓÚÑ][a-záéíóúñ]+)/i);
  const senderName = fromMatch && !SKIP_WORDS.has(fromMatch[1].toLowerCase()) ? fromMatch[1] : null;
  const recipientName = toMatch && !SKIP_WORDS.has(toMatch[1].toLowerCase()) ? toMatch[1] : null;

  const memoKeywords = ['rent', 'alquiler', 'salary', 'salario', 'freelance', 'invoice', 'school', 'fees', 'family', 'work'];
  const memo = memoKeywords.find(k => lower.includes(k)) || 'cross-chain payment';

  const sender = senderName || 'sender';
  const recipient = recipientName || 'recipient address';
  const humanSummary = senderName
    ? `Send ${amount} ${toToken} from ${sender} to ${recipient} for ${memo}`
    : `Send ${amount} ${toToken} for ${memo}`;

  return { amount, fromToken, toToken, recipientAddress, senderName, recipientName, memo, humanSummary };
}

export async function parsePaymentIntent(text: string): Promise<PaymentIntent> {
  const apiKey = process.env.ANTHROPIC_API_KEY;

  if (!apiKey) return fallbackParse(text);

  try {
    const anthropic = new Anthropic({ apiKey });
    const response = await anthropic.messages.create({
      model: 'claude-haiku-4-5-20251001',
      max_tokens: 300,
      messages: [{
        role: 'user',
        content: `Parse this cross-chain remittance request into JSON with these fields:
- amount: number (default 0.01 if unclear)
- fromToken: string (default "ETH")
- toToken: string (default "USDC")
- recipientAddress: string (EVM address if present, else "0x742d35Cc6634C0532925a3b844Bc454e4438f44e")
- senderName: string | null
- recipientName: string | null
- memo: string (purpose of payment)
- humanSummary: string (one sentence, e.g. "Send 100 USDC from María to Juan for rent")

Input: "${text}"

Respond with valid JSON only, no markdown.`
      }]
    });

    const content = response.content[0];
    if (content.type !== 'text') return fallbackParse(text);
    return JSON.parse(content.text) as PaymentIntent;
  } catch {
    return fallbackParse(text);
  }
}
