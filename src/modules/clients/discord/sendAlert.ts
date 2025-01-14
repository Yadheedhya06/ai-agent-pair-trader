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
  category,
  color = '#43B581'
}: {
  title: string;
  longPosition: string;
  shortPosition: string;
  related: string;
  pearsonCorrelation: string;
  standardDeviation: string;
  remarks: string;
  category: string;
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
    .setDescription([
        `**📈 Long:** ${longPosition}`,
        `**📉 Short:** ${shortPosition}`,
        `**✅ Related:** ${related}`,
        category !== 'other' ? `**🏷️ Category:** ${category.charAt(0).toUpperCase() + category.slice(1)}` : '',
        `**📊 Pearson Correlation:** ${pearsonCorrelation}`,
        `**📏 Standard Deviation:** ${standardDeviation}`,
        `**✨ Remarks:** ${remarks}`
    ].filter(Boolean).join('\n\n'))
    .setTimestamp();

    await channel.send({ embeds: [embed] });
    return
  } catch (error) {
    console.error('Error sending trade alert:', error);
  }
}

export async function sendMessage(tradeData: DiscordResponse) {
  const category = tradeData.category
    .replace(/\bother\s*x\s*/gi, '')
    .replace(/\s*x\s*other\b/gi, '')
    .trim();

  await sendTradeAlert({
    title: '🟢 Pair Trade Alert 🟢',
    longPosition: tradeData.long,
    shortPosition: tradeData.short,
    related: tradeData.related,
    pearsonCorrelation: tradeData.pearsonCorrelation.toString(),
    standardDeviation: tradeData.standardDeviation.toString(),
    remarks: tradeData.remarks,
    category: category,
    color: '#43B581'
  });
  console.log('✅ Successfully sent discord alert!');
  return
}

client.once('ready', () => {
  console.log(`Logged in as ${client.user?.tag}`);
});

client.login(TOKEN);