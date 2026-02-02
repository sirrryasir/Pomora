import { AttachmentBuilder } from 'discord.js';
import { ImageService } from './ImageService.js';
// Initialize services
export class LeaderboardReporter {
    client;
    dbService;
    imageService;
    constructor(client, dbService) {
        this.client = client;
        this.dbService = dbService;
        this.imageService = new ImageService();
        setInterval(() => this.checkAndSendReports(), 60 * 60 * 1000);
    }
    async checkAndSendReports() {
        const now = new Date();
        const hour = now.getHours();
        if (hour === 20) {
            await this.broadcastReports('daily');
        }
        if (now.getDay() === 5 && hour === 20) {
            await this.broadcastReports('weekly');
        }
        if (now.getDate() === 1 && hour === 20) {
            await this.broadcastReports('monthly');
        }
    }
    async broadcastReports(timeframe) {
        const guilds = this.client.guilds.cache;
        for (const [guildId] of guilds) {
            await this.sendGuildReport(guildId, timeframe);
        }
    }
    async sendGuildReport(guildId, timeframe, targetChannel, authorId) {
        const guild = this.client.guilds.cache.get(guildId);
        if (!guild)
            return;
        try {
            let leaderboard = await this.dbService.getGuildLeaderboard(guildId, timeframe);
            const isManual = !!targetChannel;
            if (leaderboard.length === 0 && !isManual)
                return;
            // Fetch guild config to find the report channel
            const config = await this.dbService.getGuildConfig(guildId);
            const configChannelId = config?.report_channel_id;
            let channel = targetChannel || null;
            if (!channel && configChannelId) {
                channel = (guild.channels.cache.get(configChannelId) || await guild.channels.fetch(configChannelId));
            }
            if (!channel) {
                channel = (guild.systemChannel ||
                    guild.channels.cache.find(c => c.type === 0 && (c.name.includes('pomo') || c.name.includes('bot'))) ||
                    guild.channels.cache.find(c => c.type === 0));
            }
            if (!channel)
                return;
            if (leaderboard.length === 0) {
                if (isManual) {
                    await targetChannel.send("No study data available for this timeframe yet.");
                }
                return;
            }
            if (leaderboard.length === 0)
                return;
            const imageBuffer = await this.imageService.generateLeaderboardCard(guild.name, timeframe === 'daily' ? 'Daily' : timeframe === 'weekly' ? 'Weekly' : 'Monthly', leaderboard, this.client);
            const attachment = new AttachmentBuilder(imageBuffer, { name: 'leaderboard.png' });
            await channel.send({
                content: `**${timeframe.toUpperCase()} REPORT** for **${guild.name}**`,
                files: [attachment]
            });
        }
        catch (err) {
            console.error(`Failed to send report to guild ${guildId}:`, err);
            if (targetChannel) {
                await targetChannel.send("Error generating visual report.");
            }
        }
    }
}
