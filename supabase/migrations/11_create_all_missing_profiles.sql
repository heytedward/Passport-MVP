-- Migration: Create profiles for all missing auth users
-- Run this in your Supabase SQL editor

-- First, let's see what auth users exist
SELECT 
  id,
  email,
  created_at,
  raw_user_meta_data
FROM auth.users
ORDER BY created_at DESC;

-- Now let's create profiles for ALL auth users that don't have profiles
-- This uses a more direct approach to ensure all users get profiles

-- Step 1: Create profiles for existing auth users
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

-- Step 2: Update the handle_new_user function to be more robust
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
DROP FUNCTION IF EXISTS public.handle_new_user();

CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  -- Insert profile with all required fields
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

-- Step 3: Recreate the trigger
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- Step 4: Ensure RLS policies are correct
DROP POLICY IF EXISTS "Users can update own profile" ON public.user_profiles;
DROP POLICY IF EXISTS "Users can insert own profile" ON public.user_profiles;
DROP POLICY IF EXISTS "Users can view own profile" ON public.user_profiles;

CREATE POLICY "Users can view own profile" ON public.user_profiles
  FOR SELECT USING (auth.uid() = id);

CREATE POLICY "Users can insert own profile" ON public.user_profiles
  FOR INSERT WITH CHECK (auth.uid() = id);

CREATE POLICY "Users can update own profile" ON public.user_profiles
  FOR UPDATE USING (auth.uid() = id);

-- Step 5: Enable RLS and grant permissions
ALTER TABLE public.user_profiles ENABLE ROW LEVEL SECURITY;
GRANT ALL ON public.user_profiles TO authenticated;
GRANT ALL ON public.user_profiles TO service_role;
GRANT EXECUTE ON FUNCTION public.handle_new_user() TO service_role;
GRANT EXECUTE ON FUNCTION public.handle_new_user() TO postgres;

-- Step 6: Show results
SELECT 
  'Migration completed!' as message,
  COUNT(*) as total_profiles,
  COUNT(CASE WHEN avatar_url IS NOT NULL THEN 1 END) as profiles_with_avatars,
  COUNT(CASE WHEN avatar_url IS NULL THEN 1 END) as profiles_without_avatars
FROM public.user_profiles;

-- Step 7: Show recent profiles
SELECT 
  email,
  username,
  created_at,
  avatar_url IS NOT NULL as has_avatar
FROM public.user_profiles
ORDER BY created_at DESC
LIMIT 10; 