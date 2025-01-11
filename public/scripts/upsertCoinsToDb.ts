import { finalEnums } from '../assets/data/finalEnums';
import { getHistoricalPrices } from './infrastructure/coingecko/getHistoricalPrices';
import { DatabaseService } from './infrastructure/db/dbAction';
import { CoinPriceInput } from '../types/db';

async function upsertCoinsToDb() {
  const dbService = new DatabaseService();
  const DAYS_OF_HISTORY = 30;
  const BATCH_SIZE = 10;

  try {
    for (let i = 0; i < finalEnums.length; i += BATCH_SIZE) {
      const batch = finalEnums.slice(i, i + BATCH_SIZE);
      const batchPromises = batch.map(async (coin) => {
        try {
          // Get historical prices for each coin
          const prices = await getHistoricalPrices(coin.coin_id, DAYS_OF_HISTORY);

          // Format data for database insertion
          const coinData: CoinPriceInput = {
            coinId: coin.coin_id,
            instrumentId: coin.instrumentId,
            symbol: coin.coin_symbol,
            prices: prices,
          };

          return coinData;
        } catch (error) {
          console.error(`Failed to process coin ${coin.coin_id}:`, error);
          return null;
        }
      });

      // Wait for all promises in the batch to resolve
      const batchResults = await Promise.all(batchPromises);
      const validResults = batchResults.filter((result): result is CoinPriceInput => result !== null);
      console.log(validResults)

      if (validResults.length > 0) {
        await dbService.batchUpsertCoinPrices(validResults);
        console.log(`⏳ Successfully processed batch of ${validResults.length} coins`);
      }

      // Add delay between batches to respect rate limits
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