import { PromptAssetMetrics } from "./types";
import { CorrelationResult } from "../../public/types/correlation";

function getMainHeading(asset1: PromptAssetMetrics, asset2: PromptAssetMetrics): string {
  return `You are deciding positions two perpetual contract assets on Binance for Pair Trading: ${asset1.instrumentId} and ${asset2.instrumentId}
  Based on below Stats, Market data, Binance data and Funding Rate of both Assets you have to tell me which Asset suited for Long and which Asset suited for Short in pair trading.`;
}

function getExamples(): string {
  return `Example: 
    "Long : BTCUSDT\nShort : ETHUSDT\nPearson Correlation: 0.8\nStandard Deviation: 0.23\nRemarks: High correlation suggests potential mean reversion opportunity. BTC showing relative strength vs ETH with lower volatility. Entry at 2 standard deviations from mean spread.",
    "Long : PERPUSDT\nShort : HFTUSDT\nPearson Correlation: 0.75\nStandard Deviation: 0.31\nRemarks: PERP shows higher trading volume and market cap with positive price momentum. HFT has lower liquidity and declining funding rates."`;
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

  return stats.length ? `Market Stats:\n${stats.join('\n')}` : '';
}

function getBinanceStats(asset: PromptAssetMetrics): string {
  const stats: string[] = [];

  if (asset.lastPrice) stats.push(`- Last Price: $${asset.lastPrice}`);
  if (asset.tradingVolume) stats.push(`- 24h Trading Volume: ${asset.tradingVolume}`);
  if (asset.convertedLast) stats.push(`- Last Converted Price: ${asset.convertedLast}`);
  if (asset.contractVolume) stats.push(`- Last Converted Volume: ${asset.contractVolume}`);
  if (asset.trustScore) stats.push(`- Trust Score: ${asset.trustScore}`);

  return stats.length ? `Binance Stats:\n${stats.join('\n')}` : '';
}

function getFundingRates(asset: PromptAssetMetrics): string {
  const rates: string[] = [];

  if (asset.currentFunding) rates.push(`- Current funding rate: ${asset.currentFunding}`);
  if (asset.FundingChange) rates.push(`- Funding rate change: ${asset.FundingChange}`);
  if (asset.HighFunding) rates.push(`- High funding rate: ${asset.HighFunding}`);
  if (asset.lowFunding) rates.push(`- Low funding Rate: ${asset.lowFunding}`);

  return rates.length ? `Funding Rates (from Coinglass):\n${rates.join('\n')}` : '';
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

  return `Token Unlocks:\n${unlocks.join('\n\n')}`;
}

function getAssetSection(asset: PromptAssetMetrics, assetNumber: number): string {
  const sections: string[] = [`Asset ${assetNumber}: ${asset.instrumentId}`];

  const marketStats = getMarketStats(asset);
  const binanceStats = getBinanceStats(asset);
  const fundingRates = getFundingRates(asset);
  const tokenUnlocks = getTokenUnlocks(asset);

  if (marketStats) sections.push(marketStats);
  if (binanceStats) sections.push(binanceStats);
  if (fundingRates) sections.push(fundingRates);
  if (tokenUnlocks) sections.push(tokenUnlocks);

  return sections.join('\n\n');
}

export function promptTemplate(
  asset1: PromptAssetMetrics, 
  asset2: PromptAssetMetrics, 
  correlations: CorrelationResult
): string {
  const sections = [
    getMainHeading(asset1, asset2),
    getExamples(),
    getCorrelationStats(correlations),
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