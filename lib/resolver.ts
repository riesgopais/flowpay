// Mock name registry for demo — maps human names to testnet addresses.
// In production this would integrate ENS (viem.getEnsAddress) and Hedera Name Service.

interface ResolvedAddress {
  evm: string;
  hedera: string | null;
  source: 'registry';
}

const NAME_REGISTRY: Record<string, { evm: string; hedera: string | null }> = {
  // Spanish names
  'sofia':   { evm: '0x742d35Cc6634C0532925a3b844Bc454e4438f44e', hedera: '0.0.98' },
  'sofía':   { evm: '0x742d35Cc6634C0532925a3b844Bc454e4438f44e', hedera: '0.0.98' },
  'carlos':  { evm: '0xd8dA6BF26964aF9D7eEd9e03E53415D37aA96045', hedera: '0.0.9217982' },
  'juan':    { evm: '0xAb5801a7D398351b8bE11C439e05C5B3259aeC9B', hedera: '0.0.1234567' },
  'maría':   { evm: '0x4838B106FCe9647Bdf1E7877BF73cE8B0BAD5f97', hedera: null },
  'maria':   { evm: '0x4838B106FCe9647Bdf1E7877BF73cE8B0BAD5f97', hedera: null },
  'pablo':   { evm: '0x9876543210987654321098765432109876543211', hedera: '0.0.9185784' },
  'lucas':   { evm: '0x1111222233334444555566667777888899990001', hedera: null },
  'lucía':   { evm: '0x2222333344445555666677778888999900001112', hedera: null },
  'lucia':   { evm: '0x2222333344445555666677778888999900001112', hedera: null },
  'ana':     { evm: '0x3333444455556666777788889999000011112223', hedera: null },
  'valentina':{ evm: '0x4444555566667777888899990000111122223334', hedera: null },
  // English names
  'alice':   { evm: '0x742d35Cc6634C0532925a3b844Bc454e4438f44e', hedera: null },
  'bob':     { evm: '0xd8dA6BF26964aF9D7eEd9e03E53415D37aA96045', hedera: null },
  'charlie': { evm: '0xAb5801a7D398351b8bE11C439e05C5B3259aeC9B', hedera: null },
};

export function resolveRecipientName(name: string | null): ResolvedAddress | null {
  if (!name) return null;
  const normalized = name.toLowerCase().trim();
  const entry = NAME_REGISTRY[normalized];
  if (!entry) return null;
  return { ...entry, source: 'registry' };
}

export function isKnownName(name: string | null): boolean {
  if (!name) return false;
  return name.toLowerCase().trim() in NAME_REGISTRY;
}
