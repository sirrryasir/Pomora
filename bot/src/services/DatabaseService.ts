import { PrismaClient, Prisma } from '@prisma/client';
import { config } from 'dotenv';

config();

// Types for backward compatibility with existing service consumers
export interface GuildConfigData {
    guild_id: string;
    study_channel_id: string | null;
    report_channel_id: string | null;
    welcome_channel_id: string | null;
    welcome_message: any | null;
    welcome_enabled: boolean;
    updated_at: Date;
}

export interface GuildStatsData {
    id: string;
    guild_id: string;
    user_id: string;
    daily_time: number;
    weekly_time: number;
    monthly_time: number;
    total_time: number;
    updated_at: Date;
}

const globalForPrisma = globalThis as unknown as {
    prisma: PrismaClient | undefined;
};

export class DatabaseService {
    private prisma: PrismaClient;

    constructor() {
        const rawUrl = process.env.DATABASE_URL || "";
        const databaseUrl = rawUrl.trim();

        if (!databaseUrl) {
            console.warn('[DatabaseService] ⚠️ DATABASE_URL missing or empty. Operations will fail.');
            // Fail fast for index creation or critical paths if possible
            this.prisma = new PrismaClient(); 
        } else {
            const separator = databaseUrl.includes('?') ? '&' : '?';
            const finalUrl = `${databaseUrl}${separator}connect_timeout=15&pool_timeout=15&connection_limit=3`;
            
            // Masked host for debugging without leaking creds
            try {
                const host = new URL(databaseUrl).host;
                console.log(`[DatabaseService] Connecting to host: ${host}`);
            } catch (e) {
                console.warn('[DatabaseService] Could not parse host from URL.');
            }

            this.prisma = globalForPrisma.prisma ?? new PrismaClient({
                datasources: {
                    db: {
                        url: finalUrl,
                    },
                },
            });

            if (process.env.NODE_ENV !== 'production') globalForPrisma.prisma = this.prisma;
            console.log(`[DatabaseService] Connected via Prisma (Limited pool).`);
        }
    }

    isConnected(): boolean {
        return !!process.env.DATABASE_URL;
    }

    /**
     * Logs a completed session.
     * Upserts into guild_stats to keep leaderboards real-time.
     */
    async logSession(userId: string, guildId: string | null, durationMinutes: number, sessionType: 'focus' | 'break' = 'focus') {
        try {
            // 1. Immutable Log
            await this.prisma.sessionLog.create({
                data: {
                    userId,
                    guildId,
                    duration: durationMinutes,
                    sessionType,
                    isWeb: false,
                },
            });

            // 2. Aggregated Stats (Upsert)
            if (guildId) {
                await this.prisma.guildStats.upsert({
                    where: {
                        guildId_userId: { guildId, userId },
                    },
                    update: {
                        dailyTime: { increment: durationMinutes },
                        weeklyTime: { increment: durationMinutes },
                        monthlyTime: { increment: durationMinutes },
                        totalTime: { increment: durationMinutes },
                    },
                    create: {
                        guildId,
                        userId,
                        dailyTime: durationMinutes,
                        weeklyTime: durationMinutes,
                        monthlyTime: durationMinutes,
                        totalTime: durationMinutes,
                    },
                });
            }
        } catch (err) {
            console.error('[DatabaseService] ❌ Failed to log session:', err);
        }
    }

    /**
     * Fetches top 10 users for the leaderboard.
     */
    async getGuildLeaderboard(guildId: string, timeframe: 'daily' | 'weekly' | 'monthly' | 'total' = 'total'): Promise<GuildStatsData[]> {
        try {
            const orderByField = timeframe === 'daily' ? 'dailyTime' :
                timeframe === 'weekly' ? 'weeklyTime' :
                    timeframe === 'monthly' ? 'monthlyTime' :
                        'totalTime';

            const data = await this.prisma.guildStats.findMany({
                where: { guildId },
                orderBy: { [orderByField]: 'desc' },
                take: 10,
            });

            // Map to snake_case for backward compatibility with ImageService etc.
            return data.map(d => ({
                id: d.id,
                guild_id: d.guildId,
                user_id: d.userId,
                daily_time: d.dailyTime,
                weekly_time: d.weeklyTime,
                monthly_time: d.monthlyTime,
                total_time: d.totalTime,
                updated_at: d.updatedAt,
            }));
        } catch (error) {
            console.error('[DatabaseService] ❌ Error fetching leaderboard:', error);
            return [];
        }
    }

