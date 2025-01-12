import colors from 'colors';
import { 
    CryptoAsset, 
    PairSchema, 
    assetCategories, 
    relatedCategories ,
    AssetCategory,
    TradingPair
} from "../../types/utils";

export class TradingPairGenerator {
    private pairs: PairSchema[] = [];
    private processedPairs: Set<string> = new Set();
    private readonly stablecoins = ['USDT', 'USDC', 'BUSD'];

    constructor(private assets: CryptoAsset[]) {}

    /**
     * Generates trading pairs based on asset categories and relationships
     */
    public generate(): TradingPair[] {
        this.pairs = [];
        this.processedPairs.clear();
        
        let currentIteration = 0;

        for (let i = 0; i < this.assets.length; i++) {
            for (let j = i + 1; j < this.assets.length; j++) {
                this.processPair(this.assets[i], this.assets[j]);
                currentIteration++;
            }
        }

        const seenPairs = new Set<string>();
        const uniquePairs: PairSchema[] = [];

        let processedCount = 0;

        for (const pair of this.pairs) {
            const key1 = `${pair.asset1.baseAsset}-${pair.asset2.baseAsset}`;
            const key2 = `${pair.asset2.baseAsset}-${pair.asset1.baseAsset}`;
            
            if (!seenPairs.has(key1) && !seenPairs.has(key2)) {
                uniquePairs.push(pair);
                seenPairs.add(key1);
                seenPairs.add(key2);
            }
            processedCount++;
        }

        console.log(colors.green(`\n✨ Total number of Pairs generated: ${uniquePairs.length}`));
        return uniquePairs.map(pair => ({
            asset1: pair.asset1.instrumentId,
            asset2: pair.asset2.instrumentId,
            category: pair.category
        }));
    }

    /**
     * Process a potential trading pair
     */
    private processPair(asset1: CryptoAsset, asset2: CryptoAsset): void {
        if (asset1.baseAsset === asset2.baseAsset) {
            return;
        }

        if (this.areQuotedInStablecoins(asset1, asset2)) {
            const pairKey = this.createPairKey(asset1, asset2);
            
            if (this.processedPairs.has(pairKey)) {
                return;
            }

            this.tryAddPair(asset1, asset2, pairKey);
        }
    }

    /**
     * Attempt to add a valid trading pair
     */
    private tryAddPair(asset1: CryptoAsset, asset2: CryptoAsset, pairKey: string): void {
        const category1 = this.getAssetCategory(asset1);
        const category2 = this.getAssetCategory(asset2);

        if (this.areCategoriesCompatible(category1, category2)) {
            this.pairs.push({
                asset1,
                asset2,
                category: category1 === category2 ? category1 : `${category1} x ${category2}`
            });
            this.processedPairs.add(pairKey);
        }
    }

    /**
     * Check if both assets are quoted in stablecoins
     */
    private areQuotedInStablecoins(asset1: CryptoAsset, asset2: CryptoAsset): boolean {
        return this.stablecoins.includes(asset1.quoteAsset) && 
               this.stablecoins.includes(asset2.quoteAsset);
    }

    /**
     * Get the category of an asset
     */
    private getAssetCategory(asset: CryptoAsset): AssetCategory {
        for (const [category, symbols] of Object.entries(assetCategories)) {
            if (symbols.includes(asset.baseAsset)) {
                return category as AssetCategory;
            }
        }
        return 'other';
    }

    /**
     * Create a unique key for a pair of assets
     */
    private createPairKey(asset1: CryptoAsset, asset2: CryptoAsset): string {
        return [asset1.baseAsset, asset2.baseAsset].sort().join('-');
    }

    /**
     * Check if two categories are compatible for pairing
     */
    private areCategoriesCompatible(category1: AssetCategory, category2: AssetCategory): boolean {
        return category1 === category2 || 
               relatedCategories[category1]?.includes(category2) || 
               relatedCategories[category2]?.includes(category1);
    }
}