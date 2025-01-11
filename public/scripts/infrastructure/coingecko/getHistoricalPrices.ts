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
  
    const maxRetries = 3;
    let retryCount = 0;

    while (retryCount < maxRetries) {
      try {
        const response = await fetch(url, options);
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }
        const rawData = await response.json();
        const parsedData = HistoricalPriceDataSchema.parse(rawData);
        return parsedData.prices;
      } catch (error) {
        retryCount++;
        console.error(`Error fetching historical prices for coin ${coinId} (attempt ${retryCount}/${maxRetries}):`, error);
        
        if (retryCount === maxRetries) {
          throw error;
        }
        
        await new Promise(resolve => setTimeout(resolve, retryCount * 2000));
      }
    }

    throw new Error('Failed to fetch historical prices after all retries');
  }