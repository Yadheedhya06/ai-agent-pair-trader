import { HistoricalPriceDataSchema, PriceDataPoint } from '../../../types/coingecko';
import dotenv from 'dotenv';

dotenv.config();

export async function getHistoricalPrices(coinId: string, days: number) : Promise<PriceDataPoint[]> {
    const url = `https://pro-api.coingecko.com/api/v3/coins/${coinId}/market_chart?vs_currency=usd&days=${days}`;
    const options = {
      method: 'GET',
      headers: {
        accept: 'application/json',
        'x-cg-pro-api-key': process.env.COINGECKO_API_KEY as string
      }
    };
  
    try {
      const response = await fetch(url, options);
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      const rawData = await response.json();
      const parsedData = HistoricalPriceDataSchema.parse(rawData);
      return parsedData.prices;
    } catch (error) {
      console.error('Error fetching historical prices:', error);
      throw error;
    }
  }