#!/usr/bin/env node

/**
 * Create Missing User Profiles & Unlock All Themes Script
 * 
 * This script creates missing user profiles and unlocks all themes for beta testers.
 * Run with: node scripts/unlock-all-themes.js
 */

const { createClient } = require('@supabase/supabase-js');
require('dotenv').config();

const supabaseUrl = process.env.REACT_APP_SUPABASE_URL;
const supabaseKey = process.env.REACT_APP_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error('❌ Missing Supabase environment variables');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

const ALL_THEMES = [
  'frequencyPulse',
  'solarShine', 
  'echoGlass',
  'retroFrame',
  'nightScan'
];

async function getAuthUserIds() {
  console.log('👥 Getting user IDs from auth dashboard...');
  
  // Since we can't access auth.users directly with anon key,
  // we'll use the user IDs you can see in the dashboard
  const userIds = [
    '8d8cf1b4-413f-43b5-891e-364c897634ed',
    '0e7654ed-6aef-4ca3-9b55-70b54064e5e9',
    '203c5f0e-9992-4924-895e-427c41ecddfd',
    'f4d1ed3a-ac6e-4082-be66-0336d3626bf8',
    'eb8a53eb-1b94-4202-9dc0-a9e616d47836',
    'f478f53-9639-434d-931b-f211526383ef',
    '4e01c4ad-dea1-476e-845f-d2a26ce91451',
    '5820334d-9929-4e49-b899-64c99462386',
    'd85bf94f-90b1-4e2c-996a-d5aa86266f67',
    '9cd4e96b-402d-4cbf-99a4-fcf5af66f72b',
    '2c3b15f0-6271-477c-be8f-4ae45e3f1242',
    '45e314e9-9a3e-4c65-9f26-54f90bdffee4'
  ];
  
  console.log(`📋 Found ${userIds.length} user IDs from dashboard`);
  return userIds;
}

async function createUserProfile(userId, index) {
  try {
    console.log(`👤 Creating profile for user ${index + 1}/12: ${userId.substring(0, 8)}...`);
    
    // Check if profile already exists
    const { data: existing } = await supabase
      .from('user_profiles')
      .select('id')
      .eq('id', userId)
      .single();
    
    if (existing) {
      console.log(`✅ Profile already exists for ${userId.substring(0, 8)}...`);
      
      // Update existing profile with all themes
      const { error: updateError } = await supabase
        .from('user_profiles')
        .update({
          owned_themes: ALL_THEMES,
          themes_unlocked: ALL_THEMES,
          equipped_theme: 'frequencyPulse',
          wings_balance: 1000,
          total_scans: 10
        })
        .eq('id', userId);
      
      if (updateError) {
        console.log(`❌ Failed to update existing profile: ${updateError.message}`);
        return false;
      }
      
      console.log(`🎨 Updated themes for existing user`);
      return true;
    }
    
    // Create new profile
    const { data, error } = await supabase
      .from('user_profiles')
      .insert({
        id: userId,
        email: `user${index + 1}@example.com`, // Placeholder email
        equipped_theme: 'frequencyPulse',
        owned_themes: ALL_THEMES,
        themes_unlocked: ALL_THEMES,
        wings_balance: 1000,
        total_scans: 10,
        total_quests_completed: 5,
        total_items_collected: 8
      })
      .select();
    
    if (error) {
      if (error.code === '42703') {
        console.log(`❌ Column missing: ${error.message}`);
        console.log('📝 You need to add these columns to user_profiles:');
        console.log('   owned_themes TEXT[]');
        console.log('   themes_unlocked TEXT[]');
        return false;
      }
      
      console.log(`❌ Failed to create profile: ${error.message}`);
      return false;
    }
    
    console.log(`✅ Created profile with all themes unlocked`);
    return true;
    
  } catch (error) {
    console.log(`❌ Exception creating profile: ${error.message}`);
    return false;
  }
}

