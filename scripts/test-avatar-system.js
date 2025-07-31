#!/usr/bin/env node

/**
 * Simple test script for avatar system
 */

const { createClient } = require('@supabase/supabase-js');

// Load environment variables
require('dotenv').config();

const supabase = createClient(
  process.env.REACT_APP_SUPABASE_URL,
  process.env.REACT_APP_SUPABASE_ANON_KEY
);

async function testAvatarSystem() {
  console.log('🦋 Testing Monarch Passport Avatar System...\n');

  try {
    // 1. Test database connection and check for avatar_url column
    console.log('1. Testing database connection...');
    const { data: testData, error: testError } = await supabase
      .from('user_profiles')
      .select('id, avatar_url, display_name')
      .limit(1);
    
    if (testError) {
      console.error('❌ Database connection failed:', testError.message);
      return;
    }
    console.log('✅ Database connection successful');
    console.log('✅ avatar_url and display_name columns are accessible');

    // 2. Test storage connection
    console.log('\n2. Testing storage connection...');
    const { data: buckets, error: bucketsError } = await supabase.storage.listBuckets();
    
    if (bucketsError) {
      console.error('❌ Storage connection failed:', bucketsError.message);
      console.log('\n💡 Please ensure:');
      console.log('   - Storage is enabled in your Supabase project');
      console.log('   - Storage policies are configured');
      return;
    }

    const avatarsBucket = buckets?.find(bucket => bucket.name === 'avatars');
    if (avatarsBucket) {
      console.log('✅ avatars bucket exists');
    } else {
      console.log('❌ avatars bucket missing');
      console.log('💡 Please create the avatars bucket:');
      console.log('   - Go to your Supabase dashboard');
      console.log('   - Navigate to Storage');
      console.log('   - Create a new bucket named "avatars"');
      console.log('   - Set it to public access');
      console.log('   - Allow image/* MIME types');
    }

    // 3. Test storage policies
    console.log('\n3. Testing storage policies...');
    const testBlob = new Blob(['test'], { type: 'text/plain' });
    const testFileName = `test-${Date.now()}.txt`;
    
    const { error: uploadError } = await supabase.storage
      .from('avatars')
      .upload(`test/${testFileName}`, testBlob, {
        cacheControl: '0',
        upsert: false
      });

    if (uploadError) {
      console.error('❌ Storage upload test failed:', uploadError.message);
      console.log('\n💡 Please check storage policies');
    } else {
      console.log('✅ Storage policies working');
      // Clean up test file
      await supabase.storage
        .from('avatars')
        .remove([`test/${testFileName}`]);
    }

    console.log('\n🎉 Avatar system test complete!');
    console.log('\n📋 Status:');
    console.log('   ✅ Database connection: Working');
    console.log('   ✅ avatar_url column: Available');
    console.log('   ✅ display_name column: Available');
    console.log(`   ${avatarsBucket ? '✅' : '❌'} avatars bucket: ${avatarsBucket ? 'Exists' : 'Missing'}`);
    console.log(`   ${!uploadError ? '✅' : '❌'} Storage policies: ${!uploadError ? 'Working' : 'Failed'}`);

    if (!avatarsBucket || uploadError) {
      console.log('\n🔧 To fix remaining issues:');
      if (!avatarsBucket) {
        console.log('   1. Create avatars storage bucket in Supabase dashboard');
      }
      if (uploadError) {
        console.log('   2. Check storage policies in Supabase dashboard');
      }
    } else {
      console.log('\n🎯 Avatar system is ready! You can now test uploading profile pictures.');
    }

  } catch (error) {
    console.error('❌ Test failed:', error.message);
  }
}

// Run the test
testAvatarSystem(); 