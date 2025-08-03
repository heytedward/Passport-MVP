const { createClient } = require('@supabase/supabase-js');
require('dotenv').config();

const supabase = createClient(
  process.env.REACT_APP_SUPABASE_URL,
  process.env.REACT_APP_SUPABASE_ANON_KEY
);

async function addSampleClosetData() {
  console.log('🦋 Adding sample closet data...');
  
  try {
    // First, let's check if there are any users
    const { data: users, error: usersError } = await supabase
      .from('user_profiles')
      .select('id, email, username')
      .limit(5);

    if (usersError) {
      console.error('❌ Error fetching users:', usersError);
      return;
    }

    console.log('👥 Found users:', users?.length || 0);
    
    if (!users || users.length === 0) {
      console.log('⚠️ No users found. Please create a user account first.');
      return;
    }

    const userId = users[0].id;
    console.log('🎯 Using user:', users[0].email);

    // Check if user already has closet items
    const { data: existingItems, error: existingError } = await supabase
      .from('user_closet')
      .select('*')
      .eq('user_id', userId);

    if (existingError) {
      console.error('❌ Error checking existing items:', existingError);
      return;
    }

    if (existingItems && existingItems.length > 0) {
      console.log('✅ User already has', existingItems.length, 'closet items');
      return;
    }

    // Add sample closet items
    const sampleItems = [
      {
        user_id: userId,
        reward_id: 'monarch_jacket_001',
        name: 'Monarch Varsity Jacket',
        rarity: 'rare',
        category: 'jackets',
        mint_number: 1,
        wings_earned: 50,
        earned_date: new Date().toISOString(),
        earned_via: 'qr_scan',
        is_equipped: false
      },
      {
        user_id: userId,
        reward_id: 'monarch_tee_001',
        name: 'Monarch Classic Tee',
        rarity: 'common',
        category: 'tops',
        mint_number: 1,
        wings_earned: 10,
        earned_date: new Date().toISOString(),
        earned_via: 'qr_scan',
        is_equipped: true
      },
      {
        user_id: userId,
        reward_id: 'monarch_cap_001',
        name: 'Monarch Snapback',
        rarity: 'uncommon',
        category: 'headwear',
        mint_number: 1,
        wings_earned: 25,
        earned_date: new Date().toISOString(),
        earned_via: 'qr_scan',
        is_equipped: false
      }
    ];

    const { data: insertedItems, error: insertError } = await supabase
      .from('user_closet')
      .insert(sampleItems)
      .select();

    if (insertError) {
      console.error('❌ Error inserting sample items:', insertError);
      return;
    }

    console.log('✅ Successfully added', insertedItems?.length || 0, 'sample closet items');
    console.log('📦 Sample items added:');
    insertedItems?.forEach(item => {
      console.log(`   - ${item.name} (${item.rarity})`);
    });

  } catch (error) {
    console.error('❌ Error:', error.message);
  }
}

addSampleClosetData(); 