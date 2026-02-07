import { useEffect, useState } from 'react';
import { Flame } from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';
import { useSettings } from '@/components/SettingsContext';

export function StreakBadge() {
    const { user } = useAuth();
    const { settings } = useSettings();
    const [streak, setStreak] = useState<number>(0);
    const [loading, setLoading] = useState(true);
    const [mounted, setMounted] = useState(false);

    useEffect(() => {
        setMounted(true);
    }, []);

    useEffect(() => {
        if (!user) {
            setLoading(false);
            return;
        }

        const fetchStats = async () => {
            try {
                const res = await fetch('/api/stats');
                if (res.ok) {
                    const data = await res.json();
                    setStreak(data.current_streak || 0);
                }
            } catch (error) {
                console.error('Failed to fetch streak', error);
            } finally {
                setLoading(false);
            }
        };

        fetchStats();
    }, [user]);

    if (!user || loading || streak === 0) return null;

    // Determine current theme color or default
    const themeColor = mounted ? (settings.themeColors?.focus || '#f97316') : '#f97316';

    return (
        <div
            className="relative group flex items-center gap-2 px-5 py-2.5 rounded-full bg-background/80 backdrop-blur-xl border border-white/10 transition-all duration-300 animate-pulse-glow"
            style={{
                '--glow-color': themeColor,
                borderColor: themeColor
            } as React.CSSProperties}
        >
            <div className="absolute inset-0 rounded-full bg-gradient-to-r from-transparent via-white/10 to-transparent animate-shimmer" style={{ backgroundSize: '200% 100%' }} />

            <Flame
                className="w-5 h-5 drop-shadow-[0_0_8px_rgba(255,255,255,0.5)]"
                style={{ color: themeColor, fill: themeColor }}
            />
            <span
                className="text-sm font-black tracking-widest drop-shadow-md z-10"
                style={{ color: themeColor }}
            >
                {streak} DAY STREAK
            </span>
        </div>
    );
}
