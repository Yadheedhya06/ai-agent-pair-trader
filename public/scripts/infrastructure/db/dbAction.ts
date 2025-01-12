import { PrismaClient } from '@prisma/client';
import { Prisma } from '@prisma/client';
import { CoinPriceInputSchema } from '../../../types/db';

const prisma = new PrismaClient();

export class DatabaseService {
  async batchUpsertCoinPrices(coinPrices: Prisma.CoinPricesCreateInput[]) {
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

  async batchInsertCorrelations(correlations: Prisma.AssetCorrelationsCreateInput[]) {
    try {
      const result = await prisma.assetCorrelations.createMany({
        data: correlations,
        skipDuplicates: true,
      });
      return result;
    } catch (error) {
      console.error('Error in batchInsertCorrelations:', error);
      throw error;
    }
}

  async getAllCoinPrices(){
    try {
      const coinPrices = await prisma.coinPrices.findMany({
        orderBy: {
          createdAt: 'desc'
        }
      });

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