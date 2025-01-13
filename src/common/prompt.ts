import { PromptAssetMetrics } from "./types";
import { CorrelationResult } from "../../public/types/correlation";

export function promptTemplate(asset1: PromptAssetMetrics, asset2: PromptAssetMetrics, correlations: CorrelationResult): string {
    return `
  You are deciding positions two perpetual contract assets on Binance for Pair Trading: ${asset1.instrumentId} and ${asset2.instrumentId}
  Based on below Stats, Market data, Binance data and Funding Rate of both Assets you have to tell me which Asset suited for Long and which Asset suited for Short in pair trading.
  Give Pearson Correlation and Standard deviation available from stats given to you
  Write Short Remark on what you analysed
  You do not give explanation directly give one line telling which is long position which is short position, Pearson Correlation, Standard Deviation and Remarks
  Example: 
    "Long : BTCUSDT\nShort : ETHUSDT\nPearson Correlation: 0.8\nStandard Deviation: 0.23\nRemarks: High correlation suggests potential mean reversion opportunity. BTC showing relative strength vs ETH with lower volatility. Entry at 2 standard deviations from mean spread.",
    "Long : PERPUSDT\nShort : HFTUSDT\nPearson Correlation: 0.75\nStandard Deviation: 0.31\nRemarks: PERP shows higher trading volume and market cap with positive price momentum. HFT has lower liquidity and declining funding rates.",
    "Long : SOLUSDT\nShort : AVAXUSDT\nPearson Correlation: 0.85\nStandard Deviation: 0.28\nRemarks: SOL has stronger price action with higher 24h volume and lower FDV ratio. AVAX showing weakness in price and funding rates.",
    "Long : LINKUSDT\nShort : ATOMUSDT\nPearson Correlation: 0.72\nStandard Deviation: 0.25\nRemarks: LINK demonstrates better market metrics with higher trust score and trading volume. ATOM facing selling pressure with negative funding.",
    "Long : BNBUSDT\nShort : MATICUSDT\nPearson Correlation: 0.77\nStandard Deviation: 0.21\nRemarks: BNB maintains higher market cap and volume with stable funding rates. MATIC showing declining volume and negative price momentum.",
    "Long : DOGEUSDT\nShort : SHIBUSDT\nPearson Correlation: 0.91\nStandard Deviation: 0.35\nRemarks: DOGE exhibits stronger market fundamentals with higher trading volume and positive funding rates. SHIB facing increased selling pressure.",
    "Long : APTUSDT\nShort : FTMUSDT\nPearson Correlation: 0.68\nStandard Deviation: 0.29\nRemarks: APT shows bullish momentum with increasing volume and positive funding. FTM has weaker market metrics and declining price action.",
    "Long : NEARUSDT\nShort : ONEUSDT\nPearson Correlation: 0.82\nStandard Deviation: 0.27\nRemarks: NEAR demonstrates superior market health with higher volume and stable funding rates. ONE showing weakness in price and volume metrics.",
    "Long : OPUSDT\nShort : ARBUSDT\nPearson Correlation: 0.88\nStandard Deviation: 0.19\nRemarks: OP has stronger market positioning with higher trading volume and positive funding rates. ARB showing relative weakness in price action."
  
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