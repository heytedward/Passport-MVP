-- Limited Edition Sample Data and Testing
-- PapillonLabs Monarch Passport MVP

-- 1. Insert sample limited edition items
INSERT INTO public.limited_edition_items (
    reward_id,
    total_supply,
    start_date,
    end_date,
    is_active
) VALUES 
    ('MONARCH_LAUNCH_HOODIE', 100, NOW(), NOW() + INTERVAL '30 days', true),
    ('NYC_POPUP_EXCLUSIVE', 50, NOW(), NOW() + INTERVAL '7 days', true),
    ('SEASON_ONE_COLLECTOR', 200, NOW(), NOW() + INTERVAL '90 days', true),
    ('BIRTHDAY_SPECIAL_2025', 25, NOW(), NOW() + INTERVAL '14 days', true)
ON CONFLICT (reward_id) DO NOTHING;

-- 2. Create test function for claiming limited edition items
CREATE OR REPLACE FUNCTION public.test_claim_limited_edition(
    p_reward_id TEXT,
    p_user_id UUID DEFAULT auth.uid()
)
RETURNS TABLE (
    mint_number INTEGER,
    claimed_at TIMESTAMPTZ,
    success BOOLEAN,
    message TEXT
)
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
    -- Use the main claim function
    RETURN QUERY SELECT * FROM public.claim_limited_edition_item(p_reward_id, p_user_id, 'Test Location');
END;
$$;

-- 3. Create function to get user's limited edition claims
CREATE OR REPLACE FUNCTION public.get_user_limited_editions(
    p_user_id UUID DEFAULT auth.uid()
)
RETURNS TABLE (
    reward_id TEXT,
    mint_number INTEGER,
    claimed_at TIMESTAMPTZ,
    total_supply INTEGER,
    claim_percentage DECIMAL,
    qr_scan_location TEXT
)
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
    RETURN QUERY
    SELECT 
        lei.reward_id,
        lec.mint_number,
        lec.claimed_at,
        lei.total_supply,
        ROUND((lei.claimed_count::DECIMAL / lei.total_supply) * 100, 2) as claim_percentage,
        lec.qr_scan_location
    FROM public.limited_edition_claims lec
    JOIN public.limited_edition_items lei ON lec.limited_edition_id = lei.id
    WHERE lec.user_id = p_user_id
    ORDER BY lec.claimed_at DESC;
END;
$$;

-- 4. Create function to get limited edition status
CREATE OR REPLACE FUNCTION public.get_limited_edition_status(
    p_reward_id TEXT
)
RETURNS TABLE (
    reward_id TEXT,
    total_supply INTEGER,
    claimed_count INTEGER,
    available_count INTEGER,
    claim_percentage DECIMAL,
    is_active BOOLEAN,
    start_date TIMESTAMPTZ,
    end_date TIMESTAMPTZ,
    user_has_claimed BOOLEAN,
    user_mint_number INTEGER
)
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
    RETURN QUERY
    SELECT 
        lei.reward_id,
        lei.total_supply,
        lei.claimed_count,
        (lei.total_supply - lei.claimed_count) as available_count,
        ROUND((lei.claimed_count::DECIMAL / lei.total_supply) * 100, 2) as claim_percentage,
        lei.is_active,
        lei.start_date,
        lei.end_date,
        COALESCE(lec.user_id IS NOT NULL, false) as user_has_claimed,
        lec.mint_number
    FROM public.limited_edition_items lei
    LEFT JOIN public.limited_edition_claims lec ON 
        lei.id = lec.limited_edition_id AND 
        lec.user_id = auth.uid()
    WHERE lei.reward_id = p_reward_id;
END;
$$;

