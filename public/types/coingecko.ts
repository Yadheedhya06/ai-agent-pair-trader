import { z } from 'zod';

export const CoinSchema = z.object({
    id: z.string(),
    symbol: z.string(),
    name: z.string(),
});
export type Coin = z.infer<typeof CoinSchema>;

export const HistoricalPriceDataSchema = z.object({
    prices: z.array(z.tuple([z.number(), z.number()])),
    market_caps: z.array(z.tuple([z.number(), z.number()])),
    total_volumes: z.array(z.tuple([z.number(), z.number()])),
  });
  
export type HistoricalPriceData = z.infer<typeof HistoricalPriceDataSchema>;

export type PriceDataPoint = [timestamp: number, price: number];