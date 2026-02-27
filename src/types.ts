export interface Position {
  tokenAddress: string;
  tokenName: string;
  tokenSymbol: string;
  balance: string;
  currentValueEth: string;
  currentValueUsd: string;
  totalCostEth: string;
  totalBoughtEth: string;
  totalBoughtUsd: string;
  realizedPnlEth: string;
  realizedPnlUsd: string;
  unrealizedPnlEth: string;
  unrealizedPnlUsd: string;
  totalPnlEth: string;
  totalPnlUsd: string;
  totalPnlPercent: number;
}

export interface PositionsResponse {
  vaultAddress: string;
  ethBalance: string; // wei — ETH available to trade
  overallValueEth: string; // wei
  overallValueUsd: string;
  overallPnlEth: string; // wei
  overallPnlUsd: string;
  overallPnlPercent: number;
  positions: Position[];
}

export interface StreamEvent {
  type: string;
  action?: string;
  // token info
  tokenName?: string;
  tokenSymbol?: string;
  tokenAddress?: string;
  // trade info — SSE schema is undocumented, field names may vary
  side?: 'buy' | 'sell';
  ethAmount?: string; // ETH value of trade
  tokenAmount?: string; // token units traded
  usdValue?: string; // fallback USD value field
  effectivePriceUsd?: string; // price per token in USD
  ethPriceUsd?: number; // ETH price at time of trade
  // metadata
  reasoning?: string;
  txHash?: string;
  transactionHash?: string; // alternative field name
  logId?: number;
  strategyId?: string;
  [key: string]: unknown;
}
