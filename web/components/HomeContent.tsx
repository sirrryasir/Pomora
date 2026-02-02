'use client';

import { PremiumTimer } from '@/components/PremiumTimer';
import { Notes } from '@/components/Notes';
import { SettingsModal } from '@/components/SettingsModal';
import { UserNav } from '@/components/UserNav';
import { BotNavbar } from '@/components/bot/BotNavbar';
import { BotFooter } from '@/components/bot/BotFooter';
import { useState } from 'react';
import { useSettings } from '@/components/SettingsContext';

export function HomeContent() {
    const { settings } = useSettings();
    const [mode, setMode] = useState<'focus' | 'short_break' | 'long_break'>('focus');

    const getBgColor = () => {
        if (!settings.themeColors) return '#ba4949';
        switch (mode) {
            case 'focus': return settings.themeColors.focus;
            case 'short_break': return settings.themeColors.shortBreak;
            case 'long_break': return settings.themeColors.longBreak;
            default: return settings.themeColors.focus;
        }
    };

    const bgColor = getBgColor();

    return (
        <div className="min-h-screen bg-background text-foreground flex flex-col transition-all duration-1000">
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
                className="flex-1 w-full transition-all duration-1000 ease-in-out py-12 md:py-20 flex flex-col gap-12 items-center"
                style={{ backgroundColor: bgColor }}
            >
                <div className="w-full max-w-2xl px-4 flex flex-col gap-8 md:gap-16">
                    {/* Timer Section */}
                    <div className="w-full flex justify-center">
                        <PremiumTimer onTypeChange={setMode} />
                    </div>

                    {/* Notes Section - Matches the theme background */}
                    <div className="w-full">
                        <Notes themeColor={bgColor} />
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
