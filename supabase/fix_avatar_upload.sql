-- Fix avatar upload functionality
-- Run this in your Supabase SQL Editor

-- 1. Add avatar_url column to user_profiles table
ALTER TABLE public.user_profiles 
ADD COLUMN IF NOT EXISTS avatar_url TEXT;

-- 2. Create index for better performance
CREATE INDEX IF NOT EXISTS idx_user_profiles_avatar_url ON public.user_profiles(avatar_url);

-- 3. Update RLS policies to allow avatar_url updates
-- (The existing policies should already cover this, but let's make sure)

-- 4. Create storage bucket for avatars (this needs to be done via Supabase Dashboard)
-- Go to Storage > Create bucket > Name: "avatars" > Public bucket > File size limit: 5MB

-- 5. Insert some test data to verify the column works
-- (Optional - only if you want to test)

-- 6. Grant permissions for avatar_url column
GRANT SELECT, UPDATE ON public.user_profiles TO authenticated;

-- 7. Ensure the column is properly configured
COMMENT ON COLUMN public.user_profiles.avatar_url IS 'URL to user profile avatar image'; 