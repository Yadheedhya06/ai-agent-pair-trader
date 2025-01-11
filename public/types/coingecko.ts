import { z } from 'zod';

export const CoinSchema = z.object({
    id: z.string(),
    symbol: z.string(),
    name: z.string(),
});

export type Coin = z.infer<typeof CoinSchema>;