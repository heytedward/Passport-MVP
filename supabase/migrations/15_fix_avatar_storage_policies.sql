-- Migration: Fix avatar storage policies and ensure proper database access
-- Run this in your Supabase SQL editor

-- Ensure avatar_url column exists
ALTER TABLE public.user_profiles 
ADD COLUMN IF NOT EXISTS avatar_url TEXT;

-- Create index for avatar_url queries
CREATE INDEX IF NOT EXISTS idx_user_profiles_avatar_url 
ON public.user_profiles(avatar_url);

-- Update RLS policies for user_profiles table
DROP POLICY IF EXISTS "Users can update own profile" ON public.user_profiles;
CREATE POLICY "Users can update own profile" ON public.user_profiles
  FOR UPDATE USING (auth.uid() = id);

DROP POLICY IF EXISTS "Users can insert own profile" ON public.user_profiles;
CREATE POLICY "Users can insert own profile" ON public.user_profiles
  FOR INSERT WITH CHECK (auth.uid() = id);

DROP POLICY IF EXISTS "Users can view own profile" ON public.user_profiles;
CREATE POLICY "Users can view own profile" ON public.user_profiles
  FOR SELECT USING (auth.uid() = id);

-- Create storage bucket for avatars if it doesn't exist
-- Note: This requires admin privileges in Supabase
-- You may need to create this manually in the Supabase dashboard
-- Go to Storage > Create bucket named 'avatars' with public access

-- Storage policies for avatars bucket
-- These policies allow users to upload and view their own avatars

-- Policy for uploading avatars (users can upload to their own folder)
DROP POLICY IF EXISTS "Users can upload own avatars" ON storage.objects;
CREATE POLICY "Users can upload own avatars" ON storage.objects
  FOR INSERT WITH CHECK (
    bucket_id = 'avatars' AND 
    auth.uid()::text = (storage.foldername(name))[1]
  );

-- Policy for viewing avatars (public read access)
DROP POLICY IF EXISTS "Anyone can view avatars" ON storage.objects;
CREATE POLICY "Anyone can view avatars" ON storage.objects
  FOR SELECT USING (bucket_id = 'avatars');

-- Policy for updating avatars (users can update their own avatars)
DROP POLICY IF EXISTS "Users can update own avatars" ON storage.objects;
CREATE POLICY "Users can update own avatars" ON storage.objects
  FOR UPDATE USING (
    bucket_id = 'avatars' AND 
    auth.uid()::text = (storage.foldername(name))[1]
  );

-- Policy for deleting avatars (users can delete their own avatars)
DROP POLICY IF EXISTS "Users can delete own avatars" ON storage.objects;
CREATE POLICY "Users can delete own avatars" ON storage.objects
  FOR DELETE USING (
    bucket_id = 'avatars' AND 
    auth.uid()::text = (storage.foldername(name))[1]
  );

-- Function to clean up old avatars when user updates profile
CREATE OR REPLACE FUNCTION public.cleanup_old_avatars()
RETURNS TRIGGER AS $$
BEGIN
  -- Delete old avatar file if it exists and is different from new one
  IF OLD.avatar_url IS NOT NULL AND NEW.avatar_url IS NOT NULL AND OLD.avatar_url != NEW.avatar_url THEN
    -- Extract file path from old avatar URL
    -- Assuming URL format: https://xxx.supabase.co/storage/v1/object/public/avatars/user_id/filename
    -- We need to extract the user_id/filename part
    DECLARE
      old_file_path TEXT;
    BEGIN
      -- Extract the path after 'avatars/' in the URL
      old_file_path := substring(OLD.avatar_url from 'avatars/(.*)');
      
      IF old_file_path IS NOT NULL THEN
        -- Delete the old file
        DELETE FROM storage.objects 
        WHERE bucket_id = 'avatars' AND name = old_file_path;
      END IF;
    EXCEPTION
      WHEN OTHERS THEN
        -- Log error but don't fail the update
        RAISE WARNING 'Failed to cleanup old avatar: %', SQLERRM;
    END;
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create trigger to cleanup old avatars
DROP TRIGGER IF EXISTS trigger_cleanup_old_avatars ON public.user_profiles;
CREATE TRIGGER trigger_cleanup_old_avatars
  BEFORE UPDATE ON public.user_profiles
  FOR EACH ROW
  EXECUTE FUNCTION public.cleanup_old_avatars();

-- Add comments for documentation
COMMENT ON COLUMN public.user_profiles.avatar_url IS 'URL to user profile picture stored in Supabase storage';
COMMENT ON FUNCTION public.cleanup_old_avatars() IS 'Automatically deletes old avatar files when user updates their avatar';

-- Grant necessary permissions
GRANT USAGE ON SCHEMA storage TO authenticated;
GRANT ALL ON storage.objects TO authenticated;
GRANT ALL ON public.user_profiles TO authenticated; 