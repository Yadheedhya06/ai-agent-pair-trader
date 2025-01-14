import axios from 'axios';
import { TokenData } from '../types/tokenomist';
import { TokenResponse } from '../types/tokenomist';
import fs from 'fs';
import path from 'path';

async function getTokenUnlockList(): Promise<TokenData[]> {
  try {
    const apiKey = process.env.TOKENOMIST_API_KEY;
    
    if (!apiKey) {
      throw new Error('TOKENOMIST_API_KEY is not defined in environment variables');
    }

    const response = await axios.get<TokenResponse>('https://api.unlocks.app/v1/token/list', {
      headers: {
        'x-api-key': apiKey,
        'Accept-Encoding': 'gzip'
      }
    });

    return response.data.data;
  } catch (error) {
    if (axios.isAxiosError(error)) {
      throw new Error(`Failed to fetch token list: ${error.message}`);
    }
    throw error;
  }
}

(async () => {
  try {
    const tokens = await getTokenUnlockList();
    
    // Create the directory path if it doesn't exist
    const dirPath = path.join(process.cwd(), 'public', 'assets', 'data', 'fetched');
    fs.mkdirSync(dirPath, { recursive: true });

    // Create the file content
    const fileContent = `import { TokenData } from '../../../types/tokenomist';\n\nexport const unlocksList: TokenData[] = ${JSON.stringify(tokens, null, 2)};\n`;

    // Write to file
    const filePath = path.join(dirPath, 'tokenomistList.ts');
    fs.writeFileSync(filePath, fileContent);

    console.log('Token unlock list saved to:', filePath);
    console.log('Total tokens:', tokens.length);
  } catch (error) {
    console.error('Error fetching and saving token unlock list:', error);
  }
})();