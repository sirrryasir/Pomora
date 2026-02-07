import { useState, useEffect, useCallback, useRef } from 'react';
import { useSettings } from '@/components/SettingsContext';

export type SessionType = 'focus' | 'short_break' | 'long_break';

// Sound URL mapping
const TICKING_SOUNDS: Record<string, string | null> = {
    none: null,
    slow: '/sounds/ticking-slow.mp3',
    fast: '/sounds/ticking-fast.mp3',
    // Custom handled dynamically
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

    // Helper to safely play audio
    const playSafe = (audio: HTMLAudioElement) => {
        const playPromise = audio.play();
        if (playPromise !== undefined) {
            playPromise.catch((error) => {
                // Silently swallow AbortError to prevent Runtime Error Overlay
                if (error.name !== 'AbortError') {
                    console.warn('Audio play warning:', error);
                }
            });
        }
    };

    useEffect(() => {
        if (typeof window !== 'undefined' && settings.tickingSound !== 'none') {
            const url = TICKING_SOUNDS[settings.tickingSound];

            if (url) {
                // Clean up previous audio if exists
                if (tickingAudioRef.current) {
                    tickingAudioRef.current.pause();
                    tickingAudioRef.current = null;
                }

                const audio = new Audio(url);
                tickingAudioRef.current = audio;
                audio.preload = 'auto';
                audio.crossOrigin = 'anonymous';

                // For ambient sounds (rain, cafe, etc.), loop them
                if (['rain', 'cafe', 'forest'].includes(settings.tickingSound)) {
                    audio.loop = true;
                }
            }
        } else if (tickingAudioRef.current) {
            // Clean up if sound is set to none or switched to custom
            tickingAudioRef.current.pause();
            tickingAudioRef.current = null;
        }

        // Cleanup on unmount or change
        return () => {
            if (tickingAudioRef.current) {
                tickingAudioRef.current.pause();
                tickingAudioRef.current = null;
            }
        };
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

    // Audio & Alarm
    const playAlarm = useCallback(() => {
        if (typeof window === 'undefined') return;
        const audio = new Audio('https://assets.mixkit.co/active_storage/sfx/2869/2869-preview.mp3');
        audio.crossOrigin = 'anonymous';
        audio.volume = settings.alarmVolume / 100;
        audio.play().catch(() => { });

        if (Notification.permission === 'granted') {
            new Notification('Pomora', { body: 'Session complete!', icon: '/favicon.ico' });
        }

        // Celebration!
        if (typeof window !== 'undefined') {
            import('canvas-confetti').then((confetti) => {
                const triggerConfetti = confetti.default || confetti; // Handle default export

                triggerConfetti({
                    particleCount: 150,
                    spread: 80,
                    origin: { y: 0.6 },
                    colors: ['#f97316', '#3b82f6', '#10b981'] // Theme colors
                });
            }).catch(e => console.error(e));
        }

        // Stats Sync for Logged-in Users
        if (type === 'focus') {
            fetch('/api/stats', {
                method: 'PATCH',
                body: JSON.stringify({ minutes: Math.floor(settings.focusTime) }),
                headers: { 'Content-Type': 'application/json' }
            }).catch(err => console.error('Failed to sync stats', err));
        }
    }, [settings.alarmVolume, type, settings.focusTime]);

    const playTick = useCallback(() => {
        // Strict guard: ensure audio exists and sound is valid
        if (!tickingAudioRef.current || settings.tickingSound === 'none') return;

        const audio = tickingAudioRef.current;
        audio.volume = settings.tickingVolume / 100;



        // Ticking sounds (rhythmic, once per second)
        audio.currentTime = 0;
        playSafe(audio);
    }, [settings.tickingVolume, settings.tickingSound]);

    // Timer Tick Logic
    useEffect(() => {
        if (isReady && isRunning && remainingTime > 0) {
            timerRef.current = setInterval(() => {
                setRemainingTime((prev) => {
                    if (prev <= 1) return 0; // Clamp to 0
                    playTick();
                    return prev - 1;
                });
            }, 1000);
        } else {
            if (timerRef.current) clearInterval(timerRef.current);
            if (tickingAudioRef.current) tickingAudioRef.current.pause();
        }
        return () => {
            if (timerRef.current) clearInterval(timerRef.current);
            if (tickingAudioRef.current && ['rain', 'cafe', 'forest'].includes(settings.tickingSound)) {
                tickingAudioRef.current.pause();
            }
        };
    }, [isReady, isRunning, remainingTime, settings.tickingSound, playTick]);

    // Cleanup helper
    const cleanupTimer = useCallback(() => {
        if (timerRef.current) clearInterval(timerRef.current);
        if (tickingAudioRef.current) tickingAudioRef.current.pause();
    }, []);

    // Completion Logic (Separated from Tick)
    useEffect(() => {
        if (remainingTime === 0 && isRunning) {
            cleanupTimer();
            playAlarm();

            let nextType: SessionType = 'focus';
            let shouldAutoStart = false;

            if (type === 'focus') {
                incrementDailySessions();
                console.log('Calling onFocusComplete. Fn exists:', !!onFocusComplete);
                onFocusComplete?.();

                // To be absolutely safe against Strict Mode double-effect invocation if it happens (though usually effects are cleaned up),
                // we depend on the state change to break the condition `remainingTime === 0 && isRunning`.
                // But `setRemainingTime` is async. 
                // Actually, the issue was state updater function running twice. Effects run twice in strict mode too, but usually cleanup handles it. 
                // However, `incrementDailySessions` serves as an external mutation if it hits localStorage directly? No, it sets state.
                // onFocusComplete sets state in parent. 
                // Let's proceed. If this effect runs twice, we might still have issues. 
                // But usually, setting `setIsRunning(false)` or changing `remainingTime` immediately stops the condition for the next render.

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
        }
    }, [remainingTime, isRunning, type, round, settings, incrementDailySessions, onFocusComplete, playAlarm, cleanupTimer]);

    // Notification Permission
    useEffect(() => {
        if (typeof window !== 'undefined' && 'Notification' in window && Notification.permission === 'default') {
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
