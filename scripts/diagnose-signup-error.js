#!/usr/bin/env node

/**
 * Diagnostic script for signup database error
 */

const { createClient } = require('@supabase/supabase-js');

// Load environment variables
require('dotenv').config();

const supabase = createClient(
  process.env.REACT_APP_SUPABASE_URL,
  process.env.REACT_APP_SUPABASE_ANON_KEY
);

async function diagnoseSignupError() {
  console.log('🔍 Diagnosing signup database error...\n');

  try {
    // 1. Test basic database connection
    console.log('1. Testing database connection...');
    const { data: testData, error: testError } = await supabase
      .from('user_profiles')
      .select('id')
      .limit(1);
    
    if (testError) {
      console.error('❌ Database connection failed:', testError.message);
      return;
    }
    console.log('✅ Database connection successful');

    // 2. Check if user_profiles table has required columns
    console.log('\n2. Checking user_profiles table structure...');
    const { data: profileData, error: profileError } = await supabase
      .from('user_profiles')
      .select('id, email, username, full_name, display_name, avatar_url')
      .limit(1);
    
    if (profileError) {
      console.error('❌ Error accessing user_profiles:', profileError.message);
      return;
    }
    console.log('✅ user_profiles table accessible');

    // 3. Check if handle_new_user function exists
    console.log('\n3. Checking handle_new_user function...');
    const { data: functionData, error: functionError } = await supabase
      .rpc('handle_new_user', {})
      .catch(() => ({ data: null, error: { message: 'Function not found or not callable' } }));

    if (functionError) {
      console.log('⚠️  handle_new_user function issue:', functionError.message);
      console.log('💡 This suggests the trigger function needs to be updated');
    } else {
      console.log('✅ handle_new_user function exists');
    }

    // 4. Check for existing users with the test email
    console.log('\n4. Checking for existing users...');
    const testEmail = 'tedongwenyi@gmail.com';
    const { data: existingUsers, error: usersError } = await supabase
      .from('user_profiles')
      .select('id, email, username')
      .eq('email', testEmail);

    if (usersError) {
      console.error('❌ Error checking existing users:', usersError.message);
    } else {
      if (existingUsers && existingUsers.length > 0) {
        console.log('⚠️  Found existing users with test email:');
        existingUsers.forEach(user => {
          console.log(`   - ID: ${user.id}, Username: ${user.username}`);
        });
        console.log('💡 You may need to delete these users first');
      } else {
        console.log('✅ No existing users found with test email');
      }
    }

    // 5. Test manual user profile creation
    console.log('\n5. Testing manual profile creation...');
    const testUserId = process.env.TEST_USER_ID || '00000000-0000-0000-0000-000000000000'; // Test UUID
    const { data: insertData, error: insertError } = await supabase
      .from('user_profiles')
      .insert({
        id: testUserId,
        email: 'test@example.com',
        username: 'testuser',
        full_name: 'Test User',
        display_name: 'Test User',
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      })
      .select()
      .single();

    if (insertError) {
      console.error('❌ Manual profile creation failed:', insertError.message);
      console.log('💡 This indicates a table structure or permission issue');
    } else {
      console.log('✅ Manual profile creation successful');
      
      // Clean up test data
      await supabase
        .from('user_profiles')
        .delete()
        .eq('id', testUserId);
      console.log('✅ Test data cleaned up');
    }

    // 6. Check RLS policies
    console.log('\n6. Checking RLS policies...');
    const { data: policies, error: policiesError } = await supabase
      .from('user_profiles')
      .select('*')
      .limit(1);

    if (policiesError && policiesError.code === '42501') {
      console.log('⚠️  RLS policy issue detected:', policiesError.message);
      console.log('💡 Check Row Level Security policies for user_profiles table');
    } else if (policiesError) {
      console.log('⚠️  Other policy issue:', policiesError.message);
    } else {
      console.log('✅ RLS policies appear to be working');
    }

    console.log('\n🎯 Diagnosis complete!');
    console.log('\n📋 Summary:');
    console.log('   ✅ Database connection: Working');
    console.log('   ✅ user_profiles table: Accessible');
    console.log(`   ${functionError ? '❌' : '✅'} handle_new_user function: ${functionError ? 'Needs update' : 'Working'}`);
    console.log(`   ${existingUsers && existingUsers.length > 0 ? '⚠️' : '✅'} Existing users: ${existingUsers && existingUsers.length > 0 ? 'Found' : 'None'}`);
    console.log(`   ${insertError ? '❌' : '✅'} Manual creation: ${insertError ? 'Failed' : 'Working'}`);
    console.log(`   ${policiesError ? '⚠️' : '✅'} RLS policies: ${policiesError ? 'Issue detected' : 'Working'}`);

    if (functionError || insertError || policiesError) {
      console.log('\n🔧 Recommended fixes:');
      console.log('   1. Run the migration: supabase/migrations/06_fix_handle_new_user.sql');
      console.log('   2. Check Supabase dashboard for any error logs');
      console.log('   3. Verify RLS policies in Supabase dashboard');
    } else {
      console.log('\n🎉 Database appears to be working correctly!');
      console.log('   The issue might be in the frontend code or a temporary database issue.');
    }

  } catch (error) {
    console.error('❌ Diagnosis failed:', error.message);
  }
}

// Run the diagnosis
diagnoseSignupError(); 