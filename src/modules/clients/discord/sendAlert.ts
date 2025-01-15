import { Client, GatewayIntentBits, TextChannel, EmbedBuilder } from 'discord.js';
import { DiscordResponse } from '@/common/types';
import { config } from 'dotenv';

config();

const TOKEN = process.env.DISCORD_BOT_TOKEN || '';
const CHANNEL_ID = String(process.env.DISCORD_CHANNEL_ID || '');

const client = new Client({
  intents: [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildMessages,
    GatewayIntentBits.MessageContent,
  ]
})

let isInitialized = false

async function initializeClient() {
  if (!isInitialized) {
    return new Promise((resolve, reject) => {
      client.on('error', (error) => {
        console.error('Discord client error:', error)
        reject(error)
      })

      client.once('ready', () => {
        console.log('Discord client ready')
        isInitialized = true
        resolve(true)
      })

      const loginPromise = client.login(TOKEN)
      const timeoutPromise = new Promise((_, reject) => {
        setTimeout(() => reject(new Error('Discord client login timeout')), 10000)
      })

      Promise.race([loginPromise, timeoutPromise])
        .catch(reject)
    })
  }
  return Promise.resolve(true)
}


export async function sendMessage(response: DiscordResponse) {
  try {
    console.log('Initializing Discord client...')
    await initializeClient()
    
    console.log('Fetching Discord channel...')
    const channel = await client.channels.fetch(CHANNEL_ID)
    if (!channel || !(channel instanceof TextChannel)) {
      throw new Error('Invalid Discord channel')
    }

    console.log('Sending Discord message...')
    const message = formatDiscordMessage(response)
    await channel.send(message)
    
    console.log('Discord message sent successfully')
  } catch (error) {
    console.error('Discord send message error:', error)
  } finally {
    try {
      await client.destroy()
      isInitialized = false
    } catch (error) {
      console.error('Error destroying Discord client:', error)
    }
  }
}

function formatDiscordMessage(response: DiscordResponse): string {
  return `
🔗 Correlation Alert
${response.long} ↔️ ${response.short}
Correlation: ${response.pearsonCorrelation}
StdDev: ${response.standardDeviation}
Category: ${response.category} (${response.related} related)
📝 ${response.remarks}
  `.trim()
}