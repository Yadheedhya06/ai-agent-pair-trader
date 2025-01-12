import { PromptAssetMetrics } from "./types";
import { CorrelationResult } from "../../public/types/correlation";

export function generateComparisonPrompt(asset1: PromptAssetMetrics, asset2: PromptAssetMetrics, correlations: CorrelationResult): string {
    return `
  You are analyzing two perpetual contract assets on Binance for Pair Trading: ${asset1.instrumentId} and ${asset2.instrumentId}
  Based on below Stats, Market data, Binance data and Funding Rate of both Assets you have to tell me which Asset suited for Long and which Asset suited for Short in pair trading.
  
  Statistic calculation of Correlations between these two Asset pairs are :
  - Pearson Correlation: ${correlations.pearsonCorrelation}
  - Standard Deviation: ${correlations.stdDeviation}
  - Strength: ${correlations.correlationStrength}ly correlated

===========
  Asset 1 : ${asset1.instrumentId}
  Market Stats for Asset 1:
  - Current Price: $${asset1.currentPrice}
  - Market Cap: $${asset1.marketCap}
  - Fully Diluted Valuation: $${asset1.fullyDilutedValuation}
  - FDV Ratio: ${asset1.fdvRatio}
  - Total Volume: ${asset1.volume}
  - 24h High: $${asset1.high24h}
  - 24h Low: $${asset1.low24h}
  - 24h Price Change: ${asset1.priceChange24h}%
  - Circulating Supply: ${asset1.circulatingSupply}
  - Max Supply: ${asset1.maxSupply}
  - Total Supply: ${asset1.totalSupply}

  Binance Stats for Asset 1:
  - Last Price: $${asset1.lastPrice}
  - 24h Trading Volume: ${asset1.tradingVolume}
  - Last Converted Price: ${asset1.convertedLast}
  - Last Converted Volume: ${asset1.contractVolume}
  - Trust Score: ${asset1.trustScore}

  Funding Rates of Asset 1(from Coinglass):
  - Current funding rate: ${asset1.currentFunding}
  - Funding rate change: ${asset1.FundingChange}
  - High funding rate: ${asset1.HighFunding}
  - Low funding Rate: ${asset1.lowFunding}
==========

==========  
  Asset 2: ${asset2.instrumentId}
    Market Stats for Asset 1:
  - Current Price: $${asset2.currentPrice}
  - Market Cap: $${asset2.marketCap}
  - Fully Diluted Valuation: $${asset2.fullyDilutedValuation}
  - FDV Ratio: ${asset2.fdvRatio}
  - 24h Volume: ${asset2.volume}
  - 24h High: $${asset2.high24h}
  - 24h Low: $${asset2.low24h}
  - 24h Price Change: ${asset2.priceChange24h}%
  - Circulating Supply: ${asset2.circulatingSupply}
  - Max Supply: ${asset2.maxSupply}
  - Total Supply: ${asset2.totalSupply}

  Binance Stats for Asset 2:
  - Last Price: $${asset2.lastPrice}
  - 24h Trading Volume: ${asset2.tradingVolume}
  - Last Converted Price: ${asset2.convertedLast}
  - Last Converted Volume: ${asset2.contractVolume}
  - Trust Score: ${asset2.trustScore}

  Funding Rates of Asset 2(from Coinglass):
  - Current funding rate: ${asset2.currentFunding}
  - Funding rate change: ${asset2.FundingChange}
  - High funding rate: ${asset2.HighFunding}
  - Low funding Rate: ${asset2.lowFunding}
==========
  
  Based on the above metrics, please provide decision:
  1. Which asset is better suited for a long position
  2. Which asset is better suited for a short position
  3. Provide reasoning based on:
        - Market sentiment (e.g., funding rates, token unlocks)
        - Momentum (e.g., price changes, volume)
        - Valuation metrics (e.g., market cap/FDV ratio, trust score)`;
  }