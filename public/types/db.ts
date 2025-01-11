import { z } from 'zod';

export const CoinPriceInputSchema = z.object({
    coinId: z.string(),
    instrumentId: z.string(),
    symbol: z.string(),
    prices: z.array(z.tuple([z.number(), z.number()])),
  });

export type CoinPriceInput = z.infer<typeof CoinPriceInputSchema>;