import axios from 'axios';
import dotenv from 'dotenv';
import fs from 'fs';
import path from 'path';
import { CoinglassResponse, CoinglassResponseSchema } from '../types/coinglass';

dotenv.config();

const COINGLASS_API_KEY = process.env.COINGLASS_API_KEY;
const BASE_URL = 'https://open-api-v3.coinglass.com';

async function getSupportedExchangePairs() {
    try {
        const response: CoinglassResponse = await axios.get(`${BASE_URL}/api/futures/supported-exchange-pairs`, {
            headers: {
                'Accept': 'application/json',
                'Cg-Api-Key': COINGLASS_API_KEY
            }
        });

        const validatedData = CoinglassResponseSchema.parse(response.data);
        const binancePairs = validatedData.data['Binance']

        const filteredPairs =binancePairs.filter(pair => !pair.instrumentId.includes('_'));
        console.log('🚀 Total number of Binance Trading Pairs are: ',filteredPairs.length)
        
        const filePath = path.join(__dirname, '..', '..', 'data', 'binancePairs.ts'); //TODO: update path
        const fileContent = `export const binancePairs = ${JSON.stringify(filteredPairs, null, 2)};`;
        
        fs.writeFileSync(filePath, fileContent);
        
        console.log(`✨ Binance pairs saved to ${filePath}`);
        
    } catch (error) {
        console.error('Error fetching supported exchange pairs:', error);
        throw error;
    }
}

(async () => {
await getSupportedExchangePairs()
    .then(() => process.exit(0))
    .catch(() => process.exit(1));
})();