    /**
     * Retrieves guild configuration.
     */
    async getGuildConfig(guildId: string): Promise<GuildConfigData | null> {
        try {
            const data = await this.prisma.guildConfig.findUnique({
                where: { guildId },
            });

            if (!data) return null;

            // Map to snake_case for backward compatibility
            return {
                guild_id: data.guildId,
                study_channel_id: data.studyChannelId,
                report_channel_id: data.reportChannelId,
                welcome_channel_id: data.welcomeChannelId,
                welcome_message: data.welcomeMessage,
                welcome_enabled: data.welcomeEnabled,
                updated_at: data.updatedAt,
            };
        } catch (error) {
            console.error(`[DatabaseService] ❌ Error fetching config for ${guildId}:`, error);
            return null;
        }
    }

    /**
     * Updates guild configuration (Channels, etc).
     */
    async updateGuildConfig(guildId: string, updates: Partial<GuildConfigData>) {
        try {
            await this.prisma.guildConfig.upsert({
                where: { guildId },
                update: {
                    studyChannelId: updates.study_channel_id !== undefined ? updates.study_channel_id : undefined,
                    reportChannelId: updates.report_channel_id !== undefined ? updates.report_channel_id : undefined,
                    welcomeChannelId: updates.welcome_channel_id !== undefined ? updates.welcome_channel_id : undefined,
                    welcomeMessage: updates.welcome_message !== undefined ? (updates.welcome_message ?? Prisma.JsonNull) : undefined,
                    welcomeEnabled: updates.welcome_enabled !== undefined ? updates.welcome_enabled : undefined,
                },
                create: {
                    guildId,
                    studyChannelId: updates.study_channel_id ?? null,
                    reportChannelId: updates.report_channel_id ?? null,
                    welcomeChannelId: updates.welcome_channel_id ?? null,
                    welcomeMessage: updates.welcome_message ?? Prisma.JsonNull,
                    welcomeEnabled: updates.welcome_enabled ?? false,
                },
            });
        } catch (error) {
            console.error(`[DatabaseService] ❌ Error updating config for ${guildId}:`, error);
            throw error;
        }
    }

    /**
     * Aggregates a user's total study time across all servers.
     */
    async getUserProfile(userId: string) {
        try {
            const data = await this.prisma.guildStats.findMany({
                where: { userId },
                select: {
                    dailyTime: true,
                    weeklyTime: true,
                    monthlyTime: true,
                    totalTime: true,
                },
            });

            if (!data || data.length === 0) return null;

            return data.reduce((acc, curr) => ({
                daily_time: acc.daily_time + curr.dailyTime,
                weekly_time: acc.weekly_time + curr.weeklyTime,
                monthly_time: acc.monthly_time + curr.monthlyTime,
                total_time: acc.total_time + curr.totalTime,
            }), { daily_time: 0, weekly_time: 0, monthly_time: 0, total_time: 0 });

        } catch (error) {
            console.error(`[DatabaseService] ❌ Error fetching profile for ${userId}:`, error);
            return null;
        }
    }

    /**
     * Resets stats for a specific timeframe.
     */
    async resetStats(timeframe: 'daily' | 'weekly' | 'monthly') {
        try {
            if (timeframe === 'daily') {
                await this.prisma.guildStats.updateMany({ data: { dailyTime: 0 } });
            } else if (timeframe === 'weekly') {
                await this.prisma.guildStats.updateMany({ data: { weeklyTime: 0 } });
            } else if (timeframe === 'monthly') {
                await this.prisma.guildStats.updateMany({ data: { monthlyTime: 0 } });
            }
            console.log(`[DatabaseService] 🔄 Reset ${timeframe} stats.`);
        } catch (error) {
            console.error(`[DatabaseService] ❌ Error resetting ${timeframe} stats:`, error);
        }
    }

    // --- Active Message Management (for persistent status cards) ---

    async setActiveMessage(channelId: string, guildId: string, messageId: string) {
        try {
            await this.prisma.activeChannelMessage.upsert({
                where: { channelId },
                update: { messageId },
                create: { channelId, guildId, messageId },
            });
        } catch (error) {
            console.error(`[DatabaseService] Error setting active message:`, error);
        }
    }

    async getActiveMessage(channelId: string): Promise<string | null> {
        try {
            const data = await this.prisma.activeChannelMessage.findUnique({
                where: { channelId },
            });
            return data?.messageId || null;
        } catch (error) {
            return null;
        }
    }

    async deleteActiveMessage(channelId: string) {
        try {
            await this.prisma.activeChannelMessage.delete({
                where: { channelId },
            });
        } catch (error) { /* Ignore - may not exist */ }
    }
}
