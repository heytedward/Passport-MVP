-- Migration: Add theme and progress tracking columns to user_profiles
-- Run this in your Supabase SQL editor

-- Add theme-related columns
DO $$
BEGIN
    -- Add themes_unlocked column if it doesn't exist
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'user_profiles' 
        AND column_name = 'themes_unlocked'
    ) THEN
        ALTER TABLE public.user_profiles ADD COLUMN themes_unlocked TEXT[] DEFAULT ARRAY['frequencyPulse'];
        RAISE NOTICE 'Added themes_unlocked column to user_profiles';
    END IF;

    -- Add equipped_theme column if it doesn't exist
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'user_profiles' 
        AND column_name = 'equipped_theme'
    ) THEN
        ALTER TABLE public.user_profiles ADD COLUMN equipped_theme TEXT DEFAULT 'frequencyPulse';
        RAISE NOTICE 'Added equipped_theme column to user_profiles';
    END IF;

    -- Add total_scans column if it doesn't exist
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'user_profiles' 
        AND column_name = 'total_scans'
    ) THEN
        ALTER TABLE public.user_profiles ADD COLUMN total_scans INTEGER DEFAULT 0;
        RAISE NOTICE 'Added total_scans column to user_profiles';
    END IF;

    -- Add total_quests_completed column if it doesn't exist
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'user_profiles' 
        AND column_name = 'total_quests_completed'
    ) THEN
        ALTER TABLE public.user_profiles ADD COLUMN total_quests_completed INTEGER DEFAULT 0;
        RAISE NOTICE 'Added total_quests_completed column to user_profiles';
    END IF;

    -- Add total_items_collected column if it doesn't exist
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'user_profiles' 
        AND column_name = 'total_items_collected'
    ) THEN
        ALTER TABLE public.user_profiles ADD COLUMN total_items_collected INTEGER DEFAULT 0;
        RAISE NOTICE 'Added total_items_collected column to user_profiles';
    END IF;

    -- Add last_quest_completion_date column if it doesn't exist
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'user_profiles' 
        AND column_name = 'last_quest_completion_date'
    ) THEN
        ALTER TABLE public.user_profiles ADD COLUMN last_quest_completion_date TIMESTAMP WITH TIME ZONE;
        RAISE NOTICE 'Added last_quest_completion_date column to user_profiles';
    END IF;

    -- Add last_scan_date column if it doesn't exist
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'user_profiles' 
        AND column_name = 'last_scan_date'
    ) THEN
        ALTER TABLE public.user_profiles ADD COLUMN last_scan_date TIMESTAMP WITH TIME ZONE;
        RAISE NOTICE 'Added last_scan_date column to user_profiles';
    END IF;

END $$;

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_user_profiles_themes_unlocked ON public.user_profiles USING GIN(themes_unlocked);
CREATE INDEX IF NOT EXISTS idx_user_profiles_equipped_theme ON public.user_profiles(equipped_theme);
CREATE INDEX IF NOT EXISTS idx_user_profiles_total_scans ON public.user_profiles(total_scans);
CREATE INDEX IF NOT EXISTS idx_user_profiles_total_quests_completed ON public.user_profiles(total_quests_completed);
CREATE INDEX IF NOT EXISTS idx_user_profiles_total_items_collected ON public.user_profiles(total_items_collected);

-- Update RLS policies to ensure they cover theme operations
DROP POLICY IF EXISTS "Users can update own theme" ON public.user_profiles;
CREATE POLICY "Users can update own theme" ON public.user_profiles
  FOR UPDATE USING (auth.uid() = id);

-- Create a function to unlock themes based on progress
CREATE OR REPLACE FUNCTION unlock_theme_based_on_progress()
RETURNS TRIGGER AS $$
DECLARE
    new_themes TEXT[] := NEW.themes_unlocked;
    theme_unlocked BOOLEAN := FALSE;
BEGIN
    -- Check for Solar Shine theme (first scan)
    IF NEW.total_scans >= 1 AND NOT ('solarShine' = ANY(NEW.themes_unlocked)) THEN
        new_themes := array_append(new_themes, 'solarShine');
        theme_unlocked := TRUE;
    END IF;

    -- Check for Echo Glass theme (3 quests)
    IF NEW.total_quests_completed >= 3 AND NOT ('echoGlass' = ANY(NEW.themes_unlocked)) THEN
        new_themes := array_append(new_themes, 'echoGlass');
        theme_unlocked := TRUE;
    END IF;

    -- Check for Retro Frame theme (10 items)
    IF NEW.total_items_collected >= 10 AND NOT ('retroFrame' = ANY(NEW.themes_unlocked)) THEN
        new_themes := array_append(new_themes, 'retroFrame');
        theme_unlocked := TRUE;
    END IF;

    -- Check for Night Scan theme (500 WNGS)
    IF NEW.wings_balance >= 500 AND NOT ('nightScan' = ANY(NEW.themes_unlocked)) THEN
        new_themes := array_append(new_themes, 'nightScan');
        theme_unlocked := TRUE;
    END IF;

    -- Update themes if any new ones were unlocked
    IF theme_unlocked THEN
        NEW.themes_unlocked := new_themes;
    END IF;

    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create trigger to automatically unlock themes
DROP TRIGGER IF EXISTS trigger_unlock_themes ON public.user_profiles;
CREATE TRIGGER trigger_unlock_themes
    BEFORE UPDATE ON public.user_profiles
    FOR EACH ROW
    EXECUTE FUNCTION unlock_theme_based_on_progress();

-- Grant necessary permissions
GRANT EXECUTE ON FUNCTION unlock_theme_based_on_progress() TO service_role;
GRANT EXECUTE ON FUNCTION unlock_theme_based_on_progress() TO postgres;

-- Show success message
SELECT 'Theme and progress tracking columns added successfully!' as message; 