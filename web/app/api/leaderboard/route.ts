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

        // Fetch top 10 users by total focus time
        const { data, error } = await supabase
            .from('user_stats')
            .select('full_name, total_focus_time, current_streak')
            .order('total_focus_time', { ascending: false })
            .limit(10);

        if (error) throw error;

        return NextResponse.json(data);
    } catch (e) {
        console.error('Leaderboard fetch error:', e);
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
}
