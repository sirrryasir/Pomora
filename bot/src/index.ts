import { Client, GatewayIntentBits, Interaction, MessageFlags, ModalBuilder, TextInputBuilder, TextInputStyle, ActionRowBuilder, ModalSubmitInteraction, EmbedBuilder, TextChannel, Events } from 'discord.js';
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

client.on('guildCreate', async (guild) => {
    console.log(`Joined new guild: ${guild.name}`);
    const channel = guild.systemChannel ||
        guild.channels.cache.find(c => c.type === 0 && (c.name.includes('general') || c.name.includes('bot'))) as TextChannel;

    if (channel) {
        const embed = new EmbedBuilder()
            .setColor('#FF6B35')
            .setTitle('Welcome to Pomora Premium!')
            .setThumbnail(client.user?.displayAvatarURL() || null)
            .setDescription('Thank you for inviting me. I am here to help your community reach peak focus and productivity.')
            .addFields(
                { name: 'Step 1: Voice Setup [REQUIRED]', value: 'Use `!setup vc #channel` to designate your study room. I will only track sessions in the configured channel.' },
                { name: 'Step 2: Leaderboards', value: 'Designate a channel for daily & weekly reports with `!setup reports #channel`.' },
                { name: 'Step 3: Participation', value: 'Once in a VC, press the **Present** button on my message to log your time!' },
                { name: 'Commands', value: 'Type `!help` to see all available commands.' }
            )
            .setFooter({ text: 'Pomora Premium - Focus. Flow. Pomora.' });

        await channel.send({ embeds: [embed] }).catch(() => { });
    }
});

client.on('voiceStateUpdate', async (oldState, newState) => {
    const member = newState.member || oldState.member;
    if (!member || member.user.bot || member.id === client.user?.id) return;

    const guildId = newState.guild.id || oldState.guild.id;
    const config = await dbService.getGuildConfig(guildId);
    const studyChannelId = config?.study_channel_id;

    // Join Logic
    if (newState.channel && (!oldState.channel || oldState.channel.id !== newState.channel.id)) {
        if (studyChannelId && newState.channel.id === studyChannelId) {
            await voiceManager.handleUserJoin(newState);
        }
    }

    // Leave Logic
    if (oldState.channel && (!newState.channel || oldState.channel.id !== newState.channel.id)) {
        if (studyChannelId && oldState.channel.id === studyChannelId) {
            await voiceManager.handleUserLeave(oldState);
        }
    }
});

client.on('interactionCreate', async (interaction: Interaction) => {
    if (!interaction.isButton()) return;

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
        } else if (customId === 'stop_all') {
            await interaction.deferReply({ flags: [MessageFlags.Ephemeral] }).catch(() => { });
            const room = timerService.getUserSession(interaction.user.id);
            timerService.stopTimer(interaction.user.id);

            await interaction.editReply({ content: 'Timer stopped.' }).catch(() => { });

            if (room) {
                await voiceManager.updateStatusMessage(room.guildId, room.channelId, true);
            }
        } else if (customId === 'options') {
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

            modal.addComponents(
                new ActionRowBuilder<TextInputBuilder>().addComponents(focusInput),
                new ActionRowBuilder<TextInputBuilder>().addComponents(breakInput),
                new ActionRowBuilder<TextInputBuilder>().addComponents(soundInput),
                new ActionRowBuilder<TextInputBuilder>().addComponents(voiceInput)
            );

            await interaction.showModal(modal);
        }
    } catch (error) {
        console.error('Interaction error:', error);
    }
});

client.on('interactionCreate', async (interaction: Interaction) => {
    if (!interaction.isModalSubmit()) return;

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
        } else {
            await interaction.reply({ content: 'Join a voice channel to change settings.', flags: [MessageFlags.Ephemeral] });
        }
    }
});

client.on('error', error => console.error('Client error:', error));
process.on('unhandledRejection', error => console.error('Unhandled rejection:', error));

