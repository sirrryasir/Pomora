import { Client, GatewayIntentBits, MessageFlags, ModalBuilder, TextInputBuilder, TextInputStyle, ActionRowBuilder, EmbedBuilder, Events } from 'discord.js';
import { config } from 'dotenv';
import http from 'node:http';
import { VoiceManager } from './services/VoiceManager.js';
import { TimerService } from './services/TimerService.js';
import { DatabaseService } from './services/DatabaseService.js';
import { LeaderboardReporter } from './services/LeaderboardReporter.js';
config();
// Simple health check server for Railway/Deployment
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
    ],
});
// Initialize services
export const dbService = new DatabaseService();
export const timerService = new TimerService();
export const voiceManager = new VoiceManager(client, timerService, dbService);
export const leaderboardReporter = new LeaderboardReporter(client, dbService);
client.once(Events.ClientReady, (c) => {
    console.log(`Bot Active: ${c.user.tag}`);
});
client.on('voiceStateUpdate', async (oldState, newState) => {
    const studyChannelName = process.env.STUDY_CHANNEL_NAME || 'Study';
    const member = newState.member || oldState.member;
    if (!member || member.user.bot || member.id === client.user?.id)
        return;
    if (newState.channel && (!oldState.channel || oldState.channel.id !== newState.channel.id)) {
        if (newState.channel.name.toLowerCase().includes(studyChannelName.toLowerCase())) {
            await voiceManager.handleUserJoin(newState);
        }
    }
    if (oldState.channel && (!newState.channel || oldState.channel.id !== newState.channel.id)) {
        if (oldState.channel.name.toLowerCase().includes(studyChannelName.toLowerCase())) {
            await voiceManager.handleUserLeave(oldState);
        }
    }
});
client.on('interactionCreate', async (interaction) => {
    if (!interaction.isButton())
        return;
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
});
client.on('interactionCreate', async (interaction) => {
    if (!interaction.isModalSubmit())
        return;
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
});
client.on('error', error => console.error('Client error:', error));
process.on('unhandledRejection', error => console.error('Unhandled rejection:', error));
client.on('messageCreate', async (message) => {
    if (message.author.bot || !message.guild)
        return;
    const prefix = '!';
    if (!message.content.startsWith(prefix))
        return;
    const args = message.content.slice(prefix.length).trim().split(/ +/);
    const command = args.shift()?.toLowerCase();
    if (command === 'test-report') {
        const timeframe = args[0] || 'weekly';
        if (!['daily', 'weekly', 'monthly'].includes(timeframe)) {
            return message.reply('Usage: !test-report daily|weekly|monthly');
        }
        await message.reply(`Generating ${timeframe} report...`);
        await leaderboardReporter.sendGuildReport(message.guildId, timeframe, message.channel, message.author.id);
    }
    if (command === 'setup' || command === 'config') {
        if (!message.member?.permissions.has('Administrator')) {
            return message.reply("Only Administrators can configure the bot.");
        }
        const subCommand = args[0]?.toLowerCase();
        if (subCommand === 'report-channel' || subCommand === 'reports') {
            const channel = message.mentions.channels.first() || message.channel;
            await dbService.updateGuildConfig(message.guildId, { report_channel_id: channel.id });
            return message.reply(`Report channel set to: ${channel}`);
        }
        const config = await dbService.getGuildConfig(message.guildId);
        const reportChannelId = config?.report_channel_id || message.channelId;
        const embed = new EmbedBuilder()
            .setColor('#FF6B35')
            .setTitle('Pomora Admin Configuration')
            .setDescription('Manage your server settings below.')
            .addFields({ name: 'Report Channel', value: `<#${reportChannelId}>` }, { name: 'Permissions', value: 'Administrator Only' }, { name: 'Commands', value: '`!setup report-channel <#channel>`' })
            .setFooter({ text: 'Pomora Premium' });
        await message.reply({ embeds: [embed] });
    }
});
client.on('interactionCreate', async (interaction) => {
    if (!interaction.isButton())
        return;
    if (['stop_session', 'options_menu'].includes(interaction.customId)) {
        const member = await interaction.guild?.members.fetch(interaction.user.id);
        if (!member?.permissions.has('Administrator')) {
            return interaction.reply({
                content: "Administrator permission required.",
                flags: MessageFlags.Ephemeral
            });
        }
    }
});
client.login(process.env.DISCORD_TOKEN);
