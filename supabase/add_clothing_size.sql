-- Add clothing_size column to user_profiles table
ALTER TABLE public.user_profiles 
ADD COLUMN IF NOT EXISTS clothing_size VARCHAR(10);

-- Update the handle_new_user function to include clothing_size
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.user_profiles (id, email, username, full_name, clothing_size)
  VALUES (
    NEW.id, 
    NEW.email, 
    NEW.raw_user_meta_data->>'username', 
    NEW.raw_user_meta_data->>'full_name',
    NEW.raw_user_meta_data->>'clothing_size'
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER; 