# AI-Powered Pairs Trading Agent
 An AI Agent that analyzes cryptocurrency pairs trading opportunities using correlation analysis. It monitors market data from Coingecko and Coinglass, identifies strongly correlated crypto pairs, and generates trading insights through a Discord bot. The agent uses the Eliza framework for natural language processing to communicate market analysis and potential trading opportunities.

 Key features:
 - Automated correlation analysis of crypto trading pairs
 - Real-time market data integration from Coingecko and Coinglass APIs
 - Discord bot integration for trade alerts and market insights
 - Natural language processing for human-friendly market analysis
 - Scheduled cron jobs for continuous market monitoring
 - Prisma database for storing historical correlation data

<p align="center">
  <img src="https://github.com/user-attachments/assets/ff7088e1-0ea8-4bb0-966d-7317d1c5eed5" alt="AI-Powered Pairs Trading Agent" width="500">
</p>

```
Directory structure:
└── yadheedhya06-ai-agent-pair-trader/
    ├── README.md
    ├── LICENSE
    ├── biome.json
    ├── next-env.d.ts
    ├── next.config.mjs
    ├── package.json
    ├── pnpm-lock.yaml
    ├── postcss.config.js
    ├── tailwind.config.js
    ├── tsconfig.json
    ├── vercel.json
    ├── .env.example
    ├── characters/
    │   └── trade.character.ts
    ├── prisma/
    │   └── schema.prisma
    ├── public/
    │   ├── assets/
    │   │   ├── data/
    │   │   │   ├── finalEnums.ts
    │   │   │   ├── fetched/
    │   │   │   │   ├── binancePairs.ts
    │   │   │   │   └── coingeckoCoins.ts
    │   │   │   └── helpers/
    │   │   │       └── pairOutliers.ts
    │   │   └── lib/
    │   │       ├── correlationAnalysis.ts
    │   │       └── generatePairs.ts
    │   ├── scripts/
    │   │   ├── getCoinglassPairs.ts
    │   │   ├── getCoins.ts
    │   │   ├── mapPairsAndCoins.ts
    │   │   ├── upsertCoinsToDb.ts
    │   │   ├── upsertPairsToDb.ts
    │   │   └── infrastructure/
    │   │       ├── coingecko/
    │   │       │   └── getHistoricalPrices.ts
    │   │       └── db/
    │   │           └── dbAction.ts
    │   └── types/
    │       ├── coingecko.ts
    │       ├── coinglass.ts
    │       ├── correlation.ts
    │       ├── db.ts
    │       └── utils.ts
    ├── src/
    │   ├── app/
    │   │   ├── globals.css
    │   │   ├── layout.tsx
    │   │   ├── page.tsx
    │   │   └── api/
    │   │       └── cron/
    │   │           ├── discord/
    │   │           │   └── route.ts
    │   │           └── modules/
    │   │               └── cron-runner.ts
    │   ├── common/
    │   │   ├── prompt.ts
    │   │   ├── types.ts
    │   │   └── utils.ts
    │   ├── modules/
    │   │   ├── clients/
    │   │   │   └── discord/
    │   │   │       └── sendAlert.ts
    │   │   ├── coingecko/
    │   │   │   └── getCoinDataById.ts
    │   │   └── coinglass/
    │   │       └── getFundingRate.ts
    │   └── scripts/
    │       ├── loader.ts
    │       └── db/
    │           └── appDB.ts
    └── .github/
        └── workflows/
            └── lint.yaml
```


## Correlation Analysis

We analyze the correlation between cryptocurrency pairs using Pearson correlation coefficient, which measures the linear correlation between two variables. The correlation strength is categorized as follows:

| Correlation Strength | Absolute Correlation Range |
|---------------------|---------------------------|
| Very Strong | ≥ 0.90 |
| Strong | ≥ 0.85 |
| Moderate | ≥ 0.80 |
| Weak | ≥ 0.30 |
| Very Weak | < 0.30 |

