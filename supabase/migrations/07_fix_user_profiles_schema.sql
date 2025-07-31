-- Migration: Fix user_profiles table schema and ensure all columns exist
-- Run this in your Supabase SQL editor

-- First, let's check what columns currently exist and add missing ones
DO $$
BEGIN
    -- Add full_name column if it doesn't exist
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'user_profiles' 
        AND column_name = 'full_name'
    ) THEN
        ALTER TABLE public.user_profiles ADD COLUMN full_name TEXT;
        RAISE NOTICE 'Added full_name column to user_profiles';
    END IF;

    -- Add username column if it doesn't exist
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'user_profiles' 
        AND column_name = 'username'
    ) THEN
        ALTER TABLE public.user_profiles ADD COLUMN username TEXT UNIQUE;
        RAISE NOTICE 'Added username column to user_profiles';
    END IF;

    -- Add wings_balance column if it doesn't exist
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'user_profiles' 
        AND column_name = 'wings_balance'
    ) THEN
        ALTER TABLE public.user_profiles ADD COLUMN wings_balance INTEGER DEFAULT 0;
        RAISE NOTICE 'Added wings_balance column to user_profiles';
    END IF;

    -- Add current_week_wings column if it doesn't exist
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'user_profiles' 
        AND column_name = 'current_week_wings'
    ) THEN
        ALTER TABLE public.user_profiles ADD COLUMN current_week_wings INTEGER DEFAULT 0;
        RAISE NOTICE 'Added current_week_wings column to user_profiles';
    END IF;

    -- Add week_start_date column if it doesn't exist
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'user_profiles' 
        AND column_name = 'week_start_date'
    ) THEN
        ALTER TABLE public.user_profiles ADD COLUMN week_start_date TIMESTAMP WITH TIME ZONE DEFAULT NOW();
        RAISE NOTICE 'Added week_start_date column to user_profiles';
    END IF;

    -- Add role column if it doesn't exist
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'user_profiles' 
        AND column_name = 'role'
    ) THEN
        ALTER TABLE public.user_profiles ADD COLUMN role VARCHAR(50) DEFAULT 'user';
        RAISE NOTICE 'Added role column to user_profiles';
    END IF;

    -- Add created_at column if it doesn't exist
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'user_profiles' 
        AND column_name = 'created_at'
    ) THEN
        ALTER TABLE public.user_profiles ADD COLUMN created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW();
        RAISE NOTICE 'Added created_at column to user_profiles';
    END IF;

    -- Add updated_at column if it doesn't exist
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'user_profiles' 
        AND column_name = 'updated_at'
    ) THEN
        ALTER TABLE public.user_profiles ADD COLUMN updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW();
        RAISE NOTICE 'Added updated_at column to user_profiles';
    END IF;

    -- Add avatar_url column if it doesn't exist
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'user_profiles' 
        AND column_name = 'avatar_url'
    ) THEN
        ALTER TABLE public.user_profiles ADD COLUMN avatar_url TEXT;
        RAISE NOTICE 'Added avatar_url column to user_profiles';
    END IF;

    -- Add display_name column if it doesn't exist
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'user_profiles' 
        AND column_name = 'display_name'
    ) THEN
        ALTER TABLE public.user_profiles ADD COLUMN display_name TEXT;
        RAISE NOTICE 'Added display_name column to user_profiles';
    END IF;

END $$;

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_user_profiles_username ON public.user_profiles(username);
CREATE INDEX IF NOT EXISTS idx_user_profiles_email ON public.user_profiles(email);
CREATE INDEX IF NOT EXISTS idx_user_profiles_avatar_url ON public.user_profiles(avatar_url);
CREATE INDEX IF NOT EXISTS idx_user_profiles_display_name ON public.user_profiles(display_name);

-- Update RLS policies to ensure they cover all operations
DROP POLICY IF EXISTS "Users can update own profile" ON public.user_profiles;
CREATE POLICY "Users can update own profile" ON public.user_profiles
  FOR UPDATE USING (auth.uid() = id);

DROP POLICY IF EXISTS "Users can insert own profile" ON public.user_profiles;
CREATE POLICY "Users can insert own profile" ON public.user_profiles
  FOR INSERT WITH CHECK (auth.uid() = id);

DROP POLICY IF EXISTS "Users can view own profile" ON public.user_profiles;
CREATE POLICY "Users can view own profile" ON public.user_profiles
  FOR SELECT USING (auth.uid() = id);

-- Drop and recreate the handle_new_user function with proper error handling
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
DROP FUNCTION IF EXISTS public.handle_new_user();

CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
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
    NOW(),
    'user',
    NOW(),
    NOW()
  );
  RETURN NEW;
EXCEPTION
  WHEN unique_violation THEN
    -- If username already exists, use email as fallback
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
      NEW.email, 
      COALESCE(NEW.raw_user_meta_data->>'full_name', NEW.raw_user_meta_data->>'username', 'User'),
      COALESCE(NEW.raw_user_meta_data->>'username', NEW.email, 'User'),
      0,
      0,
      NOW(),
      'user',
      NOW(),
      NOW()
    );
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

-- Grant necessary permissions
GRANT EXECUTE ON FUNCTION public.handle_new_user() TO service_role;
GRANT EXECUTE ON FUNCTION public.handle_new_user() TO postgres;

-- Show success message
SELECT 'user_profiles table schema fixed successfully!' as message; 