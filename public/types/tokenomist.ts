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

export const AllocationBreakdownSchema = z.object({
  unlockDate: z.string(),
  allocationName: z.string(),
  standardAllocationName: z.string(),
  cliffAmount: z.number(),
  cliffValue: z.number(),
  referencePrice: z.number(),
  referencePriceUpdatedTime: z.string(),
  unlockPrecision: z.string()
});

export const CliffUnlocksSchema = z.object({
  cliffAmount: z.number(),
  cliffValue: z.number(), 
  referencePrice: z.number(),
  referencePriceUpdatedTime: z.string(),
  valueToMarketCap: z.number(),
  allocationBreakdown: z.array(AllocationBreakdownSchema)
});

export const UnlockEventSchema = z.object({
  unlockDate: z.string(),
  tokenName: z.string(),
  tokenSymbol: z.string(),
  dataSource: z.string(),
  linearUnlocks: z.null().or(z.any()),
  cliffUnlocks: CliffUnlocksSchema,
  latestUpdateDate: z.string()
});

export type UnlockEvent = z.infer<typeof UnlockEventSchema>;
export const UnlocksResponseSchema = z.object({
  metadata: z.object({
    queryDate: z.string()
  }),
  status: z.boolean(),
  data: z.array(UnlockEventSchema).nullable()
});

export type UnlocksResponse = z.infer<typeof UnlocksResponseSchema>;