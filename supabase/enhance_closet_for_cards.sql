-- Enhance closet structure for card-based display
-- Run this in your Supabase SQL editor

-- 1. Add missing columns to user_closet for card display
ALTER TABLE public.user_closet 
ADD COLUMN IF NOT EXISTS image_url TEXT,
ADD COLUMN IF NOT EXISTS description TEXT,
ADD COLUMN IF NOT EXISTS stats JSONB DEFAULT '{}',
ADD COLUMN IF NOT EXISTS card_metadata JSONB DEFAULT '{}',
ADD COLUMN IF NOT EXISTS is_limited_edition BOOLEAN DEFAULT false,
ADD COLUMN IF NOT EXISTS collection_name TEXT,
ADD COLUMN IF NOT EXISTS season TEXT,
ADD COLUMN IF NOT EXISTS release_date TIMESTAMP WITH TIME ZONE;

-- 2. Add missing columns to rewards table for better card data
ALTER TABLE public.rewards 
ADD COLUMN IF NOT EXISTS image_url TEXT,
ADD COLUMN IF NOT EXISTS card_image_url TEXT,
ADD COLUMN IF NOT EXISTS stats JSONB DEFAULT '{}',
ADD COLUMN IF NOT EXISTS card_metadata JSONB DEFAULT '{}',
ADD COLUMN IF NOT EXISTS is_limited_edition BOOLEAN DEFAULT false,
ADD COLUMN IF NOT EXISTS collection_name TEXT,
ADD COLUMN IF NOT EXISTS release_date TIMESTAMP WITH TIME ZONE;

-- 3. Insert enhanced sample rewards with card data
INSERT INTO public.rewards (
  reward_id, 
  name, 
  description, 
  category, 
  rarity, 
  wings_value, 
  season,
  image_url,
  card_image_url,
  stats,
  card_metadata,
  is_limited_edition,
  collection_name,
  release_date
) VALUES
  (
    'monarch_jacket_001',
    'Monarch Varsity Jacket',
    'Limited edition varsity jacket with embroidered butterfly design',
    'jackets',
    'rare',
    50,
    'S1',
    '/images/rewards/monarch_jacket_001.jpg',
    '/images/cards/monarch_jacket_001_card.jpg',
    '{"hp": 160, "attack": 80, "defense": 120, "speed": 90}',
    '{"card_number": "001/150", "artist": "PapillonLabs", "card_type": "Fashion Item", "special_ability": "Style Boost"}',
    true,
    'Monarch Collection',
    '2025-01-15'
  ),
  (
    'monarch_tee_001',
    'Monarch Classic Tee',
    'Classic branded t-shirt with minimalist butterfly logo',
    'tops',
    'common',
    10,
    'S1',
    '/images/rewards/monarch_tee_001.jpg',
    '/images/cards/monarch_tee_001_card.jpg',
    '{"hp": 70, "attack": 40, "defense": 60, "speed": 80}',
    '{"card_number": "002/150", "artist": "PapillonLabs", "card_type": "Fashion Item", "special_ability": "Comfort Zone"}',
    false,
    'Monarch Collection',
    '2025-01-15'
  ),
  (
    'monarch_cap_001',
    'Monarch Snapback',
    'Embroidered snapback cap with metallic butterfly accent',
    'headwear',
    'uncommon',
    25,
    'S1',
    '/images/rewards/monarch_cap_001.jpg',
    '/images/cards/monarch_cap_001_card.jpg',
    '{"hp": 90, "attack": 60, "defense": 80, "speed": 100}',
    '{"card_number": "003/150", "artist": "PapillonLabs", "card_type": "Fashion Item", "special_ability": "Cool Factor"}',
    false,
    'Monarch Collection',
    '2025-01-15'
  ),
  (
    'monarch_hoodie_001',
    'Monarch Hoodie',
    'Premium cotton hoodie with butterfly wing design',
    'tops',
    'rare',
    35,
    'S1',
    '/images/rewards/monarch_hoodie_001.jpg',
    '/images/cards/monarch_hoodie_001_card.jpg',
    '{"hp": 140, "attack": 70, "defense": 100, "speed": 75}',
    '{"card_number": "004/150", "artist": "PapillonLabs", "card_type": "Fashion Item", "special_ability": "Warm Embrace"}',
    true,
    'Monarch Collection',
    '2025-01-20'
  ),
  (
    'monarch_shoes_001',
    'Monarch Sneakers',
    'Limited edition sneakers with butterfly wing pattern',
    'footwear',
    'epic',
    75,
    'S1',
    '/images/rewards/monarch_shoes_001.jpg',
    '/images/cards/monarch_shoes_001_card.jpg',
    '{"hp": 180, "attack": 90, "defense": 140, "speed": 120}',
    '{"card_number": "005/150", "artist": "PapillonLabs", "card_type": "Fashion Item", "special_ability": "Swift Movement"}',
    true,
    'Monarch Collection',
    '2025-01-25'
  ),
  (
    'monarch_chain_001',
    'Monarch Chain',
    'Gold-plated chain with butterfly pendant',
    'accessories',
    'legendary',
    100,
    'S1',
    '/images/rewards/monarch_chain_001.jpg',
    '/images/cards/monarch_chain_001_card.jpg',
    '{"hp": 200, "attack": 120, "defense": 160, "speed": 110}',
    '{"card_number": "006/150", "artist": "PapillonLabs", "card_type": "Fashion Item", "special_ability": "Royal Aura"}',
    true,
    'Monarch Collection',
    '2025-02-01'
  ),
  (
    'monarch_jeans_001',
    'Monarch Jeans',
    'Distressed jeans with butterfly embroidery',
    'bottoms',
    'uncommon',
    30,
    'S1',
    '/images/rewards/monarch_jeans_001.jpg',
    '/images/cards/monarch_jeans_001_card.jpg',
    '{"hp": 110, "attack": 55, "defense": 90, "speed": 85}',
    '{"card_number": "007/150", "artist": "PapillonLabs", "card_type": "Fashion Item", "special_ability": "Street Style"}',
    false,
    'Monarch Collection',
    '2025-01-30'
  ),
  (
    'monarch_watch_001',
    'Monarch Watch',
    'Luxury timepiece with butterfly motif',
    'accessories',
    'mythic',
    150,
    'S1',
    '/images/rewards/monarch_watch_001.jpg',
    '/images/cards/monarch_watch_001_card.jpg',
    '{"hp": 250, "attack": 150, "defense": 200, "speed": 130}',
    '{"card_number": "008/150", "artist": "PapillonLabs", "card_type": "Fashion Item", "special_ability": "Time Master"}',
    true,
    'Monarch Collection',
    '2025-02-05'
  ),
  (
    'monarch_backpack_001',
    'Monarch Backpack',
    'Functional backpack with butterfly wing design',
    'accessories',
    'rare',
    45,
    'S1',
    '/images/rewards/monarch_backpack_001.jpg',
    '/images/cards/monarch_backpack_001_card.jpg',
    '{"hp": 130, "attack": 65, "defense": 110, "speed": 70}',
    '{"card_number": "009/150", "artist": "PapillonLabs", "card_type": "Fashion Item", "special_ability": "Storage Master"}',
    false,
    'Monarch Collection',
    '2025-02-10'
  )
