# Database Fixes Instructions

## Issues Fixed

✅ **+25 Test Button Error**: Missing `add_wings_to_user` RPC function  
✅ **WNGS Balance Not Updating**: Missing columns in user_profiles table  
✅ **Physical Items in Wrong Tab**: Missing item_type column for proper filtering  
✅ **Scan Logic Updated**: ScanScreen.jsx now populates item_type correctly  

## How to Apply the Fixes

### Step 1: Run the SQL Script
1. Go to your **Supabase Dashboard** → **SQL Editor**
2. Open the file `fix_all_issues.sql` from this project
3. **Copy and paste** the entire contents into the SQL Editor
4. Click **Run** to execute all the fixes

### Step 2: Test the Fixes
After running the SQL script, test these features:

1. **Physical Items Tab**: 
   - Go to Closet screen
   - Click "Physical" tab
   - Your "Monarch Classic Tee" should now appear here

2. **WNGS Balance**: 
   - Check Home screen - should show updated WNGS balance
   - Try scanning another QR code to see balance increase

3. **+25 Test Button**: 
   - Click the "+25 Test" button on Home screen
   - Should work without database function error

### Step 3: Expected Results
- ✅ Physical items show in Physical tab (not just "All Items")
- ✅ WNGS balance displays correctly on Home screen
- ✅ +25 Test button works without errors
- ✅ Scanning QR codes updates balance immediately

## What Was Fixed

### Database Schema Updates
- Added `wings_balance` and `current_week_wings` columns to `user_profiles`
- Added `item_type` column to `user_closet` and `rewards` tables
- Created missing `add_wings_to_user` RPC function

### Code Updates
- Updated `ScanScreen.jsx` to populate `item_type` when scanning items
- Fixed categorization logic for physical vs digital items

### Categories
- **Physical**: jackets, tops, bottoms, headwear, accessories, footwear, hoodies
- **Digital**: themes, wallpapers, tickets, posters, badges, passes, stickers

---

**Next Steps**: Run the SQL script and test the functionality! 