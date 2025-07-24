-- Quest System Database Setup for Monarch Passport MVP
-- Run this in your Supabase SQL editor

-- 1. Quest Progress table for tracking user progress on specific quests
CREATE TABLE IF NOT EXISTS public.quest_progress (
  id SERIAL PRIMARY KEY,
  user_id UUID REFERENCES public.user_profiles(id) ON DELETE CASCADE,
  quest_id TEXT NOT NULL,
  quest_name TEXT NOT NULL,
  progress INTEGER DEFAULT 0,
  total_required INTEGER NOT NULL,
  is_completed BOOLEAN DEFAULT false,
  completed_at TIMESTAMP WITH TIME ZONE,
  season TEXT DEFAULT 'Spring_25',
  quest_type TEXT NOT NULL, -- 'digital_collector', 'store_explorer', 'social_butterfly', 'daily_dedication'
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(user_id, quest_id, season)
);

-- 2. User Stats table for aggregated statistics
CREATE TABLE IF NOT EXISTS public.user_stats (
  id SERIAL PRIMARY KEY,
  user_id UUID REFERENCES public.user_profiles(id) ON DELETE CASCADE UNIQUE,
  total_qr_scans INTEGER DEFAULT 0,
  total_social_shares INTEGER DEFAULT 0,
  total_store_visits INTEGER DEFAULT 0,
  total_daily_completions INTEGER DEFAULT 0,
  current_streak INTEGER DEFAULT 0,
  longest_streak INTEGER DEFAULT 0,
  last_scan_date TIMESTAMP WITH TIME ZONE,
  last_share_date TIMESTAMP WITH TIME ZONE,
  last_visit_date TIMESTAMP WITH TIME ZONE,
  last_daily_date TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable Row Level Security
ALTER TABLE public.quest_progress ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_stats ENABLE ROW LEVEL SECURITY;

-- RLS Policies for quest_progress
CREATE POLICY "Users can view own quest progress" ON public.quest_progress
  FOR SELECT USING (user_id = auth.uid());

CREATE POLICY "Users can insert own quest progress" ON public.quest_progress
  FOR INSERT WITH CHECK (user_id = auth.uid());

CREATE POLICY "Users can update own quest progress" ON public.quest_progress
  FOR UPDATE USING (user_id = auth.uid());

-- RLS Policies for user_stats
CREATE POLICY "Users can view own stats" ON public.user_stats
  FOR SELECT USING (user_id = auth.uid());

CREATE POLICY "Users can insert own stats" ON public.user_stats
  FOR INSERT WITH CHECK (user_id = auth.uid());

CREATE POLICY "Users can update own stats" ON public.user_stats
  FOR UPDATE USING (user_id = auth.uid());

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_quest_progress_user_id ON public.quest_progress(user_id);
CREATE INDEX IF NOT EXISTS idx_quest_progress_quest_type ON public.quest_progress(quest_type);
CREATE INDEX IF NOT EXISTS idx_quest_progress_completed ON public.quest_progress(is_completed);
CREATE INDEX IF NOT EXISTS idx_user_stats_user_id ON public.user_stats(user_id);

-- Function to initialize user stats when user profile is created
CREATE OR REPLACE FUNCTION public.initialize_user_stats()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.user_stats (user_id)
  VALUES (NEW.id)
  ON CONFLICT (user_id) DO NOTHING;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger to auto-create user stats
CREATE OR REPLACE TRIGGER on_user_profile_created
  AFTER INSERT ON public.user_profiles
  FOR EACH ROW EXECUTE FUNCTION public.initialize_user_stats();

-- Function to update quest progress
CREATE OR REPLACE FUNCTION public.update_quest_progress(
  user_id_param UUID,
  quest_type_param TEXT,
  increment_amount INTEGER DEFAULT 1
)
RETURNS JSON AS $$
DECLARE
  quest_record RECORD;
  quest_configs JSON := '{
    "digital_collector": {"name": "Digital Collector", "total": 10, "reward": 100},
    "store_explorer": {"name": "Store Explorer", "total": 3, "reward": 75},
    "social_butterfly": {"name": "Social Butterfly", "total": 5, "reward": 50},
    "daily_dedication": {"name": "Daily Dedication", "total": 15, "reward": 125}
  }';
  quest_config JSON;
  new_progress INTEGER;
  quest_completed BOOLEAN := false;
