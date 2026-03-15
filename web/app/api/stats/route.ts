import { NextResponse } from 'next/server';
import { auth } from '@/auth';
import { prisma } from '@/lib/prisma';

export async function GET() {
    try {
        const session = await auth();

        if (!session?.user?.id) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const data = await prisma.userStats.findUnique({
            where: { userId: session.user.id },
        });

        return NextResponse.json(data || { totalFocusTime: 0, currentStreak: 0 });
    } catch (e) {
        console.error('Stats fetch error:', e);
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
}

export async function PATCH(request: Request) {
    try {
        const session = await auth();

        if (!session?.user?.id) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const { minutes } = await request.json();
        const MINUTES_TO_ADD = Number(minutes) || 25;

        // Fetch current stats
        const currentStats = await prisma.userStats.findUnique({
            where: { userId: session.user.id },
        });

        const today = new Date().toISOString().split('T')[0];
        let newStreak = currentStats?.currentStreak || 0;
        const lastDate = currentStats?.lastFocusDate;

        // Streak Logic
        if (lastDate !== today) {
            const yesterday = new Date();
            yesterday.setDate(yesterday.getDate() - 1);
            const yesterdayStr = yesterday.toISOString().split('T')[0];

            if (lastDate === yesterdayStr) {
                // Continued streak
                newStreak += 1;
            } else if (newStreak === 0 || !lastDate) {
                // New/First streak
                newStreak = 1;
            } else {
                // Broken streak, reset to 1 (since they focused today)
                newStreak = 1;
            }
        }

        const data = await prisma.userStats.upsert({
            where: { userId: session.user.id },
            update: {
                totalFocusTime: (currentStats?.totalFocusTime || 0) + MINUTES_TO_ADD,
                currentStreak: newStreak,
                lastFocusDate: today,
                email: session.user.email || undefined,
                fullName: session.user.name || session.user.email?.split('@')[0],
            },
            create: {
                userId: session.user.id,
                email: session.user.email || undefined,
                fullName: session.user.name || session.user.email?.split('@')[0],
                totalFocusTime: MINUTES_TO_ADD,
                currentStreak: newStreak,
                lastFocusDate: today,
            },
        });

        return NextResponse.json(data);
    } catch (e) {
        console.error('Stats update error:', e);
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
}
