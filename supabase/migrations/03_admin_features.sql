-- In this migration, we are adding administrative features to the application.
-- This includes creating a new table to store admin-specific settings and
-- adding a 'role' column to the user_profiles table to differentiate
-- between regular users and administrators.

-- 1. Create admin_settings table
-- This table will store key-value pairs for application settings that
-- can be toggled by an administrator, such as enabling or disabling
-- specific item categories.
CREATE TABLE admin_settings (
  id SERIAL PRIMARY KEY,
  setting_key VARCHAR(255) UNIQUE NOT NULL,
  setting_value BOOLEAN DEFAULT true,
  setting_name VARCHAR(255),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 2. Add 'role' column to user_profiles
-- This allows us to assign different access levels. By default, all new users
-- will have the 'user' role.
ALTER TABLE public.user_profiles
ADD COLUMN role VARCHAR(50) DEFAULT 'user';

-- 3. Enable RLS for the new table and create policies
ALTER TABLE public.admin_settings ENABLE ROW LEVEL SECURITY;

-- Admins should be able to do anything with the settings.
CREATE POLICY "Allow all access to admins"
ON public.admin_settings
FOR ALL
TO authenticated
USING (
  (SELECT role FROM public.user_profiles WHERE id = auth.uid()) = 'admin'
)
WITH CHECK (
  (SELECT role FROM public.user_profiles WHERE id = auth.uid()) = 'admin'
);

-- Authenticated users should be able to read the settings.
-- This is useful for the client-side to know which features are enabled.
CREATE POLICY "Allow read access to authenticated users"
ON public.admin_settings
FOR SELECT
TO authenticated
USING (true);

-- 4. Insert default settings for the new categories
-- This pre-populates the settings for the categories we've been working on.
INSERT INTO public.admin_settings (setting_key, setting_name, setting_value) VALUES
  ('category_jackets', 'Jackets', true),
  ('category_tops', 'Tops', true),
  ('category_bottoms', 'Bottoms', true),
  ('category_headwear', 'Headwear', true),
  ('category_accessories', 'Accessories', true),
  ('category_footwear', 'Footwear', true),
  ('category_badges', 'Badges', false),
  ('category_passes', 'Passes', false),
  ('category_wallpapers', 'Wallpapers', true),
  ('category_audio_stickers', 'Audio Stickers', false),
  ('category_stickers', 'Stickers', false),
  ('category_tickets', 'Tickets', true),
  ('category_posters', 'Posters', true); 