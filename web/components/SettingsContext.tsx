'use client';

import React, { createContext, useContext, useState, useEffect } from 'react';

export type TickingSound = 'none' | 'slow' | 'fast';

export interface TimerSettings {
    focusTime: number;
    shortBreakTime: number;
    longBreakTime: number;
    autoStartBreaks: boolean;
    autoStartPomodoros: boolean;
    longBreakInterval: number;
    dailyGoal: number;
    alarmSound: string;
    alarmVolume: number;
    tickingSound: TickingSound;

    tickingVolume: number;
    themeColors: {
        focus: string;
        shortBreak: string;
        longBreak: string;
    };
    darkModeWhenRunning: boolean;
}

const DEFAULT_SETTINGS: TimerSettings = {
    focusTime: 25,
    shortBreakTime: 5,
    longBreakTime: 15,
    autoStartBreaks: false,
    autoStartPomodoros: false,
    longBreakInterval: 4,
    dailyGoal: 8,
    alarmSound: 'digital',
    alarmVolume: 50,
    tickingSound: 'none',

    tickingVolume: 50,
    themeColors: {
        focus: '#ba4949',
        shortBreak: '#38858a',
        longBreak: '#397097',
    },
    darkModeWhenRunning: false,
};

interface SettingsContextType {
    settings: TimerSettings;
    updateSettings: (newSettings: Partial<TimerSettings>) => void;
    isLoaded: boolean;
}

const SettingsContext = createContext<SettingsContextType | undefined>(undefined);

export function SettingsProvider({ children }: { children: React.ReactNode }) {
    const [settings, setSettings] = useState<TimerSettings>(DEFAULT_SETTINGS);
    const [isLoaded, setIsLoaded] = useState(false);

    useEffect(() => {
        const saved = localStorage.getItem('pomora_settings');
        if (saved) {
            try {
                const parsed = JSON.parse(saved);
                // Deep merge to ensure nested objects like themeColors are always valid
                setSettings({
                    ...DEFAULT_SETTINGS,
                    ...parsed,
                    themeColors: {
                        ...DEFAULT_SETTINGS.themeColors,
                        ...(parsed.themeColors || {})
                    }
                });
            } catch (e) {
                console.error('Failed to parse settings', e);
                // Optional: Clear corrupted settings
                // localStorage.removeItem('pomora_settings');
            }
        }
        setIsLoaded(true);
    }, []);

    const updateSettings = (newSettings: Partial<TimerSettings>) => {
        setSettings(prev => {
            const updated = { ...prev, ...newSettings };
            localStorage.setItem('pomora_settings', JSON.stringify(updated));
            return updated;
        });
    };

    return (
        <SettingsContext.Provider value={{ settings, updateSettings, isLoaded }}>
            {children}
        </SettingsContext.Provider>
    );
}

export function useSettings() {
    const context = useContext(SettingsContext);
    if (context === undefined) {
        throw new Error('useSettings must be used within a SettingsProvider');
    }
    return context;
}
