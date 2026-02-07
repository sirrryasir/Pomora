import { createServerClient } from '@supabase/auth-helpers-nextjs';
import { cookies } from 'next/headers';
import { NextResponse } from 'next/server';

export async function GET() {
    try {
        const cookieStore = await cookies();
        const supabase = createServerClient(
            process.env.NEXT_PUBLIC_SUPABASE_URL!,
            process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
            { cookies: { get: (name) => cookieStore.get(name)?.value } }
        );

        const { data: { user } } = await supabase.auth.getUser();
        if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

        const { data, error } = await supabase
            .from('user_stats')
            .select('*')
            .eq('user_id', user.id)
            .single();

        if (error && error.code !== 'PGRST116') { // PGRST116 is "No rows found"
            console.error('Stats fetch error:', error);
        }

        return NextResponse.json(data || { total_focus_time: 0, current_streak: 0 });
    } catch (e) {
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
}

export async function PATCH(request: Request) {
    try {
        const cookieStore = await cookies();
        const supabase = createServerClient(
            process.env.NEXT_PUBLIC_SUPABASE_URL!,
            process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
            { cookies: { get: (name) => cookieStore.get(name)?.value } }
        );

        const { data: { user } } = await supabase.auth.getUser();
        if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

        const { minutes } = await request.json();
        const MINUTES_TO_ADD = Number(minutes) || 25;

        // Fetch current stats
        const { data: currentStats } = await supabase
            .from('user_stats')
            .select('*')
            .eq('user_id', user.id)
            .single();

        const today = new Date().toISOString().split('T')[0];
        let newStreak = currentStats?.current_streak || 0;
        let lastDate = currentStats?.last_focus_date;

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

        const { data, error } = await supabase
            .from('user_stats')
            .upsert({
                user_id: user.id,
                email: user.email,
                full_name: user.user_metadata.full_name || user.email?.split('@')[0],
                total_focus_time: (currentStats?.total_focus_time || 0) + MINUTES_TO_ADD,
                current_streak: newStreak,
                last_focus_date: today
            })
            .select()
            .single();

        if (error) throw error;

        return NextResponse.json(data);
    } catch (e) {
        console.error('Stats update error:', e);
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
}
