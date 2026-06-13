# FlowPay

**Cross-chain remittances in plain language.**

> $800B in annual remittances. Western Union charges 7% and takes 3 days. FlowPay does it in 3 seconds, with a $0.001 fee, from any chain, with a single instruction.

Built at ETHGlobal New York 2026.

---

## The Problem

Sending money across borders using crypto today requires:
- Knowing which chain your recipient is on
- Having the right token in your wallet
- Executing 4–6 manual transactions
- Paying unpredictable gas fees
- Waiting minutes for finality

Most people give up and use Western Union.

## The Solution

FlowPay is an AI agent that takes a plain-language instruction and executes a cross-chain payment in one flow:

```
"Send 200 USDC from María in Buenos Aires to Juan in Mexico City for rent"
```

That's it. The agent handles everything else.

---

## How It Works

```
User input (natural language)
        ↓
  Claude AI — parses payment intent
        ↓
  LI.FI Composer — builds atomic cross-chain flow (EVM)
        ↓
  Hedera HCS — records immutable audit trail
  Hedera HTS — executes payment settlement
        ↓
  Transaction confirmed in < 3 seconds · $0.001 fee
```

### Stack

| Layer | Technology | Purpose |
|-------|-----------|---------|
| AI parsing | Claude AI (Anthropic) | Natural language → payment intent |
| Cross-chain routing | LI.FI Composer SDK | Atomic EVM swap flows |
| Audit trail | Hedera Consensus Service (HCS) | Immutable payment record |
| Settlement | Hedera Token Service (HTS) | Fast, cheap final transfer |
| Frontend | Next.js + Tailwind | Demo UI |

### Why Hedera?

- **< 3 second finality** — no waiting for block confirmations
- **$0.001 per transaction** — no gas volatility
- **HCS as audit trail** — every payment is permanently recorded on a public topic
- **No Solidity required** — uses native Hedera SDK (HTS + HCS), zero smart contracts

### Why LI.FI Composer?

- Converts multi-step DeFi operations into a single atomic transaction
- Handles cross-chain routing across 15+ EVM networks
- Prevents partial failures — all-or-nothing execution

---

## Tracks

- **Hedera — AI & Agentic Payments** ($3,000): AI agent executing autonomous payments on Hedera Testnet
- **Hedera — No Solidity Allowed** ($1,000): Two native Hedera services (HCS + HTS), zero Solidity
- **LI.FI — Agentic Workflows** ($4,000): LI.FI Composer as execution layer for the AI payment agent

---

## Setup

### Prerequisites

- Node.js 18+
- Hedera Testnet account — [portal.hedera.com](https://portal.hedera.com)
- LI.FI API key — [portal.li.fi](https://portal.li.fi)
- Anthropic API key — [console.anthropic.com](https://console.anthropic.com)

### Installation

```bash
git clone https://github.com/YOUR_USERNAME/flowpay
cd flowpay
npm install
```

### Environment Variables

Create `.env.local`:

```env
ANTHROPIC_API_KEY=your_anthropic_key
LIFI_API_KEY=your_lifi_key
HEDERA_ACCOUNT_ID=0.0.XXXXXX
HEDERA_PRIVATE_KEY=0x...
HEDERA_RECIPIENT_ID=0.0.98
HEDERA_TOPIC_ID=          # leave blank on first run — auto-created
```

### Run

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

---

## Demo

Try these example payments:

- `Send 200 USDC from María in Buenos Aires to Juan in Mexico City for rent`
- `Pay 0.05 ETH to 0x742d35Cc6634C0532925a3b844Bc454e4438f44e for freelance design work`
- `Transfer 500 USDC to my sister in Colombia for school fees`

Each payment generates:
1. A parsed intent (sender, recipient, amount, memo)
2. A compiled LI.FI cross-chain flow with real calldata
3. A Hedera HCS entry — viewable on [Hashscan](https://hashscan.io/testnet/topic/0.0.9217982)
4. A Hedera Testnet transaction — viewable on [Hashscan](https://hashscan.io/testnet)

---

## Architecture

FlowPay uses two specialized layers that each do what they do best:

**LI.FI Composer** handles the EVM cross-chain leg — converting any token on any EVM chain into the target asset atomically, with no partial failures.

**Hedera** handles settlement and the audit layer — sub-second finality, USD-denominated fees, and a permanent public record via HCS. No Solidity required.

Both are orchestrated by a single Claude AI agent. Zero blockchain knowledge required from the user.

---

## Built With

- [LI.FI Composer SDK](https://li.fi) `@staging`
- [Hedera SDK](https://hedera.com) `@hashgraph/sdk`
- [Anthropic Claude](https://anthropic.com)
- [Next.js 16](https://nextjs.org)
- [Tailwind CSS](https://tailwindcss.com)