Our analysis of cryptocurrency pairs yielded the following distribution:

✨ Total number of Pairs generated: 13,244
- Very Strong correlation: 5 pairs
- Strong correlation: 55 pairs  
- Moderate correlation: 388 pairs
- Weak correlation: 9,747 pairs
- Very Weak correlation: 3,049 pairs

This distribution shows that while most cryptocurrency pairs have weak or very weak correlations, there are still a significant number of pairs with moderate to very strong correlations that could be valuable for trading strategies and market analysis.

For efficiency and focus on the most meaningful relationships, we store only pairs with correlations of 0.80 and above in our database. This includes:
- Very Strong correlations (≥ 0.90)
- Strong correlations (≥ 0.85)
- Moderate correlations (≥ 0.80)

This results in a total of 448 high-quality pairs being actively tracked and available for analysis.

## Environment Setup

you'll need to set up the following environment variables in a `.env` file:
```
OPENAI_API_KEY =                        //paste your openai api(No free tier)
COINGLASS_API_KEY =                     //paste your coinglass api(No free tier)
COINGECKO_API_KEY =                     // paste your coingecko api key(No free tier)
DATABASE_URL =                          //paste your database url(Free tier available)
DISCORD_BOT_TOKEN =                     // paste your discord bot token
DISCORD_CHANNEL_ID =                    // paste your dicord channel id
```




## Data Collection and Processing

After identifying correlated pairs, our system:

1. **Random Pair Selection**
   - Randomly selects a pair from the filtered set of correlations (≥ 0.80)
   - Focuses on Very Strong (≥0.90), Strong (≥0.85), and Moderate (≥0.80) correlations

2. **Market Data Collection**
   For each asset in the selected pair:
   - Fetches comprehensive market data from CoinGecko API including:
     - Current price
     - 24h trading volume
     - Market cap
     - Price changes (24h, 7d, etc.)
   - Retrieves Binance-specific ticker data:
     - Last price
     - Trading volume
     - Trust score
     - Quote asset details

3. **Funding Rate Analysis**
   - Queries Coinglass API for funding rates
   - Focuses on Binance perpetual futures
   - Collects funding rates for both assets in the pair
   - Helps identify potential arbitrage opportunities

This data collection process runs every 10 minutes via a scheduled cron job, ensuring our analysis stays current with market conditions.

4. **AI Analysis and Response Generation**
   - Aggregates collected data into a structured format:
     - Correlation pair details
     - Market data for both assets
     - Funding rates
     - Trading metrics
   - Processes through a prompt template system that:
     - Formats data consistently
     - Highlights key relationships
     - Emphasizes significant market movements
   - Passes formatted prompt to Eliza runtime AI agent which:
     - Analyzes market conditions
     - Evaluates correlation strength
     - Identifies trading opportunities
     - Generates natural language insights
   - Returns structured response containing:
     - Market analysis
     - Trading recommendations
     - Risk assessments
     - Supporting data points

The AI agent's response is then formatted and delivered through Discord, providing traders with actionable insights based on correlation analysis and current market conditions.

5. **Discord Alert Distribution**
   The system sends formatted alerts to Discord that include:
   - **Correlation Analysis**
     - Pair identification (e.g., BTC/ETH)
     - Correlation strength category
     - Correlation coefficient value
   
   - **Market Context**
     - Current prices for both assets
     - 24h price changes
     - Trading volumes
     - Market sentiment indicators
   
   - **AI-Generated Insights**
     - Natural language market analysis
     - Pattern identification
     - Potential trading opportunities
     - Risk considerations
   
   - **Technical Metrics**
     - Funding rates comparison
     - Volume analysis
     - Price momentum indicators
     - Market depth assessment

The Discord alerts are designed to be:
- Concise yet comprehensive
- Easy to read and understand
- Actionable for traders
- Backed by data and analysis

Alerts are delivered every 10 minutes, providing regular updates while avoiding alert fatigue. Each message is structured to highlight the most important information first, with supporting details available for those who want to dive deeper.



