import { PromptAssetMetrics } from "./types";
import { CorrelationResult } from "../../public/types/correlation";

function getMainHeading(asset1: PromptAssetMetrics, asset2: PromptAssetMetrics): string {
  const now = new Date();
  return `You are deciding positions two perpetual contract assets on Binance for Pair Trading: ${asset1.instrumentId} and ${asset2.instrumentId} on ${now.toLocaleDateString()} now. Current date time is ${now.toLocaleTimeString()}
  Based on below Stats, Market data, Binance data and Funding Rate of both Assets you have to tell me which Asset suited for Long and which Asset suited for Short in pair trading.`;
}

function getExamples(): string {
  return `\nGive Output in FORMAT: (THESE ARE JUST FOR EXAMPLES TO TELL YOU FORMAT)\n
  Only mention base assets in response dont give quote asset or whole trade name\n
    "Long : BTC\nShort : ETH\nPearson Correlation: 0.8\nStandard Deviation: 0.23\nRemarks: Strong correlation indicates mean reversion potential. BTC shows higher market cap, lower volatility and positive funding rates. ETH has upcoming token unlocks of 2.3M tokens valued at $4.2B (3.2% of mcap) suggesting selling pressure."\n\n
    "Long : PERP\nShort : HFT\nPearson Correlation: 0.75\nStandard Deviation: 0.31\nRemarks: PERP exhibits 2x higher trading volume, positive funding rate change of 0.01% and stronger market depth on Binance. HFT shows declining volume with negative funding rates and lower trust score."\n\n
    "Long : LINK\nShort : ATOM\nPearson Correlation: 0.83\nStandard Deviation: 0.28\nRemarks: LINK demonstrates bullish momentum with 15% 24h gains, increasing funding rates from 0.01% to 0.03%. ATOM faces bearish pressure with major token unlock of 25M tokens (8% of mcap) in next 30 days and declining Binance volume."\n\n
    "Long : SOL\nShort : AVAX\nPearson Correlation: 0.79\nStandard Deviation: 0.25\nRemarks: SOL shows strong fundamentals with 30% higher market cap, increasing funding rates and 2x Binance volume. AVAX exhibits bearish divergence with negative price momentum, upcoming unlock events and lower trust score."\n\n
    "Long : MATIC\nShort : FTM\nPearson Correlation: 0.77\nStandard Deviation: 0.27\nRemarks: MATIC demonstrates relative strength with positive funding rate change of 0.02%, higher Binance liquidity and no imminent unlocks. FTM faces selling pressure from 50M token unlock (4.5% of mcap) and declining market metrics."\n\n`;
}

function getCorrelationStats(correlations: CorrelationResult): string {
  return `Statistic calculation of Correlations between these two Asset pairs are:
  - Pearson Correlation: ${correlations.pearsonCorrelation}
  - Standard Deviation: ${correlations.stdDeviation}
  - Strength: ${correlations.correlationStrength}ly correlated`;
}

function getMarketStats(asset: PromptAssetMetrics): string {
  const stats: string[] = [];
  
  if (asset.currentPrice) stats.push(`- Current Price: $${asset.currentPrice}`);
  if (asset.marketCap) stats.push(`- Market Cap: $${asset.marketCap}`);
  if (asset.fullyDilutedValuation) stats.push(`- Fully Diluted Valuation: $${asset.fullyDilutedValuation}`);
  if (asset.fdvRatio) stats.push(`- FDV Ratio: ${asset.fdvRatio}`);
  if (asset.volume) stats.push(`- Total Volume: ${asset.volume}`);
  if (asset.high24h) stats.push(`- 24h High: $${asset.high24h}`);
  if (asset.low24h) stats.push(`- 24h Low: $${asset.low24h}`);
  if (asset.priceChange24h) stats.push(`- 24h Price Change: ${asset.priceChange24h}%`);
  if (asset.circulatingSupply) stats.push(`- Circulating Supply: ${asset.circulatingSupply}`);
  if (asset.maxSupply) stats.push(`- Max Supply: ${asset.maxSupply}`);
  if (asset.totalSupply) stats.push(`- Total Supply: ${asset.totalSupply}`);

  return stats.length ? `Market Stats for ${asset.instrumentId}:\n${stats.join('\n')}` : '';
}

