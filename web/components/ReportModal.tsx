'use client';

import { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { BarChart, Trophy, Clock, Calendar, Lock } from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';

interface Stats {
    total_focus_time: number;
    current_streak: number;
    last_focus_date: string;
}

interface LeaderboardEntry {
    full_name: string;
    total_focus_time: number;
    current_streak: number;
}

export function ReportModal({ children }: { children?: React.ReactNode }) {
    const { user, signInWithGoogle } = useAuth();
    const [stats, setStats] = useState<Stats | null>(null);
    const [leaderboard, setLeaderboard] = useState<LeaderboardEntry[]>([]);
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        if (user) {
            setLoading(true);
            Promise.all([
                fetch('/api/stats').then(res => res.json()),
                fetch('/api/leaderboard').then(res => res.json())
            ]).then(([statsData, leaderboardData]) => {
                setStats(statsData);
                setLeaderboard(leaderboardData);
            }).catch(err => console.error(err))
                .finally(() => setLoading(false));
        }
    }, [user]);

    const formatTime = (minutes: number) => {
        const hours = Math.floor(minutes / 60);
        const mins = minutes % 60;
        return `${hours}h ${mins}m`;
    };

    return (
        <Dialog>
            <DialogTrigger asChild>
                {children || <Button variant="ghost" size="icon"><BarChart className="w-5 h-5" /></Button>}
            </DialogTrigger>
            <DialogContent className="sm:max-w-[600px] bg-card/95 backdrop-blur-xl border-border/50">
                <DialogHeader>
                    <DialogTitle className="flex items-center gap-2 text-xl font-bold">
                        <BarChart className="w-5 h-5 text-orange-500" />
                        Focus Report
                    </DialogTitle>
                </DialogHeader>

                {!user ? (
                    <div className="flex flex-col items-center justify-center py-12 text-center space-y-4">
                        <div className="w-16 h-16 rounded-full bg-orange-500/10 flex items-center justify-center">
                            <Lock className="w-8 h-8 text-orange-500" />
                        </div>
                        <h3 className="text-lg font-bold">Login Required</h3>
                        <p className="text-muted-foreground text-sm max-w-xs">
                            Log in to track your focus hours, build streaks, and join the global leaderboard.
                        </p>
                        <Button
                            onClick={signInWithGoogle}
                            className="bg-orange-500 hover:bg-orange-600 text-white font-bold rounded-xl"
                        >
                            Sign In with Google
                        </Button>
                    </div>
                ) : (
                    <Tabs defaultValue="summary" className="w-full">
                        <TabsList className="grid w-full grid-cols-2 bg-muted/20">
                            <TabsTrigger value="summary">Summary</TabsTrigger>
                            <TabsTrigger value="ranking">Leaderboard</TabsTrigger>
                        </TabsList>

                        <TabsContent value="summary" className="space-y-6 py-4">
                            <div className="grid grid-cols-3 gap-4">
                                <div className="p-4 rounded-2xl bg-orange-500/5 border border-orange-500/10 flex flex-col items-center justify-center text-center gap-2">
                                    <Clock className="w-5 h-5 text-orange-500" />
                                    <span className="text-2xl font-black text-foreground">
                                        {(stats?.total_focus_time || 0) / 60 < 0.01
                                            ? '0'
                                            : ((stats?.total_focus_time || 0) / 60).toFixed(3)}
                                    </span>
                                    <span className="text-[10px] uppercase font-bold text-muted-foreground tracking-wider">Hours Focused</span>
                                </div>
                                <div className="p-4 rounded-2xl bg-blue-500/5 border border-blue-500/10 flex flex-col items-center justify-center text-center gap-2">
                                    <Calendar className="w-5 h-5 text-blue-500" />
                                    <span className="text-2xl font-black text-foreground">
                                        {/* Simplified logic for MVP: just showing days accessed could be inferred or stored separately. For now, let's use a dummy or just hide if complex. 
                                            Actually let's just show Streak here twice or Total Sessions if we had it. 
                                            Let's use Current Streak. */}
                                        {stats?.current_streak || 0}
                                    </span>
                                    <span className="text-[10px] uppercase font-bold text-muted-foreground tracking-wider">Day Streak</span>
                                </div>
                                <div className="p-4 rounded-2xl bg-red-500/5 border border-red-500/10 flex flex-col items-center justify-center text-center gap-2">
                                    <Trophy className="w-5 h-5 text-red-500" />
                                    <span className="text-2xl font-black text-foreground">
                                        #{leaderboard.findIndex(u => u.total_focus_time === stats?.total_focus_time) + 1 || '-'}
                                    </span>
                                    <span className="text-[10px] uppercase font-bold text-muted-foreground tracking-wider">Global Rank</span>
                                </div>
                            </div>

                            <div className="p-6 rounded-2xl bg-muted/10 border border-border/50 text-center">
                                <p className="text-muted-foreground text-sm">
                                    Detailed charts coming soon! Keep focusing to build your stats.
                                </p>
                            </div>
                        </TabsContent>

                        <TabsContent value="ranking" className="py-4">
                            <div className="bg-muted/10 rounded-2xl border border-border/50 overflow-hidden">
                                {loading ? (
                                    <div className="p-8 text-center text-muted-foreground">Loading...</div>
                                ) : (
                                    <div className="divide-y divide-border/50">
                                        {leaderboard.map((entry, index) => (
                                            <div key={index} className="flex items-center justify-between p-4 hover:bg-muted/20 transition-colors">
                                                <div className="flex items-center gap-4">
                                                    <div className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-sm
                                                        ${index === 0 ? 'bg-yellow-500/20 text-yellow-500' :
                                                            index === 1 ? 'bg-slate-400/20 text-slate-400' :
                                                                index === 2 ? 'bg-orange-700/20 text-orange-700' : 'bg-muted text-muted-foreground'}`}>
                                                        {index + 1}
                                                    </div>
                                                    <div className="flex flex-col">
                                                        <span className="font-bold text-sm">{entry.full_name || 'Anonymous User'}</span>
                                                        {entry.current_streak > 0 && (
                                                            <span className="text-[10px] text-orange-500 font-bold flex items-center gap-1">
                                                                <span className="inline-block w-1.5 h-1.5 rounded-full bg-orange-500" />
                                                                {entry.current_streak} Day Streak
                                                            </span>
                                                        )}
                                                    </div>
                                                </div>
                                                <span className="font-mono text-sm opacity-70">
                                                    {formatTime(entry.total_focus_time)}
                                                </span>
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </div>
                        </TabsContent>
                    </Tabs>
                )}
            </DialogContent>
        </Dialog>
    );
}
