import { GoogleGenerativeAI, SchemaType, type Schema } from '@google/generative-ai';
import { parseWithKeywords } from './keyword-parser';

// Re-export so existing imports from '@/lib/parser' keep working
export type { PaymentIntent } from './keyword-parser';
import type { PaymentIntent } from './keyword-parser';

// Tokens that FlowPay can actually route
const SUPPORTED_TOKENS = new Set(['ETH', 'WETH', 'USDC', 'USDT', 'DAI', 'WBTC', 'HBAR', 'MATIC', 'POL']);

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

  const allTokenMatches = [...text.matchAll(/\b(usdc|usdt|eth|weth|hbar|dai|matic|wbtc)\b/gi)];
  const uniqueTokens = [...new Set(allTokenMatches.map(m => m[1].toUpperCase()))];
  let fromToken: string;
  let toToken: string;
  if (uniqueTokens.length === 0) {
    fromToken = 'ETH'; toToken = 'USDC';
  } else if (uniqueTokens.length === 1) {
    fromToken = uniqueTokens[0]; toToken = uniqueTokens[0];
  } else {
    fromToken = uniqueTokens[0]; toToken = uniqueTokens[1];
  }

  const evmMatch = text.match(/0x[a-fA-F0-9]{40}/);
  const recipientAddress = evmMatch ? evmMatch[0] : '0x742d35Cc6634C0532925a3b844Bc454e4438f44e';

  const hederaMatch = text.match(/\b(0\.\d+\.\d+)\b/);
  const hederaRecipient = hederaMatch ? hederaMatch[1] : null;

  const SKIP = new Set(['my', 'the', 'a', 'an', 'his', 'her', 'our', 'your', 'their', 'mi', 'tu', 'su', 'el', 'la']);
  const NAME = '[A-ZÁÉÍÓÚÑ][a-záéíóúñ]+';
  const senderMatch    = text.match(new RegExp(`(?:from|de)\\s+(${NAME})`, 'i'));
  const recipientMatch = text.match(new RegExp(`(?:to|para|a)\\s+(${NAME})`, 'i'));
  const senderName    = senderMatch    && !SKIP.has(senderMatch[1].toLowerCase())    ? senderMatch[1]    : null;
  const recipientName = recipientMatch && !SKIP.has(recipientMatch[1].toLowerCase()) ? recipientMatch[1] : null;

  const memoWords = ['rent', 'alquiler', 'salary', 'salario', 'freelance', 'invoice', 'school', 'fees', 'family', 'work'];
  const memo = memoWords.find(k => lower.includes(k)) ?? 'payment';

  const recipient = recipientName ?? 'recipient';
  const sender    = senderName    ?? null;
  const humanSummary = sender
    ? `Send ${amount} ${toToken} from ${sender} to ${recipient} for ${memo}`
    : `Send ${amount} ${toToken} for ${memo}`;

  const unsupportedMatch = text.match(/\b(btc|bitcoin|sol|solana|xrp|ripple|ada|cardano|dot|polkadot|avax|avalanche|luna|bnb)\b/i);
  const error = unsupportedMatch
    ? `Token "${unsupportedMatch[1].toUpperCase()}" is not supported. FlowPay supports: ETH, USDC, USDT, DAI, WBTC, HBAR, MATIC.`
    : null;

  return { amount, fromToken, toToken, recipientAddress, hederaRecipient, senderName, recipientName, memo, humanSummary, error, _parsedBy: 'fallback' };
}

export async function parsePaymentIntent(text: string): Promise<PaymentIntent> {
  // ── 1. Keyword fast path ───────────────────────────────────────────────────
  // For clear intents (explicit amount + token + known recipient), skip Gemini entirely.
  const kw = parseWithKeywords(text);
  if (kw.confidence === 'high') {
    return kw.result;
  }

  // ── 2. Gemini deep parse ──────────────────────────────────────────────────
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
Unsupported: BTC (native Bitcoin), SOL, XRP, ADA, DOT, AVAX, BNB, LUNA — any token NOT in the supported list.

## TOKEN RULES (critical — follow exactly)
- If the user mentions ONE token only → set BOTH fromToken AND toToken to that same token. Do NOT invent a different fromToken.
  Example: "Pay 0.05 ETH for work" → fromToken: "ETH", toToken: "ETH"
  Example: "Send 200 USDC to Juan" → fromToken: "USDC", toToken: "USDC"
- Only set DIFFERENT fromToken/toToken when the user EXPLICITLY wants to swap/exchange one token FOR another.
  Example: "Swap 1 ETH for USDC" → fromToken: "ETH", toToken: "USDC"
- If NO token is mentioned → fromToken: "ETH", toToken: "USDC" (default swap)

## NAME EXTRACTION RULES (English and Spanish)
Extract senderName and recipientName from these patterns:

English:
- "from [Name]" → senderName
- "to [Name]" → recipientName

Spanish (few-shot examples):
- "Mandá 100 USDT de Carlos a Sofía para el alquiler" → senderName: "Carlos", recipientName: "Sofía"
- "Enviá 50 ETH de Juan a María" → senderName: "Juan", recipientName: "María"
- "Transferí 200 USDC de Pablo en Buenos Aires a Lucía en Colombia" → senderName: "Pablo", recipientName: "Lucía"
- "de [Name]" → senderName (Spanish "from")
- "a [Name]" → recipientName (Spanish "to") — only when followed by a proper noun (capitalized)
- "para [Name]" → recipientName (Spanish "for/to")

Only extract HUMAN NAMES. Ignore city names, country names, and common words.

## ERROR RULES
- Unsupported token mentioned → error: "Token X is not supported. FlowPay supports: ETH, USDC, USDT, DAI, WBTC, HBAR, MATIC."
- Valid intent → error: null

Parse this payment request: "${text}"

humanSummary must always be a complete, natural sentence.`;

    const response = await model.generateContent(prompt);
    const raw = response.response.text();
    const parsed = JSON.parse(raw) as PaymentIntent;

    // Normalize: convert empty strings to null
    parsed.hederaRecipient = parsed.hederaRecipient || null;
    parsed.senderName      = parsed.senderName      || null;
    parsed.recipientName   = parsed.recipientName   || null;
    parsed.error           = parsed.error           || null;
    parsed._parsedBy       = 'gemini';

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
