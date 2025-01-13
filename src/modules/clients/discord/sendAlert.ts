import { Client, GatewayIntentBits, TextChannel, EmbedBuilder } from 'discord.js';
import { DiscordResponse } from '@/common/types';
import { config } from 'dotenv';

config();

const client = new Client({
  intents: [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildMessages,
  ]
});

const TOKEN = process.env.DISCORD_BOT_TOKEN;
const CHANNEL_ID = process.env.DISCORD_CHANNEL_ID;

async function sendTradeAlert({
  title,
  longPosition,
  shortPosition,
  related,
  pearsonCorrelation,
  standardDeviation,
  remarks,
  color = '#43B581'
}: {
  title: string;
  longPosition: string;
  shortPosition: string;
  related: string;
  pearsonCorrelation: string;
  standardDeviation: string;
  remarks: string;
  color?: string;
}) {
  try {
    const channel = await client.channels.fetch(CHANNEL_ID!) as TextChannel;
    if (!channel) {
      throw new Error('Channel not found');
    }

    const embed = new EmbedBuilder()
    .setColor(color as any)
    .setTitle(title)
    .setDescription(
        `**📈 Long:** ${longPosition}\n\n` +
        `**📉 Short:** ${shortPosition}\n\n` +
        `**✅ Related:** ${related}\n\n` +
        `**📊 Pearson Correlation:** ${pearsonCorrelation}\n\n` +
        `**📏 Standard Deviation:** ${standardDeviation}\n\n` +
        `**✨ Remarks:** ${remarks}`
    )
    .setTimestamp();

    await channel.send({ embeds: [embed] });
    return
  } catch (error) {
    console.error('Error sending trade alert:', error);
  }
}

export async function sendMessage(tradeData: DiscordResponse) {
  await sendTradeAlert({
    title: '🟢 Pair Trade Alert 🟢',
    longPosition: tradeData.long,
    shortPosition: tradeData.short,
    related: tradeData.related,
    pearsonCorrelation: tradeData.pearsonCorrelation.toString(),
    standardDeviation: tradeData.standardDeviation.toString(),
    remarks: tradeData.remarks,
    color: '#43B581'
  });
  console.log('✅ Successfully sent discord alert!');
  return
}

client.once('ready', () => {
  console.log(`Logged in as ${client.user?.tag}`);
});

client.login(TOKEN);