-- Fix the user_closet table by adding missing columns
-- Run this to fix the "wings_earned column not found" error

-- Add missing columns to user_closet table
ALTER TABLE public.user_closet 
ADD COLUMN IF NOT EXISTS wings_earned INTEGER DEFAULT 0;

ALTER TABLE public.user_closet 
ADD COLUMN IF NOT EXISTS metadata JSONB;

-- Also ensure user_id column exists and has correct type
-- (In case the table was created with wrong column name)
DO $$ 
BEGIN
    -- Check if user_id column exists, if not add it
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name = 'user_closet' AND column_name = 'user_id') THEN
        ALTER TABLE public.user_closet ADD COLUMN user_id UUID NOT NULL;
    END IF;
END $$;

-- Update the unique constraint to use correct column names
DROP CONSTRAINT IF EXISTS user_closet_user_id_reward_id_key;
ALTER TABLE public.user_closet 
ADD CONSTRAINT user_closet_user_id_reward_id_key UNIQUE(user_id, reward_id); 