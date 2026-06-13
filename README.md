# FlowPay

**Intent-based cross-chain payments in plain language.**

> Type what you want to pay. FlowPay routes, executes, and settles — across any chain, in under 10 seconds, at $0.001 per transaction.

**Live demo:** https://flowpay-delta.vercel.app  
**Built at:** ETHGlobal New York 2026 (June 12–14) — solo project

---

## The One-Line Pitch

FlowPay collapses 5+ blockchain steps (pick chain → pick token → find address → approve → send) into a single text input powered by Google Gemini.

---

## How It Works End-to-End

```
User types:
"Send 200 USDC from María to Juan in Mexico for rent"
                  │
                  ▼
         POST /api/parse  (preview step)
         Google Gemini 2.0 Flash
         Structured Output → PaymentIntent JSON
         Name resolver → real testnet address
         Warnings generated for AI assumptions
                  │
                  ▼
      Confirmation card shown to user
      (human summary + chips + amber warnings if AI assumed defaults)
                  │
          user clicks "Confirm & Execute"
                  │
                  ▼
         POST /api/pay-stream  (SSE)
         ┌─ Step 0: Gemini re-validates intent
         ├─ Step 1: LI.FI Composer builds atomic EVM flow
         ├─ Step 2: Hedera HBAR settlement executes
         └─ Step 3: Hedera HCS writes audit record (SUCCESS/FAILED)
                  │
                  ▼
         Frontend reads SSE events in real time
         Pipeline nodes light up as each step completes
         Receipt shows Hashscan links for HCS topic + tx
```

### Two-Step UX — intentional

The flow is **parse-first, execute-second**. The AI acts as a structured parser; it never executes directly on-chain. The user sees the parsed intent (summary + chips) before any blockchain call. The user is the final firewall. This is the correct security model for financial AI.

---

## Architecture

### AI Layer — Google Gemini 2.0 Flash

`lib/parser.ts`

- Uses `responseMimeType: 'application/json'` + `responseSchema` (Structured Outputs — no prompt engineering for JSON format)
- Returns a strict `PaymentIntent` typed object: `amount`, `fromToken`, `toToken`, `recipientAddress`, `hederaRecipient`, `senderName`, `recipientName`, `memo`, `humanSummary`, `error`
- **Single-token rule:** if user says "Pay 0.05 ETH", both `fromToken` and `toToken` = ETH (no invented swap)
- Unsupported tokens (BTC, SOL, XRP, ADA, DOT, AVAX, BNB) set `error` field → backend returns 422 before any chain call
- Fallback regex parser when `GOOGLE_API_KEY` is absent (for local dev without keys)

### Name Resolution Layer

`lib/resolver.ts`

- 14-name registry (ES + EN): Sofia, Carlos, Juan, María, Pablo, Lucas, Lucía, Ana, Valentina, Alice, Bob, Charlie — each maps to `{ evm: '0x...', hedera: '0.0.X' | null }`
- Called in both `/api/parse` (preview) and `/api/pay-stream` (execution) — consistent resolution
- Unknown name + no explicit address in intent → 422 with actionable message: *"[Name] is not in the FlowPay registry. Please include a wallet address (0x…) or Hedera account (0.0.X)."*
- Production path: swap registry for `viem.getEnsAddress()` (ENS) + Hedera Name Service lookup

### Cross-Chain Routing — LI.FI Composer SDK

`lib/lifi.ts`

- Staging endpoint: `ethglobal-composer.li.quest` (ETHGlobal-specific)
- Same token → direct transfer step. Different tokens → `lifi.swap()` via aggregator
- Token addresses: ETH/WETH/USDC/USDT/DAI/WBTC on Ethereum mainnet
- `toWei()` handles decimal conversion: USDC/USDT = 6 decimals, ETH/WETH/DAI = 18, WBTC = 8
- Amounts capped at demo limits (1 token max, 0.01 WBTC) for testnet safety
- Compile result includes `transactionRequest` — if wallet connected, "Sign & Execute on-chain" button appears in the receipt

### Settlement + Audit — Hedera

`lib/hedera.ts`

