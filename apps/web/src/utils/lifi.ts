/**
 * Eject.fi — LI.FI Cross-Chain Bridge v3.0
 * 
 * Full integration with LI.FI REST API for the Dev3pack Hackathon.
 * 
 * Endpoints used:
 *  - /v1/quote          — Single optimal route quote
 *  - /v1/advanced/routes — Multi-route comparison
 *  - /v1/tokens         — Solana token discovery
 *  - /v1/chains         — Chain info & ecosystem
 *  - /v1/tools          — Available bridges & DEXs
 *  - /v1/status         — Transaction status tracking
 */

// Chain & Token Config
const LIFI_API = 'https://li.quest/v1';
const BASE_CHAIN_ID = 8453;
const SOLANA_CHAIN_ID = 1151111081099710;
const USDC_BASE = '0x833589fCD6eDb6E08f4c7C32D4f71b54bdA02913';
const NATIVE_SOL = '11111111111111111111111111111111';

export interface BridgeQuote {
  route: string;
  fromChain: string;
  toChain: string;
  fromToken: string;
  toToken: string;
  fromAmount: string;
  estimatedReceive: string;
  estimatedFeeUSD: string;
  executionTime: number;
  solver: string;
  steps: BridgeStep[];
  dataSource: 'live' | 'fallback';
  transactionRequest?: any;
}

export interface BridgeStep {
  tool: string;
  type: string;
  fromToken: string;
  toToken: string;
  fromChain: string;
  toChain: string;
}

/**
 * Fetches a real bridge quote from LI.FI REST API.
 * Falls back to mock data if the API is unreachable.
 */
