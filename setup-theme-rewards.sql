-- Add passport theme rewards to the rewards table
-- Run this in your Supabase SQL Editor after the main setup

-- Insert passport themes as collectible rewards
INSERT INTO public.rewards (reward_id, name, description, category, rarity, wings_value, season, image_url, is_active) VALUES
  ('theme_frequency_pulse', 'Frequency Pulse Theme', 'Unlock the deep purple gradient theme for your passport', 'themes', 'common', 15, 'S1', null, true),
  ('theme_solar_shine', 'Solar Shine Theme', 'Unlock the golden sunrise gradient theme for your passport', 'themes', 'uncommon', 30, 'S1', null, true),
  ('theme_echo_glass', 'Echo Glass Theme', 'Unlock the mysterious glass gradient theme for your passport', 'themes', 'rare', 50, 'S1', null, true),
  ('theme_retro_frame', 'Retro Frame Theme', 'Unlock the vintage silver gradient theme for your passport', 'themes', 'uncommon', 35, 'S1', null, true),
  ('theme_night_scan', 'Night Scan Theme', 'Unlock the midnight scanner gradient theme for your passport', 'themes', 'rare', 45, 'S1', null, true)
ON CONFLICT (reward_id) DO UPDATE SET
  name = EXCLUDED.name,
  description = EXCLUDED.description,
  wings_value = EXCLUDED.wings_value,
  is_active = EXCLUDED.is_active;

-- Add a new table to track equipped themes per user
CREATE TABLE IF NOT EXISTS public.user_equipped_theme (
  id SERIAL PRIMARY KEY,
  user_id UUID REFERENCES public.user_profiles(id) UNIQUE,
  theme_key TEXT DEFAULT 'frequencyPulse',
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable RLS
ALTER TABLE public.user_equipped_theme ENABLE ROW LEVEL SECURITY;

-- RLS Policies for user_equipped_theme
CREATE POLICY "Users can view own equipped theme" ON public.user_equipped_theme
  FOR SELECT USING (user_id = auth.uid());

CREATE POLICY "Users can update own equipped theme" ON public.user_equipped_theme
  FOR UPDATE USING (user_id = auth.uid());

CREATE POLICY "Users can insert own equipped theme" ON public.user_equipped_theme
  FOR INSERT WITH CHECK (user_id = auth.uid());

-- Function to check if user owns a theme
CREATE OR REPLACE FUNCTION public.user_owns_theme(user_id_param UUID, theme_reward_id TEXT)
RETURNS BOOLEAN AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM public.user_closet 
    WHERE user_id = user_id_param 
    AND reward_id = theme_reward_id
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Check current theme rewards
SELECT reward_id, name, category, rarity, wings_value FROM public.rewards WHERE category = 'themes' AND is_active = true; 