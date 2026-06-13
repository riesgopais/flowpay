import { createComposeSdk, resources, materialisers } from '@lifi/composer-sdk';

const DEMO_SIGNER = '0x742d35Cc6634C0532925a3b844Bc454e4438f44e';

// Ethereum mainnet token addresses
const TOKEN_ADDRESSES: Record<string, string> = {
  ETH:   '0xEeeeeEeeeEeEeeEeEeEeeEEEeeeeEeeeeeeeEEeE',
  WETH:  '0xC02aaA39b223FE8D0A0e5C4F27eAD9083C756Cc2',
  USDC:  '0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48',
  USDT:  '0xdAC17F958D2ee523a2206206994597C13D831ec7',
  DAI:   '0x6B175474E89094C44Da98b954EedeAC495271d0F',
  WBTC:  '0x2260FAC5E5542a773Aa44fBCfeDf7C193bc2C599',
};

// Token decimals for amount conversion
const TOKEN_DECIMALS: Record<string, number> = {
  ETH: 18, WETH: 18, DAI: 18, USDC: 6, USDT: 6, WBTC: 8,
};

function resolveToken(symbol: string): string {
  const upper = symbol.toUpperCase();
  // ETH routes through WETH in Composer
  return TOKEN_ADDRESSES[upper === 'ETH' ? 'WETH' : upper] ?? TOKEN_ADDRESSES.WETH;
}

function toWei(amount: number, token: string): string {
  const decimals = TOKEN_DECIMALS[token.toUpperCase()] ?? 18;
  // Cap at sane demo amounts to avoid overflow
  const capped = Math.min(amount, token.toUpperCase() === 'WBTC' ? 0.01 : 1);
  return BigInt(Math.round(capped * 10 ** decimals)).toString();
}

export interface LiFiResult {
  flowBuilt: boolean;
  flowName: string;
  steps: string[];
  compiled: boolean;
  calldataPreview?: string;
  fromToken: string;
  toToken: string;
  transactionRequest?: {
    to: string;
    data: string;
    value: string;
    chainId: number;
  };
}

export async function buildCrossChainPaymentFlow(
  recipientAddress: string,
  senderAddress?: string,
  fromToken = 'ETH',
  toToken = 'USDC',
  amount = 0.01,
): Promise<LiFiResult> {
  const apiKey = process.env.LIFI_API_KEY;
  const fromAddr = resolveToken(fromToken);
  const toAddr   = resolveToken(toToken);
  const isSameToken = fromAddr === toAddr;

  if (!apiKey) {
    return { flowBuilt: false, flowName: 'cross-chain-payment', steps: [], compiled: false, fromToken, toToken };
  }

  try {
    const sdk = createComposeSdk({
      baseUrl: 'https://ethglobal-composer.li.quest',
      apiKey,
    });

    const builder = sdk.flow(1, {
      name: 'flowpay-remittance',
      inputs: { amountIn: resources.erc20(fromAddr as `0x${string}`, 1) },
    });

    const steps: string[] = [];

    if (!isSameToken) {
      builder.lifi.swap('swap', {
        bind: { amountIn: builder.inputs.amountIn },
        config: { resourceOut: resources.erc20(toAddr as `0x${string}`, 1), slippage: 0.03 },
      });
      steps.push(`Swap ${fromToken.toUpperCase()} → ${toToken.toUpperCase()} via LI.FI aggregator (Ethereum Mainnet)`);
    } else {
      steps.push(`Transfer ${amount} ${toToken.toUpperCase()} (Ethereum Mainnet)`);
    }

    try {
      const signer = (senderAddress || DEMO_SIGNER) as `0x${string}`;
      const weiAmount = toWei(amount, fromToken);
      const result = await builder.compile({
        signer,
        inputs: {
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          amountIn: materialisers.directDeposit({ amount: weiAmount as any }),
        },
        sweepTo: builder.context.sender,
        simulationPolicy: 'allow-revert',
      });

      const compiled = result.status === 'success' || result.status === 'partial';
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const txReq = compiled ? (result as any).transactionRequest as Record<string, string> | undefined : undefined;

      return {
        flowBuilt: true,
        flowName: 'flowpay-remittance',
        steps,
        compiled,
        fromToken,
        toToken,
        calldataPreview: txReq?.data ? `${txReq.data.slice(0, 18)}...` : undefined,
        transactionRequest: txReq?.to && txReq?.data ? {
          to: txReq.to,
          data: txReq.data,
          value: txReq.value ?? '0x0',
          chainId: 1,
        } : undefined,
      };
    } catch {
      return { flowBuilt: true, flowName: 'flowpay-remittance', steps, compiled: false, fromToken, toToken };
    }
  } catch (err) {
    console.error('[LI.FI] Flow build error:', err);
    return { flowBuilt: false, flowName: 'cross-chain-payment', steps: [], compiled: false, fromToken, toToken };
  }
}
