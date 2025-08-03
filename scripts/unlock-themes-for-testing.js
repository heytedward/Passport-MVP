require('dotenv').config();
const { createClient } = require('@supabase/supabase-js');

// Initialize Supabase client
const supabase = createClient(
  process.env.REACT_APP_SUPABASE_URL,
  process.env.REACT_APP_SUPABASE_ANON_KEY
);

async function unlockThemesForTesting() {
  const testUserId = '8d8cf1b4-413f-43b5-891e-364c897634ed'; // Your test user ID
  
  try {
    console.log('🔓 Unlocking all themes for test user...');
    console.log('User ID:', testUserId);
    console.log('Using URL:', process.env.REACT_APP_SUPABASE_URL);
    
    // First, check if the user profile exists
    const { data: existingProfile, error: checkError } = await supabase
      .from('user_profiles')
      .select('*')
      .eq('id', testUserId)
      .single();

    if (checkError) {
      console.log('❌ User profile not found, creating one...');
      
      // Create the profile first
      const { data: newProfile, error: createError } = await supabase
        .from('user_profiles')
        .insert({
          id: testUserId,
          email: 'tedongwenyi@gmail.com',
          username: 'test',
          full_name: 'Test User',
          themes_unlocked: ['frequencyPulse', 'solarShine', 'echoGlass', 'retroFrame', 'nightScan'],
          equipped_theme: 'frequencyPulse',
          total_scans: 50,
          total_quests_completed: 20,
          total_items_collected: 25,
          wings_balance: 1500,
          role: 'user'
        })
        .select()
        .single();

      if (createError) {
        console.error('❌ Error creating profile:', createError);
        return;
      }

      console.log('✅ Profile created with themes:', newProfile);
    } else {
      console.log('✅ Profile found, updating themes...');
      
      // Update existing profile
      const { data, error } = await supabase
        .from('user_profiles')
        .update({
          themes_unlocked: ['frequencyPulse', 'solarShine', 'echoGlass', 'retroFrame', 'nightScan'],
          equipped_theme: 'frequencyPulse',
          total_scans: 50,
          total_quests_completed: 20,
          total_items_collected: 25,
          wings_balance: 1500
        })
        .eq('id', testUserId)
        .select();

      if (error) {
        console.error('❌ Error updating profile:', error);
        return;
      }

      console.log('✅ Profile updated with themes:', data);
    }

    console.log('\n🎨 All themes unlocked for testing!');
    console.log('📊 Progress values set:');
    console.log('   - QR Scans: 50');
    console.log('   - Quests Completed: 20');
    console.log('   - Items Collected: 25');
    console.log('   - WNGS Balance: 1500');
    console.log('\n🎯 Now you can:');
    console.log('1. Go to /closet to see all themes');
    console.log('2. Go to /passport to see themes in action');
    console.log('3. Click on themes to equip them');
    
  } catch (error) {
    console.error('❌ Error:', error);
  }
}

// Run the script
unlockThemesForTesting(); 