import { EmbedBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle, AttachmentBuilder, } from 'discord.js';
import { joinVoiceChannel, createAudioPlayer, createAudioResource, AudioPlayerStatus, VoiceConnectionStatus, entersState, getVoiceConnection, } from '@discordjs/voice';
import { ImageService } from './ImageService.js';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';
const __dirname = path.dirname(fileURLToPath(import.meta.url));
// Initialize services
export class VoiceManager {
    connections = new Map();
    statusMessages = new Map();
    lastAttachments = new Map();
    lastRenamed = new Map();
    client;
    timerService;
    imageService;
    dbService;
    channelMutex = new Map();
    guildVoiceLock = new Map();
    processedJoins = new Map();
    constructor(client, timerService, dbService) {
        this.client = client;
        this.timerService = timerService;
        this.imageService = new ImageService();
        this.dbService = dbService;
        this.timerService.on('stageComplete', (room) => {
            this.handleStageComplete(room);
        });
        this.timerService.on('missedTick', (data) => {
            this.handleMissedTick(data);
        });
        this.timerService.on('tick', (room) => {
            this.handleTick(room);
        });
    }
    async handleUserJoin(state) {
        if (!state.member || state.member.user.bot || state.member.id === this.client.user?.id)
            return;
        const userId = state.member.user.id;
        const guildId = state.guild.id;
        const channelId = state.channel.id;
        this.timerService.joinRoom(userId, guildId, channelId);
        // Always force a new status message on join for instant feedback
        await this.updateStatusMessage(guildId, channelId, true, true);
    }
    async handleUserLeave(state) {
        if (!state.member || state.member.user.bot || state.member.id === this.client.user?.id)
            return;
        const userId = state.member.user.id;
        const guildId = state.guild.id;
        const channelId = state.channel?.id;
        if (!channelId)
            return;
        this.timerService.leaveRoom(userId, channelId);
        const room = this.timerService.getRoomSession(channelId);
        if (room) {
            // Always force a new status message on leave to reflect current participants
            await this.updateStatusMessage(guildId, channelId, true, true);
        }
    }
    async handleTick(room) {
        if (room.remaining === room.duration)
            return;
        const updateImage = room.remaining % 300 === 0 && room.remaining > 0;
        const updateText = room.remaining % 60 === 0 && room.remaining > 0;
        if (updateImage || updateText) {
            await this.updateStatusMessage(room.guildId, room.channelId, updateImage);
        }
    }
    async handleStageComplete(room) {
        const durationMins = room.duration / 60;
        for (const [userId] of room.participants) {
            this.dbService.logSession(userId, room.guildId, durationMins, room.type);
        }
        if (room.participants.size === 0) {
            // Clean up and stop if no one is left at the end of the stage
            const lastMsgId = await this.dbService.getActiveMessage(room.channelId);
            if (lastMsgId) {
                const channel = await this.client.channels.fetch(room.channelId).catch(() => null);
                if (channel && channel.isVoiceBased()) {
                    await channel.messages.delete(lastMsgId).catch(() => { });
                }
                await this.dbService.deleteActiveMessage(room.channelId);
            }
            this.timerService.stopRoomCleanup(room.channelId);
            return;
        }
        await this.updateStatusMessage(room.guildId, room.channelId, true, true);
        await this.playAlert(room.guildId, room.channelId, room.type);
    }
    async handleMissedTick(data) {
        if (data.missedTicks >= 4) {
            const guild = this.client.guilds.cache.get(data.guildId);
            const member = await guild?.members.fetch(data.userId).catch(() => null);
            if (member && member.voice.channel) {
                await member.voice.disconnect(`Inactivity limit reached`).catch(() => { });
                const channel = await this.client.channels.fetch(data.channelId);
                if (channel && channel.isTextBased()) {
                    await channel.send(`User <@${data.userId}> disconnected due to inactivity.`).catch(() => { });
                }
            }
            this.timerService.stopTimer(data.userId);
        }
    }
    async updateStatusMessage(guildId, channelId, updateImage = true, forceNew = false) {
        const mutexKey = `${guildId}-${channelId}`;
        const previous = this.channelMutex.get(mutexKey) || Promise.resolve();
        const next = previous.then(async () => {
            try {
                await this._updateStatusMessageInternal(guildId, channelId, updateImage, forceNew);
            }
            catch (err) {
                console.error(`Status update failed:`, err);
            }
        });
        this.channelMutex.set(mutexKey, next);
        return next;
    }
    async _updateStatusMessageInternal(guildId, channelId, updateImage = true, forceNew = false) {
        const room = this.timerService.getRoomSession(channelId);
        if (!room)
            return;
        const participants = Array.from(room.participants.values());
        const nextStage = room.type === 'focus' ? 'BREAK' : 'FOCUS';
        const expirationTimestamp = Math.floor(Date.now() / 1000 + room.remaining);
        const stageline = `<#${channelId}>: **${room.type.toUpperCase()}** Mode Active\n**${nextStage}** begins <t:${expirationTimestamp}:R>`;
        const atRiskUsers = participants.filter(p => p.missedTicks > 0);
        let warningLine = "";
        if (atRiskUsers.length > 0) {
            const warningMentions = atRiskUsers.map(p => `<@${p.userId}>`).join(', ');
            warningLine = `\n**Inactivity Warning:** ${warningMentions}, please confirm presence to stay.`;
        }
        const content = `${stageline}${warningLine}`;
        let attachment = this.lastAttachments.get(channelId);
        if (updateImage || !attachment) {
            let channelName = 'Pomora Room';
            try {
                const channel = await this.client.channels.fetch(channelId);
                if (channel && 'name' in channel && channel.name) {
                    channelName = channel.name;
                }
            }
            catch (err) { }
            const imageBuffer = await this.imageService.generateStatusCard(room, this.client, channelName);
            const fileName = `status-${Date.now()}.png`;
            attachment = new AttachmentBuilder(imageBuffer, { name: fileName });
            this.lastAttachments.set(channelId, attachment);
        }
        const embed = new EmbedBuilder()
            .setColor(room.type === 'focus' ? '#FF6B35' : '#43B581')
            .setTitle('Pomora Study Session')
            .setImage(`attachment://${attachment.name}`)
            .setTimestamp();
        const row = new ActionRowBuilder()
            .addComponents(new ButtonBuilder()
            .setCustomId(`present_all`)
            .setLabel('Present')
            .setStyle(ButtonStyle.Success), new ButtonBuilder()
            .setCustomId(`options`)
            .setLabel('Options')
            .setStyle(ButtonStyle.Secondary), new ButtonBuilder()
            .setCustomId(`stop_all`)
            .setLabel('Stop')
            .setStyle(ButtonStyle.Danger));
        try {
            const channel = await this.client.channels.fetch(channelId);
            if (!channel || !channel.isVoiceBased())
                return;
            const voiceChannel = channel;
            const now = Date.now();
            const lastRename = this.lastRenamed.get(channelId) || 0;
            if (now - lastRename > 5 * 60 * 1000) {
                const baseName = voiceChannel.name.split(' | ')[0];
                const minsRemaining = Math.ceil(room.remaining / 60);
                const newName = `${baseName} | ${minsRemaining}m ${room.type.toUpperCase()}`;
                if (voiceChannel.name !== newName) {
                    await voiceChannel.setName(newName).catch(() => { });
                    this.lastRenamed.set(channelId, now);
                }
            }
            let lastMsgId = this.statusMessages.get(channelId);
            const messageOptions = { content, embeds: [embed], components: [row] };
            if (attachment) {
                messageOptions.files = [attachment];
            }
            // Check database for persistent message ID if memory doesn't have it
            if (!lastMsgId) {
                lastMsgId = await this.dbService.getActiveMessage(channelId);
            }
            if (lastMsgId && !forceNew) {
                try {
                    const msg = await voiceChannel.messages.fetch(lastMsgId);
                    await msg.edit(messageOptions);
                    this.statusMessages.set(channelId, lastMsgId); // Sync back to memory
                    return;
                }
                catch (err) {
                    // If edit fails, we'll try to delete (if permissions/exists) and send new one
                    await this.dbService.deleteActiveMessage(channelId);
                    this.statusMessages.delete(channelId);
                }
            }
            if (lastMsgId) {
                try {
                    const oldMsg = await voiceChannel.messages.fetch(lastMsgId);
                    await oldMsg.delete().catch(() => { });
                }
                catch (err) { }
                await this.dbService.deleteActiveMessage(channelId);
            }
            const newMsg = await voiceChannel.send(messageOptions);
            this.statusMessages.set(channelId, newMsg.id);
            await this.dbService.setActiveMessage(channelId, guildId, newMsg.id);
        }
        catch (error) {
            console.error('Status update error:', error);
        }
    }
    async joinChannel(channelId, guildId) {
        const channel = await this.client.channels.fetch(channelId);
        if (!channel || !channel.isVoiceBased())
            return null;
        const existing = getVoiceConnection(guildId);
        if (existing) {
            existing.destroy();
            this.connections.delete(guildId);
        }
        const voiceChannel = channel;
        const connection = joinVoiceChannel({
            channelId: voiceChannel.id,
            guildId: voiceChannel.guild.id,
            adapterCreator: voiceChannel.guild.voiceAdapterCreator,
            selfDeaf: false,
            selfMute: false,
        });
        this.connections.set(guildId, connection);
        return connection;
    }
    leaveChannel(guildId) {
        const connection = this.connections.get(guildId);
        if (connection) {
            connection.destroy();
            this.connections.delete(guildId);
        }
    }
    async playAlert(guildId, channelId, type) {
        const mutexKey = `voice-${guildId}`;
        const previous = this.guildVoiceLock.get(mutexKey) || Promise.resolve();
        const next = previous.then(async () => {
            try {
                await this._playAlertInternal(guildId, channelId, type);
            }
            catch (err) {
                console.error(`Voice alert failed:`, err);
            }
        });
        this.guildVoiceLock.set(mutexKey, next);
        return next;
    }
    async _playAlertInternal(guildId, channelId, type) {
        const room = this.timerService.getRoomSession(channelId);
        if (room && !room.soundEnabled)
            return;
        const soundFile = type === 'focus' ? 'focus_alert_1.wav' : 'break_alert_1.wav';
        const soundPath = path.resolve(__dirname, `../../assets/sounds/${soundFile}`);
        if (!fs.existsSync(soundPath))
            return;
        let connection = this.connections.get(guildId);
        if (!connection) {
            connection = await this.joinChannel(channelId, guildId) || undefined;
        }
        if (!connection)
            return;
        try {
            await entersState(connection, VoiceConnectionStatus.Ready, 10000);
            const player = createAudioPlayer();
            const resource = createAudioResource(soundPath);
            connection.subscribe(player);
            player.play(resource);
            await new Promise((resolve) => {
                const timeout = setTimeout(resolve, 10000);
                player.on(AudioPlayerStatus.Idle, () => {
                    clearTimeout(timeout);
                    resolve();
                });
                player.on('error', () => {
                    clearTimeout(timeout);
                    resolve();
                });
            });
        }
        catch (error) {
            console.error('Voice playback error:', error);
        }
        finally {
            this.leaveChannel(guildId);
        }
    }
}
