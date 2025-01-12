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
          prices: JSON.stringify(coin.prices),
        })),
        skipDuplicates: true,
      });
      return result;
    } catch (error) {
      console.error('Error in batchUpsertCoinPrices:', error);
      throw error;
    }
  }

  async getAllCoinPrices() {
    try {
      const coinPrices = await prisma.coinPrices.findMany({
        orderBy: {
          createdAt: 'desc'
        }
      });

      // Parse the JSON prices string back to array
      return coinPrices.map(coin => ({
        ...coin,
        prices: JSON.parse(coin.prices as string)
      }));
    } catch (error) {
      console.error('Error in getAllCoinPrices:', error);
      throw error;
    }
  }
}