// Name resolver for FlowPay.
// Resolution order:
//   1. Mock registry (instant — for demo names like Sofia, Carlos, etc.)
//   2. ENS on Ethereum mainnet (for .eth names or unknown names auto-suffixed with .eth)
//   3. null → caller returns 422

import { createPublicClient, http } from 'viem';
import { mainnet } from 'viem/chains';
import { normalize } from 'viem/ens';

interface ResolvedAddress {
  evm: string;
  hedera: string | null;
  source: 'registry' | 'ens';
}

// ENS lives on Ethereum mainnet
const ensClient = createPublicClient({
  chain: mainnet,
  transport: http(process.env.ETHEREUM_RPC_URL ?? 'https://cloudflare-eth.com'),
});

const NAME_REGISTRY: Record<string, { evm: string; hedera: string | null }> = {
  // Spanish names
  'sofia':     { evm: '0x742d35Cc6634C0532925a3b844Bc454e4438f44e', hedera: '0.0.98' },
  'sofía':     { evm: '0x742d35Cc6634C0532925a3b844Bc454e4438f44e', hedera: '0.0.98' },
  'carlos':    { evm: '0xd8dA6BF26964aF9D7eEd9e03E53415D37aA96045', hedera: '0.0.9217982' },
  'juan':      { evm: '0xAb5801a7D398351b8bE11C439e05C5B3259aeC9B', hedera: '0.0.1234567' },
  'maría':     { evm: '0x4838B106FCe9647Bdf1E7877BF73cE8B0BAD5f97', hedera: null },
  'maria':     { evm: '0x4838B106FCe9647Bdf1E7877BF73cE8B0BAD5f97', hedera: null },
  'pablo':     { evm: '0x9876543210987654321098765432109876543211', hedera: '0.0.9185784' },
  'lucas':     { evm: '0x1111222233334444555566667777888899990001', hedera: null },
  'lucía':     { evm: '0x2222333344445555666677778888999900001112', hedera: null },
  'lucia':     { evm: '0x2222333344445555666677778888999900001112', hedera: null },
  'ana':       { evm: '0x3333444455556666777788889999000011112223', hedera: null },
  'valentina': { evm: '0x4444555566667777888899990000111122223334', hedera: null },
  // English names
  'alice':     { evm: '0x742d35Cc6634C0532925a3b844Bc454e4438f44e', hedera: null },
  'bob':       { evm: '0xd8dA6BF26964aF9D7eEd9e03E53415D37aA96045', hedera: null },
  'charlie':   { evm: '0xAb5801a7D398351b8bE11C439e05C5B3259aeC9B', hedera: null },
};

async function resolveENS(name: string): Promise<string | null> {
  try {
    const ensName = name.toLowerCase().includes('.') ? name : `${name}.eth`;
    const address = await ensClient.getEnsAddress({ name: normalize(ensName) });
    return address ?? null;
  } catch {
    return null;
  }
}

export async function resolveRecipientName(name: string | null): Promise<ResolvedAddress | null> {
  if (!name) return null;
  const normalized = name.toLowerCase().trim();

  // 1. Registry first — instant, no network call needed for demo names
  const entry = NAME_REGISTRY[normalized];
  if (entry) return { ...entry, source: 'registry' };

  // 2. ENS — for .eth names or plain names not in registry (auto-suffixed .eth)
  const ensAddress = await resolveENS(name);
  if (ensAddress) return { evm: ensAddress, hedera: null, source: 'ens' };

  return null;
}

export function isKnownName(name: string | null): boolean {
  if (!name) return false;
  return name.toLowerCase().trim() in NAME_REGISTRY;
}
