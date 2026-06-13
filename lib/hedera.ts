import {
  Client,
  AccountId,
  PrivateKey,
  TransferTransaction,
  Hbar,
  TopicCreateTransaction,
  TopicMessageSubmitTransaction,
  TopicId,
} from '@hashgraph/sdk';

let hederaClient: Client | null = null;
let cachedTopicId: string | null = null;

function getClient(): Client {
  if (hederaClient) return hederaClient;

  const accountId = process.env.HEDERA_ACCOUNT_ID;
  const privateKey = process.env.HEDERA_PRIVATE_KEY;
  if (!accountId || !privateKey) throw new Error('HEDERA_ACCOUNT_ID and HEDERA_PRIVATE_KEY must be set');

  hederaClient = Client.forTestnet();
  hederaClient.setOperator(
    AccountId.fromString(accountId),
    PrivateKey.fromStringECDSA(privateKey)
  );
  return hederaClient;
}

async function getTopicId(): Promise<string> {
  if (cachedTopicId) return cachedTopicId;
  if (process.env.HEDERA_TOPIC_ID) {
    cachedTopicId = process.env.HEDERA_TOPIC_ID;
    return cachedTopicId;
  }

  const client = getClient();
  const txResponse = await new TopicCreateTransaction()
    .setTopicMemo('FlowPay — cross-chain payment audit trail')
    .execute(client);

  const receipt = await txResponse.getReceipt(client);
  cachedTopicId = receipt.topicId!.toString();
  console.log('[Hedera] Created HCS topic:', cachedTopicId);
  return cachedTopicId;
}

export interface HCSResult {
  topicId: string;
  sequenceNumber: string;
  explorerUrl: string;
}

export interface PaymentResult {
  transactionId: string;
  amount: string;
  explorerUrl: string;
}

export async function recordPaymentOnChain(
  data: object,
  status: 'SUCCESS' | 'ROUTING_FAILED' | 'PAYMENT_FAILED' = 'SUCCESS',
): Promise<HCSResult> {
  const client = getClient();
  const topicId = await getTopicId();

  const message = JSON.stringify({
    ...data,
    status,
    timestamp: new Date().toISOString(),
    app: 'FlowPay',
  });

  const txResponse = await new TopicMessageSubmitTransaction()
    .setTopicId(TopicId.fromString(topicId))
    .setMessage(message)
    .execute(client);

  const receipt = await txResponse.getReceipt(client);

  return {
    topicId,
    sequenceNumber: receipt.topicSequenceNumber!.toString(),
    explorerUrl: `https://hashscan.io/testnet/topic/${topicId}`,
  };
}

export async function executeHbarPayment(
  memo: string,
  options?: { recipient?: string | null; amount?: number; token?: string }
): Promise<PaymentResult> {
  const client = getClient();
  const operatorId = process.env.HEDERA_ACCOUNT_ID!;

  // Use parsed recipient if it's a valid Hedera account ID, else fall back to demo account
  const recipientId = options?.recipient ?? process.env.HEDERA_RECIPIENT_ID ?? '0.0.98';

  // If the user is sending HBAR, use the parsed amount (capped at 1 HBAR for testnet safety)
  const isHbar = options?.token?.toUpperCase() === 'HBAR';
  const hbarAmount = isHbar ? Math.min(options!.amount!, 1) : 0.001;

  const txResponse = await new TransferTransaction()
    .addHbarTransfer(AccountId.fromString(operatorId), new Hbar(-hbarAmount))
    .addHbarTransfer(AccountId.fromString(recipientId), new Hbar(hbarAmount))
    .setTransactionMemo(memo.substring(0, 100))
    .execute(client);

  await txResponse.getReceipt(client);
  const txId = txResponse.transactionId.toString();

  return {
    transactionId: txId,
    amount: `${hbarAmount} HBAR`,
    explorerUrl: `https://hashscan.io/testnet/transaction/${txId}`,
  };
}
