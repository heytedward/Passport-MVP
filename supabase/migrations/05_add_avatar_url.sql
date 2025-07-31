-- Migration: Add avatar_url and display_name columns to user_profiles table
-- Run this in your Supabase SQL editor

-- Add missing columns to user_profiles table
ALTER TABLE public.user_profiles 
ADD COLUMN IF NOT EXISTS avatar_url TEXT;

ALTER TABLE public.user_profiles 
ADD COLUMN IF NOT EXISTS display_name TEXT;

-- Create index for better performance when querying by avatar_url
CREATE INDEX IF NOT EXISTS idx_user_profiles_avatar_url 
ON public.user_profiles(avatar_url);

-- Create index for display_name queries
CREATE INDEX IF NOT EXISTS idx_user_profiles_display_name 
ON public.user_profiles(display_name);

-- Update RLS policies to ensure they cover all operations
DROP POLICY IF EXISTS "Users can update own profile" ON public.user_profiles;
CREATE POLICY "Users can update own profile" ON public.user_profiles
  FOR UPDATE USING (auth.uid() = id);

-- Ensure insert policy exists
DROP POLICY IF EXISTS "Users can insert own profile" ON public.user_profiles;
CREATE POLICY "Users can insert own profile" ON public.user_profiles
  FOR INSERT WITH CHECK (auth.uid() = id);

-- Ensure select policy exists
DROP POLICY IF EXISTS "Users can view own profile" ON public.user_profiles;
CREATE POLICY "Users can view own profile" ON public.user_profiles
  FOR SELECT USING (auth.uid() = id);

-- Add comments for documentation
COMMENT ON COLUMN public.user_profiles.avatar_url IS 'URL to user profile picture stored in Supabase storage';
COMMENT ON COLUMN public.user_profiles.display_name IS 'User display name for the app';

-- Create storage bucket for avatars if it doesn't exist
-- Note: This requires admin privileges in Supabase
-- You may need to create this manually in the Supabase dashboard
-- Go to Storage > Create bucket named 'avatars' with public access

-- Update the handle_new_user function to include new columns
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.user_profiles (
    id, 
    email, 
    username, 
    full_name,
    display_name,
    created_at,
    updated_at
  )
  VALUES (
    NEW.id, 
    NEW.email, 
    NEW.raw_user_meta_data->>'username', 
    NEW.raw_user_meta_data->>'full_name',
    COALESCE(NEW.raw_user_meta_data->>'username', NEW.email->>'email', 'User'),
    NOW(),
    NOW()
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER; 