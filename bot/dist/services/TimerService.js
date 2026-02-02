// Initialize services
export class TimerService {
    rooms = new Map();
    intervals = new Map();
    constructor() {
    }
    joinRoom(userId, guildId, channelId) {
        let room = this.rooms.get(channelId);
        if (!room) {
            const focusTime = (parseInt(process.env.FOCUS_TIME || '50')) * 60;
            const breakTime = (parseInt(process.env.SHORT_BREAK || '10')) * 60;
            room = {
                channelId,
                guildId,
                type: 'focus',
                duration: focusTime,
                remaining: focusTime,
                isRunning: true,
                participants: new Map(),
                sessionsCompleted: 0,
                customFocusTime: focusTime,
                customBreakTime: breakTime,
                soundEnabled: true,
                voiceEnabled: true
            };
            this.rooms.set(channelId, room);
            this.startRoomInterval(channelId);
        }
        if (!room.participants.has(userId)) {
            room.participants.set(userId, {
                userId,
                isActive: false,
                missedTicks: 0,
                joinedAt: new Date()
            });
        }
        return room;
    }
    leaveRoom(userId, channelId) {
        const room = this.rooms.get(channelId);
        if (room) {
            room.participants.delete(userId);
            // Do NOT stop the room here. 
            // The room will stop at the end of the stage if size is 0.
        }
    }
    stopTimer(userId) {
        const room = this.getUserSession(userId);
        if (room) {
            this.leaveRoom(userId, room.channelId);
        }
    }
    startRoomInterval(channelId) {
        if (this.intervals.has(channelId))
            return;
        const interval = setInterval(() => {
            const room = this.rooms.get(channelId);
            if (!room || !room.isRunning) {
                this.stopRoom(channelId);
                return;
            }
            room.remaining--;
            this.emit('tick', room);
            if (room.remaining <= 0) {
                this.handleRoomStageComplete(channelId);
            }
        }, 1000);
        this.intervals.set(channelId, interval);
    }
    stopRoomCleanup(channelId) {
        this.stopRoom(channelId);
    }
    stopRoom(channelId) {
        const interval = this.intervals.get(channelId);
        if (interval) {
            clearInterval(interval);
            this.intervals.delete(channelId);
        }
        this.rooms.delete(channelId);
    }
    handleRoomStageComplete(channelId) {
        const room = this.rooms.get(channelId);
        if (!room)
            return;
        room.isRunning = false;
        for (const [userId, participant] of room.participants) {
            if (!participant.isActive) {
                participant.missedTicks++;
                this.emit('missedTick', { userId, guildId: room.guildId, channelId, missedTicks: participant.missedTicks });
            }
            else {
                participant.missedTicks = 0;
                participant.isActive = false;
            }
        }
        if (room.type === 'focus') {
            room.sessionsCompleted++;
            const breakTime = room.customBreakTime || (10 * 60);
            room.type = 'break';
            room.duration = breakTime;
            room.remaining = breakTime;
        }
        else {
            const focusTime = room.customFocusTime || (50 * 60);
            room.type = 'focus';
            room.duration = focusTime;
            room.remaining = focusTime;
        }
        room.isRunning = true;
        this.emit('stageComplete', room);
    }
    confirmParticipation(userId) {
        for (const room of this.rooms.values()) {
            const participant = room.participants.get(userId);
            if (participant) {
                participant.isActive = true;
                participant.missedTicks = 0;
                break;
            }
        }
    }
    getRoomSession(channelId) {
        return this.rooms.get(channelId);
    }
    getUserSession(userId) {
        for (const room of this.rooms.values()) {
            if (room.participants.has(userId))
                return room;
        }
        return undefined;
    }
    getAllSessions() {
        return Array.from(this.rooms.values());
    }
    formatTime(seconds) {
        const mins = Math.floor(seconds / 60);
        const secs = seconds % 60;
        return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
    }
    listeners = new Map();
    on(event, callback) {
        if (!this.listeners.has(event)) {
            this.listeners.set(event, []);
        }
        this.listeners.get(event).push(callback);
    }
    emit(event, data) {
        const callbacks = this.listeners.get(event);
        if (callbacks) {
            callbacks.forEach(cb => cb(data));
        }
    }
}
