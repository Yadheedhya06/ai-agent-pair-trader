import { finalEnums } from '../data/finalEnums';
import { unlocksList } from '../data/fetched/tokenomistList';

export const checkCoinIdsInTokenomist = () => {
    const tokenomistIds = new Set(unlocksList.map(item => item.id));
    
    const missingItems: typeof finalEnums = [];
    const matchedItems: typeof finalEnums = [];

    finalEnums.forEach(item => {
        if (tokenomistIds.has(item.coin_id)) {
            matchedItems.push(item);
        } else {
            missingItems.push(item);
        }
    });

    const totalItems = finalEnums.length;
    const matchedPercentage = (matchedItems.length / totalItems * 100).toFixed(2);
    const missingPercentage = (missingItems.length / totalItems * 100).toFixed(2);

    return {
        summary: {
            totalItems,
            matchedCount: matchedItems.length,
            matchedPercentage: `${matchedPercentage}%`,
            missingCount: missingItems.length,
            missingPercentage: `${missingPercentage}%`,
        },
        missingItems,
        matchedItems
    };
};

const results = checkCoinIdsInTokenomist();
console.log('Summary:', results.summary);
console.log('Missing Items:', results.missingItems.map(item => ({
    instrumentId: item.instrumentId,
    coin_id: item.coin_id
})));