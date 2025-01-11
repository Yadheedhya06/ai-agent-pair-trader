import { finalEnums } from '../assets/data/finalEnums';
import { getHistoricalPrices } from './infrastructure/coingecko/getHistoricalPrices';
import { DatabaseService } from './infrastructure/db/dbAction';
import { CoinPriceInput } from '../types/db';

async function upsertCoinsToDb() {
  const dbService = new DatabaseService();
  const DAYS_OF_HISTORY = 180;
  const BATCH_SIZE = 100;

  try {
    console.log('👆 Total Coins to index: ',finalEnums.length)
    let totalProcessedCoins = 0;
    for (let i = 0; i < finalEnums.length; i += BATCH_SIZE) {
      const batch = finalEnums.slice(i, i + BATCH_SIZE);
      const batchPromises = batch.map(async (coin, index) => {
        const maxRetries = 3;
        let retryCount = 0;
        
        while (retryCount < maxRetries) {
          try {
            
            const prices = await getHistoricalPrices(coin.coin_id, DAYS_OF_HISTORY);
            const coinData: CoinPriceInput = {
              coinId: coin.coin_id,
              instrumentId: coin.instrumentId,
              symbol: coin.coin_symbol,
              prices: prices,
            };

            return coinData;
          } catch (error) {
            retryCount++;
            console.error(`Failed to process coin ${coin.coin_id} (attempt ${retryCount}/${maxRetries}):`, error);
            
            if (retryCount < maxRetries) {
              await new Promise(resolve => setTimeout(resolve, retryCount * 2000));
              continue;
            }
            return null;
          }
        }
        return null;
      });
      const batchResults = await Promise.all(batchPromises);
      const validResults = batchResults.filter((result): result is CoinPriceInput => result !== null);

      if (validResults.length > 0) {
        await dbService.batchUpsertCoinPrices(validResults);
        totalProcessedCoins += validResults.length;
        console.log(`⏳ Total coins processed so far: ${totalProcessedCoins}`);
      }

      if (i + BATCH_SIZE < finalEnums.length) {
        await new Promise(resolve => setTimeout(resolve, 3000));
      }
    }

    console.log('✅ Completed processing all coins');
  } catch (error) {
    console.error('Error in upsertCoinsToDb:', error);
    throw error;
  }
}

(async () => {
await upsertCoinsToDb()
  .then(() => {
    console.log('Script completed successfully');
    process.exit(0);
  })
  .catch((error) => {
    console.error('Script failed:', error);
    process.exit(1);
  });
})();