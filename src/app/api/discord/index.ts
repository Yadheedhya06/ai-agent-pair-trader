import { ApplicationDatabase } from "@/scripts/db/appDB";
import { CorrelationStrength, CorrelationResult } from "../../../../public/types/correlation";
import { finalEnums } from "../../../../public/assets/data/finalEnums";
import { getCoinDataById } from "@/modules/coingecko/getCoinDataById";
import { getFundingRate } from "@/modules/coinglass/getFundingRate";
import { TickerSchema, MarketDataSchema, PromptAssetMetrics } from "@/common/types";
import { promptTemplate } from "@/common/prompt";
import { minimalDatabaseAdapter } from "@/index";
import { AgentRuntime, stringToUuid,generateText } from "@ai16z/eliza";
import { loadCharacters } from "@/scripts/loader";
import { CompatibleCacheAdapter } from "@/index";

async function main() {
  const startTime = performance.now();
  
  const correlationStrengths = [
    CorrelationStrength.VERY_STRONG, 
    CorrelationStrength.STRONG,
    CorrelationStrength.MODERATE
  ];
  const randomStrength = correlationStrengths[Math.floor(Math.random() * correlationStrengths.length)];
  
  const db = new ApplicationDatabase()
  const pair = await db.getRandomCorrelationByCategory(randomStrength)
  console.log(pair)

  const asset1CoinId = finalEnums.find(item => item.instrumentId === pair.asset1)?.coin_id
  const asset2CoinId = finalEnums.find(item => item.instrumentId === pair.asset2)?.coin_id

  if (!asset1CoinId || !asset2CoinId) {
    throw new Error('Could not find coin_ids for one or both assets')
  }
  const [asset1Data, asset2Data] = await Promise.all([
    getCoinDataById(asset1CoinId),
    getCoinDataById(asset2CoinId)
  ]);

  const asset1QuoteAsset = finalEnums.find(item => item.instrumentId === pair.asset1)?.quoteAsset;
  const asset2QuoteAsset = finalEnums.find(item => item.instrumentId === pair.asset2)?.quoteAsset;

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

  console.log('Asset 1 Market Data:', asset1MarketData);
  console.log('Asset 1 Ticker Data:', asset1TickerData);
  console.log('Asset 2 Market Data:', asset2MarketData); 
  console.log('Asset 2 Ticker Data:', asset2TickerData);
  
  const endTime = performance.now();
  const executionTime = endTime - startTime;
  console.log(`Function execution time: ${executionTime.toFixed(2)} milliseconds`);

  const [fundingRateAsset1, fundingRateAsset2] = await Promise.all([
    getFundingRate(pair.asset1),
    getFundingRate(pair.asset2)
  ]);
  
  console.log('Funding Rate Asset 1:', fundingRateAsset1);
  console.log('Funding Rate Asset 2:', fundingRateAsset2);

  const promptConfigAsset1: PromptAssetMetrics = {
    instrumentId: pair.asset1,
    currentPrice: asset1MarketData.market_data.current_price.usd ?? 'Not Available',
    marketCap: asset1MarketData.market_data.market_cap.usd ?? 'Not Available',
    fullyDilutedValuation: asset1MarketData.market_data.fully_diluted_valuation?.usd ?? 'Not Available',
    fdvRatio: asset1MarketData.market_data.market_cap_fdv_ratio ?? 'Not Available',
    volume: asset1MarketData.market_data.total_volume.usd ?? 'Not Available',
    high24h: asset1MarketData.market_data.high_24h.usd ?? 'Not Available',
    low24h: asset1MarketData.market_data.low_24h.usd ?? 'Not Available',
    priceChange24h: asset1MarketData.market_data.price_change_24h ?? 'Not Available',
    circulatingSupply: asset1MarketData.market_data.circulating_supply ?? 'Not Available',
    maxSupply: asset1MarketData.market_data.max_supply ?? 'Not Available',
    totalSupply: asset1MarketData.market_data.total_supply ?? 'Not Available',
    lastPrice: asset1TickerData[0]?.last ?? 'Not Available',
    tradingVolume: asset1TickerData[0]?.volume ?? 'Not Available',
    convertedLast: asset1TickerData[0]?.converted_last.usd ?? 'Not Available',
    contractVolume: asset1TickerData[0]?.converted_volume.usd ?? 'Not Available',
    trustScore: asset1TickerData[0]?.trust_score === 'yellow' ? 0.5 : 1,
    currentFunding: fundingRateAsset1.data[0]?.c ?? 'Not Available',
    FundingChange: fundingRateAsset1.data[0] ? (Number(fundingRateAsset1.data[0].c) - Number(fundingRateAsset1.data[0].o)).toString() : 'Not Available',
    HighFunding: fundingRateAsset1.data[0]?.h ?? 'Not Available',
    lowFunding: fundingRateAsset1.data[0]?.l ?? 'Not Available'
  }

  const promptConfigAsset2: PromptAssetMetrics = {
    instrumentId: pair.asset2,
    currentPrice: asset2MarketData.market_data.current_price.usd ?? 'Not Available',
    marketCap: asset2MarketData.market_data.market_cap.usd ?? 'Not Available',
    fullyDilutedValuation: asset2MarketData.market_data.fully_diluted_valuation?.usd ?? 'Not Available',
    fdvRatio: asset2MarketData.market_data.market_cap_fdv_ratio ?? 'Not Available',
    volume: asset2MarketData.market_data.total_volume.usd ?? 'Not Available',
    high24h: asset2MarketData.market_data.high_24h.usd ?? 'Not Available',
    low24h: asset2MarketData.market_data.low_24h.usd ?? 'Not Available',
    priceChange24h: asset2MarketData.market_data.price_change_24h ?? 'Not Available',
    circulatingSupply: asset2MarketData.market_data.circulating_supply ?? 'Not Available',
    maxSupply: asset2MarketData.market_data.max_supply ?? 'Not Available',
    totalSupply: asset2MarketData.market_data.total_supply ?? 'Not Available',
    lastPrice: asset2TickerData[0]?.last ?? 'Not Available',
    tradingVolume: asset2TickerData[0]?.volume ?? 'Not Available',
    convertedLast: asset2TickerData[0]?.converted_last.usd ?? 'Not Available',
    contractVolume: asset2TickerData[0]?.converted_volume.usd ?? 'Not Available',
    trustScore: asset2TickerData[0]?.trust_score === 'yellow' ? 0.5 : 1,
    currentFunding: fundingRateAsset2.data[0]?.c ?? 'Not Available',
    FundingChange: fundingRateAsset2.data[0] ? (Number(fundingRateAsset2.data[0].c) - Number(fundingRateAsset2.data[0].o)).toString() : 'Not Available',
    HighFunding: fundingRateAsset2.data[0]?.h ?? 'Not Available',
    lowFunding: fundingRateAsset2.data[0]?.l ?? 'Not Available'
  }

  const promptConfigCorrelation:CorrelationResult = {
    pearsonCorrelation: pair.pearsonCorrelation,
    stdDeviation: pair.stdDeviation,
    correlationStrength: pair.correlationStrength as CorrelationStrength,
  }

  const finalPrompt = promptTemplate(promptConfigAsset1, promptConfigAsset2, promptConfigCorrelation)
  const characters = await loadCharacters()
    const character = characters[0]


  const runtime = new AgentRuntime({
    character,
    plugins: [],
    token: process.env.OPENAI_API_KEY || '',
    agentId: stringToUuid(
      character.name,
    ) as `${string}-${string}-${string}-${string}-${string}`,
    modelProvider: character.modelProvider,
    databaseAdapter: minimalDatabaseAdapter,
    cacheManager: new CompatibleCacheAdapter(),
    logging: true,
  });

  const response = await generateText({
    runtime,
    context: finalPrompt,
    modelClass: "medium"
  })
  console.log('Response from model is: ',response)
}

main().catch(console.error);