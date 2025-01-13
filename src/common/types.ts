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
export type MarketData = z.infer<typeof MarketDataSchema>;

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
  trust_score: z.union([z.string(), z.null()]),
});

export type Ticker = z.infer<typeof TickerSchema>;

export const CoinSchema = z.object({
  name: z.string(),
  market_data: MarketDataSchema,
  tickers: z.array(TickerSchema),
});

export type Coin = z.infer<typeof CoinSchema>;

export const FundingRateDataSchema = z.object({
    t: z.union([z.number(), z.string()]),
    o: z.union([z.number(), z.string()]),
    h: z.union([z.number(), z.string()]),
    l: z.union([z.number(), z.string()]),
    c: z.union([z.number(), z.string()]),
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
    currentPrice: z.union([z.number(), z.string()]),
    marketCap: z.union([z.number(), z.string()]),
    fullyDilutedValuation: z.union([z.number(), z.string()]),
    fdvRatio:  z.union([z.number(), z.string()]),
    volume: z.union([z.number(), z.string()]),
    high24h: z.union([z.number(), z.string()]),
    low24h: z.union([z.number(), z.string()]),
    priceChange24h: z.union([z.number(), z.string()]),
    circulatingSupply: z.union([z.number(), z.string()]),
    maxSupply: z.union([z.number(), z.string()]),
    totalSupply: z.union([z.number(), z.string()]),
    lastPrice: z.union([z.number(), z.string()]),
    tradingVolume: z.union([z.number(), z.string()]),
    convertedLast: z.union([z.number(), z.string()]),
    contractVolume: z.union([z.number(), z.string()]),
    trustScore: z.union([z.number(), z.string()]),
    currentFunding: z.union([z.number(), z.string()]),
    FundingChange: z.union([z.number(), z.string()]),
    HighFunding: z.union([z.number(), z.string()]),
    lowFunding: z.union([z.number(), z.string()])
  });
  
  export type PromptAssetMetrics = z.infer<typeof PromptAssetMetricsSchema>; 

export const DiscordResponseSchema = z.object({
  related: z.string(),
  long: z.string(),
  short: z.string(),
  pearsonCorrelation: z.number(),
  standardDeviation: z.number(),
  remarks: z.string()
});

export type DiscordResponse = z.infer<typeof DiscordResponseSchema>;
