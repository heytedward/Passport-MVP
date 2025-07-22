-- Create the missing add_wings_to_user RPC function
-- This is needed for the +25 Test button and WNGS system

CREATE OR REPLACE FUNCTION public.add_wings_to_user(
    user_id_param UUID,
    wings_amount INTEGER,
    transaction_type_param TEXT DEFAULT 'manual',
    description_param TEXT DEFAULT 'Wings added',
    reference_id_param TEXT DEFAULT NULL
)
RETURNS JSON AS $$
DECLARE
    old_balance INTEGER;
    new_balance INTEGER;
BEGIN
    -- Get current balance from user_profiles
    SELECT COALESCE(wings_balance, 0) INTO old_balance
    FROM public.user_profiles
    WHERE id = user_id_param;

    -- If user profile doesn't exist, create it
    IF old_balance IS NULL THEN
        INSERT INTO public.user_profiles (id, wings_balance, current_week_wings)
        VALUES (user_id_param, wings_amount, wings_amount)
        ON CONFLICT (id) DO UPDATE SET
            wings_balance = COALESCE(user_profiles.wings_balance, 0) + wings_amount,
            current_week_wings = COALESCE(user_profiles.current_week_wings, 0) + wings_amount;
        
        new_balance := wings_amount;
    ELSE
        -- Calculate new balance
        new_balance := old_balance + wings_amount;

        -- Update user's wings balance
        UPDATE public.user_profiles
        SET wings_balance = new_balance,
            current_week_wings = COALESCE(current_week_wings, 0) + wings_amount,
            updated_at = NOW()
        WHERE id = user_id_param;
    END IF;

    -- Log the activity (if user_activity table exists)
    BEGIN
        INSERT INTO public.user_activity (user_id, activity_type, activity_title, activity_description, wings_earned, reference_id)
        VALUES (
            user_id_param,
            transaction_type_param,
            'Wings Earned',
            description_param,
            wings_amount,
            reference_id_param
        );
    EXCEPTION
        WHEN others THEN
            -- If user_activity table doesn't exist, just continue
            NULL;
    END;

    -- Return the result
    RETURN json_build_object(
        'success', true,
        'old_balance', COALESCE(old_balance, 0),
        'new_balance', new_balance,
        'wings_added', wings_amount
    );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Grant execute permission to authenticated users
GRANT EXECUTE ON FUNCTION public.add_wings_to_user TO authenticated; 