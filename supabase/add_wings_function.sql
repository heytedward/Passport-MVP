-- Add missing RPC function for adding wings to users
-- Run this in your Supabase SQL editor

CREATE OR REPLACE FUNCTION public.add_wings_to_user(
  user_id_param UUID,
  wings_amount INTEGER,
  activity_type_param TEXT DEFAULT 'manual',
  description_param TEXT DEFAULT 'Wings added'
)
RETURNS JSON AS $$
DECLARE
  old_balance INTEGER;
  new_balance INTEGER;
BEGIN
  -- Get current balance
  SELECT wings_balance INTO old_balance
  FROM public.user_profiles
  WHERE id = user_id_param;

  -- Calculate new balance
  new_balance := COALESCE(old_balance, 0) + wings_amount;

  -- Update user's wings balance
  UPDATE public.user_profiles
  SET wings_balance = new_balance,
      current_week_wings = COALESCE(current_week_wings, 0) + wings_amount,
      updated_at = NOW()
  WHERE id = user_id_param;

  -- Log the activity
  INSERT INTO public.user_activity (
    user_id,
    activity_type,
    activity_title,
    activity_description,
    wings_earned,
    activity_date
  ) VALUES (
    user_id_param,
    activity_type_param,
    'WNGS Added',
    description_param,
    wings_amount,
    NOW()
  );

  -- Return the result
  RETURN json_build_object(
    'success', true,
    'old_balance', old_balance,
    'new_balance', new_balance,
    'wings_added', wings_amount
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER; 