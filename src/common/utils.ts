import { Content } from "@ai16z/eliza";
import { 
  PromptAssetMetrics,
  MarketData,
  Ticker,
  FundingRateResponse
} from './types';

export class ApiError extends Error {
  constructor(
    message: string,
    public statusCode?: number,
  ) {
    super(message);
    this.name = "ApiError";
  }
}

export const validateSearchQuery = (content: Content): string => {
  const query = typeof content === "string" ? content : content.text;
  if (!query?.trim()) {
    throw new ApiError("Search query is required");
  }
  return query.trim();
};

export const handleApiError = (
  error: unknown,
): { success: false; response: string } => {
  if (error instanceof ApiError) {
    return {
      success: false,
      response: `API Error: ${error.message}`,
    };
  }
  return {
    success: false,
    response: "An unexpected error occurred",
  };
};

export const createRateLimiter = (maxRequests: number, timeWindow: number) => {
  const requests: number[] = [];

  return {
    checkLimit: (): boolean => {
      const now = Date.now();
      const windowStart = now - timeWindow;

      // Remove old requests
      while (requests.length > 0 && requests[0] < windowStart) {
        requests.shift();
      }

      // Check if we're at the limit
      if (requests.length >= maxRequests) {
        return false;
      }

      // Add new request
      requests.push(now);
      return true;
    },
  };
};

export function generateAssetPromptConfig(
  instrumentId: string,
  marketData: MarketData,
  tickerData: Ticker[],
  fundingRate: FundingRateResponse
): PromptAssetMetrics {
  return {
    instrumentId,
    currentPrice: marketData.current_price.usd ?? 'Not Available',
    marketCap: marketData.market_cap.usd ?? 'Not Available',
    fullyDilutedValuation: marketData.fully_diluted_valuation?.usd ?? 'Not Available',
    fdvRatio: marketData.market_cap_fdv_ratio ?? 'Not Available',
    volume: marketData.total_volume.usd ?? 'Not Available',
    high24h: marketData.high_24h.usd ?? 'Not Available',
    low24h: marketData.low_24h.usd ?? 'Not Available',
    priceChange24h: marketData.price_change_24h ?? 'Not Available',
    circulatingSupply: marketData.circulating_supply ?? 'Not Available',
    maxSupply: marketData.max_supply ?? 'Not Available',
    totalSupply: marketData.total_supply ?? 'Not Available',
    lastPrice: tickerData[0]?.last ?? 'Not Available',
    tradingVolume: tickerData[0]?.volume ?? 'Not Available',
    convertedLast: tickerData[0]?.converted_last?.usd ?? 'Not Available',
    contractVolume: tickerData[0]?.converted_volume?.usd ?? 'Not Available',
    trustScore: tickerData[0]?.trust_score === 'yellow' ? 0.5 : 1,
    currentFunding: fundingRate.data[0]?.c ?? 'Not Available',
    FundingChange: fundingRate.data[0] 
      ? (Number(fundingRate.data[0].c) - Number(fundingRate.data[0].o)).toString() 
      : 'Not Available',
    HighFunding: fundingRate.data[0]?.h ?? 'Not Available',
    lowFunding: fundingRate.data[0]?.l ?? 'Not Available'
  };
}


//TODO : Write format code for api calls