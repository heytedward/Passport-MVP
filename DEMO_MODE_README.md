# Demo Mode - 11% Passport View

## Overview
The PassportScreen now includes a demo mode that forces a consistent 11% progress view for demonstration purposes.

## Implementation

### Demo Mode Toggle
Located in `src/screens/PassportScreen.jsx` at the top of the component:

```javascript
// DEMO MODE: Force 11% view with sample stamps
const DEMO_MODE = true; // Set to false to return to normal
```

### Demo Data
The demo mode provides:
- **1 unlocked stamp** (Welcome/Received Passport)
- **9 total stamps** (giving 11.1% progress)
- **No loading state** (instant display)
- **No errors** (clean demo experience)

### Demo Stamp Details
```javascript
const demoStamps = [
  { 
    stamp_id: 'received_passport', 
    unlocked: true, 
    earnedAt: '2025-03-01T00:00:00Z',
    stamp_type: 'achievement',
    rarity: 'common'
  }
];
```

## Usage

### Enable Demo Mode
```javascript
const DEMO_MODE = true; // Forces 11% view
```

### Disable Demo Mode
```javascript
const DEMO_MODE = false; // Returns to real user data
```

### Expected Results

**With Demo Mode ON:**
- ✅ **Consistent 11% progress** every time
- ✅ **1/9 stamps** displayed
- ✅ **Welcome stamp** unlocked and visible
- ✅ **8 locked stamps** showing 🔒
- ✅ **No loading delays**
- ✅ **Perfect for demos**

**With Demo Mode OFF:**
- ✅ **Real user progress** from database
- ✅ **Actual unlocked stamps**
- ✅ **Real loading states**
- ✅ **Normal error handling**

## Demo Stamp Display

The demo shows:
1. **Welcome** stamp (🎫) - **UNLOCKED** - Earned March 1, 2025
2. **GM** stamp (☀️) - **LOCKED**
3. **First Scan** stamp (👕) - **LOCKED**
4. **Scanner** stamp (📱) - **LOCKED**
5. **Social** stamp (📣) - **LOCKED**
6. **Style Icon** stamp (✨) - **LOCKED**
7. **Streak** stamp (🔥) - **LOCKED**
8. **Quest** stamp (🎯) - **LOCKED**
9. **Master** stamp (👑) - **LOCKED**

## Console Logging

Demo mode includes enhanced logging:
```javascript
console.log('PassportScreen - Stamps data:', {
  totalStamps: 1,
  unlockedCount: 1,
  totalCount: 9,
  loading: false,
  error: null,
  demoMode: true
});
```

## Benefits

### For Demos
- 🎯 **Consistent experience** every time
- 📱 **Professional presentation**
- 👥 **Great for showing others**
- ⚡ **No database dependencies**

### For Development
- 🔧 **Easy to toggle** on/off
- 🐛 **Isolated testing** environment
- 📊 **Predictable data** for UI testing
- 🚀 **Fast iteration** without real data

## Quick Toggle

**For immediate demo:**
```javascript
const DEMO_MODE = true;
```

**For real user data:**
```javascript
const DEMO_MODE = false;
```

## Theme Compatibility

Demo mode works with all themes:
- ✅ **frequencyPulse** (Default)
- ✅ **solarShine**
- ✅ **echoGlass**
- ✅ **retroFrame**
- ✅ **nightScan**

The demo stamp will display with the current theme's styling and colors.

## Future Enhancements

Potential improvements:
- **Environment variable** toggle (`REACT_APP_DEMO_MODE`)
- **Multiple demo scenarios** (25%, 50%, 75% progress)
- **Demo stamp selection** (choose which stamps to show)
- **Demo mode indicator** in UI

---

**Status**: ✅ Implemented and ready for demos
**File**: `src/screens/PassportScreen.jsx`
**Toggle**: `DEMO_MODE` constant 