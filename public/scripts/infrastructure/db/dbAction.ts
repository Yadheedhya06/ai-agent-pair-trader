import { PrismaClient } from '@prisma/client';
import { CoinPriceInput, CoinPriceInputSchema } from '../../../types/db';

const prisma = new PrismaClient();

export class DatabaseService {
  async batchUpsertCoinPrices(coinPrices: CoinPriceInput[]) {
    try {

      coinPrices.forEach(coin => CoinPriceInputSchema.parse(coin));

      const result = await prisma.coinPrices.createMany({
        data: coinPrices.map(coin => ({
          coinId: coin.coinId,
          instrumentId: coin.instrumentId,
          symbol: coin.symbol,
          prices: coin.prices,
        })),
        skipDuplicates: true,
      });

      return result;
    } catch (error) {
      console.error('Error in batchUpsertCoinPrices:', error);
      throw error;
    }
  }
}