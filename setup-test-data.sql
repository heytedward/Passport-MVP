-- Run this in your Supabase SQL Editor to add test rewards for QR scanning

-- Insert test rewards that match our QR code generator exactly
INSERT INTO public.rewards (reward_id, name, description, category, rarity, wings_value, season, image_url, is_active) VALUES
  ('monarch_jacket_001', 'Monarch Varsity Jacket', 'Limited edition varsity jacket', 'jackets', 'rare', 50, 'Spring2025', null, true),
  ('monarch_tee_001', 'Monarch Classic Tee', 'Classic branded t-shirt', 'tops', 'common', 10, 'Spring2025', null, true),
  ('monarch_cap_001', 'Monarch Snapback', 'Embroidered snapback cap', 'headwear', 'uncommon', 25, 'Spring2025', null, true),
  ('frequency_pulse_theme', 'Frequency Pulse Theme', 'Unlock the Frequency Pulse passport theme', 'themes', 'epic', 0, 'Spring2025', null, true),
  ('solar_shine_theme', 'Solar Shine Theme', 'Unlock the Solar Shine passport theme', 'themes', 'rare', 0, 'Spring2025', null, true),
  ('echo_glass_theme', 'Echo Glass Theme', 'Unlock the Echo Glass passport theme', 'themes', 'uncommon', 0, 'Spring2025', null, true),
  ('exclusive_hoodie_001', 'Monarch Exclusive Hoodie', 'Limited drop exclusive hoodie', 'hoodies', 'legendary', 100, 'Spring2025', null, true),
  ('test_expired_001', 'Expired Test Item', 'This QR code is expired (for testing)', 'test', 'common', 5, 'Winter2024', null, true)
ON CONFLICT (reward_id) DO UPDATE SET
  name = EXCLUDED.name,
  description = EXCLUDED.description,
  category = EXCLUDED.category,
  rarity = EXCLUDED.rarity,
  wings_value = EXCLUDED.wings_value,
  season = EXCLUDED.season,
  is_active = EXCLUDED.is_active;

-- Check if rewards were inserted successfully
SELECT reward_id, name, category, rarity, wings_value, season FROM public.rewards WHERE season IN ('Spring2025', 'Winter2024') ORDER BY rarity, wings_value DESC; 