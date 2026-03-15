import { Client, GatewayIntentBits, MessageFlags, ModalBuilder, TextInputBuilder, TextInputStyle, ActionRowBuilder, Events } from 'discord.js';
import { config } from 'dotenv';
// Load environment variables only if not explicitly set (Render/Production handles this natively)
if (!process.env.DISCORD_TOKEN || !process.env.DATABASE_URL) {
    config();
}
import http from 'node:http';
import { VoiceManager } from './services/VoiceManager.js';
import { TimerService } from './services/TimerService.js';
import { DatabaseService } from './services/DatabaseService.js';
import { LeaderboardReporter } from './services/LeaderboardReporter.js';
import { CommandRegistry } from './services/CommandRegistry.js';
import { WelcomeService } from './services/WelcomeService.js';
// Simple health check server
const port = process.env.PORT || 8080;
http.createServer((req, res) => {
    res.writeHead(200, { 'Content-Type': 'text/plain' });
    res.end('Pomora Bot is running\n');
}).listen(port, () => {
    console.log(`Health check server listening on port ${port}`);
});
const client = new Client({
    intents: [
        GatewayIntentBits.Guilds,
        GatewayIntentBits.GuildVoiceStates,
        GatewayIntentBits.GuildMessages,
        GatewayIntentBits.MessageContent,
        GatewayIntentBits.GuildMembers, // Required for GuildMemberAdd
    ],
});
// Initialize services
export const dbService = new DatabaseService();
export const timerService = new TimerService();
export const voiceManager = new VoiceManager(client, timerService, dbService);
export const leaderboardReporter = new LeaderboardReporter(client, dbService);
export const welcomeService = new WelcomeService(client, dbService);
// Command Registry
let commandRegistry;
client.once(Events.ClientReady, async (c) => {
    console.log(`Bot Active: ${c.user.tag}`);
    // Initialize Command Registry and deploying commands
    // Initialize Command Registry and deploying commands
    commandRegistry = new CommandRegistry(client, dbService, welcomeService, leaderboardReporter, timerService);
    await commandRegistry.deployCommands();
    // --- Global Status Loop ---
    // Updates presence every minute to show total users studying across all servers
    const updatePresence = () => {
        const totalUsers = timerService.getTotalParticipants();
        const statusText = `${totalUsers} People Deep Working`;
        c.user.setActivity(statusText, { type: 4 }); // Type 4 is "Custom Status" (or similar depending on lib version, usually ActivityType.Watching/Listening is better)
        // Let's use ActivityType.Watching for "Watching X People Studying" or just set state.
        // Using setPresence with activities
        c.user.setPresence({
            activities: [{ name: `${totalUsers} People Working`, type: 3 }], // 3 = Watching
            status: 'online'
        });
    };
    updatePresence(); // Initial call
    setInterval(updatePresence, 60 * 1000); // Update every minute
});
// --- Event: Bot Join (Onboarding) ---
client.on('guildCreate', async (guild) => {
    console.log(`Joined new guild: ${guild.name}`);
    const channel = guild.systemChannel ||
        guild.channels.cache.find(c => c.type === 0 && (c.name.includes('general') || c.name.includes('bot')));
    if (channel) {
        await welcomeService.handleGuildCreate(channel);
    }
});
// --- Event: Member Join (Welcome) ---
client.on('guildMemberAdd', async (member) => {
    await welcomeService.handleMemberJoin(member);
});
// --- Event: Voice State Update ---
client.on('voiceStateUpdate', async (oldState, newState) => {
    const member = newState.member || oldState.member;
    if (!member || member.user.bot || member.id === client.user?.id)
        return;
    const guildId = newState.guild.id || oldState.guild.id;
    // console.log(`[DiscordEvent] VoiceUpdate for ${member.user.tag} in ${guildId}`);
    const config = await dbService.getGuildConfig(guildId);
    const studyChannelId = config?.study_channel_id;
    // Join Logic
    if (newState.channel && (!oldState.channel || oldState.channel.id !== newState.channel.id)) {
        if (studyChannelId && newState.channel.id === studyChannelId) {
            console.log(`[DiscordEvent] Valid Join detected for ${studyChannelId}`);
            await voiceManager.handleUserJoin(newState);
        }
    }
    // Leave Logic
    if (oldState.channel && (!newState.channel || oldState.channel.id !== newState.channel.id)) {
        if (studyChannelId && oldState.channel.id === studyChannelId) {
            console.log(`[DiscordEvent] Valid Leave detected for ${studyChannelId}`);
            await voiceManager.handleUserLeave(oldState);
        }
    }
});
// --- Event: Interaction (Slash Commands & Buttons) ---
client.on('interactionCreate', async (interaction) => {
    // 1. Slash Commands
    if (interaction.isChatInputCommand()) {
        if (commandRegistry) {
            await commandRegistry.handleInteraction(interaction);
        }
        return;
    }
    // 2. Modals (Settings)
    if (interaction.isModalSubmit()) {
        if (interaction.customId === 'settings_modal') {
            const focusMins = parseInt(interaction.fields.getTextInputValue('focus_time'));
            const breakMins = parseInt(interaction.fields.getTextInputValue('break_time'));
            const soundText = interaction.fields.getTextInputValue('sound_toggle').toUpperCase();
            const voiceText = interaction.fields.getTextInputValue('voice_toggle').toUpperCase();
            if (isNaN(focusMins) || isNaN(breakMins) || focusMins < 1 || breakMins < 1) {
                return interaction.reply({ content: 'Please enter valid numbers.', flags: [MessageFlags.Ephemeral] });
            }
            const room = timerService.getUserSession(interaction.user.id);
            if (room) {
                room.customFocusTime = focusMins * 60;
                room.customBreakTime = breakMins * 60;
                room.soundEnabled = soundText !== 'OFF';
                room.voiceEnabled = voiceText !== 'OFF';
                room.duration = room.type === 'focus' ? room.customFocusTime : room.customBreakTime;
                room.remaining = room.duration;
                const settingsDesc = `**${focusMins}m Focus** / **${breakMins}m Break**\nSound: **${room.soundEnabled ? 'ON' : 'OFF'}** | Voice: **${room.voiceEnabled ? 'ON' : 'OFF'}**`;
                await interaction.reply({ content: `Settings Updated\n${settingsDesc}`, flags: [MessageFlags.Ephemeral] });
                await voiceManager.updateStatusMessage(room.guildId, room.channelId, true, true);
            }
            else {
                await interaction.reply({ content: 'Join a voice channel to change settings.', flags: [MessageFlags.Ephemeral] });
            }
        }
        return;
    }
    // 3. Buttons
    if (interaction.isButton()) {
        try {
            const customId = interaction.customId;
            if (customId === 'present_all') {
                await interaction.deferReply({ flags: [MessageFlags.Ephemeral] }).catch(() => { });
                timerService.confirmParticipation(interaction.user.id);
                await interaction.editReply({
                    content: 'Presence confirmed. Good luck and stay productive.'
                }).catch(() => { });
                const room = timerService.getUserSession(interaction.user.id);
                if (room) {
                    await voiceManager.updateStatusMessage(room.guildId, room.channelId, true);
                }
            }
            else if (customId === 'stop_all') {
                await interaction.deferReply({ flags: [MessageFlags.Ephemeral] }).catch(() => { });
                const room = timerService.getUserSession(interaction.user.id);
                timerService.stopTimer(interaction.user.id);
                await interaction.editReply({ content: 'Timer stopped.' }).catch(() => { });
                if (room) {
                    await voiceManager.updateStatusMessage(room.guildId, room.channelId, true);
                }
            }
            else if (customId === 'options') {
                const modal = new ModalBuilder()
                    .setCustomId('settings_modal')
                    .setTitle('Room Settings');
                const focusInput = new TextInputBuilder()
                    .setCustomId('focus_time')
                    .setLabel('Focus Duration (minutes)')
                    .setStyle(TextInputStyle.Short)
                    .setPlaceholder('25')
                    .setRequired(true)
                    .setMinLength(1)
                    .setMaxLength(2);
                const breakInput = new TextInputBuilder()
                    .setCustomId('break_time')
                    .setLabel('Break Duration (minutes)')
                    .setStyle(TextInputStyle.Short)
                    .setPlaceholder('5')
                    .setRequired(true)
                    .setMinLength(1)
                    .setMaxLength(2);
                const soundInput = new TextInputBuilder()
                    .setCustomId('sound_toggle')
                    .setLabel('Sound Effects (ON/OFF)')
                    .setStyle(TextInputStyle.Short)
                    .setValue('ON')
                    .setRequired(true)
                    .setMaxLength(3);
                const voiceInput = new TextInputBuilder()
                    .setCustomId('voice_toggle')
                    .setLabel('Voice Alerts (ON/OFF)')
                    .setStyle(TextInputStyle.Short)
                    .setValue('ON')
                    .setRequired(true)
                    .setMaxLength(3);
                modal.addComponents(new ActionRowBuilder().addComponents(focusInput), new ActionRowBuilder().addComponents(breakInput), new ActionRowBuilder().addComponents(soundInput), new ActionRowBuilder().addComponents(voiceInput));
                await interaction.showModal(modal);
            }
        }
        catch (error) {
            console.error('Interaction error:', error);
        }
    }
});
client.on('error', error => console.error('Client error:', error));
process.on('unhandledRejection', error => console.error('Unhandled rejection:', error));
const token = process.env.DISCORD_TOKEN?.trim();
if (!token) {
    console.error('[Bot] ❌ No DISCORD_TOKEN found in environment!');
}
else {
    const masked = token.substring(0, 4) + '...' + token.substring(token.length - 4);
    console.log(`[Bot] Attempting login with token: ${masked}`);
    client.login(token);
}
