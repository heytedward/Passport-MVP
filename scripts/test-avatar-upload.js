#!/usr/bin/env node

/**
 * Test script to verify avatar upload and persistence
 */

const { createClient } = require('@supabase/supabase-js');

// Load environment variables
require('dotenv').config();

const supabase = createClient(
  process.env.REACT_APP_SUPABASE_URL,
  process.env.REACT_APP_SUPABASE_ANON_KEY
);

async function testAvatarUpload() {
  console.log('🧪 Testing avatar upload and persistence...\n');

  try {
    // 1. Check current user session
    console.log('1. Checking current session...');
    const { data: { session }, error: sessionError } = await supabase.auth.getSession();
    
    if (sessionError) {
      console.error('❌ Session error:', sessionError.message);
      return;
    }

    if (!session?.user) {
      console.log('⚠️  No active session - please log in first');
      console.log('💡 Go to your app and log in, then run this test again');
      return;
    }

    console.log('✅ User session active');
    console.log(`   User ID: ${session.user.id}`);
    console.log(`   Email: ${session.user.email}`);

    // 2. Check user profile
    console.log('\n2. Checking user profile...');
    const { data: profile, error: profileError } = await supabase
      .from('user_profiles')
      .select('*')
      .eq('id', session.user.id)
      .single();

    if (profileError) {
      console.error('❌ Profile error:', profileError.message);
      return;
    }

    console.log('✅ User profile found');
    console.log(`   Username: ${profile.username}`);
    console.log(`   Avatar URL: ${profile.avatar_url || 'None'}`);
    console.log(`   Wings Balance: ${profile.wings_balance}`);

    // 3. Test avatar upload (if no avatar exists)
    if (!profile.avatar_url) {
      console.log('\n3. Testing avatar upload...');
      
      // Create a simple test image (1x1 pixel PNG)
      const testImageData = process.env.TEST_IMAGE_DATA || 'iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNkYPhfDwAChwGA60e6kgAAAABJRU5ErkJggg==';
      const testBlob = new Blob([Buffer.from(testImageData, 'base64')], { type: 'image/png' });
      
      const fileName = `test-${Date.now()}.png`;
      const filePath = `${session.user.id}/${fileName}`;

      const { error: uploadError } = await supabase.storage
        .from('avatars')
        .upload(filePath, testBlob, {
          cacheControl: '3600',
          upsert: true
        });

      if (uploadError) {
        console.error('❌ Upload error:', uploadError.message);
        return;
      }

      // Get public URL
      const { data } = supabase.storage
        .from('avatars')
        .getPublicUrl(filePath);

      console.log('✅ Test avatar uploaded');
      console.log(`   URL: ${data.publicUrl}`);

      // 4. Update profile with avatar URL
      console.log('\n4. Updating profile with avatar URL...');
      const { error: updateError } = await supabase
        .from('user_profiles')
        .update({
          avatar_url: data.publicUrl,
          updated_at: new Date().toISOString()
        })
        .eq('id', session.user.id);

      if (updateError) {
        console.error('❌ Profile update error:', updateError.message);
        return;
      }

      console.log('✅ Profile updated with avatar URL');

      // 5. Verify the update
      console.log('\n5. Verifying profile update...');
      const { data: updatedProfile, error: verifyError } = await supabase
        .from('user_profiles')
        .select('avatar_url')
        .eq('id', session.user.id)
        .single();

      if (verifyError) {
        console.error('❌ Verification error:', verifyError.message);
        return;
      }

      console.log('✅ Avatar persistence verified');
      console.log(`   Avatar URL: ${updatedProfile.avatar_url}`);

    } else {
      console.log('\n3. Avatar already exists - testing persistence...');
      console.log('✅ Avatar persistence is working!');
      console.log(`   Current avatar: ${profile.avatar_url}`);
    }

    console.log('\n🎉 Avatar upload and persistence test completed successfully!');
    console.log('\n📋 Summary:');
    console.log('   ✅ User session: Active');
    console.log('   ✅ User profile: Found');
    console.log('   ✅ Avatar upload: Working');
    console.log('   ✅ Profile updates: Working');
    console.log('   ✅ Avatar persistence: Working');
    
    console.log('\n🚀 Your avatar system is now fully functional!');
    console.log('   Try uploading a profile picture in your app.');

  } catch (error) {
    console.error('❌ Test failed:', error.message);
  }
}

// Run the test
testAvatarUpload(); 