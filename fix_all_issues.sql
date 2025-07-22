-- Complete fix for all Passport MVP issues
-- Run this in your Supabase SQL Editor

-- 1. Create the missing add_wings_to_user RPC function
CREATE OR REPLACE FUNCTION public.add_wings_to_user(
    user_id_param UUID,
    wings_amount INTEGER,
    activity_type_param TEXT DEFAULT 'manual',
    description_param TEXT DEFAULT 'Wings added'
)
RETURNS JSON AS $$
DECLARE
    old_balance INTEGER;
    new_balance INTEGER;
BEGIN
    -- Get current balance from user_profiles
    SELECT COALESCE(wings_balance, 0) INTO old_balance
    FROM public.user_profiles
    WHERE id = user_id_param;

    -- If user profile doesn't exist, create it
    IF old_balance IS NULL THEN
        INSERT INTO public.user_profiles (id, wings_balance, current_week_wings)
        VALUES (user_id_param, wings_amount, wings_amount)
        ON CONFLICT (id) DO UPDATE SET
            wings_balance = COALESCE(user_profiles.wings_balance, 0) + wings_amount,
            current_week_wings = COALESCE(user_profiles.current_week_wings, 0) + wings_amount;
        
        new_balance := wings_amount;
    ELSE
        -- Calculate new balance
        new_balance := old_balance + wings_amount;

        -- Update user's wings balance
        UPDATE public.user_profiles
        SET wings_balance = new_balance,
            current_week_wings = COALESCE(current_week_wings, 0) + wings_amount,
            updated_at = NOW()
        WHERE id = user_id_param;
    END IF;

    -- Log the activity
    INSERT INTO public.user_activity (user_id, activity_type, activity_title, activity_description, wings_earned)
    VALUES (
        user_id_param,
        activity_type_param,
        'Wings Earned',
        description_param,
        wings_amount
    );

    -- Return the result
    RETURN json_build_object(
        'success', true,
        'old_balance', COALESCE(old_balance, 0),
        'new_balance', new_balance,
        'wings_added', wings_amount
    );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Grant execute permission to authenticated users
GRANT EXECUTE ON FUNCTION public.add_wings_to_user TO authenticated;

-- 2. Fix user_profiles table to ensure WNGS tracking works properly
ALTER TABLE public.user_profiles 
ADD COLUMN IF NOT EXISTS wings_balance INTEGER DEFAULT 0;

ALTER TABLE public.user_profiles 
ADD COLUMN IF NOT EXISTS current_week_wings INTEGER DEFAULT 0;

ALTER TABLE public.user_profiles 
ADD COLUMN IF NOT EXISTS updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW();

-- Create an index on wings_balance for performance
CREATE INDEX IF NOT EXISTS idx_user_profiles_wings_balance ON public.user_profiles(wings_balance);

-- Ensure all existing users have a wings_balance of 0 if NULL
UPDATE public.user_profiles 
SET wings_balance = 0, current_week_wings = 0 
WHERE wings_balance IS NULL OR current_week_wings IS NULL;

-- 3. Fix user_closet table to include item_type column for proper filtering
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

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_user_closet_item_type ON public.user_closet(item_type);
CREATE INDEX IF NOT EXISTS idx_rewards_item_type ON public.rewards(item_type);

-- 4. Check that everything is working
SELECT 'User Profiles Check' as check_type, 
       COUNT(*) as total_users,
       COUNT(CASE WHEN wings_balance >= 0 THEN 1 END) as users_with_wings_balance,
       COUNT(CASE WHEN current_week_wings >= 0 THEN 1 END) as users_with_current_week_wings
FROM public.user_profiles;

SELECT 'Rewards Check' as check_type,
       item_type, 
       category, 
       COUNT(*) as count 
FROM public.rewards 
GROUP BY item_type, category 
ORDER BY item_type, category;

SELECT 'User Closet Check' as check_type,
       item_type, 
       category, 
       COUNT(*) as count 
FROM public.user_closet 
GROUP BY item_type, category 
ORDER BY item_type, category;

-- 5. Test the RPC function (uncomment and replace with actual user ID to test)
-- SELECT public.add_wings_to_user('your-user-id-here'::UUID, 25, 'test', 'Testing +25 WNGS function'); 