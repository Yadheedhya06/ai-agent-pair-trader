import { WebhookClient, EmbedBuilder } from 'discord.js'
import { DiscordResponse } from '@/common/types'

export async function sendMessage(response: DiscordResponse) {
  if (!process.env.DISCORD_WEBHOOK_URL) {
    throw new Error('Discord webhook URL not configured')
  }

  const webhookClient = new WebhookClient({ 
    url: process.env.DISCORD_WEBHOOK_URL 
  })

  try {
    console.log('Preparing Discord message...')
    
    const embed = new EmbedBuilder()
      .setColor('#0099ff')
      .setTitle('🔗 Correlation Alert')
      .addFields(
        { name: 'Pair', value: `${response.long} ↔️ ${response.short}`, inline: false },
        { name: 'Correlation', value: String(response.pearsonCorrelation), inline: true },
        { name: 'StdDev', value: String(response.standardDeviation), inline: true },
        { name: 'Category', value: `${response.category} (${response.related} related)`, inline: false },
        { name: 'Remarks', value: response.remarks || 'No remarks', inline: false }
      )
      .setTimestamp()

    console.log('Sending Discord message...')
    await webhookClient.send({
      embeds: [embed]
    })
    
    console.log('Discord message sent successfully')
  } catch (error) {
    console.error('Discord send message error:', error)
    throw error
  } finally {
    webhookClient.destroy()
  }
}