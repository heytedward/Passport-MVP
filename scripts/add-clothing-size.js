const { createClient } = require('@supabase/supabase-js');
require('dotenv').config();

const supabase = createClient(
  process.env.REACT_APP_SUPABASE_URL,
  process.env.REACT_APP_SUPABASE_ANON_KEY
);

async function addClothingSize() {
  console.log('🦋 Adding clothing_size column to user_profiles...');
  
  try {
    // Add clothing_size column
    const { error: alterError } = await supabase.rpc('exec_sql', {
      sql: `
        ALTER TABLE public.user_profiles 
        ADD COLUMN IF NOT EXISTS clothing_size VARCHAR(10);
      `
    });
    
    if (alterError) {
      console.log('⚠️ Column might already exist or need manual addition');
    } else {
      console.log('✅ Added clothing_size column');
    }
    
    // Update the handle_new_user function
    const { error: functionError } = await supabase.rpc('exec_sql', {
      sql: `
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
      `
    });
    
    if (functionError) {
      console.log('⚠️ Function update might need manual execution');
      console.log('Please run the SQL manually in Supabase dashboard');
    } else {
      console.log('✅ Updated handle_new_user function');
    }
    
    console.log('🎉 Clothing size migration completed!');
    console.log('📝 Note: You may need to run the SQL manually in Supabase dashboard if the RPC calls fail');
    
  } catch (error) {
    console.error('❌ Error:', error.message);
    console.log('📝 Please run the SQL manually in Supabase dashboard:');
    console.log(`
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
    `);
  }
}

addClothingSize(); 