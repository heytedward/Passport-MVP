#!/usr/bin/env node

/**
 * Setup script for avatar system
 * This script helps set up the database and storage for avatar functionality
 */

const { createClient } = require('@supabase/supabase-js');

// Load environment variables
require('dotenv').config();

const supabase = createClient(
  process.env.REACT_APP_SUPABASE_URL,
  process.env.REACT_APP_SUPABASE_ANON_KEY
);

async function setupAvatarSystem() {
  console.log('🦋 Setting up Monarch Passport Avatar System...\n');

  try {
    // 1. Test database connection
    console.log('1. Testing database connection...');
    const { data: testData, error: testError } = await supabase
      .from('user_profiles')
      .select('id')
      .limit(1);
    
    if (testError) {
      console.error('❌ Database connection failed:', testError.message);
      console.log('\n💡 Please ensure:');
      console.log('   - Your Supabase URL and anon key are correct');
      console.log('   - The user_profiles table exists');
      console.log('   - RLS policies are properly configured');
      return;
    }
    console.log('✅ Database connection successful');

    // 2. Check if avatar_url column exists
    console.log('\n2. Checking for avatar_url column...');
    const { data: columns, error: columnsError } = await supabase
      .rpc('get_table_columns', { table_name: 'user_profiles' })
      .catch(() => ({ data: null, error: { message: 'Function not available' } }));

    if (columnsError) {
      console.log('⚠️  Cannot check columns automatically');
      console.log('💡 Please run the migration manually:');
      console.log('   - Go to your Supabase dashboard');
      console.log('   - Navigate to SQL Editor');
      console.log('   - Run the migration from: supabase/migrations/05_add_avatar_url.sql');
    } else {
      const hasAvatarUrl = columns?.some(col => col.column_name === 'avatar_url');
      if (hasAvatarUrl) {
        console.log('✅ avatar_url column exists');
      } else {
        console.log('❌ avatar_url column missing');
        console.log('💡 Please run the migration: supabase/migrations/05_add_avatar_url.sql');
      }
    }

    // 3. Test storage connection
    console.log('\n3. Testing storage connection...');
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

    // 4. Test storage policies
    console.log('\n4. Testing storage policies...');
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

    console.log('\n🎉 Avatar system setup complete!');
    console.log('\n📋 Next steps:');
    console.log('   1. Run the database migration if needed');
    console.log('   2. Create the avatars storage bucket if needed');
    console.log('   3. Test the avatar upload functionality');

  } catch (error) {
    console.error('❌ Setup failed:', error.message);
    console.log('\n💡 Please check your configuration and try again');
  }
}

// Run the setup
setupAvatarSystem(); 