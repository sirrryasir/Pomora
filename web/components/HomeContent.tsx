'use client';

import { PremiumTimer } from '@/components/PremiumTimer';
import { StreakBadge } from '@/components/StreakBadge';
import { Tasks } from '@/components/Tasks';
import { SettingsModal } from '@/components/SettingsModal';
import { UserNav } from '@/components/UserNav';
import { BotNavbar } from '@/components/bot/BotNavbar';
import { BotFooter } from '@/components/bot/BotFooter';
import { useState, useEffect } from 'react';
import { useSettings } from '@/components/SettingsContext';
import { useTheme } from 'next-themes';
import { useTasks } from '@/hooks/useTasks';
import dynamic from 'next/dynamic';

// Dynamically import ReactPlayer to avoid SSR issues
// const ReactPlayer = dynamic(() => import('react-player'), { ssr: false });

export function HomeContent() {
    const { settings, isLoaded } = useSettings();
    const { theme } = useTheme();
    const [mode, setMode] = useState<'focus' | 'short_break' | 'long_break'>('focus');
    const [isRunning, setIsRunning] = useState(false);
    const [mounted, setMounted] = useState(false);

    // Initialize Task Hook
    const tasksHook = useTasks();
    const { incrementActiveTask } = tasksHook;



    useEffect(() => {
        setMounted(true);
    }, []);

    const getBgColor = () => {
        // Prevent hydration mismatch: SSR always gets the default theme color
        if (!mounted) return settings.themeColors?.focus || '#ba4949';

        // ONLY WHEN FOCUS TIME RUNNING AND THE TOGGLE ON
        if (settings.darkModeWhenRunning && isRunning && mode === 'focus') {
            return '#09090b';
        }

        // Custom themes from settings (Isolate from global light/dark mode)
        if (!settings.themeColors) return '#ba4949';
        switch (mode) {
            case 'focus': return settings.themeColors.focus;
            case 'short_break': return settings.themeColors.shortBreak;
            case 'long_break': return settings.themeColors.longBreak;
            default: return settings.themeColors.focus;
        }
    };

    const bgColor = getBgColor();

    // Prevent hydration mismatch by returning null until mounted and loaded
    if (!mounted || !isLoaded) return null;

    return (
        <div
            className="flex flex-col min-h-[calc(100vh-4rem)] space-y-8 transition-colors duration-1000 ease-in-out"
            style={{ backgroundColor: bgColor }}
        >
            {/* Global Navbar - Neutral Light/Dark */}
            <div className="w-full sticky top-0 z-50">
                <BotNavbar
                    suffix="Timer"
                    extra={
                        <div className="flex items-center gap-1 bg-foreground/[0.05] p-1 rounded-xl backdrop-blur-md border border-border/50">
                            <SettingsModal />
                            <UserNav />
                        </div>
                    }
                />
            </div>

            {/* Themed Content Section - Primary Product Experience */}
            <main
                className="flex-1 w-full flex flex-col gap-12 items-center py-12 md:py-20"
            >
                <div className="w-full max-w-2xl px-4 flex flex-col gap-8 md:gap-16">
                    {/* Timer Section */}
                    <div className="w-full flex flex-col items-center gap-6 justify-center">
                        <StreakBadge />
                        <PremiumTimer
                            onTypeChange={setMode}
                            onRunningChange={setIsRunning}
                            onFocusComplete={incrementActiveTask}
                        />
                    </div>

                    {/* Tasks Section - Matches the theme background */}
                    <div className="w-full">
                        <Tasks tasksHook={tasksHook} />
                    </div>
                </div>
            </main>

            {/* Global Footer - Neutral Light/Dark */}
            <div className="w-full border-t border-border/10 bg-background">
                <BotFooter />
            </div>
        </div>
    );
}
