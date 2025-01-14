import type { NextRequest } from 'next/server'
import { ApplicationDatabase } from "@/scripts/db/appDB";
import { CorrelationStrength, CorrelationResult } from "../../../../../public/types/correlation";
import { finalEnums } from "../../../../../public/assets/data/finalEnums";
import { getCoinDataById } from "@/modules/coingecko/getCoinDataById";
import { getFundingRate } from "@/modules/coinglass/getFundingRate";
import { TickerSchema, MarketDataSchema, PromptAssetMetrics, DiscordResponse } from "@/common/types";
import { promptTemplate } from "@/common/prompt";
import { minimalDatabaseAdapter, CompatibleCacheAdapter } from '@/common/utils';
import { AgentRuntime, stringToUuid,generateText } from "@ai16z/eliza";
import { loadCharacters } from "@/scripts/loader";
import { generateAssetPromptConfig } from "@/common/utils";
import { sendMessage } from "@/modules/clients/discord/sendAlert";
import { getTokenUnlocks } from '@/modules/tokenomist/tokenUnlocks';
import { cronRunner } from "../modules/cron-runner";

export const GET = async (request: NextRequest) =>
  cronRunner(request, alertDiscord)

async function alertDiscord() {
  console.log('🏁 Starting Agent')
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

  const [fundingRateAsset1, fundingRateAsset2] = await Promise.all([
    getFundingRate(pair.asset1),
    getFundingRate(pair.asset2)
  ]);  

  const [tokenUnlockAsset1, tokenUnlockAsset2] = await Promise.all([
    getTokenUnlocks(asset1CoinId),
    getTokenUnlocks(asset2CoinId)
  ])
  const promptConfigAsset1: PromptAssetMetrics = generateAssetPromptConfig(pair.asset1, asset1MarketData.market_data, asset1TickerData, fundingRateAsset1, tokenUnlockAsset1)

  const promptConfigAsset2: PromptAssetMetrics = generateAssetPromptConfig(pair.asset2, asset2MarketData.market_data, asset2TickerData, fundingRateAsset2, tokenUnlockAsset2)

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

  console.log(response)

  const parseModelResponse = (response: string) => {
    const lines = response.split('\n');
    return {
      long: lines[0].split(':')[1].trim(),
      short: lines[1].split(':')[1].trim(),
      pearsonCorrelation: parseFloat(lines[2].split(':')[1].trim()),
      standardDeviation: parseFloat(lines[3].split(':')[1].trim()),
      remarks: lines[4].split(':')[1].trim()
    };
  };

  const parsedResponse: DiscordResponse = {
    ...parseModelResponse(response),
    related: `${pair.correlationStrength}ly`,
    category: pair.category
  };
  console.log('Parsed response:', parsedResponse);
  await sendMessage(parsedResponse)

  console.log(
    '🏁 Completed Agent run',
    JSON.stringify(parseModelResponse, null, 2),
  )
}