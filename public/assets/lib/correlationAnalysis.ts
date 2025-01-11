import {   CorrelationStrength,
    type PriceDataArray, 
    type CorrelationResult  } from "../../types/correlation";

export class CryptoCorrelationAnalyzer {
  private asset1Prices: PriceDataArray;
  private asset2Prices: PriceDataArray;

  constructor(asset1Prices: PriceDataArray, asset2Prices: PriceDataArray) {
    if (asset1Prices.length !== asset2Prices.length) {
      throw new Error('Price arrays must have the same length');
    }
    
    this.asset1Prices = [...asset1Prices].sort((a, b) => a[0] - b[0]);
    this.asset2Prices = [...asset2Prices].sort((a, b) => a[0] - b[0]);
    
    const timestampsMismatch = this.asset1Prices.some((price, index) => 
      price[0] !== this.asset2Prices[index][0]
    );
    if (timestampsMismatch) {
      throw new Error('Timestamps must match between assets');
    }
  }

  public analyze(windowSize: number = 30): CorrelationResult {
    // Calculate returns (percentage changes)
    const returns1 = this.calculateReturns(this.asset1Prices);
    const returns2 = this.calculateReturns(this.asset2Prices);

    // Calculate Pearson correlation
    const pearsonCorrelation = this.calculatePearsonCorrelation(returns1, returns2);

    // Calculate rolling correlations
    const rollingCorrelations = this.calculateRollingCorrelations(returns1, returns2, windowSize);

    // Calculate current price ratio
    const priceRatio = this.asset1Prices[this.asset1Prices.length - 1][1] / 
                      this.asset2Prices[this.asset2Prices.length - 1][1];

    // Calculate standard deviation of price ratio
    const ratios = this.asset1Prices.map((data, i) => 
      data[1] / this.asset2Prices[i][1]
    );
    const stdDeviation = this.calculateStdDeviation(ratios);

    return {
      pearsonCorrelation,
      correlationStrength: this.interpretCorrelation(pearsonCorrelation),
      rollingCorrelations,
      priceRatio,
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

  private calculateRollingCorrelations(
    returns1: number[], 
    returns2: number[], 
    windowSize: number
  ): Array<{timestamp: number, correlation: number}> {
    const rollingCorrelations = [];

    for (let i = windowSize; i < returns1.length; i++) {
      const window1 = returns1.slice(i - windowSize, i);
      const window2 = returns2.slice(i - windowSize, i);
      const correlation = this.calculatePearsonCorrelation(window1, window2);

      rollingCorrelations.push({
        timestamp: this.asset1Prices[i][0],
        correlation
      });
    }

    return rollingCorrelations;
  }

  private calculateStdDeviation(values: number[]): number {
    const mean = values.reduce((sum, val) => sum + val, 0) / values.length;
    const squaredDiffs = values.map(val => Math.pow(val - mean, 2));
    return Math.sqrt(squaredDiffs.reduce((sum, val) => sum + val, 0) / values.length);
  }

  private interpretCorrelation(correlation: number): CorrelationStrength {
    const abs = Math.abs(correlation);
    if (abs >= 0.9) return CorrelationStrength.VERY_STRONG;
    if (abs >= 0.7) return CorrelationStrength.STRONG;
    if (abs >= 0.5) return CorrelationStrength.MODERATE;
    if (abs >= 0.3) return CorrelationStrength.WEAK;
    return CorrelationStrength.VERY_WEAK;
  }
}