BEGIN
  -- Get quest configuration
  quest_config := quest_configs->quest_type_param;
  
  IF quest_config IS NULL THEN
    RETURN json_build_object('success', false, 'error', 'Invalid quest type');
  END IF;

  -- Insert or update quest progress
  INSERT INTO public.quest_progress (
    user_id,
    quest_id,
    quest_name,
    progress,
    total_required,
    quest_type,
    season
  ) VALUES (
    user_id_param,
    quest_type_param,
    quest_config->>'name',
    increment_amount,
    (quest_config->>'total')::INTEGER,
    quest_type_param,
    'Spring_25'
  )
  ON CONFLICT (user_id, quest_id, season) 
  DO UPDATE SET 
    progress = quest_progress.progress + increment_amount,
    updated_at = NOW()
  RETURNING progress, total_required, is_completed INTO quest_record;

  new_progress := quest_record.progress;

  -- Check if quest is now completed
  IF new_progress >= quest_record.total_required AND NOT quest_record.is_completed THEN
    UPDATE public.quest_progress 
    SET is_completed = true, completed_at = NOW()
    WHERE user_id = user_id_param AND quest_id = quest_type_param AND season = 'Spring_25';
    
    quest_completed := true;
    
    -- Award WINGS for quest completion
    PERFORM public.add_wings_to_user(
      user_id_param,
      (quest_config->>'reward')::INTEGER,
      'quest_completion',
      'Completed quest: ' || (quest_config->>'name')
    );
  END IF;

  RETURN json_build_object(
    'success', true,
    'quest_type', quest_type_param,
    'progress', new_progress,
    'total_required', quest_record.total_required,
    'completed', quest_completed,
    'percent', ROUND((new_progress::FLOAT / quest_record.total_required::FLOAT) * 100)
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to log QR scan and update quest progress
CREATE OR REPLACE FUNCTION public.log_qr_scan(
  user_id_param UUID,
  reward_id_param TEXT,
  item_name_param TEXT,
  category_param TEXT,
  rarity_param TEXT,
  wings_earned_param INTEGER,
  location_param TEXT DEFAULT 'Unknown'
)
RETURNS JSON AS $$
DECLARE
  result JSON;
  scan_count INTEGER;
BEGIN
  -- Add item to user closet
  INSERT INTO public.user_closet (
    user_id,
    reward_id,
    name,
    rarity,
    category,
    wings_earned,
    earned_via
  ) VALUES (
    user_id_param,
    reward_id_param,
    item_name_param,
    rarity_param,
    category_param,
    wings_earned_param,
    'qr_scan'
  );

  -- Log activity
  INSERT INTO public.user_activity (
    user_id,
    activity_type,
    activity_title,
    activity_description,
    wings_earned,
    reward_id,
    metadata
  ) VALUES (
    user_id_param,
    'scan',
    'QR Code Scanned',
    'Scanned ' || item_name_param || ' at ' || location_param,
    wings_earned_param,
    reward_id_param,
    json_build_object('location', location_param, 'category', category_param)
  );

  -- Update user stats
  UPDATE public.user_stats 
  SET 
    total_qr_scans = total_qr_scans + 1,
    last_scan_date = NOW(),
    updated_at = NOW()
  WHERE user_id = user_id_param;

  -- Get current scan count for quest progress
  SELECT total_qr_scans INTO scan_count 
  FROM public.user_stats 
  WHERE user_id = user_id_param;

  -- Update digital collector quest progress
  SELECT public.update_quest_progress(user_id_param, 'digital_collector', 1) INTO result;

  -- Add WINGS to user balance
  PERFORM public.add_wings_to_user(
    user_id_param,
    wings_earned_param,
    'qr_scan',
    'QR Scan: ' || item_name_param
  );

  RETURN json_build_object(
    'success', true,
    'scan_count', scan_count,
    'quest_update', result,
    'wings_earned', wings_earned_param
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to log social share and update quest progress
CREATE OR REPLACE FUNCTION public.log_social_share(
  user_id_param UUID,
  platform_param TEXT,
  content_type_param TEXT DEFAULT 'general'
)
RETURNS JSON AS $$
DECLARE
  result JSON;
  share_count INTEGER;
  wings_reward INTEGER := 25;
BEGIN
  -- Log activity
  INSERT INTO public.user_activity (
    user_id,
    activity_type,
    activity_title,
    activity_description,
    wings_earned,
    metadata
  ) VALUES (
    user_id_param,
    'social_share',
    'Social Media Share',
    'Shared on ' || platform_param,
    wings_reward,
    json_build_object('platform', platform_param, 'content_type', content_type_param)
  );

  -- Update user stats
  UPDATE public.user_stats 
  SET 
    total_social_shares = total_social_shares + 1,
    last_share_date = NOW(),
    updated_at = NOW()
  WHERE user_id = user_id_param;

  -- Get current share count for quest progress
  SELECT total_social_shares INTO share_count 
  FROM public.user_stats 
  WHERE user_id = user_id_param;

  -- Update social butterfly quest progress
  SELECT public.update_quest_progress(user_id_param, 'social_butterfly', 1) INTO result;

  -- Add WINGS to user balance
  PERFORM public.add_wings_to_user(
    user_id_param,
    wings_reward,
    'social_share',
    'Social Share: ' || platform_param
  );

  RETURN json_build_object(
    'success', true,
    'share_count', share_count,
    'quest_update', result,
    'wings_earned', wings_reward
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Grant permissions
GRANT SELECT, INSERT, UPDATE ON public.quest_progress TO authenticated;
GRANT SELECT, INSERT, UPDATE ON public.user_stats TO authenticated;
GRANT EXECUTE ON FUNCTION public.update_quest_progress TO authenticated;
GRANT EXECUTE ON FUNCTION public.log_qr_scan TO authenticated;
GRANT EXECUTE ON FUNCTION public.log_social_share TO authenticated;

-- Initialize default quests for Spring '25 season
-- This will be called when users first access the quest system
CREATE OR REPLACE FUNCTION public.initialize_user_quests(user_id_param UUID)
RETURNS JSON AS $$
DECLARE
  quest_configs JSON := '[
    {"id": "digital_collector", "name": "Digital Collector", "total": 10, "type": "digital_collector"},
    {"id": "store_explorer", "name": "Store Explorer", "total": 3, "type": "store_explorer"},
    {"id": "social_butterfly", "name": "Social Butterfly", "total": 5, "type": "social_butterfly"},
    {"id": "daily_dedication", "name": "Daily Dedication", "total": 15, "type": "daily_dedication"}
  ]';
  quest_config JSON;
BEGIN
  FOR quest_config IN SELECT * FROM json_array_elements(quest_configs)
  LOOP
    INSERT INTO public.quest_progress (
      user_id,
      quest_id,
      quest_name,
      progress,
      total_required,
      quest_type,
      season
    ) VALUES (
      user_id_param,
      quest_config->>'id',
      quest_config->>'name',
      0,
      (quest_config->>'total')::INTEGER,
      quest_config->>'type',
      'Spring_25'
    )
    ON CONFLICT (user_id, quest_id, season) DO NOTHING;
  END LOOP;

  RETURN json_build_object('success', true, 'message', 'User quests initialized');
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

GRANT EXECUTE ON FUNCTION public.initialize_user_quests TO authenticated;

SELECT 'Quest system setup completed successfully!' as message;