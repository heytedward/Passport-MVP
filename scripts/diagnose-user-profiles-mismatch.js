#!/usr/bin/env node

/**
 * Diagnostic script to identify mismatch between auth users and user_profiles
 */

const { createClient } = require('@supabase/supabase-js');

// Load environment variables
require('dotenv').config();

const supabase = createClient(
  process.env.REACT_APP_SUPABASE_URL,
  process.env.REACT_APP_SUPABASE_ANON_KEY
);

async function diagnoseUserProfilesMismatch() {
  console.log('🔍 Diagnosing user profiles mismatch...\n');

  try {
    // 1. Check auth users count
    console.log('1. Checking auth users...');
    
    // Note: We can't directly query auth.users with anon key, but we can check profiles
    // and see what the mismatch is
    
    // 2. Check user_profiles count
    console.log('2. Checking user_profiles...');
    const { data: profiles, error: profilesError } = await supabase
      .from('user_profiles')
      .select('id, email, username, created_at')
      .order('created_at', { ascending: false });
    
    if (profilesError) {
      console.error('❌ Error accessing user_profiles:', profilesError.message);
      return;
    }

    console.log(`   Found ${profiles?.length || 0} profiles in user_profiles table`);
    
    if (profiles && profiles.length > 0) {
      console.log('   Recent profiles:');
      profiles.slice(0, 5).forEach(profile => {
        console.log(`   - ${profile.email} (${profile.username}) - ${profile.created_at}`);
      });
    }

    // 3. Check storage files to see if they match any profiles
    console.log('\n3. Checking storage files...');
    const { data: storageFiles, error: storageError } = await supabase.storage
      .from('avatars')
      .list('', { limit: 20 });

    if (storageError) {
      console.error('❌ Error accessing storage:', storageError.message);
    } else {
      console.log(`   Found ${storageFiles?.length || 0} files in avatars bucket`);
      
      if (storageFiles && storageFiles.length > 0) {
        console.log('   Storage files:');
        storageFiles.forEach(file => {
          console.log(`   - ${file.name}`);
        });
      }
    }

    // 4. Try to get current user session to understand the context
    console.log('\n4. Checking current session...');
    const { data: { session }, error: sessionError } = await supabase.auth.getSession();
    
    if (sessionError) {
      console.error('❌ Session error:', sessionError.message);
    } else if (session?.user) {
      console.log('✅ Current user session:');
      console.log(`   User ID: ${session.user.id}`);
      console.log(`   Email: ${session.user.email}`);
      console.log(`   Created: ${session.user.created_at}`);
      
      // Check if this user has a profile
      const { data: userProfile, error: userProfileError } = await supabase
        .from('user_profiles')
        .select('*')
        .eq('id', session.user.id)
        .single();

      if (userProfileError) {
        console.log('   ❌ No profile found for current user');
      } else {
        console.log('   ✅ Profile found for current user');
        console.log(`   Username: ${userProfile.username}`);
        console.log(`   Avatar: ${userProfile.avatar_url || 'None'}`);
      }
    } else {
      console.log('⚠️  No active session');
    }

    // 5. Check for any orphaned storage files
    console.log('\n5. Checking for orphaned storage files...');
    if (storageFiles && profiles) {
      const profileIds = profiles.map(p => p.id);
      const orphanedFiles = storageFiles.filter(file => {
        // Check if the file name contains a user ID that doesn't have a profile
        return !profileIds.some(profileId => file.name.includes(profileId));
      });
      
      if (orphanedFiles.length > 0) {
        console.log(`   Found ${orphanedFiles.length} orphaned files:`);
        orphanedFiles.forEach(file => {
          console.log(`   - ${file.name}`);
        });
      } else {
        console.log('   ✅ No orphaned files found');
      }
    }

    console.log('\n🎯 Diagnosis complete!');
    console.log('\n📋 Summary:');
    console.log(`   📊 Supabase dashboard shows: 12 users`);
    console.log(`   📊 user_profiles table has: ${profiles?.length || 0} profiles`);
    console.log(`   📊 Storage bucket has: ${storageFiles?.length || 0} files`);
    
    if (profiles && profiles.length < 12) {
      console.log('\n🔧 Issue identified:');
      console.log('   There are 12 auth users but only', profiles.length, 'profiles');
      console.log('   This means some users don\'t have corresponding profile records');
      console.log('\n💡 Solution:');
      console.log('   Run the profile creation migration to create profiles for missing users');
    } else if (profiles && profiles.length === 12) {
      console.log('\n✅ All users have profiles!');
      console.log('   The issue might be with the dashboard display or RLS policies');
    }

  } catch (error) {
    console.error('❌ Diagnosis failed:', error.message);
  }
}

// Run the diagnosis
diagnoseUserProfilesMismatch(); 