-- Limited Edition Tracking Schema for Monarch Passport MVP
-- PapillonLabs Security Implementation

-- 1. Create limited_edition_items table
CREATE TABLE IF NOT EXISTS public.limited_edition_items (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    reward_id TEXT NOT NULL,
    total_supply INTEGER NOT NULL CHECK (total_supply > 0),
    claimed_count INTEGER NOT NULL DEFAULT 0 CHECK (claimed_count >= 0),
    start_date TIMESTAMPTZ NOT NULL,
    end_date TIMESTAMPTZ,
    is_active BOOLEAN NOT NULL DEFAULT true,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    
    -- Constraints
    CONSTRAINT limited_edition_items_claimed_count_check 
        CHECK (claimed_count <= total_supply),
    CONSTRAINT limited_edition_items_date_range_check 
        CHECK (end_date IS NULL OR end_date > start_date),
    CONSTRAINT limited_edition_items_reward_id_format 
        CHECK (reward_id ~ '^[A-Z0-9_]+$')
);

-- 2. Create limited_edition_claims table
CREATE TABLE IF NOT EXISTS public.limited_edition_claims (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    limited_edition_id UUID NOT NULL REFERENCES public.limited_edition_items(id) ON DELETE CASCADE,
    user_id UUID NOT NULL REFERENCES public.user_profiles(id) ON DELETE CASCADE,
    mint_number INTEGER NOT NULL CHECK (mint_number > 0),
    claimed_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    qr_scan_location TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    
    -- Unique constraints
    CONSTRAINT limited_edition_claims_unique_user_per_item 
        UNIQUE (limited_edition_id, user_id),
    CONSTRAINT limited_edition_claims_unique_mint_number 
        UNIQUE (limited_edition_id, mint_number),
    CONSTRAINT limited_edition_claims_location_format 
        CHECK (qr_scan_location IS NULL OR qr_scan_location ~ '^[A-Za-z0-9\s\-_]+$')
);

-- 3. Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_limited_edition_items_reward_id 
    ON public.limited_edition_items(reward_id);
CREATE INDEX IF NOT EXISTS idx_limited_edition_items_active 
    ON public.limited_edition_items(is_active) WHERE is_active = true;
CREATE INDEX IF NOT EXISTS idx_limited_edition_items_date_range 
    ON public.limited_edition_items(start_date, end_date) WHERE is_active = true;
CREATE INDEX IF NOT EXISTS idx_limited_edition_claims_user_id 
    ON public.limited_edition_claims(user_id);
CREATE INDEX IF NOT EXISTS idx_limited_edition_claims_limited_edition_id 
    ON public.limited_edition_claims(limited_edition_id);
CREATE INDEX IF NOT EXISTS idx_limited_edition_claims_claimed_at 
    ON public.limited_edition_claims(claimed_at);

-- 4. Create updated_at trigger function
CREATE OR REPLACE FUNCTION public.handle_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- 5. Create updated_at triggers
CREATE TRIGGER limited_edition_items_updated_at
    BEFORE UPDATE ON public.limited_edition_items
    FOR EACH ROW
    EXECUTE FUNCTION public.handle_updated_at();

