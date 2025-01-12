import axios from 'axios';
import dotenv from 'dotenv';
import { FullFundingRateResponse, FundingRateSchema, FundingRateResponse } from '@/common/types';

dotenv.config();

export async function getFundingRate(symbol: string): Promise<FundingRateResponse>  {
  const API_KEY = process.env.COINGLASS_API_KEY;
  
  if (!API_KEY) {
    throw new Error('COINGLASS_API_KEY not found in environment variables');
  }

  try {
    const response = await axios.get<FullFundingRateResponse>(
      'https://open-api-v3.coinglass.com/api/futures/fundingRate/ohlc-history',
      {
        params: {
          exchange: 'Binance',
          symbol: symbol,
          interval: '8h',
          limit: 1
        },
        headers: {
          'Accept': 'application/json',
          'CG-Api-Key': API_KEY
        }
      }
    );

    const validatedData = FundingRateSchema.parse(response.data);
    return validatedData;
  } catch (error) {
    console.error('Error fetching funding rate:', error);
    throw error;
  }
}