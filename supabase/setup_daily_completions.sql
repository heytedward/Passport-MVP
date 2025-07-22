-- Create daily_completions table for tracking daily quest completion and streaks
-- Run this in your Supabase SQL Editor

-- Create daily_completions table
CREATE TABLE IF NOT EXISTS public.daily_completions (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    quest_id TEXT NOT NULL,
    quest_title TEXT NOT NULL,
    completion_date DATE NOT NULL,
    wings_earned INTEGER DEFAULT 0,
    completed_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(user_id, quest_id, completion_date)
);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_daily_completions_user_id ON public.daily_completions(user_id);
CREATE INDEX IF NOT EXISTS idx_daily_completions_date ON public.daily_completions(completion_date);
CREATE INDEX IF NOT EXISTS idx_daily_completions_user_date ON public.daily_completions(user_id, completion_date);

-- Enable Row Level Security
ALTER TABLE public.daily_completions ENABLE ROW LEVEL SECURITY;

-- Drop existing policies if they exist
DROP POLICY IF EXISTS "Users can view their own daily completions" ON public.daily_completions;
DROP POLICY IF EXISTS "Users can insert their own daily completions" ON public.daily_completions;

-- Create policies for RLS
CREATE POLICY "Users can view their own daily completions" ON public.daily_completions
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own daily completions" ON public.daily_completions
    FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Grant permissions
GRANT SELECT, INSERT ON public.daily_completions TO authenticated;
GRANT USAGE ON SCHEMA public TO authenticated;

-- Create function to get user's current streak
CREATE OR REPLACE FUNCTION public.get_user_streak(target_user_id UUID)
RETURNS INTEGER AS $$
DECLARE
    current_streak INTEGER := 0;
    check_date DATE;
    has_completion BOOLEAN;
BEGIN
    check_date := CURRENT_DATE;
    
    FOR i IN 0..30 LOOP
        SELECT EXISTS(
            SELECT 1 FROM public.daily_completions 
            WHERE user_id = target_user_id 
            AND completion_date = check_date
        ) INTO has_completion;
        
        IF has_completion THEN
            current_streak := current_streak + 1;
        ELSE
            IF i = 0 AND current_streak = 0 THEN
                NULL;
            ELSE
                EXIT;
            END IF;
        END IF;
        
        check_date := check_date - INTERVAL '1 day';
    END LOOP;
    
    RETURN current_streak;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Grant execute permission on the function
GRANT EXECUTE ON FUNCTION public.get_user_streak TO authenticated;

-- Show success message
SELECT 'Daily completions system setup completed successfully!' as message; 