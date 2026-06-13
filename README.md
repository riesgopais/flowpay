# ⚡ FlowPay | Intent-Based Settlement Engine

**Cross-chain payments in plain language. No wallets. No bridges. No complexity.**

> Type what you want to pay. FlowPay routes, executes, and settles across any chain — in under 10 seconds, with a full audit trail on Hedera.

[![Live Demo](https://img.shields.io/badge/Live%20Demo-flowpay--delta.vercel.app-FF6B1A?style=for-the-badge)](https://flowpay-delta.vercel.app)
[![ETHGlobal NYC 2026](https://img.shields.io/badge/ETHGlobal-NYC%202026-000?style=for-the-badge&logo=ethereum)](https://ethglobal.com)
[![Hedera](https://img.shields.io/badge/Hedera-HCS%20%2B%20HBAR-8A2BE2?style=for-the-badge)](https://hedera.com)
[![LI.FI](https://img.shields.io/badge/LI.FI-Composer%20SDK-00C2FF?style=for-the-badge)](https://li.fi)
[![Google Gemini](https://img.shields.io/badge/Google-Gemini%202.0%20Flash-4285F4?style=for-the-badge&logo=google)](https://ai.google.dev)

---

## The Problem

Sending crypto today requires 5+ steps: pick the right chain, pick the right token, find the wallet address, approve the token contract, sign the transaction. For every payment. Every time.

**FlowPay collapses all of this into a single sentence.**

```
"Send 200 USDC from María to Juan in Mexico for rent"
```

That's it. FlowPay handles the rest — parsing, routing, settlement, and a permanent on-chain audit record.

---

## Live Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                     User Intent (NL text)                    │
└───────────────────────────┬─────────────────────────────────┘
                            │  POST /api/parse
                            ▼
┌─────────────────────────────────────────────────────────────┐
│           STEP 1 — Google Gemini 2.0 Flash                  │
│   Structured Output → PaymentIntent JSON                    │
│   Name resolution (14-entry mock registry)                  │
│   Warnings generated for AI-assumed defaults                │
└───────────────────────────┬─────────────────────────────────┘
                            │  Confirmation card shown to user
                            │  (human summary + chips + warnings)
                            │  user clicks "Confirm & Execute"
                            │  POST /api/pay-stream (SSE)
                            ▼
┌─────────────────────────────────────────────────────────────┐
│           STEP 2 — LI.FI Composer SDK                       │
│   Builds atomic cross-chain EVM flow                        │
│   Same token → direct transfer                              │
│   Different tokens → swap via aggregator                    │
│   Returns compiled transactionRequest (wallet-ready)        │
└───────────────────────────┬─────────────────────────────────┘
                            │  on LI.FI error → HCS: ROUTING_FAILED
                            ▼
┌─────────────────────────────────────────────────────────────┐
│           STEP 3 — Hedera HBAR Settlement                   │
│   Executes native HBAR transfer from operator account       │
│   0.001 HBAR (EVM tokens) | up to 1 HBAR (HBAR token)      │
│   Returns Hashscan receipt URL                              │
└───────────────────────────┬─────────────────────────────────┘
                            │  on payment error → HCS: PAYMENT_FAILED
                            ▼
┌─────────────────────────────────────────────────────────────┐
│           STEP 4 — Hedera HCS Audit Record                  │
│   Topic: 0.0.9217982 (public, immutable)                   │
│   Writes SUCCESS only after payment confirms                │
│   { intent, amount, tokens, recipient, status, timestamp }  │
└─────────────────────────────────────────────────────────────┘
                            │  SSE: {type:'done', data}
                            ▼
                    Receipt with Hashscan links
```

**All 4 steps emit real-time SSE events.** Pipeline nodes on the UI light up strictly on server confirmation — no fake timeouts, no CSS timers.

---

## Key Design Decisions

### Parse-first, execute-second
The AI interprets the intent and shows a confirmation card before any blockchain call. The user sees the parsed summary, token chips, and any amber warnings before clicking "Confirm & Execute." The user is the final firewall. This is the correct security model for financial AI.

### HCS Atomicity enforced
`SUCCESS` is only written to Hedera Consensus Service after the HBAR payment confirms on-chain. Failures at LI.FI → `ROUTING_FAILED`. Failures at HBAR → `PAYMENT_FAILED`. No silent false-positives on the audit trail.

### Single-token rule
If the user says "Pay 0.05 ETH," both `fromToken` and `toToken` are set to ETH. Gemini never invents a swap when the user only names one token.

### Unknown name → 422, not silent fallback
If a name appears in the intent (e.g., "Roberto") but isn't in the registry and no explicit address is present, the API returns a 422 with a clear message instead of silently routing to a demo address.

---

## Resilience & Robustness

| Scenario | Behavior |
|----------|----------|
| `GOOGLE_API_KEY` absent | Fallback regex parser activates automatically |
| Amount not specified | Gemini assumes 0.01 — amber warning shown |
| Token not specified | Gemini assumes USDC — amber warning shown |
| Unsupported token (BTC, SOL, XRP…) | 422 before any chain call |
| Amount ≤ 0 or NaN | 422 with actionable message |
| Unknown name, no explicit address | 422 — user told to include wallet address |
| LI.FI failure | HCS records `ROUTING_FAILED`, 500 returned |
| HBAR payment failure | HCS records `PAYMENT_FAILED`, 500 returned |
| Network congestion (>25s per step) | AbortController fires → "Network congestion detected" — user can retry immediately |
| Empty intent | 400 |

---

## Sponsor Tracks

### Hedera — AI & Agentic Payments
FlowPay uses an AI agent (Gemini) to autonomously route and execute HBAR transfers, with the full audit trail recorded to HCS. The agent interprets free-form language, resolves names to addresses, determines amounts and tokens, and executes the settlement — zero manual steps.

### Hedera — No Solidity Allowed
Zero Solidity in this project. All Hedera interaction goes through `@hashgraph/sdk` (native Node.js SDK): `TransferTransaction` for HBAR, `TopicMessageSubmitTransaction` for HCS. No EVM bytecode, no compiled contracts.

### LI.FI — Agentic Workflows
LI.FI Composer SDK acts as the atomic execution layer for AI-driven payment flows. The AI parses intent; LI.FI handles the cross-chain route construction, token swap aggregation, and compiled transaction output. One `buildCrossChainPaymentFlow()` call covers the full EVM layer.

### Google Cloud — Gemini Integration
Gemini 2.0 Flash with Structured Outputs (`responseMimeType: 'application/json'` + `responseSchema`) is the NL parser core. No prompt engineering for JSON formatting — the model outputs a fully typed `PaymentIntent` object directly. Includes few-shot examples for Spanish/English name handling and multi-token detection.

---

## API Reference

### `POST /api/parse`

Parse a natural language intent. Returns preview for confirmation.

**Request:**
```json
{ "intent": "Send 100 USDC to Sofia for rent" }
```

**Response:**
```json
{
  "amount": 100,
  "fromToken": "USDC",
  "toToken": "USDC",
  "recipientAddress": "0x742d35Cc6634C0532925a3b844Bc454e4438f44e",
  "hederaRecipient": "0.0.98",
  "recipientName": "Sofia",
  "memo": "rent",
  "humanSummary": "Send 100 USDC to Sofia for rent",
  "warnings": ["Sending to Sofia's registered testnet address"],
  "resolvedAddressLabel": "Resolved from demo registry"
}
```

**Errors:** `400` empty intent · `200` with `error` field for unsupported tokens

---

### `POST /api/pay-stream`

Execute. Returns Server-Sent Events.

**Request:**
```json
{ "intent": "Send 100 USDC to Sofia for rent", "senderAddress": "0x..." }
```

**SSE stream:**
```
data: {"type":"step","index":0}         ← Gemini parsing
data: {"type":"step","index":1}         ← LI.FI routing
data: {"type":"step","index":2}         ← Hedera HBAR settlement
data: {"type":"step","index":3}         ← HCS audit record

data: {"type":"done","data":{
  "success": true,
  "parsed":  { "humanSummary": "...", "amount": 100, ... },
  "lifi":    { "flowBuilt": true, "steps": [...], "compiled": true },
  "hcs":     { "topicId": "0.0.9217982", "sequenceNumber": "42", "explorerUrl": "..." },
  "payment": { "transactionId": "0.0.9185784@...", "amount": "0.001 HBAR", "explorerUrl": "..." }
}}

data: {"type":"error","error":"BTC is not supported","status":422}
```

---

## Supported Tokens

| Token | Decimals | Notes |
|-------|----------|-------|
| ETH / WETH | 18 | |
| USDC | 6 | |
| USDT | 6 | |
| DAI | 18 | |
| WBTC | 8 | Capped at 0.01 in demo |
| HBAR | — | Native Hedera, up to 1 HBAR |
| MATIC / POL | 18 | |
| BTC, SOL, XRP, ADA, DOT, AVAX, BNB | — | 422 — not supported |

---

## Tech Stack

| Layer | Technology |
|-------|-----------|
| AI parser | Google Gemini 2.0 Flash · `@google/generative-ai` |
| Cross-chain routing | LI.FI Composer SDK · `@lifi/composer-sdk` |
| Settlement | Hedera HBAR transfer · `@hashgraph/sdk` |
| Audit trail | Hedera Consensus Service · topic `0.0.9217982` |
| Streaming | Server-Sent Events · Next.js App Router native |
| Wallet connect | wagmi v2 + RainbowKit v2 |
| Frontend | Next.js 16 (Turbopack) · Tailwind CSS v4 |
| Deploy | Vercel |

---

## File Structure

```
flowpay/
├── app/
│   ├── api/
│   │   ├── parse/route.ts        # AI parse + name resolution + warnings
│   │   ├── pay/route.ts          # Single-response execution (non-streaming)
│   │   └── pay-stream/route.ts   # SSE streaming execution (used by frontend)
│   ├── globals.css               # Design tokens + shimmer keyframe
│   ├── layout.tsx                # Providers wrapper
│   ├── page.tsx                  # Main UI — Studio Dark design
│   └── providers.tsx             # wagmi + RainbowKit config
└── lib/
    ├── parser.ts                 # Gemini 2.0 Flash + fallback regex parser
    ├── resolver.ts               # 14-name mock registry + ENS-ready interface
    ├── lifi.ts                   # LI.FI Composer SDK — atomic EVM flows
    └── hedera.ts                 # HCS audit trail + HBAR transfer
```

---

## Local Setup

```bash
git clone https://github.com/riesgopais/flowpay
cd flowpay
npm install
cp .env.example .env.local   # fill in your keys
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

If `GOOGLE_API_KEY` is absent, the fallback regex parser activates automatically — useful for local dev without API keys.

### Environment Variables

See `.env.example` for the full list with descriptions. Required keys:

```env
GOOGLE_API_KEY=      # Gemini 2.0 Flash — aistudio.google.com (free tier works)
HEDERA_ACCOUNT_ID=   # Testnet operator account — portal.hedera.com
HEDERA_PRIVATE_KEY=  # ECDSA private key for operator (never commit)
LIFI_API_KEY=        # LI.FI Composer — portal.li.fi
```

---

## Hackathon Limitations (v1)

| Limitation | Production path |
|-----------|----------------|
| 14-name hardcoded registry | ENS (`viem.getEnsAddress`) + Hedera Name Service |
| LI.FI ETHGlobal staging endpoint | Production LI.FI Composer API |
| HBAR amount is symbolic (0.001) for EVM tokens | Per-token settlement amounts |
| No payment history | localStorage or Supabase |
| Shared relayer account | ERC-4337 account abstraction with Paymasters |

---

## HCS Audit Trail

All payments are recorded permanently on Hedera Consensus Service.

**Topic:** `0.0.9217982`  
**Explorer:** [hashscan.io/testnet/topic/0.0.9217982](https://hashscan.io/testnet/topic/0.0.9217982)

Each message contains:
```json
{
  "app": "FlowPay",
  "intent": "Send 100 USDC to Sofia for rent",
  "amount": 100,
  "fromToken": "USDC",
  "toToken": "USDC",
  "recipient": "0x742d35...",
  "memo": "rent",
  "status": "SUCCESS",
  "timestamp": "2026-06-13T..."
}
```

---

**Built solo at ETHGlobal NYC 2026 (June 12–14)**  
Executed via FlowPay Relayer Account (Hedera Testnet) · LI.FI Composer Staging · Name resolution: demo registry
