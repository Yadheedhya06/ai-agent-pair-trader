import { WebhookClient, EmbedBuilder } from 'discord.js';
import { DiscordResponse } from '@/common/types';
import { config } from 'dotenv';

config();

const WEBHOOK_URL = process.env.DISCORD_WEBHOOK_URL;

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
  if (!WEBHOOK_URL) {
    throw new Error('Discord webhook URL not configured');
  }

  try {
    const webhookClient = new WebhookClient({ url: WEBHOOK_URL });

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

    await webhookClient.send({ embeds: [embed] });
    webhookClient.destroy();
    return;
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
  return;
}