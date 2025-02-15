import { Content } from "@ai16z/eliza";
import { 
  PromptAssetMetrics,
  MarketData,
  Ticker,
  FundingRateResponse
} from './types';
import { AxiosError } from 'axios'
import {
  stringToUuid,
  type IDatabaseAdapter,
} from "@ai16z/eliza";
import { UnlockEvent } from "../../public/types/tokenomist";

export class ApiError extends Error {
  constructor(
    message: string,
    public statusCode?: number,
  ) {
    super(message);
    this.name = "ApiError";
  }
}

export const getMessageFromError = (e: unknown) => {
  return e instanceof AxiosError
    ? e.response?.data
    : e instanceof Error
      ? e.message
      : e
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
  fundingRate: FundingRateResponse,
  tokenUnlock:  UnlockEvent[] | null,
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
    lowFunding: fundingRate.data[0]?.l ?? 'Not Available',
    tokenUnlock: tokenUnlock
  };
}

export const minimalDatabaseAdapter: IDatabaseAdapter = {
  db: null,
  init: async () => {},
  close: async () => {},
  getAccountById: async () => null,
  createAccount: async () => true,
  getMemories: async () => [],
  getMemoryById: async () => null,
  getMemoriesByRoomIds: async () => [],
  getCachedEmbeddings: async () => [],
  searchMemories: async () => [],
  searchMemoriesByEmbedding: async () => [],
  createMemory: async () => {},
  removeMemory: async () => {},
  removeAllMemories: async () => {},
  countMemories: async () => 0,
  log: async () => {},
  getActorDetails: async () => [],
  updateGoalStatus: async () => {},
  getGoals: async () => [],
  updateGoal: async () => {},
  createGoal: async () => {},
  removeGoal: async () => {},
  removeAllGoals: async () => {},

  getRoom: async () =>
    stringToUuid(
      "mock-room-id",
    ) as `${string}-${string}-${string}-${string}-${string}`,
  createRoom: async () =>
    stringToUuid(
      "mock-room-id",
    ) as `${string}-${string}-${string}-${string}-${string}`,
  removeRoom: async () => {},
  getRoomsForParticipant: async () => [],
  getRoomsForParticipants: async () => [],
  addParticipant: async () => true,
  removeParticipant: async () => true,
  getParticipantsForAccount: async () => [],
  getParticipantsForRoom: async () => [],
  getParticipantUserState: async () => "FOLLOWED",
  setParticipantUserState: async () => {},
  createRelationship: async () => true,
  getRelationship: async () => null,
  getRelationships: async () => [],
};

export class CompatibleCacheAdapter {
  private data = new Map<string, string>();

  async get<T = unknown>(key: string): Promise<T | undefined> {
    const value = this.data.get(key);
    return (value ? JSON.parse(value) : undefined) as T;
  }
  async set<T>(key: string, value: T): Promise<void> {
    this.data.set(key, JSON.stringify(value));
  }
  async delete(key: string): Promise<void> {
    this.data.delete(key);
  }
}
//TODO : Write format code for api calls