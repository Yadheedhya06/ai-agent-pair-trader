import { z } from 'zod';

export const CryptoAssetSchema = z.object({
    instrumentId: z.string(),
    baseAsset: z.string(),
    quoteAsset: z.string(),
    coin_id: z.string(),
    coin_symbol: z.string(),
    coin_name: z.string()
});

export const PairSchema = z.object({
    asset1: CryptoAssetSchema,
    asset2: CryptoAssetSchema,
    category: z.string()
});

export const TradingPairSchema = z.object({
    asset1: z.string(),
    asset2: z.string(),
    category: z.string()
});


export type CryptoAsset = z.infer<typeof CryptoAssetSchema>;
export type PairSchema = z.infer<typeof PairSchema>;
export type TradingPair = z.infer<typeof TradingPairSchema>;

    
export const assetCategories = {
    layer1: ['BTC', 'ETH', 'SOL', 'AVAX', 'BNB', 'DOT', 'NEAR', 'ADA', 'ATOM'],
    defi: ['UNI', 'AAVE', 'COMP', 'SUSHI', 'CAKE', 'CRV', 'SNX', 'MKR', 'YFI', 'BAL'],
    gaming: ['AXS', 'SAND', 'MANA', 'ENJ', 'ILV', 'GALA', 'ALICE'],
    exchange: ['BNB', 'FTT', 'CRO', 'OKB', 'KCS', 'HT'],
    layer2: ['MATIC', 'ARB', 'OP', 'IMX', 'LRC'],
    oracle: ['LINK', 'BAND', 'TRB', 'API3'],
    storage: ['FIL', 'STORJ', 'AR'],
    privacy: ['XMR', 'ZEC', 'SCRT'],
    meme: ['DOGE', 'SHIB', 'PEPE', 'FLOKI'],
};

export type AssetCategory = 
    | 'layer1' 
    | 'defi' 
    | 'gaming' 
    | 'exchange' 
    | 'layer2' 
    | 'oracle' 
    | 'storage' 
    | 'privacy' 
    | 'meme' 
    | 'other';

export const relatedCategories: Record<AssetCategory, AssetCategory[]> = {
    'layer1': ['defi', 'layer2', 'other'],
    'defi': ['layer1', 'layer2', 'exchange', 'other'],
    'gaming': ['layer1', 'other'],
    'exchange': ['defi', 'layer1', 'other'],
    'layer2': ['layer1', 'defi', 'other'],
    'oracle': ['defi', 'layer1', 'other'],
    'storage': ['layer1', 'other'],
    'privacy': ['layer1', 'other'],
    'meme': ['meme', 'other'],
    'other': []
};