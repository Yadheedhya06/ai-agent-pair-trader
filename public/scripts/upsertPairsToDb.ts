import { TradingPairGenerator } from "../assets/lib/generatePairs";
import { finalEnums } from "../assets/data/finalEnums";
import { DatabaseService } from "./infrastructure/db/dbAction";
import type { TradingPair } from "../types/utils";
import { CryptoCorrelationAnalyzer } from "../assets/lib/correlationAnalysis";
async function main() {
    const generatePairs = new TradingPairGenerator(finalEnums)
    const pairs: TradingPair[] = generatePairs.generate()
    const db = new DatabaseService()
    const dbCoins = await db.getAllCoinPrices()
    
    const enrichedPairs = pairs.map(pair => {
        const asset1Data = dbCoins.find(coin => coin.instrumentId === pair.asset1);
        const asset2Data = dbCoins.find(coin => coin.instrumentId === pair.asset2);
        
        return {
            asset1: {
                instrumentId: pair.asset1,
                prices: asset1Data?.prices || []
            },
            asset2: {
                instrumentId: pair.asset2,
                prices: asset2Data?.prices || []
            },
            category: pair.category
        };
    });

    const exactOtherPairsCount = enrichedPairs.filter(pair => pair.category === 'other').length;
    const containsOtherPairsCount = enrichedPairs.filter(pair => pair.category.includes('other')).length;

    console.log(enrichedPairs[100]);
    console.log(`length of enrichedPairs: ${enrichedPairs.length}`);
    console.log(`Number of pairs with exact 'other' category: ${exactOtherPairsCount}`);
    console.log(`Number of pairs containing 'other' in category: ${containsOtherPairsCount - exactOtherPairsCount}`);
}

main().catch(console.error);