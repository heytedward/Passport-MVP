-- Migration: Add activity tracking features
-- Run this in your Supabase SQL editor after the main setup

-- 1. Add earned_via column to user_closet if it doesn't exist
ALTER TABLE public.user_closet 
ADD COLUMN IF NOT EXISTS earned_via TEXT DEFAULT 'qr_scan';

-- 2. Create user_activity table for recent activity tracking
CREATE TABLE IF NOT EXISTS public.user_activity (
  id SERIAL PRIMARY KEY,
  user_id UUID REFERENCES public.user_profiles(id),
  activity_type TEXT NOT NULL, -- 'scan', 'quest', 'event', 'daily', 'referral'
  activity_title TEXT NOT NULL,
  activity_description TEXT,
  wings_earned INTEGER DEFAULT 0,
  reward_id TEXT,
  activity_date TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  metadata JSONB
);

-- 3. Enable RLS for user_activity
ALTER TABLE public.user_activity ENABLE ROW LEVEL SECURITY;

-- 4. RLS Policies for user_activity
CREATE POLICY "Users can view own activity" ON public.user_activity
  FOR SELECT USING (user_id = auth.uid());

CREATE POLICY "Users can insert own activity" ON public.user_activity
  FOR INSERT WITH CHECK (user_id = auth.uid());

-- 5. Create index for better performance
CREATE INDEX IF NOT EXISTS idx_user_activity_user_date 
  ON public.user_activity(user_id, activity_date DESC);

CREATE INDEX IF NOT EXISTS idx_user_activity_type 
  ON public.user_activity(user_id, activity_type);

-- 6. Insert some sample activity data for testing (optional)
-- This will only work if you have existing users in your database
INSERT INTO public.user_activity (user_id, activity_type, activity_title, activity_description, wings_earned, reward_id, activity_date, metadata)
SELECT 
  id as user_id,
  'scan' as activity_type,
  'Welcome Bonus' as activity_title,
  'Started your Monarch Passport journey' as activity_description,
  25 as wings_earned,
  null as reward_id,
  NOW() - INTERVAL '2 days' as activity_date,
  '{"source": "welcome_bonus"}' as metadata
FROM public.user_profiles 
WHERE created_at IS NOT NULL
ON CONFLICT DO NOTHING; 