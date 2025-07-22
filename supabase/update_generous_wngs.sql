-- Update WNGS values for generous gamification system
-- Run this in your Supabase SQL Editor

-- Update existing rewards with new generous WNGS values
UPDATE public.rewards SET wings_value = 15 WHERE rarity = 'common';
UPDATE public.rewards SET wings_value = 35 WHERE rarity = 'uncommon';  
UPDATE public.rewards SET wings_value = 75 WHERE rarity = 'rare';
UPDATE public.rewards SET wings_value = 150 WHERE rarity = 'epic';
UPDATE public.rewards SET wings_value = 300 WHERE rarity = 'legendary';

-- Verify the updates
SELECT 'WNGS values updated successfully!' as message;

SELECT rarity, COUNT(*) as item_count, MIN(wings_value) as min_wngs, MAX(wings_value) as max_wngs
FROM public.rewards 
WHERE active = true 
GROUP BY rarity 
ORDER BY 
  CASE rarity 
    WHEN 'common' THEN 1
    WHEN 'uncommon' THEN 2
    WHEN 'rare' THEN 3
    WHEN 'epic' THEN 4
    WHEN 'legendary' THEN 5
  END; 