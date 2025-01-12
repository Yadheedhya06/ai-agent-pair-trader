import { z } from 'zod';

export const PriceDataTupleSchema = z.tuple([
  z.number(),
  z.number()
]);

export const PriceDataArraySchema = z.array(PriceDataTupleSchema);

export const RollingCorrelationItemSchema = z.object({
  timestamp: z.number(),
  correlation: z.number()
});

export enum CorrelationStrength {
  VERY_STRONG = 'Very Strong',
  STRONG = 'Strong',
  MODERATE = 'Moderate',
  WEAK = 'Weak',
  VERY_WEAK = 'Very Weak'
}

export const CorrelationResultSchema = z.object({
  pearsonCorrelation: z.number(),
  correlationStrength: z.nativeEnum(CorrelationStrength),
  stdDeviation: z.number()
});

export type PriceDataTuple = z.infer<typeof PriceDataTupleSchema>;
export type PriceDataArray = z.infer<typeof PriceDataArraySchema>;
export type RollingCorrelationItem = z.infer<typeof RollingCorrelationItemSchema>;
export type CorrelationResult = z.infer<typeof CorrelationResultSchema>;