-- Essential tables for QR scanning to work
-- Run this FIRST to ensure basic functionality

-- Create rewards table
CREATE TABLE IF NOT EXISTS public.rewards (
    id SERIAL PRIMARY KEY,
    reward_id TEXT UNIQUE NOT NULL,
    name TEXT NOT NULL,
    description TEXT,
    category TEXT NOT NULL,
    rarity TEXT NOT NULL,
    wings_value INTEGER DEFAULT 0,
    season TEXT,
    active BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create user_closet table
CREATE TABLE IF NOT EXISTS public.user_closet (
    id SERIAL PRIMARY KEY,
    user_id UUID NOT NULL,
    reward_id TEXT NOT NULL,
    name TEXT NOT NULL,
    rarity TEXT NOT NULL,
    category TEXT NOT NULL,
    mint_number INTEGER NOT NULL,
    earned_date TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    earned_via TEXT DEFAULT 'qr_scan',
    wings_earned INTEGER DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(user_id, reward_id)
);

-- Create user_activity table (optional but used for logging)
CREATE TABLE IF NOT EXISTS public.user_activity (
    id SERIAL PRIMARY KEY,
    user_id UUID NOT NULL,
    activity_type TEXT NOT NULL,
    activity_title TEXT NOT NULL,
    activity_description TEXT,
    wings_earned INTEGER DEFAULT 0,
    reward_id TEXT,
    metadata JSONB,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable RLS
ALTER TABLE public.rewards ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_closet ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_activity ENABLE ROW LEVEL SECURITY;

-- Drop existing policies to avoid conflicts
DROP POLICY IF EXISTS "Public read access for rewards" ON public.rewards;
DROP POLICY IF EXISTS "Users manage own closet" ON public.user_closet;
DROP POLICY IF EXISTS "Users manage own activity" ON public.user_activity;

-- Simple policies
CREATE POLICY "Public read access for rewards" ON public.rewards FOR SELECT USING (true);
CREATE POLICY "Users manage own closet" ON public.user_closet FOR ALL USING (auth.uid() = user_id);
CREATE POLICY "Users manage own activity" ON public.user_activity FOR ALL USING (auth.uid() = user_id);

-- Grant permissions
GRANT SELECT ON public.rewards TO authenticated;
GRANT ALL ON public.user_closet TO authenticated;
GRANT ALL ON public.user_activity TO authenticated;
GRANT USAGE ON ALL SEQUENCES IN SCHEMA public TO authenticated; 