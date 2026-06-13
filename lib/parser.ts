import { GoogleGenerativeAI, SchemaType, type Schema } from '@google/generative-ai';

// Tokens that FlowPay can actually route
const SUPPORTED_TOKENS = new Set(['ETH', 'WETH', 'USDC', 'USDT', 'DAI', 'WBTC', 'HBAR', 'MATIC', 'POL']);

export interface PaymentIntent {
  amount: number;
  fromToken: string;
  toToken: string;
  recipientAddress: string;
  hederaRecipient: string | null;
  senderName: string | null;
  recipientName: string | null;
  memo: string;
  humanSummary: string;
  error: string | null;
}

// Strict JSON schema for Gemini Structured Outputs
const PAYMENT_SCHEMA: Schema = {
  type: SchemaType.OBJECT,
  properties: {
    amount: {
      type: SchemaType.NUMBER,
      description: 'Numeric amount to send. Default 0.01 if unclear.',
    },
    fromToken: {
      type: SchemaType.STRING,
      description: 'Source token symbol (ETH, WETH, USDC, USDT, DAI, WBTC, HBAR, MATIC). Default ETH.',
    },
    toToken: {
      type: SchemaType.STRING,
      description: 'Destination token symbol (ETH, WETH, USDC, USDT, DAI, WBTC, HBAR, MATIC). Default USDC.',
    },
    recipientAddress: {
      type: SchemaType.STRING,
      description: 'EVM 0x address if present, else "0x742d35Cc6634C0532925a3b844Bc454e4438f44e".',
    },
    hederaRecipient: {
      type: SchemaType.STRING,
      description: 'Hedera account ID like "0.0.12345" if present, else empty string.',
      nullable: true,
    },
    senderName: {
      type: SchemaType.STRING,
      description: 'Name of the sender if mentioned, else empty string.',
      nullable: true,
    },
    recipientName: {
      type: SchemaType.STRING,
      description: 'Name of the recipient if mentioned, else empty string.',
      nullable: true,
    },
    memo: {
      type: SchemaType.STRING,
      description: 'Purpose of the payment (rent, salary, freelance, etc). Default "payment".',
    },
    humanSummary: {
      type: SchemaType.STRING,
      description: 'One clear sentence: "Send 200 USDC from Pablo to María for rent".',
    },
    error: {
      type: SchemaType.STRING,
      description: 'Non-empty if the request cannot be processed: unsupported token (BTC, SOL, XRP, etc), missing amount with no reasonable default, or ambiguous/invalid intent. Otherwise empty string.',
      nullable: true,
    },
  },
  required: ['amount', 'fromToken', 'toToken', 'recipientAddress', 'memo', 'humanSummary'],
};

function fallbackParse(text: string): PaymentIntent {
  const lower = text.toLowerCase();

  const amountMatch = text.match(/(\d+(?:\.\d+)?)\s*(usdc|usdt|eth|btc|hbar|dai|matic)?/i);
  const amount = amountMatch ? parseFloat(amountMatch[1]) : 0.01;

  const tokenMatch = text.match(/\b(usdc|usdt|eth|weth|hbar|dai|matic|wbtc)\b/i);
  const rawToken = tokenMatch ? tokenMatch[1].toUpperCase() : 'USDC';
  const toToken = rawToken;
  const fromToken = toToken === 'ETH' || toToken === 'WETH' ? 'USDC' : 'ETH';

  const evmMatch = text.match(/0x[a-fA-F0-9]{40}/);
  const recipientAddress = evmMatch ? evmMatch[0] : '0x742d35Cc6634C0532925a3b844Bc454e4438f44e';

  const hederaMatch = text.match(/\b(0\.\d+\.\d+)\b/);
  const hederaRecipient = hederaMatch ? hederaMatch[1] : null;

  const SKIP = new Set(['my', 'the', 'a', 'an', 'his', 'her', 'our', 'your', 'their']);
  const fromMatch = text.match(/from\s+([A-ZÁÉÍÓÚÑ][a-záéíóúñ]+)/i);
  const toMatch   = text.match(/to\s+([A-ZÁÉÍÓÚÑ][a-záéíóúñ]+)/i);
  const senderName    = fromMatch && !SKIP.has(fromMatch[1].toLowerCase()) ? fromMatch[1] : null;
  const recipientName = toMatch   && !SKIP.has(toMatch[1].toLowerCase())   ? toMatch[1]   : null;

  const memoWords = ['rent', 'alquiler', 'salary', 'salario', 'freelance', 'invoice', 'school', 'fees', 'family', 'work'];
  const memo = memoWords.find(k => lower.includes(k)) ?? 'payment';

  const recipient = recipientName ?? 'recipient';
  const sender    = senderName    ?? null;
  const humanSummary = sender
    ? `Send ${amount} ${toToken} from ${sender} to ${recipient} for ${memo}`
    : `Send ${amount} ${toToken} for ${memo}`;

  // Check unsupported tokens in fallback too
  const unsupportedMatch = text.match(/\b(btc|bitcoin|sol|solana|xrp|ripple|ada|cardano|dot|polkadot|avax|avalanche|luna|bnb)\b/i);
  const error = unsupportedMatch
    ? `Token "${unsupportedMatch[1].toUpperCase()}" is not supported. FlowPay supports: ETH, USDC, USDT, DAI, WBTC, HBAR, MATIC.`
    : null;

  return { amount, fromToken, toToken, recipientAddress, hederaRecipient, senderName, recipientName, memo, humanSummary, error };
}

export async function parsePaymentIntent(text: string): Promise<PaymentIntent> {
  const apiKey = process.env.GOOGLE_API_KEY;

  if (!apiKey) return fallbackParse(text);

  try {
    const genai  = new GoogleGenerativeAI(apiKey);
    const model  = genai.getGenerativeModel({
      model: 'gemini-2.0-flash',
      generationConfig: {
        responseMimeType: 'application/json',
        responseSchema: PAYMENT_SCHEMA,
      },
    });

    const prompt = `You are a cross-chain payment parser for FlowPay.

Supported tokens: ETH, WETH, USDC, USDT, DAI, WBTC, HBAR, MATIC.
Unsupported tokens include BTC (native), SOL, XRP, ADA, DOT, AVAX, BNB, LUNA, and any token not in the supported list.

Parse this payment request: "${text}"

Rules:
- If the request mentions an unsupported token, set error to a clear message explaining which tokens are supported.
- If no amount is mentioned and there's no reasonable default, set error.
- If the intent is clear and valid, set error to null.
- humanSummary must always be a complete sentence even if there's an error.`;

    const response = await model.generateContent(prompt);
    const raw = response.response.text();
    const parsed = JSON.parse(raw) as PaymentIntent;

    // Normalize: convert empty strings to null
    parsed.hederaRecipient = parsed.hederaRecipient || null;
    parsed.senderName      = parsed.senderName      || null;
    parsed.recipientName   = parsed.recipientName   || null;
    parsed.error           = parsed.error           || null;

    // Validate tokens even if Gemini didn't catch it
    const tokenToCheck = parsed.toToken?.toUpperCase();
    if (tokenToCheck && !SUPPORTED_TOKENS.has(tokenToCheck) && !parsed.error) {
      parsed.error = `Token "${parsed.toToken}" is not supported. FlowPay supports: ETH, USDC, USDT, DAI, WBTC, HBAR, MATIC.`;
    }

    return parsed;
  } catch (err) {
    console.error('[Gemini] Parse error, using fallback:', err);
    return fallbackParse(text);
  }
}