function getBinanceStats(asset: PromptAssetMetrics): string {
  const stats: string[] = [];

  if (asset.lastPrice) stats.push(`- Last Price: $${asset.lastPrice}`);
  if (asset.tradingVolume) stats.push(`- 24h Trading Volume: ${asset.tradingVolume}`);
  if (asset.convertedLast) stats.push(`- Last Converted Price: ${asset.convertedLast}`);
  if (asset.contractVolume) stats.push(`- Last Converted Volume: ${asset.contractVolume}`);
  if (asset.trustScore) stats.push(`- Trust Score: ${asset.trustScore}`);

  return stats.length ? `Binance Stats for ${asset.instrumentId}:\n${stats.join('\n')}` : '';
}

function getFundingRates(asset: PromptAssetMetrics): string {
  const rates: string[] = [];

  if (asset.currentFunding) rates.push(`- Current funding rate: ${asset.currentFunding}`);
  if (asset.FundingChange) rates.push(`- Funding rate change: ${asset.FundingChange}`);
  if (asset.HighFunding) rates.push(`- High funding rate: ${asset.HighFunding}`);
  if (asset.lowFunding) rates.push(`- Low funding Rate: ${asset.lowFunding}`);

  return rates.length ? `Funding Rates (from Coinglass)for ${asset.instrumentId}:\n${rates.join('\n')}` : '';
}


function getTokenUnlocks(asset: PromptAssetMetrics): string {
  if (!asset.tokenUnlock?.length) return '';

  const unlocks = asset.tokenUnlock.map(unlock => {
    const details: string[] = [];
    details.push(`- Unlock Date: ${unlock.unlockDate}`);
    if (unlock.cliffUnlocks) {
      details.push(`- Cliff Amount: ${unlock.cliffUnlocks.cliffAmount} at valued $${unlock.cliffUnlocks.cliffValue}`);
      details.push(`- Value to Market Cap: ${unlock.cliffUnlocks.valueToMarketCap}%`);
    }
    return details.join('\n');
  });

  return `Token Unlocks for ${asset.instrumentId}:\n${unlocks.join('\n\n')}`;
}

function getAssetSection(asset: PromptAssetMetrics, assetNumber: number): string {
  const sections: string[] = [`==========\nAsset ${assetNumber}: ${asset.instrumentId}`];

  const marketStats = getMarketStats(asset);
  const binanceStats = getBinanceStats(asset);
  const fundingRates = getFundingRates(asset);
  const tokenUnlocks = getTokenUnlocks(asset);

  if (marketStats) sections.push(marketStats);
  if (binanceStats) sections.push(binanceStats);
  if (fundingRates) sections.push(fundingRates);
  if (tokenUnlocks) sections.push(tokenUnlocks);

  sections.push("==========");

  return sections.join('\n\n');
}

export function promptTemplate(
  asset1: PromptAssetMetrics, 
  asset2: PromptAssetMetrics, 
  correlations: CorrelationResult
): string {
  const sections = [
    getMainHeading(asset1, asset2),
    getCorrelationStats(correlations),
    getExamples(),
    getAssetSection(asset1, 1),
    getAssetSection(asset2, 2),
    `Based on the above metrics, please provide decision:
    1. Which asset is better suited for a long position
    2. Which asset is better suited for a short position
    3. Provide reasoning based on:
          - Market sentiment (e.g., funding rates, token unlocks)
          - Momentum (e.g., price changes, volume)
          - Valuation metrics (e.g., market cap/FDV ratio, trust score)`
  ];

  return sections.join('\n\n');
}