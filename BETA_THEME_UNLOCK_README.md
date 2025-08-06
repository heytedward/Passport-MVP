# Beta Theme Unlock Guide - Monarch Passport

## Overview
This guide shows you how to unlock all themes for your beta testers using two different methods.

## Method 1: Command Line Script (Recommended)

### Quick Commands

**Unlock all themes for ALL users:**
```bash
node scripts/unlock-all-themes.js all
```

**Unlock all themes for specific users by email:**
```bash
node scripts/unlock-all-themes.js specific user1@example.com user2@example.com
```

**Check themes for a specific user:**
```bash
node scripts/unlock-all-themes.js check <user_id>
```

**Show help:**
```bash
node scripts/unlock-all-themes.js
```

### Example Usage

```bash
# Unlock for all beta testers
node scripts/unlock-all-themes.js all

# Unlock for specific beta testers
node scripts/unlock-all-themes.js specific beta1@papillon.com beta2@papillon.com

# Check what themes a user has
node scripts/unlock-all-themes.js check 12345678-1234-1234-1234-123456789012
```

## Method 2: Admin Component in App

### Setup

1. **Add the component to your admin screen** (optional):
```javascript
// In AdminScreen.jsx or any admin page
import BetaThemeUnlocker from '../components/BetaThemeUnlocker';

// Add to your admin screen
<BetaThemeUnlocker />
```

2. **Access the component directly** by navigating to:
```
/admin/beta-themes
```

### Usage

1. **Login as admin** (email contains 'admin', 'papillon', or 'ted')
2. **Click "Fetch Users"** to load the user list
3. **Click "Unlock All Themes"** to unlock themes for all users
4. **Or click individual "Unlock" buttons** for specific users

## Available Themes

The following themes will be unlocked for beta testers:

1. **frequencyPulse** - Frequency Pulse (Default theme)
2. **solarShine** - Solar Shine (Bright golden energy)
3. **echoGlass** - Echo Glass (Dark glass theme)
4. **retroFrame** - Retro Frame (Classic vintage aesthetic)
5. **nightScan** - Night Scan (Dark purple night scanning)

## What Happens When You Unlock Themes

### Database Changes
- Updates `user_profiles.owned_themes` to include all 5 themes
- Sets `user_profiles.equipped_theme` to 'frequencyPulse' (default)

### User Experience
- Users will see all themes available in their Passport screen
- Users can switch between any of the 5 themes
- Theme changes are instant and persistent
- Works offline with localStorage fallback

## Verification

### Check via Script
```bash
# Check a specific user's themes
node scripts/unlock-all-themes.js check <user_id>
```

### Check via Database
```sql
-- Check user's owned themes
SELECT id, email, owned_themes, equipped_theme 
FROM user_profiles 
WHERE email = 'beta@example.com';
```

### Check via App
- User logs in and goes to Passport screen
- Should see all 5 themes available
- Can switch between themes instantly

## Troubleshooting

### Common Issues

**Script fails with "Missing environment variables"**
- Ensure `.env` file has `REACT_APP_SUPABASE_URL` and `REACT_APP_SUPABASE_ANON_KEY`
- Run from the project root directory

**"User not found" error**
- Check that the email address is correct
- Ensure the user has a profile in the `user_profiles` table

**"Access Denied" in admin component**
- Admin check looks for emails containing 'admin', 'papillon', or 'ted'
- Update the `isAdmin` logic in `BetaThemeUnlocker.jsx` if needed

**Themes not showing up for users**
- Users may need to refresh the page
- Check browser console for any errors
- Verify the `owned_themes` array in the database

### Database Schema Requirements

Ensure your `user_profiles` table has these columns:
```sql
- id (primary key)
- email (text)
- owned_themes (array of text)
- equipped_theme (text)
```

## Security Notes

- The script uses the anon key, so it respects RLS policies
- Only users with proper permissions can update profiles
- Admin component checks for admin email patterns
- All operations are logged for audit purposes

## Performance Considerations

- Script processes users one by one with 100ms delays
- Admin component limits to 50 users at a time
- Large user bases may take several minutes to process
- Consider running during off-peak hours

## Rollback

If you need to remove theme access:

```bash
# Reset a user to default themes only
node scripts/reset-themes.js specific user@example.com
```

Or manually update the database:
```sql
UPDATE user_profiles 
SET owned_themes = ARRAY['frequencyPulse'], 
    equipped_theme = 'frequencyPulse' 
WHERE email = 'user@example.com';
```

## Next Steps

1. **Test the script** with a few beta testers first
2. **Monitor user feedback** on theme availability
3. **Check theme switching performance** with the new timeout protection
4. **Consider adding theme analytics** to track usage

---

**Status**: ✅ Ready for beta testing
**Date**: [Current Date]
**Version**: Monarch Passport MVP 