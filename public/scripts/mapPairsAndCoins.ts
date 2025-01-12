import { binancePairs } from '../assets/data/fetched/binancePairs';
import { coins } from '../assets/data/fetched/coingeckoCoins';
import { pairCoinOutliers } from '../assets/data/helpers/pairOutliers';
import type { CoinList } from '../types/coingecko';
import { writeFileSync, mkdirSync, existsSync } from 'fs';
import { join, dirname } from 'path';

function normalizeBaseAsset(baseAsset: string): string {
    if (baseAsset.toUpperCase() === '1INCH' || baseAsset.toUpperCase() === '1MBABYDOGE') {
        return baseAsset.toLowerCase();
    }
    const normalized = baseAsset.replace(/^\d+/, '');
    return normalized.toLowerCase();
}

function mapPairsAndCoins(coingeckoCoins: CoinList[]) {
    const multipleMatches = new Map<string, CoinList[]>();
    const noMatches = new Set<string>();

    const mappedPairs = binancePairs.map(pair => {
        if (pair.baseAsset === 'NEIRO') {
            const specificCoin = coingeckoCoins.find(coin => coin.id === 'neiro-3');
            if (specificCoin) {
                return {
                    instrumentId: pair.instrumentId,
                    baseAsset: pair.baseAsset,
                    quoteAsset: pair.quoteAsset,
                    coin_id: specificCoin.id,
                    coin_symbol: specificCoin.symbol,
                    coin_name: specificCoin.name
                };
            }
        } else if (pair.baseAsset === 'NEIROETH') {
            const specificCoin = coingeckoCoins.find(coin => coin.id === 'neiro-on-eth');
            if (specificCoin) {
                return {
                    instrumentId: pair.instrumentId,
                    baseAsset: pair.baseAsset,
                    quoteAsset: pair.quoteAsset,
                    coin_id: specificCoin.id,
                    coin_symbol: specificCoin.symbol,
                    coin_name: specificCoin.name
                };
            }
        }

        let baseAssetToMatch = normalizeBaseAsset(pair.baseAsset);
        
        if (pairCoinOutliers.has(pair.baseAsset)) {
            baseAssetToMatch = pairCoinOutliers.get(pair.baseAsset)!;
        }

        if (pair.baseAsset !== 'NEIRO' && pair.baseAsset !== 'NEIROETH') {
            const matchingCoins = coingeckoCoins.filter(
                coin => coin.symbol.toLowerCase() === baseAssetToMatch
            );

            if (matchingCoins.length > 1) {
                multipleMatches.set(pair.baseAsset, matchingCoins);
            } else if (matchingCoins.length === 0) {
                noMatches.add(pair.baseAsset);
                return null;
            }

            const matchingCoin = matchingCoins[0];
            if (matchingCoin) {
                return {
                    instrumentId: pair.instrumentId,
                    baseAsset: pair.baseAsset,
                    quoteAsset: pair.quoteAsset,
                    coin_id: matchingCoin.id,
                    coin_symbol: matchingCoin.symbol,
                    coin_name: matchingCoin.name
                };
            }
        }
        return null;
    }).filter((item): item is NonNullable<typeof item> => item !== null);

    if (multipleMatches.size > 0) {
        console.log('\nBase assets with multiple matching coins:');
        multipleMatches.forEach((coins, baseAsset) => {
            console.log(`${baseAsset}:`);
            coins.forEach(coin => console.log(`  - ${coin.name} (${coin.symbol})`));
        });
    }

    if (noMatches.size > 0) {
        console.log('\nBase assets with no matching coins:');
        noMatches.forEach(baseAsset => console.log(`- ${baseAsset}`));
    }

    return mappedPairs;
}


const coingeckoCoins: CoinList[] = coins;
const mappedResults = mapPairsAndCoins(coingeckoCoins);

const finalEnumsContent = `export const finalEnums = ${JSON.stringify(mappedResults, null, 2)};`;

const outputPath = join(__dirname, '../data/finalEnums.ts');
const directory = dirname(outputPath);
if (!existsSync(directory)) {
    mkdirSync(directory, { recursive: true });
}
writeFileSync(outputPath, finalEnumsContent);
console.log('🚀 Total number of Final Enums are: ',mappedResults.length)
console.log(`✨ Final enums saved to ${outputPath}`);