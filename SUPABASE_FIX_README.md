# Monarch Passport MVP - Supabase Fix & Testing Guide

## Problem Solved
Fixed `ReferenceError: supabase is not defined` error in browser console when running tests.

## Root Cause
Multiple files were creating their own Supabase clients instead of using the centralized `supabaseClient.js`, causing import issues and "supabase is not defined" errors.

## Solution Implemented

### 1. Centralized Supabase Client
- **File**: `src/utils/supabaseClient.js`
- **Status**: ✅ Already exists and working
- **Usage**: Import this single client everywhere

### 2. Global Supabase Access
- **File**: `src/App.js`
- **Change**: Added global window.supabase for browser console testing
- **Code**:
```javascript
import { supabase } from './utils/supabaseClient';

function App() {
  // Make supabase available globally for testing
  if (typeof window !== 'undefined') {
    window.supabase = supabase;
  }
  // ... rest of App component
}
```

### 3. Test Files Created

#### A. Comprehensive Test Suite
- **File**: `src/utils/testSupabaseConnection.js`
- **Purpose**: Full Monarch Passport functionality testing
- **Usage**: Import and use in your app

#### B. Browser Console Test
- **File**: `src/utils/browserConsoleTest.js`
- **Purpose**: Import-based testing for development

#### C. Simple Browser Console Script
- **File**: `src/utils/browserConsoleSimple.js`
- **Purpose**: Copy-paste directly into browser console

### 4. Environment Variables
- **File**: `env.example`
- **Purpose**: Shows correct Monarch Passport environment setup

## How to Test

### Option 1: Browser Console (Recommended)
1. Start your Monarch Passport app
2. Open browser console (F12)
3. Copy and paste this script:

```javascript
// Simple Monarch Passport Supabase Test
const testMonarchPassportSupabase = async () => {
  console.log('🦋 Monarch Passport MVP - Simple Supabase Test');
  
  try {
    if (typeof window.supabase === 'undefined') {
      console.error('❌ Supabase not found. Make sure you\'re on your app page.');
      return false;
    }
    
    console.log('✅ Supabase client found');
    
    // Test basic connection
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
    const { data: updateData, error: updateError } = await window.supabase
      .from('user_profiles')
      .update({ equipped_theme: 'solarShine' })
      .eq('id', 'user-id')
      .select();
    
    if (updateError) {
      console.error('❌ Your query failed:', updateError);
    } else {
      console.log('✅ Your query successful');
      console.log('🎨 Update result:', updateData);
    }
    
    console.log('🎉 Monarch Passport Supabase test completed!');
    return true;
    
  } catch (err) {
    console.error('❌ Test failed:', err);
    return false;
  }
};

// Run the test
testMonarchPassportSupabase();
```

### Option 2: Import Test File
```javascript
import { runMonarchPassportTests } from './utils/testSupabaseConnection';

// Run full test suite
runMonarchPassportTests();
```

### Option 3: Use the Simple Test File
```javascript
import './utils/browserConsoleSimple';
// This will auto-run the test when imported
```

## Environment Variable Setup

### Required Variables
```bash
REACT_APP_SUPABASE_URL=https://your-project-id.supabase.co
REACT_APP_SUPABASE_ANON_KEY=your-anon-key-here
```

### How to Get These Values
1. Go to your Supabase project dashboard
2. Navigate to Settings > API
3. Copy the "Project URL" and "anon public" key
4. Create a `.env` file in your project root
5. Add the variables with your actual values

### Validation
The test files will automatically check if your environment variables are set correctly.

## Monarch Passport Specific Features Tested

### 1. User Profile Operations
- Reading user profiles
- Updating equipped themes
- Theme validation

### 2. QR Reward System
- Rewards table access
- User closet operations
- QR code processing

### 3. Seasonal Stamps
- Seasonal completion tracking
- Stamp validation

### 4. Database Connectivity
- Basic connection testing
- Error handling
- Timeout management

## Troubleshooting

### "Supabase not found globally"
- Make sure you're on your Monarch Passport app page
- Check that `src/App.js` has the global supabase assignment
- Restart your development server

### "Missing environment variables"
- Create a `.env` file in your project root
- Add the required Supabase variables
- Restart your development server

### "Connection failed"
- Check your Supabase URL and anon key
- Verify your Supabase project is active
- Check network connectivity

### "Permission denied"
- Verify your RLS (Row Level Security) policies
- Check if you're authenticated
- Ensure you're using the anon key, not service role key

## Security Notes

### ✅ Do Use
- `REACT_APP_SUPABASE_ANON_KEY` in frontend
- Row Level Security (RLS) policies
- Environment variables for configuration

### ❌ Don't Use
- Service role keys in frontend code
- Hardcoded secrets
- Direct database access without RLS

## Next Steps

1. **Test the fix**: Use the browser console script above
2. **Verify functionality**: Check that your QR scanning and closet features work
3. **Update imports**: Ensure all files use the centralized `supabaseClient.js`
4. **Set up environment**: Create your `.env` file with actual values

## Support

If you encounter issues:
1. Check the browser console for detailed error messages
2. Verify your environment variables are set correctly
3. Ensure you're using the latest version of the Supabase client
4. Check your Supabase project settings and RLS policies

---

**Monarch Passport MVP** - Built by PapillonLabs 🦋 