ON CONFLICT (reward_id) DO UPDATE SET
  image_url = EXCLUDED.image_url,
  card_image_url = EXCLUDED.card_image_url,
  stats = EXCLUDED.stats,
  card_metadata = EXCLUDED.card_metadata,
  is_limited_edition = EXCLUDED.is_limited_edition,
  collection_name = EXCLUDED.collection_name,
  release_date = EXCLUDED.release_date;

-- 4. Create a function to get enhanced closet data with card information
CREATE OR REPLACE FUNCTION public.get_user_closet_cards(user_id_param UUID)
RETURNS TABLE (
  id INTEGER,
  reward_id TEXT,
  name TEXT,
  description TEXT,
  category TEXT,
  rarity TEXT,
  mint_number INTEGER,
  wings_earned INTEGER,
  earned_date TIMESTAMP WITH TIME ZONE,
  earned_via TEXT,
  is_equipped BOOLEAN,
  image_url TEXT,
  card_image_url TEXT,
  stats JSONB,
  card_metadata JSONB,
  is_limited_edition BOOLEAN,
  collection_name TEXT,
  season TEXT,
  release_date TIMESTAMP WITH TIME ZONE
) AS $$
BEGIN
  RETURN QUERY
  SELECT 
    uc.id,
    uc.reward_id,
    uc.name,
    COALESCE(uc.description, r.description) as description,
    uc.category,
    uc.rarity,
    uc.mint_number,
    uc.wings_earned,
    uc.earned_date,
    uc.earned_via,
    uc.is_equipped,
    COALESCE(uc.image_url, r.image_url) as image_url,
    COALESCE(uc.card_image_url, r.card_image_url) as card_image_url,
    COALESCE(uc.stats, r.stats) as stats,
    COALESCE(uc.card_metadata, r.card_metadata) as card_metadata,
    COALESCE(uc.is_limited_edition, r.is_limited_edition) as is_limited_edition,
    COALESCE(uc.collection_name, r.collection_name) as collection_name,
    COALESCE(uc.season, r.season) as season,
    COALESCE(uc.release_date, r.release_date) as release_date
  FROM public.user_closet uc
  LEFT JOIN public.rewards r ON uc.reward_id = r.reward_id
  WHERE uc.user_id = user_id_param
  ORDER BY uc.earned_date DESC;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 5. Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_user_closet_user_id_earned_date ON public.user_closet(user_id, earned_date DESC);
CREATE INDEX IF NOT EXISTS idx_user_closet_category ON public.user_closet(category);
CREATE INDEX IF NOT EXISTS idx_user_closet_rarity ON public.user_closet(rarity);
CREATE INDEX IF NOT EXISTS idx_rewards_category ON public.rewards(category);
CREATE INDEX IF NOT EXISTS idx_rewards_rarity ON public.rewards(rarity);

-- 6. Verify the enhanced structure
SELECT 
  'user_closet' as table_name,
  COUNT(*) as total_items,
  COUNT(DISTINCT user_id) as unique_users
FROM public.user_closet
UNION ALL
SELECT 
  'rewards' as table_name,
  COUNT(*) as total_items,
  COUNT(DISTINCT category) as unique_categories
FROM public.rewards; 