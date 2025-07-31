-- Migration: Fix user_id constraint issue in user_profiles table
-- Run this in your Supabase SQL editor

-- First, let's check the current table structure
SELECT 
  column_name, 
  data_type, 
  is_nullable,
  column_default
FROM information_schema.columns 
WHERE table_name = 'user_profiles' 
AND table_schema = 'public'
ORDER BY ordinal_position;

-- Check if user_id column exists and what its constraints are
SELECT 
  tc.constraint_name,
  tc.constraint_type,
  kcu.column_name,
  ccu.table_name AS foreign_table_name,
  ccu.column_name AS foreign_column_name
FROM information_schema.table_constraints tc
JOIN information_schema.key_column_usage kcu 
  ON tc.constraint_name = kcu.constraint_name
LEFT JOIN information_schema.constraint_column_usage ccu 
  ON ccu.constraint_name = tc.constraint_name
WHERE tc.table_name = 'user_profiles' 
AND tc.table_schema = 'public';

-- If user_id column exists and is causing issues, let's fix it
-- First, let's see what data currently exists
SELECT COUNT(*) as total_rows FROM public.user_profiles;

-- Check for any rows with null user_id
SELECT COUNT(*) as null_user_id_rows 
FROM public.user_profiles 
WHERE user_id IS NULL;

-- If there are rows with null user_id, we need to either:
-- 1. Delete them if they're invalid, or
-- 2. Update them if we can determine the correct user_id

-- Let's see what the actual data looks like
SELECT * FROM public.user_profiles LIMIT 5;

-- Now let's create a proper profile creation script that handles the user_id issue
-- First, let's check what auth users exist
SELECT 
  id,
  email,
  created_at,
  raw_user_meta_data
FROM auth.users
ORDER BY created_at DESC
LIMIT 10;

-- Create a safe profile creation script
DO $$
DECLARE
  auth_user RECORD;
BEGIN
  -- Loop through auth users and create profiles if they don't exist
  FOR auth_user IN 
    SELECT 
      au.id,
      au.email,
      au.created_at,
      au.raw_user_meta_data
    FROM auth.users au
    LEFT JOIN public.user_profiles up ON au.id = up.id
    WHERE up.id IS NULL
  LOOP
    BEGIN
      -- Try to insert profile with proper user_id handling
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
        auth_user.id,
        auth_user.email,
        COALESCE(auth_user.raw_user_meta_data->>'username', auth_user.email),
        COALESCE(auth_user.raw_user_meta_data->>'full_name', auth_user.raw_user_meta_data->>'username', 'User'),
        COALESCE(auth_user.raw_user_meta_data->>'username', auth_user.email, 'User'),
        0,
        0,
        auth_user.created_at,
        'user',
        auth_user.created_at,
        NOW()
      );
      
      RAISE NOTICE 'Created profile for user: %', auth_user.email;
    EXCEPTION
      WHEN OTHERS THEN
        RAISE WARNING 'Failed to create profile for user %: %', auth_user.email, SQLERRM;
    END;
  END LOOP;
END $$;

-- Show the results
SELECT 
  'Profile creation completed!' as message,
  COUNT(*) as total_profiles,
  COUNT(CASE WHEN avatar_url IS NOT NULL THEN 1 END) as profiles_with_avatars
FROM public.user_profiles; 