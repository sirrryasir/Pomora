import { createClient, SupabaseClient } from '@supabase/supabase-js';
import { RoomSession } from './TimerService.js';
import { config } from 'dotenv';

config();

export class DatabaseService {
    private supabase: SupabaseClient;

    constructor() {
        const supabaseUrl = process.env.SUPABASE_URL || process.env.NEXT_PUBLIC_SUPABASE_URL || '';
        const supabaseKey = process.env.SUPABASE_ANON_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '';

        if (!supabaseUrl || !supabaseKey) {
            console.warn('Supabase credentials missing. Database operations will be skipped.');
            this.supabase = null as any;
        } else {
            this.supabase = createClient(supabaseUrl, supabaseKey);
        }
    }

    /**
     * Logs a completed focus session and updates server/global stats
     */
    async logSession(userId: string, guildId: string | null, durationMinutes: number, sessionType: 'focus' | 'break' = 'focus') {
        if (!this.supabase || !process.env.SUPABASE_URL) return;

        try {
            // 1. Log the individual session
            const { error: sessionError } = await this.supabase
                .from('session_logs')
                .insert({
                    user_id: userId,
                    guild_id: guildId,
                    duration: durationMinutes,
                    session_type: sessionType,
                    is_web: false
                });

            if (sessionError) throw sessionError;

            // 2. Update Guild Stats if in a server
            if (guildId) {
                const { data: currentStats } = await this.supabase
                    .from('guild_stats')
                    .select('*')
                    .eq('guild_id', guildId)
                    .eq('user_id', userId)
                    .single();

                if (currentStats) {
                    await this.supabase
                        .from('guild_stats')
                        .update({
                            daily_time: currentStats.daily_time + durationMinutes,
                            weekly_time: currentStats.weekly_time + durationMinutes,
                            monthly_time: currentStats.monthly_time + durationMinutes,
                            total_time: currentStats.total_time + durationMinutes,
                            updated_at: new Date()
                        })
                        .eq('id', currentStats.id);
                } else {
                    await this.supabase
                        .from('guild_stats')
                        .insert({
                            guild_id: guildId,
                            user_id: userId,
                            daily_time: durationMinutes,
                            weekly_time: durationMinutes,
                            monthly_time: durationMinutes,
                            total_time: durationMinutes
                        });
                }
            }

            console.log(`Successfully logged session for user ${userId} (${durationMinutes}m)`);
        } catch (err) {
            console.error('Failed to log session to Supabase:', err);
        }
    }

    /**
     * Gets the top 10 users for a specific guild
     */
    async getGuildLeaderboard(guildId: string, timeframe: 'daily' | 'weekly' | 'monthly' | 'total' = 'total') {
        if (!this.supabase || !process.env.SUPABASE_URL) return [];

        const column = `${timeframe}_time`;
        const { data, error } = await this.supabase
            .from('guild_stats')
            .select('*')
            .eq('guild_id', guildId)
            .order(column, { ascending: false })
            .limit(10);

        if (error) {
            console.error('Error fetching leaderboard:', error);
            return [];
        }
        return data;
    }

    /**
     * Gets configuration for a specific guild
     */
    async getGuildConfig(guildId: string) {
        if (!this.supabase || !process.env.SUPABASE_URL) return null;

        const { data, error } = await this.supabase
            .from('guild_configs')
            .select('*')
            .eq('guild_id', guildId)
            .single();

        if (error && error.code !== 'PGRST116') { // PGRST116 is "no rows found"
            console.error(`Error fetching guild config for ${guildId}:`, error);
        }
        return data;
    }

    /**
     * Updates or creates configuration for a specific guild
     */
    async updateGuildConfig(guildId: string, updates: any) {
        if (!this.supabase || !process.env.SUPABASE_URL) return;

        const { error } = await this.supabase
            .from('guild_configs')
            .upsert({
                guild_id: guildId,
                ...updates,
                updated_at: new Date()
            });

        if (error) {
            console.error(`Error updating guild config for ${guildId}:`, error);
            throw error;
        }
    }

    /**
     * Gets aggregated stats for a specific user across all guilds
     */
    async getUserProfile(userId: string) {
        if (!this.supabase || !process.env.SUPABASE_URL) return null;

        const { data, error } = await this.supabase
            .from('guild_stats')
            .select('daily_time, weekly_time, monthly_time, total_time')
            .eq('user_id', userId);

        if (error) {
            console.error(`Error fetching profile for ${userId}:`, error);
            return null;
        }

        if (!data || data.length === 0) return null;

        // Aggregate stats
        return data.reduce((acc, curr) => ({
            daily_time: (acc.daily_time || 0) + (curr.daily_time || 0),
            weekly_time: (acc.weekly_time || 0) + (curr.weekly_time || 0),
            monthly_time: (acc.monthly_time || 0) + (curr.monthly_time || 0),
            total_time: (acc.total_time || 0) + (curr.total_time || 0)
        }), { daily_time: 0, weekly_time: 0, monthly_time: 0, total_time: 0 });
    }

    /**
     * Persists the last status message ID for a channel
     */
    async setActiveMessage(channelId: string, guildId: string, messageId: string) {
        if (!this.supabase || !process.env.SUPABASE_URL) return;

        const { error } = await this.supabase
            .from('active_channel_messages')
            .upsert({
                channel_id: channelId,
                guild_id: guildId,
                message_id: messageId,
                updated_at: new Date()
            });

        if (error) {
            console.error(`Error setting active message for ${channelId}:`, error);
        }
    }

    /**
     * Retrieves the last status message ID for a channel
     */
    async getActiveMessage(channelId: string) {
        if (!this.supabase || !process.env.SUPABASE_URL) return null;

        const { data, error } = await this.supabase
            .from('active_channel_messages')
            .select('message_id')
            .eq('channel_id', channelId)
            .single();

        if (error && error.code !== 'PGRST116') {
            console.error(`Error fetching active message for ${channelId}:`, error);
        }
        return data?.message_id || null;
    }

    /**
     * Deletes the active message record for a channel
     */
    async deleteActiveMessage(channelId: string) {
        if (!this.supabase || !process.env.SUPABASE_URL) return;

        const { error } = await this.supabase
            .from('active_channel_messages')
            .delete()
            .eq('channel_id', channelId);

        if (error) {
            console.error(`Error deleting active message for ${channelId}:`, error);
        }
    }
}
