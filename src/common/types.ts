import { z } from "zod";

export const MarketDataSchema = z.object({
  current_price: z.object({
    usd: z.number(),
  }),
  market_cap: z.object({
    usd: z.number(),
  }),
  fully_diluted_valuation: z.object({
    usd: z.number(),
  }).nullable(),
  market_cap_fdv_ratio: z.number().nullable(),
  total_volume: z.object({
    usd: z.number(),
  }),
  high_24h: z.object({
    usd: z.number(),
  }),
  low_24h: z.object({
    usd: z.number(),
  }),
  price_change_24h: z.number(),
  price_change_percentage_24h: z.number(),
  circulating_supply: z.number(),
  max_supply: z.number().nullable(),
  total_supply: z.number().nullable(),
});

export const TickerSchema = z.object({
  base: z.string(),
  target: z.string(),
  market: z.object({
    name: z.string(),
  }),
  last: z.number(),
  volume: z.number(),
  converted_last: z.object({
    usd: z.number()
  }),
  converted_volume: z.object({
    usd: z.number()
  }),
  trust_score: z.string(),
});

export const CoinSchema = z.object({
  name: z.string(),
  market_data: MarketDataSchema,
  tickers: z.array(TickerSchema),
});

export type Coin = z.infer<typeof CoinSchema>;

export const FundingRateDataSchema = z.object({
    t: z.number(),
    o: z.string(),
    h: z.string(),
    l: z.string(),
    c: z.string(),
  });
  
export const FullFundingRateResponseSchema = z.object({
    code: z.string(),
    msg: z.string(),
    data: z.array(FundingRateDataSchema),
    success: z.boolean(),
});

export const FundingRateSchema = z.object({
    data: z.array(FundingRateDataSchema)
});
  
export type FullFundingRateResponse = z.infer<typeof FullFundingRateResponseSchema>;
export type FundingRateResponse = z.infer<typeof FundingRateSchema>;

export const PromptAssetMetricsSchema = z.object({
    instrumentId: z.string(),
    currentPrice: z.number(),
    marketCap: z.number(),
    fullyDilutedValuation: z.number(),
    fdvRatio: z.number(),
    volume: z.number(),
    high24h: z.number(),
    low24h: z.number(),
    priceChange24h: z.number(),
    circulatingSupply: z.number(),
    maxSupply: z.number(),
    totalSupply: z.number(),
    lastPrice: z.number(),
    tradingVolume: z.number(),
    convertedLast: z.number(),
    contractVolume: z.number(),
    trustScore: z.number(),
    currentFunding: z.string(),
    FundingChange: z.string(),
    HighFunding: z.string(),
    lowFunding: z.string()
  });
  
  export type PromptAssetMetrics = z.infer<typeof PromptAssetMetricsSchema>; 