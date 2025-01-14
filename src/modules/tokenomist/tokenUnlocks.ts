import axios from 'axios';
import { UnlocksResponse, UnlockEvent } from '../../../public/types/tokenomist';
export async function getTokenUnlocks(tokenId: string): Promise<UnlockEvent[] | null> {
    try {
        const response = await axios.get<UnlocksResponse>(
        `https://api.unlocks.app/v1/unlock/events?tokenId=${tokenId}`,
        {
          headers: {
            'x-api-key': process.env.TOKENOMIST_API_KEY,
            'Accept-Encoding': 'gzip'
          }
        }
      );
      
      return response.data.data;
    } catch (error) {
      return null;
    }
}