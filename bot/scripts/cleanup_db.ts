import { createClient } from '@supabase/supabase-js';
import { config } from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
config({ path: path.resolve(__dirname, '../.env') });

const supabaseUrl = process.env.SUPABASE_URL || process.env.NEXT_PUBLIC_SUPABASE_URL || '';
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_ANON_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '';

if (!supabaseUrl || !supabaseKey) {
    console.error('❌ Supabase credentials missing in bot/.env');
    process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

async function cleanup() {
    console.log('🧹 Starting Database Cleanup...');

    // 1. Clear session_logs
    const { error: logsError } = await supabase
        .from('session_logs')
        .delete()
        .neq('id', '00000000-0000-0000-0000-000000000000');

    if (logsError) {
        if (logsError.code === 'PGRST205') {
            console.error('❌ Error: Table "session_logs" not found in Supabase.');
            console.log('💡 HINT: Have you run the SQL schema in the Supabase SQL Editor?');
            console.log('   File: bot/src/services/DatabaseService.schema.sql');
        } else {
            console.error('❌ Error clearing session_logs:', logsError.message);
        }
    } else {
        console.log('✅ session_logs cleared.');
    }

    // 2. Clear guild_stats
    const { error: statsError } = await supabase
        .from('guild_stats')
        .delete()
        .neq('guild_id', '0');

    if (statsError) {
        if (statsError.code === 'PGRST205') {
            console.error('❌ Error: Table "guild_stats" not found in Supabase.');
        } else {
            console.error('❌ Error clearing guild_stats:', statsError.message);
        }
    } else {
        console.log('✅ guild_stats cleared.');
    }

    console.log('\n--- Status Check ---');
    if (logsError?.code === 'PGRST205' || statsError?.code === 'PGRST205') {
        process.exit(1);
    }

    console.log('🎉 Database cleanup complete!');
}

cleanup();
