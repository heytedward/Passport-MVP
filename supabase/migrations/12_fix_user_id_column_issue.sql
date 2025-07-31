-- Migration: Fix user_id column issue in user_profiles table
-- Run this in your Supabase SQL editor

-- First, let's understand the current table structure
SELECT 
  column_name, 
  data_type, 
  is_nullable,
  column_default
FROM information_schema.columns 
WHERE table_name = 'user_profiles' 
AND table_schema = 'public'
ORDER BY ordinal_position;

-- Check the constraints on the user_id column
SELECT 
  tc.constraint_name,
  tc.constraint_type,
  kcu.column_name
FROM information_schema.table_constraints tc
JOIN information_schema.key_column_usage kcu 
  ON tc.constraint_name = kcu.constraint_name
WHERE tc.table_name = 'user_profiles' 
AND tc.table_schema = 'public'
AND kcu.column_name = 'user_id';

-- Let's see what data currently exists
SELECT COUNT(*) as total_rows FROM public.user_profiles;

-- Check for any rows with null user_id
SELECT COUNT(*) as null_user_id_rows 
FROM public.user_profiles 
WHERE user_id IS NULL;

-- If user_id column exists and is causing issues, we need to fix it
-- Option 1: If user_id should be the same as id, let's update it
UPDATE public.user_profiles 
SET user_id = id 
WHERE user_id IS NULL;

-- Option 2: If user_id column is redundant, let's drop it
-- First, let's check if it's safe to drop
SELECT 
  'user_id column analysis' as info,
  COUNT(*) as total_rows,
  COUNT(CASE WHEN user_id = id THEN 1 END) as matching_id,
  COUNT(CASE WHEN user_id IS NULL THEN 1 END) as null_user_id,
  COUNT(CASE WHEN user_id != id AND user_id IS NOT NULL THEN 1 END) as different_values
FROM public.user_profiles;

-- If user_id is always the same as id or null, we can safely drop it
-- Let's drop the user_id column since it's redundant with id
ALTER TABLE public.user_profiles DROP COLUMN IF EXISTS user_id;

-- Now let's create profiles for existing auth users with the correct structure
INSERT INTO public.user_profiles (
  id,
  email,
  username,
  full_name,
  display_name,
  wings_balance,
  current_week_wings,
  week_start_date,
  role,
  created_at,
  updated_at
)
SELECT 
  au.id,
  au.email,
  COALESCE(au.raw_user_meta_data->>'username', au.email),
  COALESCE(au.raw_user_meta_data->>'full_name', au.raw_user_meta_data->>'username', 'User'),
  COALESCE(au.raw_user_meta_data->>'username', au.email, 'User'),
  0,
  0,
  au.created_at,
  'user',
  au.created_at,
  NOW()
FROM auth.users au
LEFT JOIN public.user_profiles up ON au.id = up.id
WHERE up.id IS NULL
ON CONFLICT (id) DO NOTHING;

-- Update the handle_new_user function to work with the correct structure
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
DROP FUNCTION IF EXISTS public.handle_new_user();

CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  -- Insert profile with correct structure (no user_id column)
  INSERT INTO public.user_profiles (
    id, 
    email, 
    username, 
    full_name,
    display_name,
    wings_balance,
    current_week_wings,
    week_start_date,
    role,
    created_at,
    updated_at
  )
  VALUES (
    NEW.id, 
    NEW.email, 
    COALESCE(NEW.raw_user_meta_data->>'username', NEW.email), 
    COALESCE(NEW.raw_user_meta_data->>'full_name', NEW.raw_user_meta_data->>'username', 'User'),
    COALESCE(NEW.raw_user_meta_data->>'username', NEW.email, 'User'),
    0,
    0,
    NEW.created_at,
    'user',
    NEW.created_at,
    NOW()
  );
  RETURN NEW;
EXCEPTION
  WHEN unique_violation THEN
    -- If profile already exists, update it
    UPDATE public.user_profiles 
    SET 
      email = NEW.email,
      username = COALESCE(NEW.raw_user_meta_data->>'username', NEW.email),
      full_name = COALESCE(NEW.raw_user_meta_data->>'full_name', NEW.raw_user_meta_data->>'username', 'User'),
      display_name = COALESCE(NEW.raw_user_meta_data->>'username', NEW.email, 'User'),
      updated_at = NOW()
    WHERE id = NEW.id;
    RETURN NEW;
  WHEN OTHERS THEN
    -- Log the error and continue
    RAISE WARNING 'Error in handle_new_user: %', SQLERRM;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Recreate the trigger
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- Ensure RLS policies are correct
DROP POLICY IF EXISTS "Users can update own profile" ON public.user_profiles;
DROP POLICY IF EXISTS "Users can insert own profile" ON public.user_profiles;
DROP POLICY IF EXISTS "Users can view own profile" ON public.user_profiles;

CREATE POLICY "Users can view own profile" ON public.user_profiles
  FOR SELECT USING (auth.uid() = id);

CREATE POLICY "Users can insert own profile" ON public.user_profiles
  FOR INSERT WITH CHECK (auth.uid() = id);

CREATE POLICY "Users can update own profile" ON public.user_profiles
  FOR UPDATE USING (auth.uid() = id);

-- Enable RLS and grant permissions
ALTER TABLE public.user_profiles ENABLE ROW LEVEL SECURITY;
GRANT ALL ON public.user_profiles TO authenticated;
GRANT ALL ON public.user_profiles TO service_role;
GRANT EXECUTE ON FUNCTION public.handle_new_user() TO service_role;
GRANT EXECUTE ON FUNCTION public.handle_new_user() TO postgres;

-- Show final results
SELECT 
  'Migration completed!' as message,
  COUNT(*) as total_profiles,
  COUNT(CASE WHEN avatar_url IS NOT NULL THEN 1 END) as profiles_with_avatars,
  COUNT(CASE WHEN avatar_url IS NULL THEN 1 END) as profiles_without_avatars
FROM public.user_profiles;

-- Show recent profiles
SELECT 
  email,
  username,
  created_at,
  avatar_url IS NOT NULL as has_avatar
FROM public.user_profiles
ORDER BY created_at DESC
LIMIT 10; 