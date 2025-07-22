-- Fix the rarity constraint issue
-- Run this first to allow all rarity types

-- Check what constraints exist on the rewards table
SELECT conname, pg_get_constraintdef(oid) 
FROM pg_constraint 
WHERE conrelid = 'public.rewards'::regclass 
AND contype = 'c';

-- Drop the existing rarity check constraint if it exists
ALTER TABLE public.rewards DROP CONSTRAINT IF EXISTS rewards_rarity_check;

-- Add a new constraint that allows all the rarity types we use
ALTER TABLE public.rewards 
ADD CONSTRAINT rewards_rarity_check 
CHECK (rarity IN ('common', 'uncommon', 'rare', 'epic', 'legendary'));

-- Now insert test rewards with corrected values
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

-- Verify the data was inserted
SELECT reward_id, name, rarity, wings_value FROM public.rewards WHERE active = true; 