-- 6. Create claim_limited_edition_item function
CREATE OR REPLACE FUNCTION public.claim_limited_edition_item(
    p_reward_id TEXT,
    p_user_id UUID,
    p_qr_scan_location TEXT DEFAULT NULL
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
DECLARE
    v_limited_edition_id UUID;
    v_total_supply INTEGER;
    v_claimed_count INTEGER;
    v_next_mint_number INTEGER;
    v_reward_data JSONB;
    v_claim_id UUID;
BEGIN
    -- Start transaction
    BEGIN
        -- Find active limited edition item
        SELECT id, total_supply, claimed_count
        INTO v_limited_edition_id, v_total_supply, v_claimed_count
        FROM public.limited_edition_items
        WHERE reward_id = p_reward_id
          AND is_active = true
          AND start_date <= NOW()
          AND (end_date IS NULL OR end_date > NOW())
        FOR UPDATE SKIP LOCKED;
        
        -- Check if limited edition item exists and is available
        IF v_limited_edition_id IS NULL THEN
            RETURN QUERY SELECT 
                NULL::INTEGER, 
                NULL::TIMESTAMPTZ, 
                false, 
                'Limited edition item not found or not available'::TEXT;
            RETURN;
        END IF;
        
        -- Check if supply is exhausted
        IF v_claimed_count >= v_total_supply THEN
            RETURN QUERY SELECT 
                NULL::INTEGER, 
                NULL::TIMESTAMPTZ, 
                false, 
                'Limited edition supply exhausted'::TEXT;
            RETURN;
        END IF;
        
        -- Check if user already claimed this item
        IF EXISTS (
            SELECT 1 FROM public.limited_edition_claims 
            WHERE limited_edition_id = v_limited_edition_id 
              AND user_id = p_user_id
        ) THEN
            RETURN QUERY SELECT 
                NULL::INTEGER, 
                NULL::TIMESTAMPTZ, 
                false, 
                'User already claimed this limited edition item'::TEXT;
            RETURN;
        END IF;
        
        -- Calculate next mint number
        v_next_mint_number := v_claimed_count + 1;
        
        -- Get reward data for closet insertion
        SELECT data INTO v_reward_data
        FROM public.static_rewards
        WHERE reward_id = p_reward_id;
        
        IF v_reward_data IS NULL THEN
            RETURN QUERY SELECT 
                NULL::INTEGER, 
                NULL::TIMESTAMPTZ, 
                false, 
                'Reward data not found'::TEXT;
            RETURN;
        END IF;
        
        -- Insert claim record
        INSERT INTO public.limited_edition_claims (
            limited_edition_id,
            user_id,
            mint_number,
            qr_scan_location
        ) VALUES (
            v_limited_edition_id,
            p_user_id,
            v_next_mint_number,
            p_qr_scan_location
        ) RETURNING id INTO v_claim_id;
        
        -- Update claimed count
        UPDATE public.limited_edition_items
        SET claimed_count = claimed_count + 1
        WHERE id = v_limited_edition_id;
        
        -- Add item to user's closet with limited edition metadata
        INSERT INTO public.user_closet (
            user_id,
            item_id,
            item_type,
            rarity,
            acquired_at,
            metadata
        ) VALUES (
            p_user_id,
            p_reward_id,
            'limited_edition',
            'legendary',
            NOW(),
            jsonb_build_object(
                'limited_edition_id', v_limited_edition_id,
                'mint_number', v_next_mint_number,
                'total_supply', v_total_supply,
                'claim_id', v_claim_id,
                'qr_scan_location', p_qr_scan_location
            )
        );
        
        -- Award WINGS for limited edition claim
        UPDATE public.user_profiles
        SET wings_balance = wings_balance + 100,
            updated_at = NOW()
        WHERE id = p_user_id;
        
        -- Return success
        RETURN QUERY SELECT 
            v_next_mint_number,
            NOW(),
            true,
            'Limited edition item claimed successfully'::TEXT;
            
    EXCEPTION
        WHEN OTHERS THEN
            -- Rollback on any error
            RETURN QUERY SELECT 
                NULL::INTEGER, 
                NULL::TIMESTAMPTZ, 
                false, 
                'Claim failed: ' || SQLERRM::TEXT;
    END;
END;
$$;

-- 7. Create RLS policies for limited_edition_items
ALTER TABLE public.limited_edition_items ENABLE ROW LEVEL SECURITY;

-- Allow authenticated users to read active limited edition items
CREATE POLICY "Users can view active limited edition items" ON public.limited_edition_items
    FOR SELECT
    TO authenticated
    USING (is_active = true);

-- Allow admins to manage limited edition items
CREATE POLICY "Admins can manage limited edition items" ON public.limited_edition_items
    FOR ALL
    TO authenticated
    USING (
        EXISTS (
            SELECT 1 FROM public.user_profiles 
            WHERE id = auth.uid() AND is_admin = true
        )
    );

-- 8. Create RLS policies for limited_edition_claims
ALTER TABLE public.limited_edition_claims ENABLE ROW LEVEL SECURITY;

-- Users can view their own claims
CREATE POLICY "Users can view their own claims" ON public.limited_edition_claims
    FOR SELECT
    TO authenticated
    USING (user_id = auth.uid());

-- Users can create claims (handled by function)
CREATE POLICY "Users can create claims" ON public.limited_edition_claims
    FOR INSERT
    TO authenticated
    WITH CHECK (user_id = auth.uid());

-- Admins can view all claims
CREATE POLICY "Admins can view all claims" ON public.limited_edition_claims
    FOR SELECT
    TO authenticated
    USING (
        EXISTS (
            SELECT 1 FROM public.user_profiles 
            WHERE id = auth.uid() AND is_admin = true
        )
    );

-- 9. Grant permissions
GRANT SELECT ON public.limited_edition_items TO authenticated;
GRANT SELECT, INSERT ON public.limited_edition_claims TO authenticated;
GRANT EXECUTE ON FUNCTION public.claim_limited_edition_item TO authenticated;

-- Admin permissions
GRANT ALL ON public.limited_edition_items TO authenticated;
GRANT ALL ON public.limited_edition_claims TO authenticated;

-- 10. Create helper functions for admin management
CREATE OR REPLACE FUNCTION public.create_limited_edition_item(
    p_reward_id TEXT,
    p_total_supply INTEGER,
    p_start_date TIMESTAMPTZ,
    p_end_date TIMESTAMPTZ DEFAULT NULL
)
RETURNS UUID
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
    v_item_id UUID;
BEGIN
    -- Check if user is admin
    IF NOT EXISTS (
        SELECT 1 FROM public.user_profiles 
        WHERE id = auth.uid() AND is_admin = true
    ) THEN
        RAISE EXCEPTION 'Admin access required';
    END IF;
    
    -- Check if reward exists
    IF NOT EXISTS (
        SELECT 1 FROM public.static_rewards WHERE reward_id = p_reward_id
    ) THEN
        RAISE EXCEPTION 'Reward not found: %', p_reward_id;
    END IF;
    
    -- Create limited edition item
    INSERT INTO public.limited_edition_items (
        reward_id,
        total_supply,
        start_date,
        end_date
    ) VALUES (
        p_reward_id,
        p_total_supply,
        p_start_date,
        p_end_date
    ) RETURNING id INTO v_item_id;
    
    RETURN v_item_id;
END;
$$;

-- 11. Create view for limited edition analytics
CREATE OR REPLACE VIEW public.limited_edition_analytics AS
SELECT 
    lei.id,
    lei.reward_id,
    lei.total_supply,
    lei.claimed_count,
    lei.start_date,
    lei.end_date,
    lei.is_active,
    ROUND((lei.claimed_count::DECIMAL / lei.total_supply) * 100, 2) as claim_percentage,
    COUNT(lec.id) as total_claims,
    MIN(lec.claimed_at) as first_claim,
    MAX(lec.claimed_at) as last_claim
FROM public.limited_edition_items lei
LEFT JOIN public.limited_edition_claims lec ON lei.id = lec.limited_edition_id
GROUP BY lei.id, lei.reward_id, lei.total_supply, lei.claimed_count, lei.start_date, lei.end_date, lei.is_active;

-- Grant access to analytics view
GRANT SELECT ON public.limited_edition_analytics TO authenticated;

-- 12. Add comments for documentation
COMMENT ON TABLE public.limited_edition_items IS 'Limited edition items with supply tracking';
COMMENT ON TABLE public.limited_edition_claims IS 'User claims for limited edition items';
COMMENT ON FUNCTION public.claim_limited_edition_item IS 'Atomic function to claim limited edition items with race condition protection';
COMMENT ON FUNCTION public.create_limited_edition_item IS 'Admin function to create new limited edition items';
COMMENT ON VIEW public.limited_edition_analytics IS 'Analytics view for limited edition performance';

-- 13. Create sample data for testing (optional)
-- INSERT INTO public.limited_edition_items (reward_id, total_supply, start_date, end_date) 
-- VALUES ('MONARCH_LAUNCH_HOODIE', 100, NOW(), NOW() + INTERVAL '30 days'); 