-- Create user_stamps table for the 7 stamps system
-- Run this in your Supabase SQL Editor

-- First, create the user_stamps table
CREATE TABLE IF NOT EXISTS public.user_stamps (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    stamp_id TEXT NOT NULL,
    metadata JSONB DEFAULT '{}',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    
    -- Ensure a user can only have one of each stamp
    UNIQUE(user_id, stamp_id)
);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_user_stamps_user_id ON public.user_stamps(user_id);
CREATE INDEX IF NOT EXISTS idx_user_stamps_stamp_id ON public.user_stamps(stamp_id);
CREATE INDEX IF NOT EXISTS idx_user_stamps_created_at ON public.user_stamps(created_at);

-- Enable Row Level Security (RLS)
ALTER TABLE public.user_stamps ENABLE ROW LEVEL SECURITY;

-- Create policies for RLS
-- Users can only see their own stamps
CREATE POLICY "Users can view their own stamps" ON public.user_stamps
    FOR SELECT USING (auth.uid() = user_id);

-- Users can only insert their own stamps
CREATE POLICY "Users can insert their own stamps" ON public.user_stamps
    FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Users cannot update or delete stamps (they're permanent achievements)
-- No UPDATE or DELETE policies means they can't modify stamps

-- Grant permissions
GRANT SELECT, INSERT ON public.user_stamps TO authenticated;
GRANT USAGE ON SCHEMA public TO authenticated;

-- Create a function to award stamps (optional, can be used from backend)
CREATE OR REPLACE FUNCTION public.award_stamp_to_user(
    target_user_id UUID,
    target_stamp_id TEXT,
    stamp_metadata JSONB DEFAULT '{}'
)
RETURNS JSON AS $$
DECLARE
    result_record public.user_stamps;
    already_exists BOOLEAN;
BEGIN
    -- Check if user already has this stamp
    SELECT EXISTS(
        SELECT 1 FROM public.user_stamps 
        WHERE user_id = target_user_id AND stamp_id = target_stamp_id
    ) INTO already_exists;
    
    IF already_exists THEN
        RETURN json_build_object(
            'success', true,
            'already_earned', true,
            'message', 'User already has this stamp'
        );
    END IF;
    
    -- Insert the new stamp
    INSERT INTO public.user_stamps (user_id, stamp_id, metadata)
    VALUES (target_user_id, target_stamp_id, stamp_metadata)
    RETURNING * INTO result_record;
    
    RETURN json_build_object(
        'success', true,
        'already_earned', false,
        'stamp', row_to_json(result_record),
        'message', 'Stamp awarded successfully'
    );
    
EXCEPTION
    WHEN unique_violation THEN
        RETURN json_build_object(
            'success', true,
            'already_earned', true,
            'message', 'User already has this stamp (race condition)'
        );
    WHEN OTHERS THEN
        RETURN json_build_object(
            'success', false,
            'error', SQLERRM,
            'message', 'Failed to award stamp'
        );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Grant execute permission on the function
GRANT EXECUTE ON FUNCTION public.award_stamp_to_user TO authenticated;

-- Insert some test data (optional - remove if you don't want test stamps)
-- Uncomment the lines below to give yourself some test stamps

/*
-- Test stamps for the currently logged in user (replace with your user ID)
-- You can get your user ID from: SELECT auth.uid();

INSERT INTO public.user_stamps (user_id, stamp_id, metadata) VALUES 
    (auth.uid(), 'received_passport', '{"trigger": "test_data", "timestamp": "2025-01-15T10:00:00Z"}'),
    (auth.uid(), 'qr_scanner', '{"trigger": "test_data", "timestamp": "2025-01-15T11:00:00Z"}')
ON CONFLICT (user_id, stamp_id) DO NOTHING;
*/

-- Show success message
SELECT 'Stamps system setup completed successfully!' as message; 