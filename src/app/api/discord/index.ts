import { ApplicationDatabase } from "@/scripts/db/appDB";
import { CorrelationStrength } from "../../../../public/types/correlation";
import { finalEnums } from "../../../../public/assets/data/finalEnums";
import { getCoinDataById } from "@/modules/coingecko/getCoinDataById";
import { TickerSchema, MarketDataSchema } from "@/common/types";

async function main() {
  while (true) {
    const startTime = performance.now();
    
    const correlationStrengths = [
      CorrelationStrength.VERY_STRONG, 
      CorrelationStrength.STRONG,
      CorrelationStrength.MODERATE
    ];
    const randomStrength = correlationStrengths[Math.floor(Math.random() * correlationStrengths.length)];
    
    const db = new ApplicationDatabase()
    const correlation = await db.getRandomCorrelationByCategory(randomStrength)
    console.log(correlation)

    const asset1CoinId = finalEnums.find(item => item.instrumentId === correlation.asset1)?.coin_id
    const asset2CoinId = finalEnums.find(item => item.instrumentId === correlation.asset2)?.coin_id

    if (!asset1CoinId || !asset2CoinId) {
      throw new Error('Could not find coin_ids for one or both assets')
    }
    const [asset1Data, asset2Data] = await Promise.all([
      getCoinDataById(asset1CoinId),
      getCoinDataById(asset2CoinId)
    ]);

    const asset1QuoteAsset = finalEnums.find(item => item.instrumentId === correlation.asset1)?.quoteAsset;
    const asset2QuoteAsset = finalEnums.find(item => item.instrumentId === correlation.asset2)?.quoteAsset;

    const asset1MarketData = {
      name: asset1Data.name,
      market_data: MarketDataSchema.parse(asset1Data.market_data)
    };

    const asset1TickerData = asset1Data.tickers
      .filter(ticker => 
        ticker.market.name === 'Binance' && 
        ticker.target === asset1QuoteAsset
      )
      .map(ticker => TickerSchema.parse({
        base: ticker.base,
        target: ticker.target,
        market: { name: ticker.market.name },
        last: ticker.last,
        volume: ticker.volume,
        converted_last: ticker.converted_last,
        converted_volume: ticker.converted_volume,
        trust_score: ticker.trust_score
      }));

    const asset2MarketData = {
      name: asset2Data.name,
      market_data: MarketDataSchema.parse(asset2Data.market_data)
    };

    const asset2TickerData = asset2Data.tickers
      .filter(ticker => 
        ticker.market.name === 'Binance' && 
        ticker.target === asset2QuoteAsset
      )
      .map(ticker => TickerSchema.parse({
        base: ticker.base,
        target: ticker.target,
        market: { name: ticker.market.name },
        last: ticker.last,
        volume: ticker.volume,
        converted_last: ticker.converted_last,
        converted_volume: ticker.converted_volume,
        trust_score: ticker.trust_score
      }));

    const asset1HasGreenScore = asset1TickerData.some(ticker => ticker.trust_score === 'green');
    const asset2HasGreenScore = asset2TickerData.some(ticker => ticker.trust_score === 'green');

    if (asset1HasGreenScore && asset2HasGreenScore) {
      console.log('Asset 1 Market Data:', asset1MarketData);
      console.log('Asset 1 Ticker Data:', asset1TickerData);
      console.log('Asset 2 Market Data:', asset2MarketData); 
      console.log('Asset 2 Ticker Data:', asset2TickerData);
      
      const endTime = performance.now();
      const executionTime = endTime - startTime;
      console.log(`Function execution time: ${executionTime.toFixed(2)} milliseconds`);
      break;
    }
    
    console.log('One or both assets do not have green trust scores. Retrying...');
  }
}

main().catch(console.error);