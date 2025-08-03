-- Add theme-related columns to user_profiles table
ALTER TABLE public.user_profiles 
ADD COLUMN IF NOT EXISTS themes_unlocked TEXT[] DEFAULT ARRAY['frequencyPulse'],
ADD COLUMN IF NOT EXISTS equipped_theme TEXT DEFAULT 'frequencyPulse',
ADD COLUMN IF NOT EXISTS total_scans INTEGER DEFAULT 0,
ADD COLUMN IF NOT EXISTS total_quests_completed INTEGER DEFAULT 0,
ADD COLUMN IF NOT EXISTS total_items_collected INTEGER DEFAULT 0;

-- Update existing users to have the default theme
UPDATE public.user_profiles 
SET 
  themes_unlocked = ARRAY['frequencyPulse'],
  equipped_theme = 'frequencyPulse'
WHERE themes_unlocked IS NULL OR equipped_theme IS NULL;

-- Create function to check and unlock themes based on progress
CREATE OR REPLACE FUNCTION check_theme_unlocks(user_id_param UUID)
RETURNS TEXT[] AS $$
DECLARE
  user_profile RECORD;
  new_unlocks TEXT[] := ARRAY[]::TEXT[];
  current_themes TEXT[];
BEGIN
  -- Get user profile
  SELECT * INTO user_profile 
  FROM user_profiles 
  WHERE id = user_id_param;
  
  IF NOT FOUND THEN
    RETURN new_unlocks;
  END IF;
  
  current_themes := user_profile.themes_unlocked;
  
  -- Check Solar Shine (first scan)
  IF user_profile.total_scans >= 1 AND NOT ('solarShine' = ANY(current_themes)) THEN
    new_unlocks := array_append(new_unlocks, 'solarShine');
    current_themes := array_append(current_themes, 'solarShine');
  END IF;
  
  -- Check Echo Glass (3 quests)
  IF user_profile.total_quests_completed >= 3 AND NOT ('echoGlass' = ANY(current_themes)) THEN
    new_unlocks := array_append(new_unlocks, 'echoGlass');
    current_themes := array_append(current_themes, 'echoGlass');
  END IF;
  
  -- Check Retro Frame (10 items)
  IF user_profile.total_items_collected >= 10 AND NOT ('retroFrame' = ANY(current_themes)) THEN
    new_unlocks := array_append(new_unlocks, 'retroFrame');
    current_themes := array_append(current_themes, 'retroFrame');
  END IF;
  
  -- Check Night Scan (500 WNGS)
  IF user_profile.wings_balance >= 500 AND NOT ('nightScan' = ANY(current_themes)) THEN
    new_unlocks := array_append(new_unlocks, 'nightScan');
    current_themes := array_append(current_themes, 'nightScan');
  END IF;
  
  -- Update user profile if new themes unlocked
  IF array_length(new_unlocks, 1) > 0 THEN
    UPDATE user_profiles 
    SET themes_unlocked = current_themes
    WHERE id = user_id_param;
  END IF;
  
  RETURN new_unlocks;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create function to update progress and check for theme unlocks
CREATE OR REPLACE FUNCTION update_user_progress(
  user_id_param UUID,
  progress_type TEXT,
  amount INTEGER DEFAULT 1
)
RETURNS TEXT[] AS $$
DECLARE
  new_unlocks TEXT[] := ARRAY[]::TEXT[];
BEGIN
  -- Update the appropriate progress field
  CASE progress_type
    WHEN 'scan' THEN
      UPDATE user_profiles 
      SET total_scans = total_scans + amount
      WHERE id = user_id_param;
    WHEN 'quest' THEN
      UPDATE user_profiles 
      SET total_quests_completed = total_quests_completed + amount
      WHERE id = user_id_param;
    WHEN 'item' THEN
      UPDATE user_profiles 
      SET total_items_collected = total_items_collected + amount
      WHERE id = user_id_param;
    WHEN 'wings' THEN
      UPDATE user_profiles 
      SET wings_balance = wings_balance + amount
      WHERE id = user_id_param;
  END CASE;
  
  -- Check for new theme unlocks
  SELECT check_theme_unlocks(user_id_param) INTO new_unlocks;
  
  RETURN new_unlocks;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER; 