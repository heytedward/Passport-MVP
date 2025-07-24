# 🗄️ Database Setup Instructions for Monarch Passport MVP

## Overview

This guide will help you replace all mock data with real Supabase database connections for the Monarch Passport MVP. After following these steps, your users will be able to:

- ✅ See real quest progress based on their actual activities
- ✅ View empty states when they haven't started collecting yet
- ✅ Track real QR scan progress, social shares, and daily completions
- ✅ Earn real WINGS rewards that persist in the database

## Quick Setup (5 minutes)

### Step 1: Run the Quest System SQL

1. Open your Supabase dashboard
2. Go to the SQL Editor
3. Copy and paste the contents of `supabase/create_quest_system.sql`
4. Click "Run" to execute the SQL

This will create:
- `quest_progress` table - tracks user progress on each quest
- `user_stats` table - aggregated statistics for quest calculations
- Helper functions for quest management
- Proper RLS policies

### Step 2: Verify Tables Created

Run this query in your Supabase SQL Editor to verify:

```sql
SELECT table_name 
FROM information_schema.tables 
WHERE table_schema = 'public' 
AND table_name IN ('quest_progress', 'user_stats', 'user_activity', 'user_closet', 'daily_completions');
```

You should see all 5 tables listed.

### Step 3: Deploy the Updated Code

The following files have been updated to use real database connections:

- ✅ `src/hooks/useQuests.js` - NEW: Real quest data hook
- ✅ `src/screens/QuestsScreen.jsx` - Now uses real quest progress
- ✅ `src/screens/ClosetScreen.jsx` - Removed mock data fallbacks
- ✅ `src/components/RecentActivityModal.jsx` - Removed mock data fallbacks
- ✅ `src/screens/HomeScreen.jsx` - Now shows real quest progress

Simply deploy these updated files to your hosting platform (Vercel).

## What Changed

### Before (Mock Data)
```javascript
// Old QuestsScreen.jsx
const questProgress = [
  {
    id: 1,
    title: 'Digital Collector',
    progress: 7,
    total: 10,
    // ... hardcoded mock data
  }
];
```

### After (Real Database)
```javascript
// New QuestsScreen.jsx
const { questProgress, questStats, loading, error } = useQuests();
// Real data from Supabase quest_progress table
```

## Database Schema

### New Tables

#### `quest_progress`
```sql
CREATE TABLE public.quest_progress (
  id SERIAL PRIMARY KEY,
  user_id UUID REFERENCES public.user_profiles(id),
  quest_id TEXT NOT NULL,
  quest_name TEXT NOT NULL,
  progress INTEGER DEFAULT 0,
  total_required INTEGER NOT NULL,
  is_completed BOOLEAN DEFAULT false,
  completed_at TIMESTAMP WITH TIME ZONE,
  season TEXT DEFAULT 'Spring_25',
  quest_type TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
```

#### `user_stats`
```sql
CREATE TABLE public.user_stats (
  id SERIAL PRIMARY KEY,
  user_id UUID REFERENCES public.user_profiles(id) UNIQUE,
  total_qr_scans INTEGER DEFAULT 0,
  total_social_shares INTEGER DEFAULT 0,
  total_store_visits INTEGER DEFAULT 0,
  total_daily_completions INTEGER DEFAULT 0,
  current_streak INTEGER DEFAULT 0,
  longest_streak INTEGER DEFAULT 0,
  -- ... additional tracking fields
);
```

### Key Functions

#### `update_quest_progress(user_id, quest_type, increment)`
- Updates progress for a specific quest type
- Automatically awards WINGS when quest is completed
- Returns progress information

#### `log_qr_scan(user_id, reward_data)`
- Adds item to user closet
- Logs activity
- Updates quest progress automatically
- Awards WINGS

#### `log_social_share(user_id, platform)`
- Logs social share activity
- Updates social butterfly quest progress
- Awards WINGS

## Quest System Logic

### Digital Collector Quest
- **Trigger**: QR code scans
- **Source**: Count items in `user_closet` where `earned_via = 'qr_scan'`
- **Goal**: 10 scans
- **Reward**: 100 WINGS

### Social Butterfly Quest
- **Trigger**: Social media shares
- **Source**: Count entries in `user_activity` where `activity_type = 'social_share'`
- **Goal**: 5 shares
- **Reward**: 50 WINGS

### Daily Dedication Quest
- **Trigger**: Daily quest completions
- **Source**: Count entries in `daily_completions` table
- **Goal**: 15 completions
- **Reward**: 125 WINGS

### Store Explorer Quest
- **Trigger**: Store visits (future implementation)
- **Source**: Manual tracking or geolocation
- **Goal**: 3 store visits
- **Reward**: 75 WINGS

## Testing the New System

### 1. Test Quest Initialization
1. Log in as a user
2. Navigate to the Quests screen
3. Verify you see 4 quests with 0 progress each

### 2. Test QR Scanning
```javascript
// Use this in your QR scan component
const { logQRScan } = useQuests();

await logQRScan({
  reward_id: 'test-item-001',
  item_name: 'Test Jacket',
  category: 'jackets',
  rarity: 'common',
  wings_earned: 25,
  location: 'Test Store'
});
```

### 3. Test Social Sharing
```javascript
// Use this when user shares on social media
const { logSocialShare } = useQuests();

await logSocialShare('instagram', 'story');
```

### 4. Test Quest Progress Display
1. Perform some QR scans
2. Check the Quests screen - progress should update
3. Check the Home screen - active quests should show real progress

## Empty States

Users will now see helpful empty states instead of mock data:

### Quests Screen (No Progress)
- **Icon**: 🎯
- **Message**: "Ready to start your journey?"
- **Subtitle**: "Scan your first QR code to begin earning rewards!"

### Closet Screen (No Items)
- **Message**: "🎯 Your closet is waiting! Scan QR codes at Papillon stores to start your collection."

### Recent Activity (No Activity)
- **Message**: "No activity yet. Start scanning QR codes to earn rewards!"

## Migration Notes

### No Data Loss
- Existing user profiles, stamps, and wing balances are preserved
- Mock data was only for display - no real user data is affected

### Backwards Compatibility
- All existing API endpoints continue to work
- Existing Supabase tables are unchanged
- Only new tables and functions are added

### Performance
- Database queries are optimized with proper indexes
- RLS policies ensure users only see their own data
- Quest progress is cached to minimize database calls

## Troubleshooting

### Quest Progress Not Updating
1. Check if user is authenticated: `console.log(user?.id)`
2. Verify quest functions exist: Test in Supabase SQL Editor
3. Check browser console for error messages

### Empty Quests Screen
1. Verify `quest_progress` table exists and has RLS policies
2. Check if `initialize_user_quests` function was created
3. Test database connection in browser dev tools

### Database Connection Issues
1. Verify Supabase environment variables are set
2. Check Supabase project status
3. Ensure user has proper permissions

## Success Criteria ✅

After completing this setup, you should see:

1. **Real Quest Progress**: Users see actual progress (0/10, 1/10, etc.)
2. **No Mock Data**: Empty states show helpful messages, not fake progress
3. **Activity Logging**: All user actions are tracked in the database
4. **Wings Integration**: Users earn real WINGS that persist
5. **Performance**: Fast loading with proper empty states

## Support

If you encounter any issues:

1. Check the browser console for error messages
2. Verify all SQL scripts ran successfully
3. Ensure environment variables are properly set
4. Test with a fresh user account

The quest system is now fully integrated with real database tracking! 🎉