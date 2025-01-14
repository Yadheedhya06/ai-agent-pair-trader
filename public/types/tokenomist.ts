import { z } from 'zod';

export const TokenResponseSchema = z.object({
  metadata: z.object({
    queryDate: z.string()
  }),
  status: z.boolean(),
  data: z.array(z.lazy(() => TokenDataSchema))
});

export const TokenDataSchema = z.object({
  id: z.string(),
  name: z.string(), 
  symbol: z.string(),
  circulatingSupply: z.number().nullable(),
  marketCap: z.number().nullable(),
  maxSupply: z.number().nullable(),
  totalLockedAmount: z.number(),
  tbdLockedAmount: z.number(),
  unlockedAmount: z.number(),
  untrackedAmount: z.number(),
  hasStandardAllocation: z.boolean(),
  websiteUrl: z.string(),
  lastUpdatedDate: z.string()
});

export type TokenResponse = z.infer<typeof TokenResponseSchema>;
export type TokenData = z.infer<typeof TokenDataSchema>;
