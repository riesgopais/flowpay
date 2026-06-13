import { createComposeSdk, resources, materialisers } from '@lifi/composer-sdk';

const WETH = '0xC02aaA39b223FE8D0A0e5C4F27eAD9083C756Cc2';
const USDC = '0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48';
const DEMO_SIGNER = '0x742d35Cc6634C0532925a3b844Bc454e4438f44e';

export interface LiFiResult {
  flowBuilt: boolean;
  flowName: string;
  steps: string[];
  compiled: boolean;
  calldataPreview?: string;
}

export async function buildCrossChainPaymentFlow(
  recipientAddress: string
): Promise<LiFiResult> {
  const apiKey = process.env.LIFI_API_KEY;
  if (!apiKey) {
    return { flowBuilt: false, flowName: 'cross-chain-payment', steps: [], compiled: false };
  }

  try {
    const sdk = createComposeSdk({
      baseUrl: 'https://ethglobal-composer.li.quest',
      apiKey,
    });

    const builder = sdk.flow(1, {
      name: 'flowpay-remittance',
      inputs: { amountIn: resources.erc20(WETH, 1) },
    });

    builder.lifi.swap('swap', {
      bind: { amountIn: builder.inputs.amountIn },
      config: { resourceOut: resources.erc20(USDC, 1), slippage: 0.03 },
    });

    const steps = ['Swap WETH → USDC via LI.FI aggregator (Ethereum Mainnet)'];

    try {
      const signer = (recipientAddress || DEMO_SIGNER) as `0x${string}`;
      const result = await builder.compile({
        signer,
        inputs: {
          amountIn: materialisers.directDeposit({ amount: '10000000000000000' }),
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
        calldataPreview: txReq?.data ? `${txReq.data.slice(0, 18)}...` : undefined,
      };
    } catch {
      return { flowBuilt: true, flowName: 'flowpay-remittance', steps, compiled: false };
    }
  } catch (err) {
    console.error('[LI.FI] Flow build error:', err);
    return { flowBuilt: false, flowName: 'cross-chain-payment', steps: [], compiled: false };
  }
}