export async function getSolanaToBaseQuote(
  amount: string,
  fromAddress: string,
  toAddress: string
): Promise<BridgeQuote> {
  try {
    const params = new URLSearchParams({
      fromChain: SOLANA_CHAIN_ID.toString(),
      toChain: BASE_CHAIN_ID.toString(),
      fromToken: NATIVE_SOL,
      toToken: USDC_BASE,
      fromAmount: amount,
      fromAddress: fromAddress || '11111111111111111111111111111111',
      toAddress: toAddress || '0x0000000000000000000000000000000000000000',
      slippage: '0.005',
      integrator: 'eject_fi',
    });

    const response = await fetch(`${LIFI_API}/quote?${params}`, {
      method: 'GET',
      headers: {
        'Accept': 'application/json',
        'x-lifi-integrator': 'eject_fi',
      },
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.warn('[LI.FI] API error:', response.status, errorText);
      throw new Error(`LI.FI API returned ${response.status}`);
    }

    const data = await response.json();

    // Parse the LI.FI response format
    const estimate = data.estimate || {};
    const toolName = data.toolDetails?.name || data.tool || 'LI.FI';
    const steps: BridgeStep[] = (data.includedSteps || []).map((step: any) => ({
      tool: step.toolDetails?.name || step.tool || 'Unknown',
      type: step.type || 'cross',
      fromToken: step.action?.fromToken?.symbol || 'USDC',
      toToken: step.action?.toToken?.symbol || 'SOL',
      fromChain: step.action?.fromChainId === BASE_CHAIN_ID ? 'Base' : 'Unknown',
      toChain: step.action?.toChainId === SOLANA_CHAIN_ID ? 'Solana' : 'Unknown',
    }));

    // Calculate estimated receive amount
    const toAmount = estimate.toAmount || estimate.toAmountMin || '0';
    const toDecimals = data.action?.toToken?.decimals || 9;
    const receiveHuman = (parseFloat(toAmount) / Math.pow(10, toDecimals)).toFixed(6);

    // Calculate fee in USD
    const feeCosts = estimate.feeCosts || [];
    const totalFeeUSD = feeCosts.reduce((sum: number, fee: any) => 
      sum + parseFloat(fee.amountUSD || '0'), 0
    ).toFixed(2);

    return {
      route: `${toolName} via LI.FI`,
      fromChain: 'Solana',
      toChain: 'Base',
      fromToken: 'SOL',
      toToken: 'USDC',
      fromAmount: (parseFloat(amount) / 1e9).toFixed(2), // Solana uses 9 decimals
      estimatedReceive: receiveHuman,
      estimatedFeeUSD: totalFeeUSD || '0.45',
      executionTime: estimate.executionDuration || 30,
      solver: toolName,
      steps,
      dataSource: 'live',
      transactionRequest: data.transactionRequest,
    };
  } catch (error) {
    console.warn('[LI.FI] Using fallback quote:', error);
    return getMockQuote(amount);
  }
}

/**
 * Gets available bridge routes (for UI display)
 */
export async function getAvailableRoutes(): Promise<{
  bridges: string[];
  exchanges: string[];
}> {
  try {
    const [bridgesRes, exchangesRes] = await Promise.all([
      fetch(`${LIFI_API}/tools?chains=${BASE_CHAIN_ID},${SOLANA_CHAIN_ID}`),
      fetch(`${LIFI_API}/tools?chains=${SOLANA_CHAIN_ID}`),
    ]);

    const bridges = bridgesRes.ok 
      ? (await bridgesRes.json()).bridges?.map((b: any) => b.key) || []
      : ['mayan', 'allbridge', 'debridge'];
    
    const exchanges = exchangesRes.ok
      ? (await exchangesRes.json()).exchanges?.map((e: any) => e.key) || []
      : ['jupiter', 'raydium'];

    return { bridges, exchanges };
  } catch {
    return {
      bridges: ['mayan', 'allbridge', 'debridge'],
      exchanges: ['jupiter', 'raydium'],
    };
  }
}

/**
 * Checks bridge transaction status
 */
export async function checkBridgeStatus(txHash: string, fromChainId: number = BASE_CHAIN_ID): Promise<{
  status: string;
  substatus: string;
  receiving?: { amount: string; token: string };
}> {
  try {
    const response = await fetch(
      `${LIFI_API}/status?txHash=${txHash}&bridge=mayan&fromChain=${fromChainId}&toChain=${SOLANA_CHAIN_ID}`
    );
    if (!response.ok) throw new Error('Status check failed');
    
    const data = await response.json();
    return {
      status: data.status || 'PENDING',
      substatus: data.substatus || 'WAIT_SOURCE_CONFIRMATIONS',
      receiving: data.receiving ? {
        amount: data.receiving.amount,
        token: data.receiving.token?.symbol || 'SOL',
      } : undefined,
    };
  } catch {
    return { status: 'UNKNOWN', substatus: 'CHECK_EXPLORER' };
  }
}

/**
 * Fetches multiple route options via LI.FI /advanced/routes.
 * Allows the Sentinel AI to compare routes and pick the best one.
 */
export async function getMultipleRoutes(
  fromAmount: string,
  fromAddress: string,
  toAddress: string
): Promise<{ routes: BridgeQuote[]; recommended: number }> {
  try {
    const body = {
      fromChainId: SOLANA_CHAIN_ID,
      toChainId: BASE_CHAIN_ID,
      fromTokenAddress: NATIVE_SOL,
      toTokenAddress: USDC_BASE,
      fromAmount,
      fromAddress: fromAddress || '11111111111111111111111111111111',
      toAddress: toAddress || '0x0000000000000000000000000000000000000000',
      options: {
        slippage: 0.005,
        integrator: 'eject_fi',
        order: 'RECOMMENDED',
      },
    };

    const response = await fetch(`${LIFI_API}/advanced/routes`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-lifi-integrator': 'eject_fi',
      },
      body: JSON.stringify(body),
    });

    if (!response.ok) throw new Error(`Routes API returned ${response.status}`);

    const data = await response.json();
    const routes: BridgeQuote[] = (data.routes || []).slice(0, 3).map((route: any) => {
      const step = route.steps?.[0] || {};
      const estimate = step.estimate || {};
      const toDecimals = step.action?.toToken?.decimals || 6;
      return {
        route: `${step.toolDetails?.name || step.tool || 'LI.FI'} via LI.FI`,
        fromChain: 'Solana',
        toChain: 'Base',
        fromToken: 'SOL',
        toToken: 'USDC',
        fromAmount: (parseFloat(fromAmount) / 1e9).toFixed(2),
        estimatedReceive: (parseFloat(estimate.toAmount || '0') / Math.pow(10, toDecimals)).toFixed(2),
        estimatedFeeUSD: (estimate.feeCosts || []).reduce((s: number, f: any) => s + parseFloat(f.amountUSD || '0'), 0).toFixed(2) || '0.50',
        executionTime: estimate.executionDuration || 30,
        solver: step.toolDetails?.name || step.tool || 'LI.FI',
        steps: (route.steps || []).map((s: any) => ({
          tool: s.toolDetails?.name || s.tool || 'Unknown',
          type: s.type || 'cross',
          fromToken: s.action?.fromToken?.symbol || 'SOL',
          toToken: s.action?.toToken?.symbol || 'USDC',
          fromChain: 'Solana',
          toChain: 'Base',
        })),
        dataSource: 'live' as const,
      };
    });

    return { routes, recommended: 0 };
  } catch (error) {
    console.warn('[LI.FI] Multi-route fallback:', error);
    return {
      routes: [getMockQuote(fromAmount)],
      recommended: 0,
    };
  }
}

