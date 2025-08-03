const { createClient } = require('@supabase/supabase-js');
require('dotenv').config();

const supabase = createClient(
  process.env.REACT_APP_SUPABASE_URL,
  process.env.REACT_APP_SUPABASE_ANON_KEY
);

async function testThemeSystem() {
  console.log('🦋 Testing theme system...');
  
  try {
    // Get current user profile
    const { data: { session } } = await supabase.auth.getSession();
    
    if (!session) {
      console.log('⚠️ No active session. Please log in first.');
      return;
    }

    const userId = session.user.id;
    console.log('👤 Testing for user:', session.user.email);

    // Check current profile
    const { data: profile, error } = await supabase
      .from('user_profiles')
      .select('*')
      .eq('id', userId)
      .single();

    if (error) {
      console.error('❌ Error fetching profile:', error);
      return;
    }

    console.log('📊 Current profile:');
    console.log('  - Themes unlocked:', profile.themes_unlocked || 'Not set');
    console.log('  - Equipped theme:', profile.equipped_theme || 'Not set');
    console.log('  - Total scans:', profile.total_scans || 0);
    console.log('  - Total quests:', profile.total_quests_completed || 0);
    console.log('  - Total items:', profile.total_items_collected || 0);
    console.log('  - WNGS balance:', profile.wings_balance || 0);

    // Test updating progress
    console.log('\n🧪 Testing progress update...');
    const { error: updateError } = await supabase
      .from('user_profiles')
      .update({
        total_scans: (profile.total_scans || 0) + 1,
        total_items_collected: (profile.total_items_collected || 0) + 5,
        wings_balance: (profile.wings_balance || 0) + 100
      })
      .eq('id', userId);

    if (updateError) {
      console.error('❌ Error updating progress:', updateError);
    } else {
      console.log('✅ Progress updated successfully');
    }

    // Test equipping a theme
    console.log('\n🎨 Testing theme equipping...');
    const { error: equipError } = await supabase
      .from('user_profiles')
      .update({ equipped_theme: 'solarShine' })
      .eq('id', userId);

    if (equipError) {
      console.error('❌ Error equipping theme:', equipError);
    } else {
      console.log('✅ Theme equipped successfully');
    }

    // Check final state
    const { data: finalProfile, error: finalError } = await supabase
      .from('user_profiles')
      .select('*')
      .eq('id', userId)
      .single();

    if (finalError) {
      console.error('❌ Error fetching final profile:', finalError);
      return;
    }

    console.log('\n📊 Final profile state:');
    console.log('  - Themes unlocked:', finalProfile.themes_unlocked);
    console.log('  - Equipped theme:', finalProfile.equipped_theme);
    console.log('  - Total scans:', finalProfile.total_scans);
    console.log('  - Total items:', finalProfile.total_items_collected);
    console.log('  - WNGS balance:', finalProfile.wings_balance);

    console.log('\n🎉 Theme system test completed!');

  } catch (error) {
    console.error('❌ Error:', error.message);
  }
}

testThemeSystem(); 