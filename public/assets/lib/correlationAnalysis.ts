import {   CorrelationStrength,
    type PriceDataArray, 
    type CorrelationResult  } from "../../types/correlation";

export class CryptoCorrelationAnalyzer {
  private asset1Prices: PriceDataArray;
  private asset2Prices: PriceDataArray;

  constructor(asset1Prices: PriceDataArray, asset2Prices: PriceDataArray) {
    this.asset1Prices = [...asset1Prices].sort((a, b) => a[0] - b[0]);
    this.asset2Prices = [...asset2Prices].sort((a, b) => a[0] - b[0]);
  
    const timestamps = new Set([
      ...this.asset1Prices.map(p => p[0]),
      ...this.asset2Prices.map(p => p[0])
    ]);
  
    const asset1Map = new Map(this.asset1Prices.map(p => [p[0], p[1]]));
    const asset2Map = new Map(this.asset2Prices.map(p => [p[0], p[1]]));
  
    // Interpolate missing values and create aligned arrays
    const alignedPrices: [PriceDataArray, PriceDataArray] = [[], []];
    
    let lastAsset1Price: number | null = null;
    let lastAsset2Price: number | null = null;
  
    Array.from(timestamps).sort((a, b) => a - b).forEach(timestamp => {
      const price1 = asset1Map.get(timestamp);
      const price2 = asset2Map.get(timestamp);
  
      // Skip if we don't have enough data for interpolation
      if (price1 !== undefined) lastAsset1Price = price1;
      if (price2 !== undefined) lastAsset2Price = price2;
      
      // Only add points when we have both prices (real or interpolated)
      if (lastAsset1Price !== null && lastAsset2Price !== null) {
        alignedPrices[0].push([timestamp, price1 ?? lastAsset1Price]);
        alignedPrices[1].push([timestamp, price2 ?? lastAsset2Price]);
      }
    });
  
    [this.asset1Prices, this.asset2Prices] = alignedPrices;
  
    if (this.asset1Prices.length < 2) {
      throw new Error('Insufficient data points after alignment');
    }
  }

  public analyze(windowSize: number = 30): CorrelationResult {
    const returns1 = this.calculateReturns(this.asset1Prices);
    const returns2 = this.calculateReturns(this.asset2Prices);

    // Calculate Pearson correlation
    const pearsonCorrelation = this.calculatePearsonCorrelation(returns1, returns2);

    // Calculate standard deviation of price ratio
    const ratios = this.asset1Prices.map((data, i) => 
      data[1] / this.asset2Prices[i][1]
    );
    const stdDeviation = this.calculateStdDeviation(ratios);

    return {
      pearsonCorrelation,
      correlationStrength: this.interpretCorrelation(pearsonCorrelation),
      stdDeviation
    };
  }

  private calculateReturns(prices: PriceDataArray): number[] {
    const returns: number[] = [];
    for (let i = 1; i < prices.length; i++) {
      const returnValue = (prices[i][1] - prices[i-1][1]) / prices[i-1][1];
      returns.push(returnValue);
    }
    return returns;
  }

  private calculatePearsonCorrelation(x: number[], y: number[]): number {
    const mean = (arr: number[]) => arr.reduce((sum, val) => sum + val, 0) / arr.length;
    const meanX = mean(x);
    const meanY = mean(y);

    const numerator = x.reduce((sum, xi, i) => 
      sum + (xi - meanX) * (y[i] - meanY), 0);
    
    const denominator = Math.sqrt(
      x.reduce((sum, xi) => sum + Math.pow(xi - meanX, 2), 0) *
      y.reduce((sum, yi) => sum + Math.pow(yi - meanY, 2), 0)
    );

    return numerator / denominator;
  }

  private calculateStdDeviation(values: number[]): number {
    const mean = values.reduce((sum, val) => sum + val, 0) / values.length;
    const squaredDiffs = values.map(val => Math.pow(val - mean, 2));
    return Math.sqrt(squaredDiffs.reduce((sum, val) => sum + val, 0) / values.length);
  }

  private interpretCorrelation(correlation: number): CorrelationStrength {
    const abs = Math.abs(correlation);
    if (abs >= 0.9) return CorrelationStrength.VERY_STRONG;
    if (abs >= 0.85) return CorrelationStrength.STRONG;
    if (abs >= 0.8) return CorrelationStrength.MODERATE;
    if (abs >= 0.3) return CorrelationStrength.WEAK;
    return CorrelationStrength.VERY_WEAK;
  }
}