**HCS (Hedera Consensus Service):**
- Topic: `0.0.9217982` — viewable at [hashscan.io/testnet/topic/0.0.9217982](https://hashscan.io/testnet/topic/0.0.9217982)
- Records: `{ intent, amount, fromToken, toToken, recipient, memo, status, timestamp, app: 'FlowPay' }`
- Statuses: `SUCCESS` | `ROUTING_FAILED` | `PAYMENT_FAILED`
- **Atomicity enforced:** HCS only writes `SUCCESS` after HBAR payment confirms. On LI.FI failure → `ROUTING_FAILED`. On HBAR failure → `PAYMENT_FAILED`. No silent false-positives.

**HBAR Transfer:**
- Executes on-chain from operator account (`0.0.9185784`) to recipient
- `0.001 HBAR` for EVM token payments (settlement signal), up to `1 HBAR` when token is HBAR
- Receipt viewable on Hashscan testnet

### SSE Streaming Pipeline

`app/api/pay-stream/route.ts`

- `POST /api/pay-stream` — returns `text/event-stream`
- Emits `{ type: 'step', index: N }` as each backend step actually completes (not faked)
- Frontend pipeline nodes light up **strictly on server events** — no `setTimeout` or CSS timers
- On error: `{ type: 'error', error: string, status: number }`
- On completion: `{ type: 'done', data: PaymentResult }`
- **25-second per-step watchdog** in the frontend via `AbortController`. Resets on each received event. On timeout: "Network congestion detected" message, stage resets to idle for immediate retry.

---

## API Reference

### `POST /api/parse`

Parse a natural language payment intent. Used for the preview/confirmation step.

**Request:**
```json
{ "intent": "Send 100 USDC to Sofia for rent" }
```

**Response (success):**
```json
{
  "amount": 100,
  "fromToken": "USDC",
  "toToken": "USDC",
  "recipientAddress": "0x742d35Cc6634C0532925a3b844Bc454e4438f44e",
  "hederaRecipient": "0.0.98",
  "senderName": null,
  "recipientName": "Sofia",
  "memo": "rent",
  "humanSummary": "Send 100 USDC to Sofia for rent",
  "error": null,
  "warnings": ["Sending to Sofia's registered testnet address"],
  "resolvedAddressLabel": "Resolved from demo registry"
}
```

**Error responses:**
- `400` — empty or missing `intent`
- `200` with `error` field set — unsupported token (BTC, SOL, XRP, etc.)

### `POST /api/pay-stream`

Execute a payment. Returns Server-Sent Events.

**Request:**
```json
{ "intent": "Send 100 USDC to Sofia for rent", "senderAddress": "0x..." }
```

**SSE stream:**
```
data: {"type":"step","index":0}        ← Gemini parsing
data: {"type":"step","index":1}        ← LI.FI routing
data: {"type":"step","index":2}        ← Hedera HBAR settlement
data: {"type":"step","index":3}        ← HCS audit record

data: {"type":"done","data":{
  "success": true,
  "parsed": { "humanSummary": "...", "amount": 100, ... },
  "lifi":   { "flowBuilt": true, "steps": [...], "compiled": true, ... },
  "hcs":    { "topicId": "0.0.9217982", "sequenceNumber": "42", "explorerUrl": "..." },
  "payment":{ "transactionId": "0.0.9185784@...", "amount": "0.001 HBAR", "explorerUrl": "..." }
}}

data: {"type":"error","error":"BTC is not supported...","status":422}
```

**Error events:**
- `status: 400` — empty intent
- `status: 422` — unsupported token, invalid amount, or unresolved name without explicit address
- `status: 500` — LI.FI or Hedera failure (HCS records the failure status)

### `POST /api/pay`

Single-response (non-streaming) execution. Same validation logic as `pay-stream`. Used for programmatic/direct API access. The frontend uses `pay-stream`.

---

## File Structure

```
flowpay/
├── app/
│   ├── api/
│   │   ├── parse/route.ts        # AI parse + name resolution + warnings
│   │   ├── pay/route.ts          # Legacy single-response execution
│   │   └── pay-stream/route.ts   # SSE streaming execution (used by frontend)
│   ├── docs/page.tsx             # Docs page
│   ├── globals.css               # Design tokens + shimmer keyframe animation
│   ├── layout.tsx                # Providers wrapper
│   ├── page.tsx                  # Main UI — Studio Dark design
│   └── providers.tsx             # wagmi + RainbowKit config
└── lib/
    ├── parser.ts                 # Gemini 2.0 Flash + fallback regex parser
    ├── resolver.ts               # Name registry + ENS-ready resolve interface
    ├── lifi.ts                   # LI.FI Composer SDK — atomic EVM flows
    └── hedera.ts                 # HCS audit trail + HBAR transfer
```

---

## Local Setup

### Prerequisites

- Node.js 20+
- Google AI API key — [aistudio.google.com](https://aistudio.google.com) (free tier works)
- Hedera Testnet account — [portal.hedera.com](https://portal.hedera.com)
- LI.FI API key — [portal.li.fi](https://portal.li.fi)

### Install

```bash
git clone https://github.com/riesgopais/flowpay
cd flowpay
npm install
```

### Environment Variables

```env
# .env.local — never committed

GOOGLE_API_KEY=your_gemini_key         # Gemini 2.0 Flash parser
LIFI_API_KEY=your_lifi_key             # LI.FI Composer SDK
HEDERA_ACCOUNT_ID=0.0.XXXXXX          # Operator account (pays fees)
HEDERA_PRIVATE_KEY=0x...               # ECDSA private key for operator
HEDERA_RECIPIENT_ID=0.0.98             # Default HBAR recipient (Hedera treasury for demo)
HEDERA_TOPIC_ID=0.0.XXXXXX            # HCS topic — leave blank on first run, auto-created
```

> `ANTHROPIC_API_KEY` is no longer used. Parser migrated from Claude Haiku → Gemini 2.0 Flash.

### Run

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

If `GOOGLE_API_KEY` is absent, the fallback regex parser activates automatically.

---

## Supported Tokens

| Token | Status | Notes |
|-------|--------|-------|
| ETH / WETH | ✅ | |
| USDC | ✅ | 6 decimals |
| USDT | ✅ | 6 decimals |
| DAI | ✅ | 18 decimals |
| WBTC | ✅ | 8 decimals, capped at 0.01 in demo |
| HBAR | ✅ | Native Hedera, up to 1 HBAR |
| MATIC / POL | ✅ | |
| BTC (native) | ❌ | Returns 422 |
| SOL, XRP, ADA, DOT, AVAX, BNB, LUNA | ❌ | Returns 422 |

---

## Known Limitations (v1 / hackathon scope)

| Limitation | Production path |
|-----------|----------------|
| Name registry is 14 hardcoded names | ENS (`viem.getEnsAddress`) + Hedera Name Service |
| LI.FI uses ETHGlobal staging endpoint | Production LI.FI Composer API key |
| HBAR amount is symbolic (0.001) for EVM tokens | Per-token settlement in production |
| No payment history | localStorage or Supabase |
| No user auth — shared relayer account | ERC-4337 account abstraction with Paymasters |
| Pipeline timing: 25s watchdog | Configurable per environment |

---

## Sponsor Tracks

| Sponsor | Track | Integration |
|---------|-------|-------------|
| **Hedera** | AI & Agentic Payments | AI agent executing HBAR transfers + HCS audit autonomously |
| **Hedera** | No Solidity Allowed | HCS + HBAR via native `@hashgraph/sdk` — zero Solidity |
| **LI.FI** | Agentic Workflows | LI.FI Composer SDK as atomic execution layer for AI-driven payments |
| **Google** | Gemini integration | Gemini 2.0 Flash + Structured Outputs as NL parser |

---

## Tech Stack

| Layer | Technology |
|-------|-----------|
| AI parser | Google Gemini 2.0 Flash (`@google/generative-ai`) |
| Cross-chain routing | LI.FI Composer SDK (`@lifi/composer-sdk`) |
| Settlement | Hedera HBAR transfer (`@hashgraph/sdk`) |
| Audit trail | Hedera Consensus Service HCS |
| Streaming | Server-Sent Events (Next.js App Router native) |
| Wallet connect | wagmi v2 + RainbowKit v2 |
| Frontend | Next.js 16 (Turbopack) + Tailwind CSS v4 |
| Deploy | Vercel |
