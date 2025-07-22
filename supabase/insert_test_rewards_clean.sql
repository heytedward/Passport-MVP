-- Insert test rewards into the database
-- Run this in your Supabase SQL editor to populate the rewards table

-- First, ensure the rewards table exists
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

-- Insert test rewards from the QR generator
INSERT INTO public.rewards (reward_id, name, description, category, rarity, wings_value, season, active) VALUES
('monarch_jacket_001', 'Monarch Varsity Jacket', 'Limited edition varsity jacket with embroidered Monarch logo', 'jackets', 'rare', 50, 'Spring2025', true),
('monarch_tee_001', 'Monarch Classic Tee', 'Premium cotton t-shirt with subtle Monarch branding', 'tops', 'common', 10, 'Spring2025', true),
('monarch_cap_001', 'Monarch Snapback', 'Embroidered snapback cap with adjustable strap', 'headwear', 'uncommon', 25, 'Spring2025', true),
('monarch_hoodie_001', 'Monarch Hoodie', 'Cozy pullover hoodie with kangaroo pocket', 'tops', 'uncommon', 35, 'Spring2025', true),
('monarch_pins_001', 'Monarch Pin Set', 'Collectible enamel pin set featuring butterfly designs', 'accessories', 'rare', 40, 'Spring2025', true),
('theme_frequency_pulse', 'Frequency Pulse Theme', 'Unlock the deep purple gradient theme for your passport', 'themes', 'epic', 0, 'Spring2025', true),
('theme_solar_shine', 'Solar Shine Theme', 'Unlock the golden sunrise gradient theme for your passport', 'themes', 'rare', 0, 'Spring2025', true),
('exclusive_hoodie_001', 'Exclusive Monarch Hoodie', 'Ultra-rare limited drop exclusive hoodie', 'hoodies', 'legendary', 100, 'Spring2025', true),
('echo_glass_theme', 'Echo Glass Theme', 'Unlock the Echo Glass passport theme', 'themes', 'uncommon', 0, 'Spring2025', true),
('test_expired_001', 'Expired Test Item', 'This QR code is expired (for testing)', 'test', 'common', 5, 'Winter2024', false)
ON CONFLICT (reward_id) DO UPDATE SET
    name = EXCLUDED.name,
    description = EXCLUDED.description,
    category = EXCLUDED.category,
    rarity = EXCLUDED.rarity,
    wings_value = EXCLUDED.wings_value,
    season = EXCLUDED.season,
    active = EXCLUDED.active;

-- Also ensure user_closet table exists
CREATE TABLE IF NOT EXISTS public.user_closet (
    id SERIAL PRIMARY KEY,
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    reward_id TEXT NOT NULL,
    name TEXT NOT NULL,
    rarity TEXT NOT NULL,
    category TEXT NOT NULL,
    mint_number INTEGER NOT NULL,
    earned_date TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    earned_via TEXT DEFAULT 'unknown',
    wings_earned INTEGER DEFAULT 0,
    metadata JSONB,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(user_id, reward_id)
);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_rewards_reward_id ON public.rewards(reward_id);
CREATE INDEX IF NOT EXISTS idx_rewards_active ON public.rewards(active);
CREATE INDEX IF NOT EXISTS idx_user_closet_user_id ON public.user_closet(user_id);
CREATE INDEX IF NOT EXISTS idx_user_closet_reward_id ON public.user_closet(reward_id);

-- Enable Row Level Security
ALTER TABLE public.rewards ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_closet ENABLE ROW LEVEL SECURITY;

-- Drop existing policies if they exist to avoid conflicts
DROP POLICY IF EXISTS "Anyone can view active rewards" ON public.rewards;
DROP POLICY IF EXISTS "Users can view their own closet items" ON public.user_closet;
DROP POLICY IF EXISTS "Users can insert their own closet items" ON public.user_closet;
DROP POLICY IF EXISTS "Users can update their own closet items" ON public.user_closet;

-- Create policies for rewards table (read-only for authenticated users)
CREATE POLICY "Anyone can view active rewards" ON public.rewards
    FOR SELECT USING (active = true);

-- Create policies for user_closet table (users can only see their own closet items)
CREATE POLICY "Users can view their own closet items" ON public.user_closet
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own closet items" ON public.user_closet
    FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own closet items" ON public.user_closet
    FOR UPDATE USING (auth.uid() = user_id);

-- Grant permissions
GRANT SELECT ON public.rewards TO authenticated;
GRANT SELECT, INSERT, UPDATE ON public.user_closet TO authenticated;
GRANT USAGE ON SEQUENCE user_closet_id_seq TO authenticated; 