/**
 * Eject.fi — Jupiter V6 API Integration
 * 
 * Used by the Yield Autopilot agent to find the optimal
 * rebalancing routes when moving assets between protocols.
 */

const JUPITER_V6_QUOTE_API = 'https://quote-api.jup.ag/v6/quote';

// Token Mints on Solana Mainnet
export const TOKENS = {
  USDC: 'EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v',
  SOL: 'So11111111111111111111111111111111111111112',
  JUP: 'JUPyiwrYJFskUPiHa7hkeR8VUtAeFoSYbAbdFSvcmMbb',
  mSOL: 'mSoLzYCxHdYgdzU16g5QSh3i5K3z3KZK7ytfqkVmUkw', // Marinade staked SOL
};

export interface JupiterQuote {
  inAmount: string;
  outAmount: string;
  priceImpactPct: string;
  routePlan: any[];
  swapMode: string;
  dataSource: 'live' | 'fallback';
}

/**
 * Fetch an optimal swap quote from Jupiter to calculate 
 * rebalancing slippage and fees.
 */
export async function getJupiterQuote(
  inputMint: string,
  outputMint: string,
  amountLamports: number,
  slippageBps: number = 50 // 0.5%
): Promise<JupiterQuote> {
  try {
    const params = new URLSearchParams({
      inputMint,
      outputMint,
      amount: amountLamports.toString(),
      slippageBps: slippageBps.toString(),
      onlyDirectRoutes: 'false',
    });

    const response = await fetch(`${JUPITER_V6_QUOTE_API}?${params}`);

    if (!response.ok) {
      throw new Error(`Jupiter API returned ${response.status}`);
    }

    const data = await response.json();

    return {
      inAmount: data.inAmount,
      outAmount: data.outAmount,
      priceImpactPct: data.priceImpactPct,
      routePlan: data.routePlan || [],
      swapMode: data.swapMode,
      dataSource: 'live',
    };
  } catch (error) {
    console.warn('[Jupiter] API failed, using fallback:', error);
    
    // Realistic fallback for demo
    return {
      inAmount: amountLamports.toString(),
      outAmount: (amountLamports * 0.995).toFixed(0), // Simulate 0.5% loss
      priceImpactPct: '0.001',
      routePlan: [{ swapInfo: { label: 'Raydium' } }],
      swapMode: 'ExactIn',
      dataSource: 'fallback',
    };
  }
}
