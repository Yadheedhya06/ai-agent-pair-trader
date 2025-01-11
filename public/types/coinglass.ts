import { z } from 'zod';

export const TradingPairSchema = z.object({
    instrumentId: z.string(),
    baseAsset: z.string(),
    quoteAsset: z.string(),
});

export const ExchangePairsSchema = z.record(z.array(TradingPairSchema));

export const CoinglassResponseSchema = z.object({
    code: z.string(),
    msg: z.string(),
    data: ExchangePairsSchema,
});

export type TradingPair = z.infer<typeof TradingPairSchema>;
export type ExchangePairs = z.infer<typeof ExchangePairsSchema>;
export type CoinglassResponse = z.infer<typeof CoinglassResponseSchema>;