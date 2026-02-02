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
    alarmSound: string;
    alarmVolume: number;
    tickingSound: TickingSound;
    tickingVolume: number;
    themeColors: {
        focus: string;
        shortBreak: string;
        longBreak: string;
    };
}

const DEFAULT_SETTINGS: TimerSettings = {
    focusTime: 25,
    shortBreakTime: 5,
    longBreakTime: 15,
    autoStartBreaks: false,
    autoStartPomodoros: false,
    longBreakInterval: 4,
    alarmSound: 'digital',
    alarmVolume: 50,
    tickingSound: 'none',
    tickingVolume: 50,
    themeColors: {
        focus: '#ba4949',
        shortBreak: '#38858a',
        longBreak: '#397097',
    },
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
                setSettings({ ...DEFAULT_SETTINGS, ...JSON.parse(saved) });
            } catch (e) {
                console.error('Failed to parse settings', e);
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
