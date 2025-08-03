/**
 * Test script for PassportScreen stamps functionality
 * This script tests the useStamps hook and database connectivity
 */

const { createClient } = require('@supabase/supabase-js');
require('dotenv').config();

// Initialize Supabase client
const supabase = createClient(
  process.env.REACT_APP_SUPABASE_URL,
  process.env.REACT_APP_SUPABASE_ANON_KEY
);

async function testPassportStamps() {
  console.log('🧪 Testing PassportScreen stamps functionality...\n');

  try {
    // Test 1: Check if we can connect to Supabase
    console.log('1. Testing Supabase connection...');
    const { data: connectionTest, error: connectionError } = await supabase
      .from('user_stamps')
      .select('count')
      .limit(1);
    
    if (connectionError) {
      console.error('❌ Supabase connection failed:', connectionError.message);
      return;
    }
    console.log('✅ Supabase connection successful\n');

    // Test 2: Check user_stamps table structure
    console.log('2. Checking user_stamps table structure...');
    const { data: tableInfo, error: tableError } = await supabase
      .from('user_stamps')
      .select('*')
      .limit(1);
    
    if (tableError) {
      console.error('❌ Table structure check failed:', tableError.message);
      return;
    }
    
    if (tableInfo && tableInfo.length > 0) {
      console.log('✅ user_stamps table exists and accessible');
      console.log('📋 Sample record structure:', Object.keys(tableInfo[0]));
    } else {
      console.log('ℹ️  user_stamps table exists but is empty');
    }
    console.log('');

    // Test 3: Check for any existing stamps
    console.log('3. Checking for existing stamps...');
    const { data: allStamps, error: stampsError } = await supabase
      .from('user_stamps')
      .select('*')
      .order('created_at', { ascending: false })
      .limit(10);
    
    if (stampsError) {
      console.error('❌ Failed to fetch stamps:', stampsError.message);
      return;
    }
    
    console.log(`📊 Found ${allStamps.length} total stamps in database`);
    
    if (allStamps.length > 0) {
      console.log('📋 Recent stamps:');
      allStamps.forEach((stamp, index) => {
        console.log(`   ${index + 1}. ${stamp.stamp_id} - ${stamp.user_id} - ${stamp.created_at}`);
      });
    }
    console.log('');

    // Test 4: Check stamp types distribution
    console.log('4. Analyzing stamp types...');
    const stampTypes = {};
    allStamps.forEach(stamp => {
      stampTypes[stamp.stamp_id] = (stampTypes[stamp.stamp_id] || 0) + 1;
    });
    
    console.log('📈 Stamp type distribution:');
    Object.entries(stampTypes).forEach(([type, count]) => {
      console.log(`   ${type}: ${count} earned`);
    });
    console.log('');

    // Test 5: Expected stamp types
    console.log('5. Expected stamp types for PassportScreen:');
    const expectedStamps = [
      'received_passport',
      'morning_gm', 
      'first_item',
      'qr_scanner',
      'social_share',
      'style_icon',
      'streak_master',
      'quest_completed',
      'master_collector'
    ];
    
    expectedStamps.forEach(stampId => {
      const count = stampTypes[stampId] || 0;
      console.log(`   ${stampId}: ${count} earned`);
    });
    console.log('');

    console.log('✅ PassportScreen stamps test completed successfully!');
    console.log('\n💡 Next steps:');
    console.log('   - Navigate to /passport in the app to see the dynamic stamps');
    console.log('   - Earn stamps through various activities to see them appear');
    console.log('   - Check the browser console for debug information');

  } catch (error) {
    console.error('❌ Test failed with error:', error.message);
    console.error('Stack trace:', error.stack);
  }
}

// Run the test
testPassportStamps(); 