client.on('messageCreate', async (message) => {
    if (message.author.bot || !message.guild) return;

    const prefix = '!';
    if (!message.content.startsWith(prefix)) return;

    const args = message.content.slice(prefix.length).trim().split(/ +/);
    const command = args.shift()?.toLowerCase();

    if (command === 'test-report') {
        const timeframe = (args[0] as any) || 'weekly';
        if (!['daily', 'weekly', 'monthly'].includes(timeframe)) {
            return message.reply('Usage: !test-report daily|weekly|monthly');
        }

        await message.reply(`Generating ${timeframe} report...`);
        await leaderboardReporter.sendGuildReport(message.guildId!, timeframe, message.channel as TextChannel, message.author.id);
    }

    if (command === 'leaderboard' || command === 'lb') {
        const timeframe = (args[0] as any) || 'weekly';
        if (!['daily', 'weekly', 'monthly'].includes(timeframe)) {
            return message.reply('Usage: !leaderboard daily|weekly|monthly');
        }
        await message.reply(`Fetching ${timeframe} leaderboard...`);
        await leaderboardReporter.sendGuildReport(message.guildId!, timeframe, message.channel as TextChannel, message.author.id);
    }

    if (command === 'status') {
        const session = timerService.getUserSession(message.author.id);
        if (!session) {
            return message.reply("You are not in an active study session. Join a voice channel to start!");
        }

        const mins = Math.floor(session.remaining / 60);
        const secs = session.remaining % 60;
        const timeStr = `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;

        const embed = new EmbedBuilder()
            .setColor(session.type === 'focus' ? '#FF6B35' : '#43B581')
            .setTitle(`Current Session: ${session.type.toUpperCase()}`)
            .setDescription(`**Time Remaining:** ${timeStr}\n**Participants:** ${session.participants.size}`)
            .setTimestamp();

        await message.reply({ embeds: [embed] });
    }

    if (command === 'me' || command === 'stats') {
        const profile = await dbService.getUserProfile(message.author.id);
        if (!profile) {
            return message.reply("You haven't started studying yet! Join a voice channel to log your first session.");
        }

        const totalHours = (profile.total_time / 60).toFixed(1);
        const weekHours = (profile.weekly_time / 60).toFixed(1);
        const dailyHours = (profile.daily_time / 60).toFixed(1);

        const embed = new EmbedBuilder()
            .setColor('#FF6B35')
            .setTitle(`${message.author.username}'s Study Stats`)
            .setThumbnail(message.author.displayAvatarURL())
            .addFields(
                { name: 'Today', value: `${dailyHours} hours`, inline: true },
                { name: 'This Week', value: `${weekHours} hours`, inline: true },
                { name: 'Total', value: `${totalHours} hours`, inline: true }
            )
            .setFooter({ text: 'Keep up the great work!' });

        await message.reply({ embeds: [embed] });
    }

    if (command === 'help') {
        const embed = new EmbedBuilder()
            .setColor('#FF6B35')
            .setTitle('Pomora Bot Help')
            .setDescription('Master your focus with these commands:')
            .addFields(
                { name: 'Leaderboards', value: '`!lb [daily|weekly|monthly]` - Show server study rankings', inline: false },
                { name: 'Status', value: '`!status` - Check your active session details', inline: true },
                { name: 'Stats', value: '`!me` - See your personal study achievement', inline: true },
                { name: 'Configuration', value: '`!setup` - Manage server-side settings (Admins)', inline: false },
                { name: 'Testing', value: '`!test-report` - Manually trigger a report', inline: true }
            )
            .setFooter({ text: 'Pomora Premium - Focus. Flow. Pomora.' });

        await message.reply({ embeds: [embed] });
    }

    if (command === 'setup' || command === 'config') {
        if (!message.member?.permissions.has('Administrator')) {
            return message.reply("Administrator permission required.");
        }

        const subCommand = args[0]?.toLowerCase();

        if (subCommand === 'report-channel' || subCommand === 'reports') {
            const channelMention = args[1];
            const channelId = channelMention?.replace(/[<#>]/g, '');
            const channel = message.guild.channels.cache.get(channelId!) as TextChannel;

            if (!channel || !channel.isTextBased()) {
                return message.reply("Please mention a valid text channel. Example: `!setup reports #reports`.");
            }

            try {
                await dbService.updateGuildConfig(message.guildId!, { report_channel_id: channel.id });
                return message.reply(`Report channel successfully set to <#${channel.id}>.`);
            } catch (err) {
                return message.reply("Failed to update server configuration.");
            }
        }

        if (subCommand === 'study-channel' || subCommand === 'vc') {
            const channelMention = args[1];
            const channelId = channelMention?.replace(/[<#>]/g, '');
            const channel = message.guild.channels.cache.get(channelId!);

            if (!channel || !channel.isVoiceBased()) {
                return message.reply("Please mention a valid voice channel. Example: `!setup vc #StudyRoom`.");
            }

            try {
                await dbService.updateGuildConfig(message.guildId!, { study_channel_id: channel.id });

                // Immediately check if anyone is already in the channel
                if (channel.members.size > 0) {
                    for (const [_, member] of channel.members) {
                        if (!member.user.bot) {
                            await voiceManager.handleUserJoin(member.voice);
                        }
                    }
                }

                return message.reply(`Study channel successfully set to <#${channel.id}>. Tracking is now active.`);
            } catch (err) {
                return message.reply("Failed to update server configuration.");
            }
        }

        const config = await dbService.getGuildConfig(message.guildId!);
        const reportChannelId = config?.report_channel_id || 'Not Set';
        const studyChannelId = config?.study_channel_id;

        const embed = new EmbedBuilder()
            .setColor('#FF6B35')
            .setTitle('Pomora Admin Configuration')
            .setDescription('Customize how Pomora operates in your server.')
            .addFields(
                { name: 'Report Channel', value: reportChannelId !== 'Not Set' ? `<#${reportChannelId}>` : '`Not Set`', inline: true },
                { name: 'Study Voice Channel', value: studyChannelId ? `<#${studyChannelId}>` : '`Not Set (Required for tracking)`', inline: true },
                { name: 'Admin Commands', value: '`!setup reports <#channel>`\n`!setup vc <#voice-channel>`' }
            )
            .setFooter({ text: 'Pomora Premium - Focus. Flow. Pomora.' });

        await message.reply({ embeds: [embed] });
    }
});

client.on('interactionCreate', async (interaction) => {
    if (!interaction.isButton()) return;

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
