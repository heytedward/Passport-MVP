/**
 * Monarch Passport MVP - Simple Browser Console Test
 * 
 * Copy and paste this script directly into your browser console
 * Make sure you're on your Monarch Passport app page first!
 * 
 * This script accesses the global supabase instance from your app
 */

// Simple test function that works in browser console
const testMonarchPassportSupabase = async () => {
  console.log('🦋 Monarch Passport MVP - Simple Supabase Test');
  console.log('=' .repeat(50));
  
  try {
    // Check if supabase is available globally
    if (typeof window.supabase === 'undefined') {
      console.error('❌ Supabase not found globally. Make sure you\'re on your app page.');
      console.log('💡 Try importing the test file in your app or check the global scope.');
      return false;
    }
    
    console.log('✅ Supabase client found');
    
    // Test basic connection
    console.log('🧪 Testing basic connection...');
    const { data, error } = await window.supabase
      .from('user_profiles')
      .select('count')
      .limit(1);
    
    if (error) {
      console.error('❌ Connection failed:', error);
      return false;
    }
    
    console.log('✅ Basic connection successful');
    console.log('📊 Test result:', data);
    
    // Test your specific query
    console.log('🧪 Testing your specific query...');
    const { data: updateData, error: updateError } = await window.supabase
      .from('user_profiles')
      .update({ equipped_theme: 'solarShine' })
      .eq('id', 'user-id')
      .select();
    
    if (updateError) {
      console.error('❌ Your query failed:', updateError);
      console.log('💡 This might be expected if user-id doesn\'t exist');
    } else {
      console.log('✅ Your query successful');
      console.log('🎨 Update result:', updateData);
    }
    
    console.log('\n🎉 Monarch Passport Supabase test completed!');
    return true;
    
  } catch (err) {
    console.error('❌ Test failed with error:', err);
    return false;
  }
};

// Alternative: Test with a real user ID if available
const testWithRealUser = async (userId) => {
  console.log('🦋 Testing with real user ID:', userId);
  
  try {
    const { data, error } = await window.supabase
      .from('user_profiles')
      .select('*')
      .eq('id', userId)
      .single();
    
    if (error) {
      console.error('❌ Error:', error);
      return false;
    }
    
    console.log('✅ User profile found:', data);
    
    // Test theme update
    const { data: updateData, error: updateError } = await window.supabase
      .from('user_profiles')
      .update({ 
        equipped_theme: 'solarShine',
        updated_at: new Date().toISOString()
      })
      .eq('id', userId)
      .select();
    
    if (updateError) {
      console.error('❌ Update error:', updateError);
      return false;
    }
    
    console.log('✅ Theme updated successfully:', updateData);
    return true;
    
  } catch (err) {
    console.error('❌ Error:', err);
    return false;
  }
};

// Make functions available
window.testMonarchPassportSupabase = testMonarchPassportSupabase;
window.testWithRealUser = testWithRealUser;

// Auto-run the test
console.log('🦋 Monarch Passport MVP Test Script Loaded!');
console.log('Available functions:');
console.log('- testMonarchPassportSupabase()');
console.log('- testWithRealUser(userId)');
console.log('\nRunning basic test...');
testMonarchPassportSupabase(); 