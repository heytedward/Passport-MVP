-- Complete database setup for Passport MVP
-- Run this in your Supabase SQL editor

-- 1. User profiles table
CREATE TABLE IF NOT EXISTS public.user_profiles (
  id UUID REFERENCES auth.users(id) PRIMARY KEY,
  email TEXT,
  username TEXT UNIQUE,
  full_name TEXT,
  wings_balance INTEGER DEFAULT 0,
  current_week_wings INTEGER DEFAULT 0,
  week_start_date TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  role VARCHAR(50) DEFAULT 'user',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 2. Rewards table (items that can be scanned)
CREATE TABLE IF NOT EXISTS public.rewards (
  id SERIAL PRIMARY KEY,
  reward_id TEXT UNIQUE NOT NULL,
  name TEXT NOT NULL,
  description TEXT,
  category TEXT NOT NULL,
  rarity TEXT NOT NULL,
  wings_value INTEGER DEFAULT 0,
  season TEXT,
  image_url TEXT,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 3. User closet (collected items)
CREATE TABLE IF NOT EXISTS public.user_closet (
  id SERIAL PRIMARY KEY,
  user_id UUID REFERENCES public.user_profiles(id),
  reward_id TEXT NOT NULL,
  name TEXT NOT NULL,
  rarity TEXT NOT NULL,
  category TEXT NOT NULL,
  mint_number INTEGER,
  wings_earned INTEGER DEFAULT 0,
  earned_date TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  earned_via TEXT DEFAULT 'qr_scan',
  is_equipped BOOLEAN DEFAULT false
);

-- 4. User activity table (for recent activity tracking)
CREATE TABLE IF NOT EXISTS public.user_activity (
  id SERIAL PRIMARY KEY,
  user_id UUID REFERENCES public.user_profiles(id),
  activity_type TEXT NOT NULL, -- 'scan', 'quest', 'event', 'daily', 'referral'
  activity_title TEXT NOT NULL,
  activity_description TEXT,
  wings_earned INTEGER DEFAULT 0,
  reward_id TEXT,
  activity_date TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  metadata JSONB
);

-- 5. Admin settings table (from your migration)
CREATE TABLE IF NOT EXISTS public.admin_settings (
  id SERIAL PRIMARY KEY,
  setting_key VARCHAR(255) UNIQUE NOT NULL,
  setting_value BOOLEAN DEFAULT true,
  setting_name VARCHAR(255),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable Row Level Security
ALTER TABLE public.user_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.rewards ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_closet ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_activity ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.admin_settings ENABLE ROW LEVEL SECURITY;

-- RLS Policies for user_profiles
CREATE POLICY "Users can view own profile" ON public.user_profiles
  FOR SELECT USING (auth.uid() = id);

CREATE POLICY "Users can update own profile" ON public.user_profiles
  FOR UPDATE USING (auth.uid() = id);

CREATE POLICY "Users can insert own profile" ON public.user_profiles
  FOR INSERT WITH CHECK (auth.uid() = id);

-- RLS Policies for rewards (public read access)
CREATE POLICY "Anyone can view active rewards" ON public.rewards
  FOR SELECT USING (is_active = true);

-- RLS Policies for user_closet
CREATE POLICY "Users can view own closet" ON public.user_closet
  FOR SELECT USING (user_id = auth.uid());

CREATE POLICY "Users can insert to own closet" ON public.user_closet
  FOR INSERT WITH CHECK (user_id = auth.uid());

CREATE POLICY "Users can update own closet items" ON public.user_closet
  FOR UPDATE USING (user_id = auth.uid());

-- RLS Policies for user_activity
CREATE POLICY "Users can view own activity" ON public.user_activity
  FOR SELECT USING (user_id = auth.uid());

CREATE POLICY "Users can insert own activity" ON public.user_activity
  FOR INSERT WITH CHECK (user_id = auth.uid());

-- RLS Policies for admin_settings
CREATE POLICY "Allow all access to admins" ON public.admin_settings
  FOR ALL TO authenticated
  USING ((SELECT role FROM public.user_profiles WHERE id = auth.uid()) = 'admin')
  WITH CHECK ((SELECT role FROM public.user_profiles WHERE id = auth.uid()) = 'admin');

CREATE POLICY "Allow read access to authenticated users" ON public.admin_settings
  FOR SELECT TO authenticated USING (true);

-- Insert sample rewards for testing
INSERT INTO public.rewards (reward_id, name, description, category, rarity, wings_value, season) VALUES
  ('monarch_jacket_001', 'Monarch Varsity Jacket', 'Limited edition varsity jacket', 'jackets', 'rare', 50, 'S1'),
  ('monarch_tee_001', 'Monarch Classic Tee', 'Classic branded t-shirt', 'tops', 'common', 10, 'S1'),
  ('monarch_cap_001', 'Monarch Snapback', 'Embroidered snapback cap', 'headwear', 'uncommon', 25, 'S1');

-- Insert default admin settings
INSERT INTO public.admin_settings (setting_key, setting_name, setting_value) VALUES
  ('category_jackets', 'Jackets', true),
  ('category_tops', 'Tops', true),
  ('category_bottoms', 'Bottoms', true),
  ('category_headwear', 'Headwear', true),
  ('category_accessories', 'Accessories', true),
  ('category_footwear', 'Footwear', true),
  ('category_wallpapers', 'Wallpapers', true),
  ('category_tickets', 'Tickets', true),
  ('category_posters', 'Posters', true)
ON CONFLICT (setting_key) DO NOTHING;

-- Create function to handle user profile creation
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.user_profiles (id, email, username, full_name)
  VALUES (NEW.id, NEW.email, NEW.raw_user_meta_data->>'username', NEW.raw_user_meta_data->>'full_name');
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create trigger for new user registration
CREATE OR REPLACE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user(); 

-- Create RPC function to add wings to user
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