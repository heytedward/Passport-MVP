-- Fix user_profiles table to ensure WNGS tracking works properly

-- Add missing columns to user_profiles if they don't exist
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