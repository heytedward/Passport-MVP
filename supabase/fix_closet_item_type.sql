-- Fix user_closet table to include item_type column for proper filtering

-- Add item_type column to user_closet table
ALTER TABLE public.user_closet 
ADD COLUMN IF NOT EXISTS item_type TEXT DEFAULT 'physical_item';

-- Update existing records to set item_type based on category
UPDATE public.user_closet 
SET item_type = CASE 
    WHEN category IN ('jackets', 'tops', 'bottoms', 'headwear', 'accessories', 'footwear', 'hoodies') THEN 'physical_item'
    WHEN category IN ('themes', 'wallpapers', 'tickets', 'posters', 'badges', 'passes', 'stickers', 'audio_stickers') THEN 'digital_collectible'
    ELSE 'physical_item' -- Default to physical for unknown categories
END;

-- Add item_type to rewards table for future reference
ALTER TABLE public.rewards
ADD COLUMN IF NOT EXISTS item_type TEXT DEFAULT 'physical_item';

-- Update rewards table to set item_type based on category
UPDATE public.rewards 
SET item_type = CASE 
    WHEN category IN ('jackets', 'tops', 'bottoms', 'headwear', 'accessories', 'footwear', 'hoodies') THEN 'physical_item'
    WHEN category IN ('themes', 'wallpapers', 'tickets', 'posters', 'badges', 'passes', 'stickers', 'audio_stickers') THEN 'digital_collectible'
    ELSE 'physical_item' -- Default to physical for unknown categories
END;

-- Create index for performance
CREATE INDEX IF NOT EXISTS idx_user_closet_item_type ON public.user_closet(item_type);
CREATE INDEX IF NOT EXISTS idx_rewards_item_type ON public.rewards(item_type);

-- Check the results
SELECT item_type, category, COUNT(*) as count 
FROM public.user_closet 
GROUP BY item_type, category 
ORDER BY item_type, category; 