-- Sample closet data for testing
-- Run this in your Supabase SQL editor after the main database setup

-- First, let's insert some sample user profiles if they don't exist
-- (This assumes you have users in your auth.users table)

-- Insert sample closet items for testing
-- Note: Replace the user_id with actual user IDs from your auth.users table
INSERT INTO public.user_closet (user_id, reward_id, name, rarity, category, mint_number, wings_earned, earned_date, earned_via) VALUES
  -- You'll need to replace these UUIDs with actual user IDs from your database
  -- For now, these are placeholder UUIDs - update them with real user IDs
  ('00000000-0000-0000-0000-000000000001', 'spring-jacket-001', 'Spring Jacket', 'rare', 'jackets', 37, 25, '2025-03-15', 'qr_scan'),
  ('00000000-0000-0000-0000-000000000001', 'gold-chain-001', 'Gold Chain', 'epic', 'accessories', 3, 30, '2025-03-12', 'qr_scan'),
  ('00000000-0000-0000-0000-000000000001', 'summer-hat-001', 'Summer Hat', 'common', 'headwear', 21, 10, '2025-03-10', 'qr_scan'),
  ('00000000-0000-0000-0000-000000000001', 'classic-hoodie-001', 'Classic Hoodie', 'rare', 'tops', 89, 25, '2025-03-08', 'qr_scan'),
  ('00000000-0000-0000-0000-000000000001', 'denim-jeans-001', 'Denim Jeans', 'rare', 'bottoms', 156, 25, '2025-03-05', 'qr_scan'),
  ('00000000-0000-0000-0000-000000000001', 'long-sleeve-tee-001', 'Long Sleeve Tee', 'common', 'tops', 203, 15, '2025-03-01', 'qr_scan'),
  ('00000000-0000-0000-0000-000000000001', 'butterfly-wallpaper-001', 'Butterfly Wallpaper', 'epic', 'wallpapers', 12, 40, '2025-03-22', 'achievement')
ON CONFLICT DO NOTHING;

-- To use this script:
-- 1. Go to your Supabase dashboard
-- 2. Navigate to SQL Editor
-- 3. Run this query: SELECT id FROM auth.users LIMIT 1;
-- 4. Copy the actual user ID from the result
-- 5. Replace all instances of '00000000-0000-0000-0000-000000000001' with the real user ID
-- 6. Run this script

-- Alternative: If you want to insert data for all existing users, use this instead:
/*
INSERT INTO public.user_closet (user_id, reward_id, name, rarity, category, mint_number, wings_earned, earned_date, earned_via)
SELECT 
  id as user_id,
  'welcome-jacket-001' as reward_id,
  'Welcome Jacket' as name,
  'rare' as rarity,
  'jackets' as category,
  1 as mint_number,
  25 as wings_earned,
  NOW() as earned_date,
  'welcome_bonus' as earned_via
FROM auth.users
WHERE id NOT IN (SELECT DISTINCT user_id FROM public.user_closet WHERE reward_id = 'welcome-jacket-001')
ON CONFLICT DO NOTHING;
*/ 