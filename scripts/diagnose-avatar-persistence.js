#!/usr/bin/env node

/**
 * Diagnostic script for avatar persistence issues
 */

const { createClient } = require('@supabase/supabase-js');

// Load environment variables
require('dotenv').config();

const supabase = createClient(
  process.env.REACT_APP_SUPABASE_URL,
  process.env.REACT_APP_SUPABASE_ANON_KEY
);

async function diagnoseAvatarPersistence() {
  console.log('🔍 Diagnosing avatar persistence issues...\n');

  try {
    // 1. Check if we can access user_profiles table
    console.log('1. Testing user_profiles table access...');
    const { data: profiles, error: profilesError } = await supabase
      .from('user_profiles')
      .select('id, email, username, avatar_url, display_name')
      .limit(5);
    
    if (profilesError) {
      console.error('❌ Error accessing user_profiles:', profilesError.message);
      return;
    }
    console.log('✅ user_profiles table accessible');
    console.log(`   Found ${profiles?.length || 0} profiles`);

    // 2. Check for profiles with avatar_url
    console.log('\n2. Checking profiles with avatar_url...');
    const profilesWithAvatar = profiles?.filter(p => p.avatar_url) || [];
    console.log(`   Profiles with avatar_url: ${profilesWithAvatar.length}`);
    
    if (profilesWithAvatar.length > 0) {
      console.log('   Sample avatar URLs:');
      profilesWithAvatar.slice(0, 3).forEach(profile => {
        console.log(`   - ${profile.email}: ${profile.avatar_url}`);
      });
    } else {
      console.log('   ⚠️  No profiles found with avatar_url');
    }

    // 3. Check storage bucket contents
    console.log('\n3. Checking avatars storage bucket...');
    const { data: storageFiles, error: storageError } = await supabase.storage
      .from('avatars')
      .list('', { limit: 10 });

    if (storageError) {
      console.error('❌ Error accessing storage:', storageError.message);
    } else {
      console.log('✅ avatars bucket accessible');
      console.log(`   Found ${storageFiles?.length || 0} files/folders`);
      
      if (storageFiles && storageFiles.length > 0) {
        console.log('   Sample storage items:');
        storageFiles.slice(0, 5).forEach(item => {
          console.log(`   - ${item.name} (${item.metadata?.size || 'unknown size'})`);
        });
      }
    }

    // 4. Test avatar URL accessibility
    console.log('\n4. Testing avatar URL accessibility...');
    if (profilesWithAvatar.length > 0) {
      const testProfile = profilesWithAvatar[0];
      console.log(`   Testing URL: ${testProfile.avatar_url}`);
      
      try {
        const response = await fetch(testProfile.avatar_url);
        if (response.ok) {
          console.log('   ✅ Avatar URL is accessible');
        } else {
          console.log(`   ❌ Avatar URL returned status: ${response.status}`);
        }
      } catch (fetchError) {
        console.log('   ❌ Avatar URL fetch failed:', fetchError.message);
      }
    } else {
      console.log('   ⚠️  No avatar URLs to test');
    }

    // 5. Check RLS policies for user_profiles
    console.log('\n5. Testing RLS policies...');
    const testUserId = profiles?.[0]?.id;
    if (testUserId) {
      const { data: testProfile, error: testError } = await supabase
        .from('user_profiles')
        .select('avatar_url')
        .eq('id', testUserId)
        .single();

      if (testError) {
        console.log('   ⚠️  RLS policy issue:', testError.message);
      } else {
        console.log('   ✅ RLS policies working for profile access');
      }
    }

    // 6. Check storage policies
    console.log('\n6. Testing storage policies...');
    const testBlob = new Blob(['test'], { type: 'text/plain' });
    const testFileName = `test-${Date.now()}.txt`;
    
    const { error: uploadTestError } = await supabase.storage
      .from('avatars')
      .upload(`test/${testFileName}`, testBlob, {
        cacheControl: '0',
        upsert: false
      });

    if (uploadTestError) {
      console.log('   ⚠️  Storage policy issue:', uploadTestError.message);
    } else {
      console.log('   ✅ Storage policies working');
      // Clean up test file
      await supabase.storage
        .from('avatars')
        .remove([`test/${testFileName}`]);
    }

    console.log('\n🎯 Diagnosis complete!');
    console.log('\n📋 Summary:');
    console.log(`   ✅ user_profiles table: ${profiles ? 'Accessible' : 'Failed'}`);
    console.log(`   ${profilesWithAvatar.length > 0 ? '✅' : '⚠️'} Profiles with avatars: ${profilesWithAvatar.length}`);
    console.log(`   ${storageFiles ? '✅' : '❌'} Storage bucket: ${storageFiles ? 'Accessible' : 'Failed'}`);
    console.log(`   ${storageFiles?.length > 0 ? '✅' : '⚠️'} Storage files: ${storageFiles?.length || 0}`);

    if (profilesWithAvatar.length === 0 && storageFiles?.length > 0) {
      console.log('\n🔧 Issue identified:');
      console.log('   Storage has files but profiles don\'t have avatar_url values');
      console.log('   This suggests the avatar upload is working but profile update is failing');
      console.log('\n💡 Possible solutions:');
      console.log('   1. Check if the avatar upload callback is working properly');
      console.log('   2. Verify the profile update in AvatarUpload.jsx');
      console.log('   3. Check if refreshProfile() is being called after upload');
    } else if (profilesWithAvatar.length > 0 && storageFiles?.length === 0) {
      console.log('\n🔧 Issue identified:');
      console.log('   Profiles have avatar_url but storage is empty');
      console.log('   This suggests storage files were deleted or moved');
    } else if (profilesWithAvatar.length > 0 && storageFiles?.length > 0) {
      console.log('\n✅ Avatar system appears to be working correctly');
      console.log('   The issue might be in the frontend display logic');
    }

  } catch (error) {
    console.error('❌ Diagnosis failed:', error.message);
  }
}

// Run the diagnosis
diagnoseAvatarPersistence(); 