/**
 * Fetches available Solana tokens from LI.FI.
 * Shows the breadth of Solana ecosystem coverage.
 */
export async function getSolanaTokens(): Promise<{ count: number; popular: string[] }> {
  try {
    const response = await fetch(
      `${LIFI_API}/tokens?chains=${SOLANA_CHAIN_ID}`,
      { headers: { 'x-lifi-integrator': 'eject_fi' } }
    );
    if (!response.ok) throw new Error('Token fetch failed');
    
    const data = await response.json();
    const tokens = data.tokens?.[SOLANA_CHAIN_ID.toString()] || [];
    const popular = tokens.slice(0, 8).map((t: any) => t.symbol);
    return { count: tokens.length, popular };
  } catch {
    return { count: 200, popular: ['SOL', 'USDC', 'USDT', 'JUP', 'RAY', 'mSOL', 'BONK', 'WIF'] };
  }
}

/**
 * Gets Solana chain information from LI.FI.
 */
export async function getSolanaChainInfo(): Promise<{ 
  name: string; nativeToken: string; bridgeCount: number; dexCount: number 
}> {
  try {
    const response = await fetch(
      `${LIFI_API}/chains?chainTypes=SVM`,
      { headers: { 'x-lifi-integrator': 'eject_fi' } }
    );
    if (!response.ok) throw new Error('Chain info failed');
    
    const data = await response.json();
    const solana = (data.chains || []).find((c: any) => c.id === SOLANA_CHAIN_ID);
    
    // Get tools count
    const toolsRes = await fetch(`${LIFI_API}/tools?chains=${SOLANA_CHAIN_ID}`);
    const toolsData = toolsRes.ok ? await toolsRes.json() : { bridges: [], exchanges: [] };
    
    return {
      name: solana?.name || 'Solana',
      nativeToken: solana?.nativeToken?.symbol || 'SOL',
      bridgeCount: toolsData.bridges?.length || 5,
      dexCount: toolsData.exchanges?.length || 4,
    };
  } catch {
    return { name: 'Solana', nativeToken: 'SOL', bridgeCount: 5, dexCount: 4 };
  }
}

// --- Fallback ---

// Cached SOL price from the last successful Pyth fetch (updated by sentinel.ts)
let _cachedSolPrice = 0;
export function updateCachedSolPrice(price: number) {
  if (price > 0) _cachedSolPrice = price;
}

function getMockQuote(amount: string): BridgeQuote {
  const solAmount = parseFloat(amount) / 1e9;
  // Use cached Pyth price if available, otherwise indicate unknown
  const solPrice = _cachedSolPrice > 0 ? _cachedSolPrice : 0;
  const estimatedUsdc = solPrice > 0 
    ? (solAmount * solPrice * 0.995).toFixed(2) 
    : '—';

  return {
    route: 'Mayan Swift via LI.FI',
    fromChain: 'Solana',
    toChain: 'Base',
    fromToken: 'SOL',
    toToken: 'USDC',
    fromAmount: solAmount.toFixed(2),
    estimatedReceive: estimatedUsdc,
    estimatedFeeUSD: '0.45',
    executionTime: 12,
    solver: 'Mayan Swift',
    steps: [
      { tool: 'Mayan Swift', type: 'cross', fromToken: 'SOL', toToken: 'USDC', fromChain: 'Solana', toChain: 'Base' },
    ],
    dataSource: 'fallback',
  };
}
