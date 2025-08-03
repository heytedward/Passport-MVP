const { createClient } = require('@supabase/supabase-js');
require('dotenv').config();

const supabase = createClient(
  process.env.REACT_APP_SUPABASE_URL,
  process.env.REACT_APP_SUPABASE_ANON_KEY
);

async function runThemeMigration() {
  console.log('🦋 Running theme system migration...');
  
  try {
    // Add theme columns
    console.log('📝 Adding theme columns to user_profiles...');
    const { error: alterError } = await supabase.rpc('exec_sql', {
      sql: `
        ALTER TABLE public.user_profiles 
        ADD COLUMN IF NOT EXISTS themes_unlocked TEXT[] DEFAULT ARRAY['frequencyPulse'],
        ADD COLUMN IF NOT EXISTS equipped_theme TEXT DEFAULT 'frequencyPulse',
        ADD COLUMN IF NOT EXISTS total_scans INTEGER DEFAULT 0,
        ADD COLUMN IF NOT EXISTS total_quests_completed INTEGER DEFAULT 0,
        ADD COLUMN IF NOT EXISTS total_items_collected INTEGER DEFAULT 0;
      `
    });
    
    if (alterError) {
      console.log('⚠️ Columns might already exist or need manual addition');
    } else {
      console.log('✅ Theme columns added');
    }
    
    // Update existing users
    console.log('🔄 Updating existing users with default theme...');
    const { error: updateError } = await supabase.rpc('exec_sql', {
      sql: `
        UPDATE public.user_profiles 
        SET 
          themes_unlocked = ARRAY['frequencyPulse'],
          equipped_theme = 'frequencyPulse'
        WHERE themes_unlocked IS NULL OR equipped_theme IS NULL;
      `
    });
    
    if (updateError) {
      console.log('⚠️ User update might need manual execution');
    } else {
      console.log('✅ Existing users updated');
    }
    
    // Create theme unlock functions
    console.log('🔧 Creating theme unlock functions...');
    const { error: functionError } = await supabase.rpc('exec_sql', {
      sql: `
        CREATE OR REPLACE FUNCTION check_theme_unlocks(user_id_param UUID)
        RETURNS TEXT[] AS $$
        DECLARE
          user_profile RECORD;
          new_unlocks TEXT[] := ARRAY[]::TEXT[];
          current_themes TEXT[];
        BEGIN
          SELECT * INTO user_profile 
          FROM user_profiles 
          WHERE id = user_id_param;
          
          IF NOT FOUND THEN
            RETURN new_unlocks;
          END IF;
          
          current_themes := user_profile.themes_unlocked;
          
          -- Check Solar Shine (first scan)
          IF user_profile.total_scans >= 1 AND NOT ('solarShine' = ANY(current_themes)) THEN
            new_unlocks := array_append(new_unlocks, 'solarShine');
            current_themes := array_append(current_themes, 'solarShine');
          END IF;
          
          -- Check Echo Glass (3 quests)
          IF user_profile.total_quests_completed >= 3 AND NOT ('echoGlass' = ANY(current_themes)) THEN
            new_unlocks := array_append(new_unlocks, 'echoGlass');
            current_themes := array_append(current_themes, 'echoGlass');
          END IF;
          
          -- Check Retro Frame (10 items)
          IF user_profile.total_items_collected >= 10 AND NOT ('retroFrame' = ANY(current_themes)) THEN
            new_unlocks := array_append(new_unlocks, 'retroFrame');
            current_themes := array_append(current_themes, 'retroFrame');
          END IF;
          
          -- Check Night Scan (500 WNGS)
          IF user_profile.wings_balance >= 500 AND NOT ('nightScan' = ANY(current_themes)) THEN
            new_unlocks := array_append(new_unlocks, 'nightScan');
            current_themes := array_append(current_themes, 'nightScan');
          END IF;
          
          -- Update user profile if new themes unlocked
          IF array_length(new_unlocks, 1) > 0 THEN
            UPDATE user_profiles 
            SET themes_unlocked = current_themes
            WHERE id = user_id_param;
          END IF;
          
          RETURN new_unlocks;
        END;
        $$ LANGUAGE plpgsql SECURITY DEFINER;
      `
    });
    
    if (functionError) {
      console.log('⚠️ Function creation might need manual execution');
    } else {
      console.log('✅ Theme unlock functions created');
    }
    
    console.log('🎉 Theme system migration completed!');
    console.log('📝 Note: You may need to run the SQL manually in Supabase dashboard if the RPC calls fail');
    
  } catch (error) {
    console.error('❌ Error:', error.message);
    console.log('📝 Please run the SQL manually in Supabase dashboard:');
    console.log(`
-- Add theme columns to user_profiles table
ALTER TABLE public.user_profiles 
ADD COLUMN IF NOT EXISTS themes_unlocked TEXT[] DEFAULT ARRAY['frequencyPulse'],
ADD COLUMN IF NOT EXISTS equipped_theme TEXT DEFAULT 'frequencyPulse',
ADD COLUMN IF NOT EXISTS total_scans INTEGER DEFAULT 0,
ADD COLUMN IF NOT EXISTS total_quests_completed INTEGER DEFAULT 0,
ADD COLUMN IF NOT EXISTS total_items_collected INTEGER DEFAULT 0;

-- Update existing users
UPDATE public.user_profiles 
SET 
  themes_unlocked = ARRAY['frequencyPulse'],
  equipped_theme = 'frequencyPulse'
WHERE themes_unlocked IS NULL OR equipped_theme IS NULL;
    `);
  }
}

runThemeMigration(); 