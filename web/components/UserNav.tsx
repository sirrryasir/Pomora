'use client';

import { useAuth } from '@/hooks/useAuth';
import { Button } from '@/components/ui/button';
import { ReportModal } from '@/components/ReportModal';
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { LogOut, User, Trophy, LogIn } from 'lucide-react';

export function UserNav() {
    const { user, signInWithGoogle, signOut, loading } = useAuth();

    if (loading) return <div className="w-8 h-8 rounded-full bg-foreground/5 animate-pulse" />;

    if (!user) {
        return (
            <Button
                onClick={signInWithGoogle}
                variant="outline"
                size="sm"
                className="gap-2 rounded-xl border-orange-500/20 bg-orange-500/5 text-orange-500 hover:bg-orange-500 hover:text-white transition-all duration-300"
            >
                <LogIn className="w-4 h-4" />
                <span className="hidden sm:inline">Join the Hub</span>
                <span className="sm:hidden">Join</span>
            </Button>
        );
    }

    const initials = user.email?.substring(0, 2).toUpperCase() || 'P';

    return (
        <DropdownMenu>
            <DropdownMenuTrigger asChild>
                <Button variant="ghost" className="relative h-10 w-10 rounded-full hover:bg-foreground/5">
                    <Avatar className="h-9 w-9 border-2 border-orange-500/20">
                        <AvatarImage src={user.user_metadata.avatar_url} alt={user.email || ''} />
                        <AvatarFallback className="bg-orange-500/10 text-orange-500 text-xs font-bold">
                            {initials}
                        </AvatarFallback>
                    </Avatar>
                </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent className="w-56 bg-card/95 backdrop-blur-xl border-border/50 rounded-2xl p-2" align="end" forceMount>
                <DropdownMenuLabel className="font-normal p-2">
                    <div className="flex flex-col space-y-1">
                        <p className="text-sm font-bold leading-none text-foreground">{user.user_metadata.full_name || 'Focused Human'}</p>
                        <p className="text-[10px] leading-none text-foreground/40 mt-1 uppercase tracking-widest">{user.email}</p>
                    </div>
                </DropdownMenuLabel>
                <DropdownMenuSeparator className="bg-border/50" />

                <ReportModal>
                    <DropdownMenuItem
                        onSelect={(e) => e.preventDefault()}
                        className="flex items-center gap-2 p-2 focus:bg-orange-500/10 focus:text-orange-500 rounded-xl cursor-pointer"
                    >
                        <Trophy className="w-4 h-4" />
                        <span className="text-xs font-bold uppercase tracking-wider">Report & Rank</span>
                    </DropdownMenuItem>
                </ReportModal>
                <DropdownMenuSeparator className="bg-border/50" />
                <DropdownMenuItem
                    onClick={() => signOut()}
                    className="flex items-center gap-2 p-2 focus:bg-red-500/10 focus:text-red-500 text-red-500/70 rounded-xl cursor-pointer"
                >
                    <LogOut className="w-4 h-4" />
                    <span className="text-xs font-bold uppercase tracking-wider">Log out</span>
                </DropdownMenuItem>
            </DropdownMenuContent>
        </DropdownMenu>
    );
}
