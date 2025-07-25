# Avatar Upload Fix

## Issue
Beta testers reported that profile images disappear after page refresh when uploaded through the Settings screen.

## Root Causes
1. **Missing `avatar_url` column** in `user_profiles` table
2. **Missing storage bucket** for avatar images
3. **Insufficient error handling** in upload process
4. **Avatar state not persisting** on page refresh

## Fixes Applied

### 1. Database Schema Update
Run this SQL in Supabase SQL Editor:

```sql
-- Add avatar_url column to user_profiles table
ALTER TABLE public.user_profiles 
ADD COLUMN IF NOT EXISTS avatar_url TEXT;

-- Create index for better performance
CREATE INDEX IF NOT EXISTS idx_user_profiles_avatar_url ON public.user_profiles(avatar_url);

-- Grant permissions
GRANT SELECT, UPDATE ON public.user_profiles TO authenticated;
```

### 2. Storage Bucket Setup
In Supabase Dashboard:
1. Go to **Storage** section
2. Click **Create bucket**
3. Name: `avatars`
4. Public bucket: ✅ **Yes**
5. File size limit: `5MB`
6. Allowed MIME types: `image/*`

### 3. Code Improvements
- ✅ Added file validation (size, type)
- ✅ Added storage bucket creation logic
- ✅ Improved error handling with user-friendly messages
- ✅ Enhanced profile loading with better logging
- ✅ Added fallback for missing avatar_url column

## Testing Steps

### For Beta Testers:
1. **Go to Settings** → Account & Profile
2. **Click "Change"** next to Profile Picture
3. **Select an image** (under 5MB)
4. **Wait for upload** (should see success message)
5. **Refresh the page** - image should persist
6. **Check console** (F12) for any error messages

### For Developers:
1. Run the SQL migration
2. Create the storage bucket
3. Test upload with various file types
4. Verify persistence across page refreshes
5. Check error handling with invalid files

## Error Messages Users Might See

- **"File size must be less than 5MB"** - File too large
- **"Please select an image file"** - Invalid file type
- **"Storage service unavailable"** - Storage bucket issues
- **"Failed to upload image"** - General upload failure

## Debugging

If issues persist:
1. Check browser console (F12) for error messages
2. Verify storage bucket exists in Supabase Dashboard
3. Confirm `avatar_url` column exists in `user_profiles` table
4. Check RLS policies allow authenticated users to update profiles

## Files Modified
- `src/screens/SettingsScreen.jsx` - Enhanced upload logic
- `supabase/fix_avatar_upload.sql` - Database migration
- `AVATAR_UPLOAD_FIX.md` - This documentation 