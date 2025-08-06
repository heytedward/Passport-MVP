/**
 * Monarch Passport MVP - Browser Console Test Script
 * 
 * Copy and paste this entire script into your browser console to test Supabase connection
 * Make sure you're on your Monarch Passport app page first!
 */

// Import the centralized Supabase client
import { supabase } from './supabaseClient.js';

// Test environment variables
const testEnvironmentVariables = () => {
  console.log('🔍 Testing Monarch Passport Environment Variables...');
  
  const requiredVars = {
    'REACT_APP_SUPABASE_URL': process.env.REACT_APP_SUPABASE_URL,
    'REACT_APP_SUPABASE_ANON_KEY': process.env.REACT_APP_SUPABASE_ANON_KEY
  };
  
  const missingVars = Object.entries(requiredVars)
    .filter(([key, value]) => !value)
    .map(([key]) => key);
  
  if (missingVars.length > 0) {
    console.error('❌ Missing environment variables:', missingVars);
    console.error('Please check your .env file and ensure all variables are set');
    return false;
  }
  
  console.log('✅ All environment variables are set');
  console.log('📡 Supabase URL:', process.env.REACT_APP_SUPABASE_URL);
  console.log('🔑 Anon Key:', process.env.REACT_APP_SUPABASE_ANON_KEY?.substring(0, 20) + '...');
  
  return true;
};

// Test basic Supabase connection
const testSupabaseConnection = async () => {
  console.log('🦋 Testing Monarch Passport Supabase Connection...');
  
  try {
    // Test basic connection
    const { data, error } = await supabase.from('user_profiles').select('count').limit(1);
    
    if (error) {
      console.error('❌ Supabase connection failed:', error);
      return false;
    }
    
    console.log('✅ Supabase connection successful');
    console.log('📊 Test query result:', data);
    return true;
    
  } catch (err) {
    console.error('❌ Supabase connection error:', err);
    return false;
  }
};

// Test user profile operations (Monarch Passport specific)
const testUserProfileOperations = async (userId = 'test-user-id') => {
  console.log('👤 Testing Monarch Passport User Profile Operations...');
  
  try {
    // Test reading user profile
    const { data: profile, error: readError } = await supabase
      .from('user_profiles')
      .select('*')
      .eq('id', userId)
      .single();
    
    if (readError && readError.code !== 'PGRST116') {
      console.error('❌ Error reading user profile:', readError);
      return false;
    }
    
    console.log('✅ User profile read test passed');
    console.log('📋 Profile data:', profile);
    
    // Test theme update (Monarch Passport core feature)
    const { data: updateData, error: updateError } = await supabase
      .from('user_profiles')
      .update({ 
        equipped_theme: 'solarShine',
        updated_at: new Date().toISOString()
      })
      .eq('id', userId)
      .select();
    
    if (updateError) {
      console.error('❌ Error updating user theme:', updateError);
      return false;
    }
    
    console.log('✅ Theme update test passed');
    console.log('🎨 Updated theme data:', updateData);
    
    return true;
    
  } catch (err) {
    console.error('❌ User profile operations error:', err);
    return false;
  }
};

// Test QR reward system (Monarch Passport core feature)
const testQRRewardSystem = async () => {
  console.log('📱 Testing Monarch Passport QR Reward System...');
  
  try {
    // Test rewards table access
    const { data: rewards, error: rewardsError } = await supabase
      .from('rewards')
      .select('*')
      .limit(5);
    
    if (rewardsError) {
      console.error('❌ Error accessing rewards table:', rewardsError);
      return false;
    }
    
    console.log('✅ Rewards table access successful');
    console.log('🎁 Available rewards:', rewards);
    
    // Test user closet table access
    const { data: closet, error: closetError } = await supabase
      .from('user_closet')
      .select('*')
      .limit(5);
    
    if (closetError) {
      console.error('❌ Error accessing user closet table:', closetError);
      return false;
    }
    
    console.log('✅ User closet table access successful');
    console.log('👕 Closet items:', closet);
    
    return true;
    
  } catch (err) {
    console.error('❌ QR reward system test error:', err);
    return false;
  }
};

// Test seasonal stamps (Monarch Passport feature)
const testSeasonalStamps = async () => {
  console.log('🌿 Testing Monarch Passport Seasonal Stamps...');
  
  try {
    const { data: stamps, error } = await supabase
      .from('seasonal_stamps')
      .select('*')
      .limit(5);
    
    if (error) {
      console.error('❌ Error accessing seasonal stamps:', error);
      return false;
    }
    
    console.log('✅ Seasonal stamps access successful');
    console.log('🌱 Seasonal stamps:', stamps);
    
    return true;
    
  } catch (err) {
    console.error('❌ Seasonal stamps test error:', err);
    return false;
  }
};

// Comprehensive test runner
const runMonarchPassportTests = async () => {
  console.log('🦋 Monarch Passport MVP - Comprehensive Supabase Test Suite');
  console.log('=' .repeat(60));
  
  const tests = [
    { name: 'Environment Variables', fn: testEnvironmentVariables },
    { name: 'Supabase Connection', fn: testSupabaseConnection },
    { name: 'User Profile Operations', fn: testUserProfileOperations },
    { name: 'QR Reward System', fn: testQRRewardSystem },
    { name: 'Seasonal Stamps', fn: testSeasonalStamps }
  ];
  
  const results = {};
  
  for (const test of tests) {
    console.log(`\n🧪 Running ${test.name} test...`);
    try {
      results[test.name] = await test.fn();
    } catch (err) {
      console.error(`❌ ${test.name} test failed with error:`, err);
      results[test.name] = false;
    }
  }
  
  console.log('\n📊 Test Results Summary:');
  console.log('=' .repeat(40));
  
  Object.entries(results).forEach(([testName, passed]) => {
    const status = passed ? '✅ PASS' : '❌ FAIL';
    console.log(`${status} ${testName}`);
  });
  
  const allPassed = Object.values(results).every(result => result);
  
  if (allPassed) {
    console.log('\n🎉 All Monarch Passport tests passed! Your Supabase setup is ready.');
  } else {
    console.log('\n⚠️ Some tests failed. Please check your configuration.');
  }
  
  return results;
};

// Browser console helper function
const monarchPassportTest = () => {
  console.log('🦋 Monarch Passport MVP Test Helper');
  console.log('Available functions:');
  console.log('- testEnvironmentVariables()');
  console.log('- testSupabaseConnection()');
  console.log('- testUserProfileOperations(userId)');
  console.log('- testQRRewardSystem()');
  console.log('- testSeasonalStamps()');
  console.log('- runMonarchPassportTests()');
  console.log('\nRun: runMonarchPassportTests() for full test suite');
};

// Make functions available globally for browser console
window.monarchPassportTest = monarchPassportTest;
window.testEnvironmentVariables = testEnvironmentVariables;
window.testSupabaseConnection = testSupabaseConnection;
window.testUserProfileOperations = testUserProfileOperations;
window.testQRRewardSystem = testQRRewardSystem;
window.testSeasonalStamps = testSeasonalStamps;
window.runMonarchPassportTests = runMonarchPassportTests;

// Auto-run helper
console.log('🦋 Monarch Passport MVP Test Script Loaded!');
console.log('Type: monarchPassportTest() to see available functions');
console.log('Type: runMonarchPassportTests() to run full test suite'); 