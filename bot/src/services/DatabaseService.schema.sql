-- Pomora Database Schema (Supabase/PostgreSQL)

-- 1. Profiles (Combined Web & Discord Users)
CREATE TABLE IF NOT EXISTS public.profiles (
  id UUID REFERENCES auth.users ON DELETE CASCADE PRIMARY KEY,
  discord_id TEXT UNIQUE,
  email TEXT,
  full_name TEXT,
  avatar_url TEXT,
  total_focus_time INTEGER DEFAULT 0, -- Total focus time in minutes
  streak_days INTEGER DEFAULT 0,
  last_session_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 2. Guild Stats (Per-Server Leaderboards)
CREATE TABLE IF NOT EXISTS public.guild_stats (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  guild_id TEXT NOT NULL,
  user_id TEXT NOT NULL, -- Discord User ID
  daily_time INTEGER DEFAULT 0, -- Daily time in minutes
  weekly_time INTEGER DEFAULT 0,
  monthly_time INTEGER DEFAULT 0,
  total_time INTEGER DEFAULT 0,
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(guild_id, user_id)
);

-- 3. Session Logs (Detailed History)
CREATE TABLE IF NOT EXISTS public.session_logs (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id TEXT NOT NULL, -- Discord ID or Auth UUID
  guild_id TEXT, -- NULL if web session
  start_time TIMESTAMPTZ NOT NULL,
  duration INTEGER NOT NULL, -- duration in minutes
  session_type TEXT DEFAULT 'focus',
  is_web BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 4. Guild Configs (Admin Settings)
CREATE TABLE IF NOT EXISTS public.guild_configs (
    guild_id TEXT PRIMARY KEY,
    report_channel_id TEXT,
    study_channel_id TEXT,
    commands_channel_id TEXT,
    admin_role_id TEXT,
    weekly_report_enabled BOOLEAN DEFAULT TRUE,
    daily_report_enabled BOOLEAN DEFAULT TRUE,
    timezone TEXT DEFAULT 'UTC',
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Enable RLS
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.guild_stats ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.session_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.guild_configs ENABLE ROW LEVEL SECURITY;

-- Basic Policies
CREATE POLICY "Public profiles are viewable by everyone" ON public.profiles FOR SELECT USING (true);
CREATE POLICY "Public guild_stats are viewable by everyone" ON public.guild_stats FOR SELECT USING (true);
CREATE POLICY "Public guild_configs are viewable by everyone" ON public.guild_configs FOR SELECT USING (true);

-- 5. Active Channel Messages (Persistence for Timer Messages)
CREATE TABLE IF NOT EXISTS public.active_channel_messages (
  channel_id TEXT PRIMARY KEY,
  guild_id TEXT NOT NULL,
  message_id TEXT NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE public.active_channel_messages ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Public active_channel_messages are viewable by everyone" ON public.active_channel_messages FOR SELECT USING (true);
