const { createClient } = require('@supabase/supabase-js');
require('dotenv').config();

const supabase = createClient(
  process.env.REACT_APP_SUPABASE_URL,
  process.env.REACT_APP_SUPABASE_ANON_KEY
);

async function createUserProfile() {
  console.log('🦋 Creating user profile...');
  
  try {
    // Get the current session to find the user
    const { data: { session }, error: sessionError } = await supabase.auth.getSession();
    
    if (sessionError) {
      console.error('❌ Error getting session:', sessionError);
      return;
    }

    if (!session) {
      console.log('⚠️ No active session. Please log in first.');
      return;
    }

    const user = session.user;
    console.log('👤 Current user:', user.email);

    // Check if profile already exists
    const { data: existingProfile, error: profileError } = await supabase
      .from('user_profiles')
      .select('*')
      .eq('id', user.id)
      .single();

    if (profileError && profileError.code !== 'PGRST116') {
      console.error('❌ Error checking profile:', profileError);
      return;
    }

    if (existingProfile) {
      console.log('✅ User profile already exists');
      console.log('📋 Profile:', existingProfile);
      return;
    }

    // Create user profile manually
    const profileData = {
      id: user.id,
      email: user.email,
      username: user.user_metadata?.username || user.email?.split('@')[0] || 'user',
      full_name: user.user_metadata?.full_name || user.user_metadata?.username || user.email?.split('@')[0] || 'User',
      wings_balance: 0,
      current_week_wings: 0,
      week_start_date: new Date().toISOString(),
      role: 'user',
      clothing_size: user.user_metadata?.clothing_size || null
    };

    const { data: newProfile, error: insertError } = await supabase
      .from('user_profiles')
      .insert(profileData)
      .select()
      .single();

    if (insertError) {
      console.error('❌ Error creating profile:', insertError);
      return;
    }

    console.log('✅ User profile created successfully!');
    console.log('📋 New profile:', newProfile);

  } catch (error) {
    console.error('❌ Error:', error.message);
  }
}

createUserProfile(); 