import axios from 'axios';
import fs from 'fs';
import path from 'path';
import dotenv from 'dotenv';
import { z } from 'zod';
import { binancePairs } from '../assets/data/fetched/binancePairs';
import { pairCoinOutliers } from '../assets/data/helpers/pairOutliers';
import { Coin, CoinSchema } from '../types/coingecko';

dotenv.config();

const COINGECKO_API_KEY = process.env.COINGECKO_API_KEY;
const BASE_URL = 'https://pro-api.coingecko.com/api/v3';



async function getAllCoins() {
    try {
        const response = await axios.get<Coin[]>(`${BASE_URL}/coins/list`, {
            headers: {
                'accept': 'application/json',
                'x-cg-pro-api-key': COINGECKO_API_KEY
            }
        });

        const validatedData = z.array(CoinSchema).parse(response.data);
        console.log(`🚀 Total number of coins: ${validatedData.length}`);

        const missingBaseAssets = binancePairs
            .filter(pair => !validatedData.some(coin => {
                const baseAsset = pair.baseAsset.toLowerCase();
                const coinSymbol = coin.symbol.toLowerCase();
                return baseAsset === coinSymbol || 
                       (pairCoinOutliers.has(pair.baseAsset) && 
                        pairCoinOutliers.get(pair.baseAsset)?.toLowerCase() === coinSymbol);
            }))
            .map(pair => pair.baseAsset);

        console.log('⏳ Missing Binance baseAssets in Coingecko:', missingBaseAssets);

        const processedMissingBaseAssets = missingBaseAssets.map(asset => {
            const match = asset.match(/^[0-9]+(.+)$/);
            return match ? match[1] : asset;
        });

        const stillMissingBaseAssets = processedMissingBaseAssets.filter(processedAsset => 
            !validatedData.some(coin => coin.symbol.toLowerCase() === processedAsset.toLowerCase())
        );

        console.log('❌ Still missing after processing numeric prefixes:', stillMissingBaseAssets);

        const duplicateBaseAssets = binancePairs.reduce((acc, pair) => {
            const matchingCoins = validatedData.filter(coin => {
                const baseAsset = pair.baseAsset.toLowerCase();
                const coinSymbol = coin.symbol.toLowerCase();
                const processedBaseAsset = baseAsset.match(/^[0-9]+(.+)$/)?.[1]?.toLowerCase() || baseAsset;
                return baseAsset === coinSymbol || processedBaseAsset === coinSymbol ||
                       (pairCoinOutliers.has(pair.baseAsset) &&
                        pairCoinOutliers.get(pair.baseAsset)?.toLowerCase() === coinSymbol);
            });
            if (matchingCoins.length > 1) {
                acc.push(pair.baseAsset);
            }
            return acc;
        }, [] as string[]);

        console.log('⚠️ Duplicate base assets found:', duplicateBaseAssets);

        const filteredCoins = validatedData.filter(coin =>
            binancePairs.some(pair => {
                const baseAsset = pair.baseAsset.toLowerCase();
                const coinSymbol = coin.symbol.toLowerCase();
                const processedBaseAsset = baseAsset.match(/^[0-9]+(.+)$/)?.[1]?.toLowerCase() || baseAsset;
                return baseAsset === coinSymbol || processedBaseAsset === coinSymbol ||
                       (pairCoinOutliers.has(pair.baseAsset) &&
                        pairCoinOutliers.get(pair.baseAsset)?.toLowerCase() === coinSymbol);
            })
        );
        
        console.log(`🎯 Filtered coins matching Binance pairs: ${filteredCoins.length}`);

        const filePath = path.join(__dirname, '..', '..', 'data', 'coingeckoCoins.ts'); //TODO: update path
        const fileContent = `export const coins = ${JSON.stringify(filteredCoins, null, 2)};`;
        
        fs.writeFileSync(filePath, fileContent);
        
        console.log(`✨ Coins data saved to ${filePath}`);
        
    } catch (error) {
        console.error('Error fetching coins:', error);
        throw error;
    }
}

(async () => {
    await getAllCoins()
        .then(() => process.exit(0))
        .catch(() => process.exit(1));
})();