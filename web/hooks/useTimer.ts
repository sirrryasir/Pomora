import { useState, useEffect, useCallback, useRef } from 'react';
import { useSettings, type TickingSound } from '@/components/SettingsContext';

export type SessionType = 'focus' | 'short_break' | 'long_break';

// Sound URL mapping
const TICKING_SOUNDS: Record<TickingSound, string | null> = {
    none: null,
    slow: '/sounds/ticking-slow.mp3',
    fast: '/sounds/ticking-fast.mp3',
};

export const useTimer = (onFocusComplete?: () => void) => {
    const { settings, isLoaded } = useSettings();

    const [remainingTime, setRemainingTime] = useState(settings.focusTime * 60);
    const [isRunning, setIsRunning] = useState(false);
    const [type, setType] = useState<SessionType>('focus');
    const [round, setRound] = useState(1);
    const [dailySessions, setDailySessions] = useState(0);
    const [isReady, setIsReady] = useState(false);
    const timerRef = useRef<NodeJS.Timeout | null>(null);
    const settingsRef = useRef(settings);
    const tickingAudioRef = useRef<HTMLAudioElement | null>(null);

    // Initialize ticking audio based on selected sound
    useEffect(() => {
        if (typeof window !== 'undefined' && settings.tickingSound !== 'none') {
            const url = TICKING_SOUNDS[settings.tickingSound];
            if (url) {
                // Clean up previous audio if exists
                if (tickingAudioRef.current) {
                    tickingAudioRef.current.pause();
                    tickingAudioRef.current = null;
                }

                tickingAudioRef.current = new Audio(url);
                tickingAudioRef.current.preload = 'auto';
                tickingAudioRef.current.crossOrigin = 'anonymous';
            }
        } else if (tickingAudioRef.current) {
            // Clean up if sound is set to none
            tickingAudioRef.current.pause();
            tickingAudioRef.current = null;
        }
    }, [settings.tickingSound]);

    // 1. Initial Load (Hardened)
    useEffect(() => {
        if (!isLoaded || isReady) return;

        const today = new Date().toLocaleDateString();
        const savedStats = localStorage.getItem('pomora_daily_stats');
        if (savedStats) {
            const stats = JSON.parse(savedStats);
            if (stats.date === today) setDailySessions(stats.count || 0);
            else localStorage.setItem('pomora_daily_stats', JSON.stringify({ date: today, count: 0 }));
        }

        const savedState = localStorage.getItem('pomora_timer_state');
        if (savedState) {
            const state = JSON.parse(savedState);
            setType(state.type || 'focus');
            setRound(state.round || 1);

            let time = state.remainingTime;
            // Calculate elapsed time from last background run
            if (state.isRunning && state.lastUpdated) {
                const elapsed = Math.floor((Date.now() - state.lastUpdated) / 1000);
                time = Math.max(0, state.remainingTime - elapsed);
            }
            setRemainingTime(time);
        } else {
            setRemainingTime(settings.focusTime * 60);
        }

        // CRITICAL: Ensure we are NOT running after a refresh
        setIsRunning(false);
        setIsReady(true);
        settingsRef.current = JSON.parse(JSON.stringify(settings)); // Deep copy to ensure no sync trigger
    }, [isLoaded, isReady, settings]);

    // 2. Save State (Only after we are ready)
    useEffect(() => {
        if (!isLoaded || !isReady) return;
        const state = {
            remainingTime,
            type,
            round,
            isRunning,
            lastUpdated: Date.now()
        };
        localStorage.setItem('pomora_timer_state', JSON.stringify(state));
    }, [remainingTime, type, round, isRunning, isLoaded, isReady]);

    // 3. Settings Sync (Manual changes only)
    useEffect(() => {
        if (!isReady) return;
        const hasChanged = JSON.stringify(settingsRef.current) !== JSON.stringify(settings);
        // Only trigger if not running and settings actually changed since last sync
        if (hasChanged && !isRunning) {
            const timeMap: Record<SessionType, number> = {
                focus: settings.focusTime * 60,
                short_break: settings.shortBreakTime * 60,
                long_break: settings.longBreakTime * 60,
            };
            setRemainingTime(timeMap[type]);
        }
        settingsRef.current = JSON.parse(JSON.stringify(settings));
    }, [settings, isRunning, type, isReady]);

    const incrementDailySessions = useCallback(() => {
        const today = new Date().toLocaleDateString();
        setDailySessions(prev => {
            const next = prev + 1;
            localStorage.setItem('pomora_daily_stats', JSON.stringify({ date: today, count: next }));
            return next;
        });
    }, []);

    const start = useCallback(() => setIsRunning(true), []);

    const pause = useCallback(() => {
        setIsRunning(false);
    }, []);

    const reset = useCallback(() => {
        setIsRunning(false);
        const timeMap: Record<SessionType, number> = {
            focus: settings.focusTime * 60,
            short_break: settings.shortBreakTime * 60,
            long_break: settings.longBreakTime * 60,
        };
        setRemainingTime(timeMap[type]);
    }, [type, settings]);

    const changeType = useCallback((newType: SessionType) => {
        setType(newType);
        const timeMap: Record<SessionType, number> = {
            focus: settings.focusTime * 60,
            short_break: settings.shortBreakTime * 60,
            long_break: settings.longBreakTime * 60,
        };
        setRemainingTime(timeMap[newType]);
        setIsRunning(false);
    }, [settings]);

    // Audio
    const playAlarm = useCallback(() => {
        if (typeof window === 'undefined') return;
        const audio = new Audio('https://assets.mixkit.co/active_storage/sfx/2869/2869-preview.mp3');
        audio.crossOrigin = 'anonymous';
        audio.volume = settings.alarmVolume / 100;
        audio.play().catch(() => { });
        if (Notification.permission === 'granted') {
            new Notification('Pomora', { body: 'Session complete!', icon: '/favicon.ico' });
        }
    }, [settings.alarmVolume]);

    const playTick = useCallback(() => {
        if (!tickingAudioRef.current || settings.tickingSound === 'none') return;

        tickingAudioRef.current.volume = settings.tickingVolume / 100;

        // For tick sounds, restart from beginning each second
        tickingAudioRef.current.currentTime = 0;
        tickingAudioRef.current.play().catch(() => { });
    }, [settings.tickingVolume, settings.tickingSound]);

    useEffect(() => {
        // Double check isReady and isRunning to prevent startup races
        if (isReady && isRunning && remainingTime > 0) {
            timerRef.current = setInterval(() => {
                setRemainingTime((prev) => {
                    if (prev <= 1) {
                        clearInterval(timerRef.current!);
                        playAlarm();
                        let nextType: SessionType = 'focus';
                        let shouldAutoStart = false;
                        if (type === 'focus') {
                            incrementDailySessions();
                            onFocusComplete?.(); // Trigger callback
                            nextType = round % settings.longBreakInterval === 0 ? 'long_break' : 'short_break';
                            setRound(r => r + 1);
                            shouldAutoStart = settings.autoStartBreaks;
                        } else {
                            nextType = 'focus';
                            shouldAutoStart = settings.autoStartPomodoros;
                        }
                        setType(nextType);
                        const nextTime = (nextType === 'focus' ? settings.focusTime : nextType === 'short_break' ? settings.shortBreakTime : settings.longBreakTime) * 60;
                        setRemainingTime(nextTime);
                        setIsRunning(shouldAutoStart);
                        return 0;
                    }
                    playTick();
                    return prev - 1;
                });
            }, 1000);
        } else if (timerRef.current) {
            clearInterval(timerRef.current);
        }
        return () => { if (timerRef.current) clearInterval(timerRef.current); };
    }, [isRunning, remainingTime, type, round, settings, isReady, playAlarm, playTick, incrementDailySessions, onFocusComplete]);

    // Notification Permission
    useEffect(() => {
        if (typeof window !== 'undefined' && Notification.permission === 'default') {
            Notification.requestPermission();
        }
    }, []);

    const formatTime = (seconds: number) => {
        const m = Math.floor(seconds / 60);
        const s = seconds % 60;
        return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
    };

    const totalTime = (type === 'focus' ? settings.focusTime : type === 'short_break' ? settings.shortBreakTime : settings.longBreakTime) * 60;
    const progress = ((totalTime - remainingTime) / totalTime) * 100;

    return { remainingTime, isRunning, type, round, dailySessions, start, pause, reset, setType: changeType, formatTime, progress };
};