-- 5. Create function to get all active limited editions
CREATE OR REPLACE FUNCTION public.get_active_limited_editions()
RETURNS TABLE (
    reward_id TEXT,
    total_supply INTEGER,
    claimed_count INTEGER,
    available_count INTEGER,
    claim_percentage DECIMAL,
    start_date TIMESTAMPTZ,
    end_date TIMESTAMPTZ,
    days_remaining INTEGER
)
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
    RETURN QUERY
    SELECT 
        lei.reward_id,
        lei.total_supply,
        lei.claimed_count,
        (lei.total_supply - lei.claimed_count) as available_count,
        ROUND((lei.claimed_count::DECIMAL / lei.total_supply) * 100, 2) as claim_percentage,
        lei.start_date,
        lei.end_date,
        CASE 
            WHEN lei.end_date IS NULL THEN NULL
            ELSE GREATEST(0, EXTRACT(DAY FROM (lei.end_date - NOW())))
        END as days_remaining
    FROM public.limited_edition_items lei
    WHERE lei.is_active = true
      AND lei.start_date <= NOW()
      AND (lei.end_date IS NULL OR lei.end_date > NOW())
    ORDER BY lei.claimed_count DESC, lei.start_date ASC;
END;
$$;

-- 6. Create admin function to reset limited edition for testing
CREATE OR REPLACE FUNCTION public.reset_limited_edition_for_testing(
    p_reward_id TEXT
)
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
    -- Check if user is admin
    IF NOT EXISTS (
        SELECT 1 FROM public.user_profiles 
        WHERE id = auth.uid() AND is_admin = true
    ) THEN
        RAISE EXCEPTION 'Admin access required';
    END IF;
    
    -- Delete all claims for this limited edition
    DELETE FROM public.limited_edition_claims 
    WHERE limited_edition_id IN (
        SELECT id FROM public.limited_edition_items WHERE reward_id = p_reward_id
    );
    
    -- Reset claimed count
    UPDATE public.limited_edition_items 
    SET claimed_count = 0 
    WHERE reward_id = p_reward_id;
    
    RETURN true;
END;
$$;

-- 7. Grant permissions for test functions
GRANT EXECUTE ON FUNCTION public.test_claim_limited_edition TO authenticated;
GRANT EXECUTE ON FUNCTION public.get_user_limited_editions TO authenticated;
GRANT EXECUTE ON FUNCTION public.get_limited_edition_status TO authenticated;
GRANT EXECUTE ON FUNCTION public.get_active_limited_editions TO authenticated;
GRANT EXECUTE ON FUNCTION public.reset_limited_edition_for_testing TO authenticated;

-- 8. Create indexes for better performance on sample data queries
CREATE INDEX IF NOT EXISTS idx_limited_edition_claims_user_claimed_at 
    ON public.limited_edition_claims(user_id, claimed_at DESC);

CREATE INDEX IF NOT EXISTS idx_limited_edition_items_active_date 
    ON public.limited_edition_items(is_active, start_date, end_date) 
    WHERE is_active = true;

-- 9. Add comments for test functions
COMMENT ON FUNCTION public.test_claim_limited_edition IS 'Test function for claiming limited edition items';
COMMENT ON FUNCTION public.get_user_limited_editions IS 'Get all limited edition items claimed by a user';
COMMENT ON FUNCTION public.get_limited_edition_status IS 'Get status of a specific limited edition item';
COMMENT ON FUNCTION public.get_active_limited_editions IS 'Get all currently active limited edition items';
COMMENT ON FUNCTION public.reset_limited_edition_for_testing IS 'Admin function to reset limited edition for testing purposes';

-- 10. Sample usage examples (commented out)
/*
-- Test claiming a limited edition item
SELECT * FROM public.test_claim_limited_edition('MONARCH_LAUNCH_HOODIE');

-- Get user's limited edition claims
SELECT * FROM public.get_user_limited_editions();

-- Check status of a specific limited edition
SELECT * FROM public.get_limited_edition_status('MONARCH_LAUNCH_HOODIE');

-- Get all active limited editions
SELECT * FROM public.get_active_limited_editions();

-- Reset for testing (admin only)
SELECT public.reset_limited_edition_for_testing('MONARCH_LAUNCH_HOODIE');
*/ 