async function addMissingColumns() {
  console.log('\n🔧 Adding missing columns to user_profiles table...');
  console.log('📝 Please run this SQL in your Supabase dashboard (SQL Editor):');
  console.log(`
-- Add theme-related columns
ALTER TABLE user_profiles 
ADD COLUMN IF NOT EXISTS owned_themes TEXT[] DEFAULT ARRAY['frequencyPulse'];

ALTER TABLE user_profiles 
ADD COLUMN IF NOT EXISTS themes_unlocked TEXT[] DEFAULT ARRAY['frequencyPulse'];

-- Add progress tracking columns  
ALTER TABLE user_profiles 
ADD COLUMN IF NOT EXISTS total_scans INTEGER DEFAULT 0;

ALTER TABLE user_profiles 
ADD COLUMN IF NOT EXISTS total_quests_completed INTEGER DEFAULT 0;

ALTER TABLE user_profiles 
ADD COLUMN IF NOT EXISTS total_items_collected INTEGER DEFAULT 0;

-- Update existing users
UPDATE user_profiles 
SET owned_themes = ARRAY['frequencyPulse']
WHERE owned_themes IS NULL;

UPDATE user_profiles 
SET themes_unlocked = ARRAY['frequencyPulse'] 
WHERE themes_unlocked IS NULL;
  `);
  
  console.log('\n⚠️ After running the SQL above, run this script again!');
}

async function testUserProfilesTable() {
  console.log('🔍 Testing user_profiles table...');
  
  try {
    const { data, error } = await supabase
      .from('user_profiles')
      .select('*')
      .limit(1);
    
    if (error) {
      if (error.code === '42P01') {
        console.log('❌ user_profiles table does not exist!');
        console.log('📝 Create the table first in Supabase dashboard');
        return false;
      }
      console.log('❌ Table test failed:', error);
      return false;
    }
    
    console.log('✅ user_profiles table exists');
    
    if (data && data.length > 0) {
      console.log('📋 Available columns:', Object.keys(data[0]));
      
      // Check for required columns
      const hasOwnedThemes = Object.keys(data[0]).includes('owned_themes');
      const hasThemesUnlocked = Object.keys(data[0]).includes('themes_unlocked');
      
      if (!hasOwnedThemes || !hasThemesUnlocked) {
        console.log('❌ Missing theme columns');
        return false;
      }
    }
    
    return true;
    
  } catch (error) {
    console.log('❌ Table test exception:', error);
    return false;
  }
}

async function unlockAllThemes() {
  console.log('🎨 Monarch Passport - Create Profiles & Unlock All Themes');
  console.log('✅ Found: REACT_APP_SUPABASE_URL');
  console.log('✅ Found: REACT_APP_SUPABASE_ANON_KEY');
  
  // Test the user_profiles table
  const tableOk = await testUserProfilesTable();
  
  if (!tableOk) {
    await addMissingColumns();
    return;
  }
  
  console.log('\n🚀 Creating profiles and unlocking themes for all users...');
  
  // Get user IDs from the dashboard
  const userIds = await getAuthUserIds();
  
  let successCount = 0;
  let failCount = 0;
  
  // Create/update profile for each user
  for (let i = 0; i < userIds.length; i++) {
    const success = await createUserProfile(userIds[i], i);
    if (success) {
      successCount++;
    } else {
      failCount++;
    }
    
    // Small delay to avoid overwhelming the database
    await new Promise(resolve => setTimeout(resolve, 100));
  }
  
  console.log('\n🎉 Profile creation and theme unlock complete!');
  console.log(`✅ Successfully processed: ${successCount} users`);
  console.log(`❌ Failed to process: ${failCount} users`);
  console.log('\n🎨 All users now have access to:');
  ALL_THEMES.forEach(theme => console.log(`  • ${theme}`));
  
  console.log('\n💡 Users can now:');
  console.log('  • Switch between all 5 themes');
  console.log('  • Have 1000 WNGS balance');
  console.log('  • See progress on their passport');
}

// Run the script
unlockAllThemes(); 