import dotenv from 'dotenv';
import { Coin } from '@/common/types'; 

dotenv.config();

const COINGECKO_API_KEY = process.env.COINGECKO_API_KEY;

export async function getCoinDataById(coinId: string): Promise<Coin> {
  if (!COINGECKO_API_KEY) {
    throw new Error('COINGECKO_API_KEY is not defined in environment variables');
  }

  const url = `https://pro-api.coingecko.com/api/v3/coins/${coinId}?localization=false&tickers=true&market_data=true&community_data=false&developer_data=false`;
  
  const options = {
    method: 'GET',
    headers: {
      'accept': 'application/json',
      'x-cg-pro-api-key': COINGECKO_API_KEY
    }
  };

  try {
    const response = await fetch(url, options);
    
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    
    const rawData = await response.json();

    const parsedData: Coin = {
      name: rawData.name,
      market_data: rawData.market_data,
      tickers: rawData.tickers
    };

    return parsedData;
  } catch (error) {
    throw new Error(`Failed to fetch coin data: ${error}`);
  }
}