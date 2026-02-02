'use client';

import { useState, useEffect } from 'react';
import { useTimer } from '@/hooks/useTimer';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { cn } from '@/lib/utils';
import { Play, Pause, RotateCcw } from 'lucide-react';
import { useTheme } from 'next-themes';
import { useSettings } from '@/components/SettingsContext';
import { motion, AnimatePresence } from 'framer-motion';

export function PremiumTimer({
    onTypeChange,
    onRunningChange,
    onFocusComplete
}: {
    onTypeChange?: (type: 'focus' | 'short_break' | 'long_break') => void,
    onRunningChange?: (isRunning: boolean) => void,
    onFocusComplete?: () => void
}) {
    const {
        remainingTime,
        isRunning,
        type,
        round,
        dailySessions,
        start,
        pause,
        reset,
        setType,
        formatTime,
        progress,
    } = useTimer(onFocusComplete);

    const { theme: currentTheme, setTheme } = useTheme();
    const { settings } = useSettings();

    useEffect(() => {
        onTypeChange?.(type);
    }, [type, onTypeChange]);

    useEffect(() => {
        onRunningChange?.(isRunning);
    }, [isRunning, onRunningChange]);

    const getTheme = () => {
        switch (type) {
            case 'focus':
                return {
                    color: 'text-orange-400',
                    bg: 'bg-orange-500/10',
                    border: 'border-orange-500/20',
                    ring: 'text-orange-500',
                    button: 'bg-orange-500 hover:bg-orange-600',
                };
            case 'short_break':
                return {
                    color: 'text-emerald-400',
                    bg: 'bg-emerald-500/10',
                    border: 'border-emerald-500/20',
                    ring: 'text-emerald-500',
                    button: 'bg-emerald-500 hover:bg-emerald-600',
                };
            case 'long_break':
                return {
                    color: 'text-blue-400',
                    bg: 'bg-blue-500/10',
                    border: 'border-blue-500/20',
                    ring: 'text-blue-500',
                    button: 'bg-blue-500 hover:bg-blue-600',
                };
            default:
                return {
                    color: 'text-orange-400',
                    bg: 'bg-orange-500/10',
                    border: 'border-orange-500/20',
                    ring: 'text-orange-500',
                    button: 'bg-orange-500 hover:bg-orange-600',
                };
        }
    };

    const theme = getTheme();

    return (
        <div className="w-full max-w-xl mx-auto px-2">
            <div className="relative bg-white/10 backdrop-blur-md rounded-[2rem] md:rounded-[2.5rem] p-6 md:p-12 flex flex-col items-center gap-8 md:gap-10 border border-white/10 shadow-2xl overflow-hidden">
                {/* Glowing Progress Line */}
                <div className="absolute top-0 left-0 w-full h-[6px] bg-white/5 overflow-hidden">
                    <motion.div
                        initial={{ width: 0 }}
                        animate={{
                            width: `${progress}%`,
                            backgroundColor: type === 'focus' ? '#f97316' : type === 'short_break' ? '#10b981' : '#3b82f6'
                        }}
                        transition={{ duration: 0.5, ease: "linear" }}
                        className="h-full relative"
                    >
                        {/* Glow Effect */}
                        <div className="absolute inset-0 blur-[8px] opacity-50 bg-inherit" />
                        <div className="absolute inset-x-0 h-[2px] top-0 bg-white/40 mix-blend-overlay" />

                        {/* Animated Head (Sparkle) */}
                        <motion.div
                            animate={{ opacity: [0.5, 1, 0.5] }}
                            transition={{ repeat: Infinity, duration: 2 }}
                            className="absolute right-0 top-1/2 -translate-y-1/2 w-4 h-4 rounded-full bg-white blur-[10px]"
                        />
                    </motion.div>
                </div>

                {/* Type Toggles */}
                <div className="flex justify-center gap-1 p-1 bg-black/10 rounded-xl md:rounded-2xl w-full max-w-sm overflow-x-auto no-scrollbar">
                    {(['focus', 'short_break', 'long_break'] as const).map((t) => (
                        <button
                            key={t}
                            onClick={() => setType(t)}
                            className={cn(
                                'flex-1 px-3 md:px-4 py-2 md:py-2.5 rounded-lg md:rounded-xl text-[9px] md:text-[10px] font-black uppercase tracking-widest transition-all duration-500 whitespace-nowrap',
                                type === t
                                    ? 'bg-white/20 text-white shadow-lg'
                                    : 'text-white/40 hover:text-white/60 hover:bg-white/5'
                            )}
                        >
                            {t.replace('_', ' ')}
                        </button>
                    ))}
                </div>

                <div className="flex flex-col items-center gap-2">
                    <span className="text-[6rem] sm:text-[8rem] md:text-[12rem] font-black tracking-tighter tabular-nums text-white leading-none drop-shadow-2xl">
                        {formatTime(remainingTime)}
                    </span>
                    <div className="flex flex-col items-center gap-2">
                        <div className="text-sm uppercase tracking-[0.4em] font-black text-white/50 animate-pulse">
                            {isRunning ? 'Flowing' : 'Paused'}
                        </div>
                        <div className="flex items-center gap-4 mt-2">
                            <div className="px-3 py-1 rounded-full bg-white/5 border border-white/10 text-[10px] uppercase tracking-widest font-black text-white/40">
                                Round {round}
                            </div>
                            <div className="px-3 py-1 rounded-full bg-white/5 border border-white/10 text-[10px] uppercase tracking-widest font-black text-white/40">
                                {dailySessions} Today
                            </div>
                        </div>
                    </div>
                </div>

                <div className="flex items-center justify-center gap-4 md:gap-8 w-full">
                    <Button
                        size="lg"
                        className={cn(
                            'h-16 md:h-20 flex-1 max-w-[200px] rounded-xl md:rounded-2xl text-xl md:text-2xl font-black uppercase tracking-[0.2em] transition-all active:scale-95 shadow-2xl bg-white text-black hover:bg-zinc-100 border-none'
                        )}
                        onClick={isRunning ? pause : start}
                    >
                        {isRunning ? <Pause className="w-6 h-6 md:w-8 md:h-8 fill-current" /> : <Play className="w-6 h-6 md:w-8 md:h-8 fill-current" />}
                    </Button>

                    <Button
                        variant="ghost"
                        size="icon"
                        className="h-16 w-16 md:h-20 md:w-20 rounded-xl md:rounded-2xl text-white/50 hover:text-white hover:bg-white/10 hover:rotate-[-12deg] transition-all duration-500"
                        onClick={reset}
                    >
                        <RotateCcw className="w-6 h-6 md:w-8 md:h-8" />
                    </Button>
                </div>
            </div>
        </div>
    );
}
