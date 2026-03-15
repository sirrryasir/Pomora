import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET() {
    try {
        // Leaderboard is public — no auth required
        const data = await prisma.userStats.findMany({
            select: {
                fullName: true,
                totalFocusTime: true,
                currentStreak: true,
            },
            orderBy: { totalFocusTime: 'desc' },
            take: 10,
        });

        return NextResponse.json(data);
    } catch (e) {
        console.error('Leaderboard fetch error:', e);
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
}
