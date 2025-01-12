import { TradingPairGenerator } from "../assets/lib/generatePairs";
import { finalEnums } from "../assets/data/finalEnums";
import { DatabaseService } from "./infrastructure/db/dbAction";
import type { TradingPair } from "../types/utils";
import { CryptoCorrelationAnalyzer } from "../assets/lib/correlationAnalysis";
import { CorrelationStrength } from "../types/correlation";

async function main() {
    const generatePairs = new TradingPairGenerator(finalEnums)
    const pairs: TradingPair[] = generatePairs.generate()
    const db = new DatabaseService()
    const dbCoins = await db.getAllCoinPrices()

    const enrichedPairs = pairs.map(pair => {
        const asset1Data = dbCoins.find(coin => coin.instrumentId === pair.asset1);
        const asset2Data = dbCoins.find(coin => coin.instrumentId === pair.asset2);
        
        const pair1Prices = asset1Data?.prices || [];
        const pair2Prices = asset2Data?.prices || [];

        const analysis = new CryptoCorrelationAnalyzer(pair1Prices, pair2Prices).analyze(30);
        
        if (analysis.stdDeviation < 0.1 || analysis.stdDeviation > 1.0) {
            return null;
        }
        
        return {
            asset1: {
                instrumentId: pair.asset1,
                prices: pair1Prices
            },
            asset2: {
                instrumentId: pair.asset2,
                prices: pair2Prices
            },
            category: pair.category,
            analysis
        };
    }).filter(pair => pair !== null);

    const veryStrongCount = enrichedPairs.filter(pair => pair.analysis.correlationStrength === CorrelationStrength.VERY_STRONG).length;
    const strongCount = enrichedPairs.filter(pair => pair.analysis.correlationStrength === CorrelationStrength.STRONG).length;
    const moderateCount = enrichedPairs.filter(pair => pair.analysis.correlationStrength === CorrelationStrength.MODERATE).length;
    const weakCount = enrichedPairs.filter(pair => pair.analysis.correlationStrength === CorrelationStrength.WEAK).length;
    const veryWeakCount = enrichedPairs.filter(pair => pair.analysis.correlationStrength === CorrelationStrength.VERY_WEAK).length;

    console.log(`Number of pairs with Very Strong correlation: ${veryStrongCount}`);
    console.log(`Number of pairs with Strong correlation: ${strongCount}`);
    console.log(`Number of pairs with Moderate correlation: ${moderateCount}`);
    console.log(`Number of pairs with Weak correlation: ${weakCount}`);
    console.log(`Number of pairs with Very Weak correlation: ${veryWeakCount}`);
    console.log(`Total number of pairs: ${enrichedPairs.length}`);

    const correlationsToInsert = enrichedPairs
        .filter(pair => [
            CorrelationStrength.VERY_STRONG,
            CorrelationStrength.STRONG, 
            CorrelationStrength.MODERATE
        ].includes(pair.analysis.correlationStrength))
        .map(pair => ({
            asset1: pair.asset1.instrumentId,
            asset2: pair.asset2.instrumentId,
            category: pair.category,
            correlationStrength: pair.analysis.correlationStrength,
            pearsonCorrelation: Number(pair.analysis.pearsonCorrelation.toFixed(3)),
            stdDeviation: Number(pair.analysis.stdDeviation.toFixed(3))
        }));

    const result = await db.batchInsertCorrelations(correlationsToInsert);
    console.log(`Successfully inserted ${result.count} correlation records into database`);
}

main().catch(console.error);