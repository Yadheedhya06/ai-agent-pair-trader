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