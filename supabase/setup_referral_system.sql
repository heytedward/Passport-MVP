-- ===================================================
-- COMPLETE REFERRAL SYSTEM DATABASE SCHEMA
-- Run this in Supabase SQL Editor
-- ===================================================

-- Create referral codes table
CREATE TABLE IF NOT EXISTS referral_codes (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  referral_code VARCHAR(20) UNIQUE NOT NULL,
  created_at TIMESTAMP DEFAULT NOW(),
  is_active BOOLEAN DEFAULT true,
  total_uses INTEGER DEFAULT 0
);

-- Create referrals table
CREATE TABLE IF NOT EXISTS referrals (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  referrer_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  referee_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  referral_code VARCHAR(20) NOT NULL,
  status VARCHAR(20) DEFAULT 'pending', -- pending, completed, rewarded
  created_at TIMESTAMP DEFAULT NOW(),
  completed_at TIMESTAMP NULL,
  referrer_reward_given BOOLEAN DEFAULT false,
  referee_reward_given BOOLEAN DEFAULT false,
  referrer_wings_earned INTEGER DEFAULT 0,
  referee_wings_earned INTEGER DEFAULT 0
);

-- Add referral tracking columns to user_profiles
ALTER TABLE user_profiles 
ADD COLUMN IF NOT EXISTS total_referrals INTEGER DEFAULT 0,
ADD COLUMN IF NOT EXISTS referral_wings_earned INTEGER DEFAULT 0,
ADD COLUMN IF NOT EXISTS current_week_wings INTEGER DEFAULT 0,
ADD COLUMN IF NOT EXISTS week_start_date TIMESTAMP DEFAULT NOW();

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_referral_codes_user_id ON referral_codes(user_id);
CREATE INDEX IF NOT EXISTS idx_referral_codes_code ON referral_codes(referral_code);
CREATE INDEX IF NOT EXISTS idx_referrals_referrer ON referrals(referrer_id);
CREATE INDEX IF NOT EXISTS idx_referrals_referee ON referrals(referee_id);
CREATE INDEX IF NOT EXISTS idx_referrals_status ON referrals(status);
CREATE INDEX IF NOT EXISTS idx_referrals_created_at ON referrals(created_at);
CREATE INDEX IF NOT EXISTS idx_user_profiles_referral_wings ON user_profiles(referral_wings_earned);

-- RPC function to add wings and update profile
CREATE OR REPLACE FUNCTION add_wings_to_user(
  user_id_param UUID,
  wings_amount INTEGER,
  activity_type_param TEXT DEFAULT 'referral',
  description_param TEXT DEFAULT 'Wings earned'
)
RETURNS VOID AS $$
BEGIN
  -- Update user profile wings balance
  UPDATE user_profiles 
  SET 
    wings_balance = COALESCE(wings_balance, 0) + wings_amount,
    current_week_wings = COALESCE(current_week_wings, 0) + wings_amount,
    referral_wings_earned = CASE 
      WHEN activity_type_param = 'referral' OR activity_type_param = 'referral_bonus' 
      THEN COALESCE(referral_wings_earned, 0) + wings_amount 
      ELSE COALESCE(referral_wings_earned, 0) 
    END
  WHERE id = user_id_param;
  
  -- Insert activity record
  INSERT INTO user_activity (user_id, activity_type, activity_title, activity_description, wings_earned, activity_date)
  VALUES (user_id_param, activity_type_param, 'Wings Earned', description_param, wings_amount, NOW());
END;
$$ LANGUAGE plpgsql;

-- Enable Row Level Security
ALTER TABLE referral_codes ENABLE ROW LEVEL SECURITY;
ALTER TABLE referrals ENABLE ROW LEVEL SECURITY;

-- RLS Policies for referral_codes
CREATE POLICY "Users can view own referral codes" ON referral_codes
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can create own referral codes" ON referral_codes
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own referral codes" ON referral_codes
  FOR UPDATE USING (auth.uid() = user_id);

-- RLS Policies for referrals
CREATE POLICY "Users can view own referrals" ON referrals
  FOR SELECT USING (auth.uid() = referrer_id OR auth.uid() = referee_id);

CREATE POLICY "System can insert referrals" ON referrals
  FOR INSERT WITH CHECK (true);

CREATE POLICY "System can update referrals" ON referrals
  FOR UPDATE USING (true);

-- Insert test data (optional - remove for production)
-- This creates a sample referral code for testing
-- INSERT INTO referral_codes (user_id, referral_code) 
-- VALUES ('your-test-user-id', 'TEST123');

COMMIT; 