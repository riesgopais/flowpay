// Deterministic keyword parser for FlowPay.
// Handles clear, unambiguous intents without calling Gemini.
// Returns confidence: 'high' → caller skips AI. 'low' → caller invokes Gemini.

// ── PaymentIntent lives here to avoid circular imports with parser.ts ─────────

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
  _parsedBy?: 'keyword' | 'gemini' | 'fallback';
}

// ── Token tables ───────────────────────────────────────────────────────────────

const TOKEN_MAP: Record<string, string> = {
  'eth': 'ETH', 'ether': 'ETH', 'ethereum': 'ETH',
  'weth': 'WETH',
  'usdc': 'USDC',
  'usdt': 'USDT', 'tether': 'USDT',
  'dai': 'DAI',
  'wbtc': 'WBTC',
  'hbar': 'HBAR',
  'matic': 'MATIC', 'pol': 'MATIC',
};

const UNSUPPORTED_RE = /\b(btc|bitcoin|sol|solana|xrp|ripple|ada|cardano|dot|polkadot|avax|avalanche|luna|bnb)\b/i;

// ── Patterns ───────────────────────────────────────────────────────────────────

// Signals that the human is uncertain → always defer to Gemini
const AMBIGUITY_RE = /\b(or|maybe|approximately|around|about|if|when|either|could|might|\?)\b/i;

const AMOUNT_RE = /\b(\d+(?:[.,]\d+)?)\b/;
const EVM_RE    = /0x[a-fA-F0-9]{40}/;
const HEDERA_RE = /\b(0\.\d+\.\d+)\b/;

// Must stay in sync with lib/resolver.ts NAME_REGISTRY
const REGISTRY = new Set([
  'sofia', 'sofía', 'carlos', 'juan', 'maría', 'maria', 'pablo',
  'lucas', 'lucía', 'lucia', 'ana', 'valentina', 'alice', 'bob', 'charlie',
]);

const MEMO_WORDS = [
  'rent', 'alquiler', 'salary', 'salario', 'freelance',
  'invoice', 'school', 'fees', 'family', 'work', 'services',
];

const SKIP = new Set([
  'my', 'the', 'a', 'an', 'his', 'her', 'our', 'your', 'their',
  'mi', 'tu', 'su', 'el', 'la', 'los', 'las',
]);

const NAME_PAT = '[A-ZÁÉÍÓÚÑ][a-záéíóúñ]+';

// ── Public API ─────────────────────────────────────────────────────────────────

export interface KeywordParseResult {
  result: PaymentIntent;
  confidence: 'high' | 'low';
}

export function parseWithKeywords(text: string): KeywordParseResult {
  const lower = text.toLowerCase();

  // 1. Unsupported token → fast error, skip Gemini entirely
  const badToken = text.match(UNSUPPORTED_RE);
  if (badToken) {
    return {
      confidence: 'high',
      result: {
        ...blank(),
        error: `Token "${badToken[1].toUpperCase()}" is not supported. FlowPay supports: ETH, USDC, USDT, DAI, WBTC, HBAR, MATIC.`,
        _parsedBy: 'keyword',
      },
    };
  }

  // 2. Ambiguous phrasing → let Gemini handle it
  if (AMBIGUITY_RE.test(lower)) {
    return { confidence: 'low', result: blank() };
  }

  // 3. Amount
  const amountMatch = text.match(AMOUNT_RE);
  const amount = amountMatch ? parseFloat(amountMatch[1].replace(',', '.')) : null;

  // 4. Tokens (single-token rule: if one token → fromToken === toToken)
  const tokenHits = [...lower.matchAll(/\b(eth|ether|ethereum|weth|usdc|usdt|tether|dai|wbtc|hbar|matic|pol)\b/g)];
  const uniqueTokens = [...new Set(tokenHits.map(m => TOKEN_MAP[m[1]] ?? m[1].toUpperCase()))];
  const fromToken = uniqueTokens[0] ?? 'ETH';
  const toToken   = uniqueTokens.length >= 2 ? uniqueTokens[1] : (uniqueTokens[0] ?? 'USDC');

  // 5. Addresses
  const evmMatch    = text.match(EVM_RE);
  const hederaMatch = text.match(HEDERA_RE);

  // 6. Names
  const recipientMatch = text.match(new RegExp(`(?:to|para|a)\\s+(${NAME_PAT})`, 'i'));
  const senderMatch    = text.match(new RegExp(`(?:from|de)\\s+(${NAME_PAT})`, 'i'));
  const recipientName  = recipientMatch && !SKIP.has(recipientMatch[1].toLowerCase()) ? recipientMatch[1] : null;
  const senderName     = senderMatch    && !SKIP.has(senderMatch[1].toLowerCase())    ? senderMatch[1]    : null;

  const recipientAddress = evmMatch ? evmMatch[0] : '0x742d35Cc6634C0532925a3b844Bc454e4438f44e';
  const hederaRecipient  = hederaMatch ? hederaMatch[1] : null;

  // 7. Memo
  const memo = MEMO_WORDS.find(w => lower.includes(w)) ?? 'payment';

  // 8. Confidence: HIGH only when amount + token + recipient are all explicit
  const hasAmount    = amount !== null;
  const hasToken     = uniqueTokens.length > 0;
  const hasRecipient = !!(
    evmMatch || hederaMatch ||
    (recipientName && REGISTRY.has(recipientName.toLowerCase()))
  );
  const confidence: 'high' | 'low' = (hasAmount && hasToken && hasRecipient) ? 'high' : 'low';

  // 9. Human summary
  const displayAmount = amount ?? 0.01;
  const displayTo     = recipientName ?? (evmMatch ? `${evmMatch[0].slice(0, 8)}…` : 'recipient');
  const humanSummary  = senderName
    ? `Send ${displayAmount} ${toToken} from ${senderName} to ${displayTo} for ${memo}`
    : `Send ${displayAmount} ${toToken} to ${displayTo} for ${memo}`;

  return {
    confidence,
    result: {
      amount: displayAmount, fromToken, toToken,
      recipientAddress, hederaRecipient,
      senderName, recipientName,
      memo, humanSummary, error: null,
      _parsedBy: 'keyword',
    },
  };
}

function blank(): PaymentIntent {
  return {
    amount: 0.01, fromToken: 'ETH', toToken: 'USDC',
    recipientAddress: '', hederaRecipient: null,
    senderName: null, recipientName: null,
    memo: 'payment', humanSummary: '', error: null,
  };
}
