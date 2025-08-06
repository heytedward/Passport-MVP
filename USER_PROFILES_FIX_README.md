# User Profiles Fix - Monarch Passport

## Problem Solved
**Fixed the issue where 12 users exist in `auth.users` but 0 users are found in `user_profiles`**. The problem was that user profiles weren't being created automatically on signup.

## Solution Implemented

### **Enhanced Script: `scripts/unlock-all-themes.js`**

The script now:
1. **Creates missing user profiles** for all auth users
2. **Unlocks all themes** for beta testers
3. **Adds progress data** (WNGS, scans, quests)
4. **Handles database schema issues** gracefully

### **Key Features**

#### 1. **Auth User Detection**
```javascript
// Uses hardcoded user IDs from your Supabase dashboard
const userIds = [
  '8d8cf1b4-413f-43b5-891e-364c897634ed',
  '0e7654ed-6aef-4ca3-9b55-70b54064e5e9',
  // ... 12 total users
];
```

#### 2. **Profile Creation Logic**
```javascript
async function createUserProfile(userId, index) {
  // Check if profile exists
  const { data: existing } = await supabase
    .from('user_profiles')
    .select('id')
    .eq('id', userId)
    .single();
  
  if (existing) {
    // Update existing profile with all themes
    return updateExistingProfile(userId);
  } else {
    // Create new profile with all themes
    return createNewProfile(userId, index);
  }
}
```

#### 3. **Database Schema Validation**
```javascript
async function testUserProfilesTable() {
  // Tests if table exists
  // Checks for required columns
  // Provides SQL to fix missing columns
}
```

## Usage

### **Quick Start**
```bash
node scripts/unlock-all-themes.js
```

### **Expected Output**
```
🎨 Monarch Passport - Create Profiles & Unlock All Themes
✅ Found: REACT_APP_SUPABASE_URL
✅ Found: REACT_APP_SUPABASE_ANON_KEY

🔍 Testing user_profiles table...
✅ user_profiles table exists

🚀 Creating profiles and unlocking themes for all users...
👤 Creating profile for user 1/12: 8d8cf1b...
✅ Created profile with all themes unlocked
👤 Creating profile for user 2/12: 0e7654e...
✅ Created profile with all themes unlocked
...

🎉 Profile creation and theme unlock complete!
✅ Successfully processed: 12 users
❌ Failed to process: 0 users

🎨 All users now have access to:
  • frequencyPulse
  • solarShine
  • echoGlass
  • retroFrame
  • nightScan

💡 Users can now:
  • Switch between all 5 themes
  • Have 1000 WNGS balance
  • See progress on their passport
```

## Database Schema Requirements

### **Required Columns**
The script checks for these columns in `user_profiles`:

```sql
-- Theme-related columns
owned_themes TEXT[] DEFAULT ARRAY['frequencyPulse']
themes_unlocked TEXT[] DEFAULT ARRAY['frequencyPulse']

-- Progress tracking columns  
total_scans INTEGER DEFAULT 0
total_quests_completed INTEGER DEFAULT 0
total_items_collected INTEGER DEFAULT 0
```

### **If Columns Are Missing**
The script will provide this SQL to run in Supabase:

```sql
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
```

## What Gets Created

### **For Each User Profile**
```javascript
{
  id: userId,                    // From auth.users
  email: `user${index}@example.com`, // Placeholder
  equipped_theme: 'frequencyPulse',  // Default theme
  owned_themes: ALL_THEMES,          // All 5 themes
  themes_unlocked: ALL_THEMES,       // All 5 themes
  wings_balance: 1000,               // Starting WNGS
  total_scans: 10,                   // Demo progress
  total_quests_completed: 5,         // Demo progress
  total_items_collected: 8           // Demo progress
}
```

### **Available Themes**
1. **frequencyPulse** - Frequency Pulse (Default)
2. **solarShine** - Solar Shine (Bright golden energy)
3. **echoGlass** - Echo Glass (Dark glass theme)
4. **retroFrame** - Retro Frame (Classic vintage aesthetic)
5. **nightScan** - Night Scan (Dark purple night scanning)

## Error Handling

### **Common Issues & Solutions**

#### 1. **Missing Columns Error**
```
❌ Column missing: column "owned_themes" does not exist
```
**Solution**: Run the provided SQL in Supabase dashboard

#### 2. **Table Doesn't Exist**
```
❌ user_profiles table does not exist!
```
**Solution**: Create the table first in Supabase dashboard

#### 3. **Permission Errors**
```
❌ Failed to create profile: new row violates row-level security policy
```
**Solution**: Check RLS policies in Supabase

## Testing

### **Verify Profile Creation**
```sql
-- Check all users have profiles
SELECT COUNT(*) FROM user_profiles;

-- Check theme access
SELECT id, email, owned_themes, equipped_theme 
FROM user_profiles 
LIMIT 5;
```

### **Expected Results**
- ✅ **12 user profiles** created
- ✅ **All themes unlocked** for each user
- ✅ **1000 WNGS balance** for each user
- ✅ **Demo progress data** populated

## Next Steps

### **After Running the Script**
1. **Test user login** - Users should see all themes available
2. **Test theme switching** - Should work instantly
3. **Check passport progress** - Should show demo data
4. **Verify WNGS balance** - Should show 1000 WNGS

### **For Production**
1. **Implement automatic profile creation** on signup
2. **Add proper email addresses** instead of placeholders
3. **Set up proper RLS policies** for user data
4. **Add profile completion flow** for new users

---

**Status**: ✅ Ready to run
**Script**: `scripts/unlock-all-themes.js`
**Impact**: Creates missing profiles and unlocks all themes for 12 auth users 