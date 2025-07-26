# Enhanced QR Scanning System
## Monarch Passport MVP - Limited Edition Integration

### Overview
The Enhanced QR Scanning System integrates the static rewards configuration with limited edition tracking to provide a seamless scanning experience for both regular and limited edition items.

### Architecture

#### Core Components
1. **Enhanced ScanScreen.jsx** - Main scanning interface with limited edition support
2. **LimitedEditionQRProcessor.js** - Utility functions for processing limited edition QR codes
3. **LimitedEditionRewardModal.jsx** - Enhanced modal for limited edition items
4. **useMonarchRewards.js** - React hook for reward management
5. **monarchRewards.js** - Static rewards configuration

### Enhanced QR Processing Flow

#### 1. QR Code Validation
```javascript
// Enhanced validation with limited edition support
const validation = validateLimitedEditionQR(qrText);
if (!validation.valid) {
  throw new Error(validation.error);
}

const { payload, reward: staticReward, isLimitedEdition } = validation;
```

#### 2. Limited Edition Processing
```javascript
if (isLimitedEdition) {
  // Process limited edition with atomic claiming
  const limitedEditionResult = await processLimitedEditionQR(payload, userId, qrScanLocation);
  
  if (!limitedEditionResult.success) {
    throw new Error(limitedEditionResult.error);
  }
  
  // Show enhanced limited edition modal
  setLimitedEditionResult(limitedEditionResult);
  setShowLimitedEditionModal(true);
}
```

#### 3. Regular Reward Processing
```javascript
// Use Monarch Rewards system for regular items
const claimResult = await claimMonarchReward(rewardId, qrScanLocation);

if (!claimResult.success) {
  throw new Error(claimResult.message);
}

// Show regular reward modal
setReward({
  ...staticReward,
  claimResult
});
```

### Utility Functions

#### `validateLimitedEditionQR(qrText)`
**Purpose**: Enhanced QR validation with static rewards integration

**Features**:
- ✅ Validates QR code format and structure
- ✅ Checks if reward exists in static configuration
- ✅ Verifies reward is active and available
- ✅ Detects limited edition vs regular rewards
- ✅ Validates timestamps for expiration

**Returns**:
```javascript
{
  valid: boolean,
  payload: Object,
  reward: MonarchReward,
  isLimitedEdition: boolean,
  error?: string,
  reason?: string
}
```

#### `processLimitedEditionQR(qrData, userId, qrScanLocation)`
**Purpose**: Atomic processing of limited edition QR codes

**Features**:
- ✅ Checks user authentication
- ✅ Validates existing claims (one per user)
- ✅ Checks availability and supply
- ✅ Atomic claiming with mint number assignment
- ✅ Automatic closet integration
- ✅ WINGS reward distribution
- ✅ Activity logging

**Returns**:
```javascript
{
  success: boolean,
  reward: MonarchReward,
  claimResult: {
    mintNumber: number,
    claimedAt: string,
    totalWingsValue: number
  },
  availability: {
    totalSupply: number,
    claimedCount: number,
    availableCount: number,
    claimPercentage: number
  }
}
```

#### `checkLimitedEditionAvailability(rewardId)`
**Purpose**: Check availability before claiming

**Features**:
- ✅ Validates reward exists in configuration
- ✅ Checks database for limited edition status
- ✅ Returns detailed availability information
- ✅ Handles regular vs limited edition rewards

**Returns**:
```javascript
{
  available: boolean,
  isLimitedEdition: boolean,
  reward: MonarchReward,
  status: {
    totalSupply: number,
    claimedCount: number,
    availableCount: number,
    claimPercentage: number,
    isActive: boolean,
    userHasClaimed: boolean,
    userMintNumber: number
  },
  reason: string
}
```

### Enhanced Modal System

#### LimitedEditionRewardModal
**Features**:
- 🎨 **Exclusivity Badge** - Shows rarity level with color coding
- 🏷️ **Mint Number Display** - Animated mint number with glow effect
- 📊 **Supply Information** - Real-time supply and claim statistics
- 🦋 **WINGS Display** - Total WINGS earned including bonus
- 📅 **Claim Date** - Formatted claim timestamp
- 🖼️ **Product Images** - Shopify integration with fallback icons

#### Visual Enhancements
- **Animations**: Reveal animation with blur and scale effects
- **Color Coding**: Different colors for exclusivity levels
  - **Ultra Rare**: Golden (#FFB000)
  - **Legendary**: Purple (#7F3FBF)
  - **Mythic**: Green (#10B981)
- **Glow Effects**: Animated mint number with pulsing glow
- **Supply Progress**: Visual progress indicators

### Security Features

#### Enhanced Validation
- **QR Format Validation**: Ensures proper JSON structure
- **Reward Existence Check**: Validates against static configuration
- **Timestamp Validation**: Prevents expired QR codes
- **User Authentication**: Ensures user is logged in
- **Duplicate Claim Prevention**: One claim per user per limited edition

#### Atomic Operations
- **Database Transactions**: All operations are atomic
- **Race Condition Protection**: `FOR UPDATE SKIP LOCKED` for concurrent claims
- **Error Handling**: Comprehensive error handling with rollback
- **Activity Logging**: Detailed audit trail for all claims

### Error Handling

#### Common Error Scenarios
- **Invalid QR Code**: "Invalid QR code format"
- **Reward Not Found**: "Reward not found in configuration"
- **Already Claimed**: "You have already claimed this limited edition item"
- **Supply Exhausted**: "Limited edition supply exhausted"
- **Expired QR**: "QR code has expired"
- **Authentication**: "User not authenticated"

#### Graceful Degradation
- **Fallback Images**: Default icons when product images fail
- **Error Messages**: User-friendly error descriptions
- **Retry Logic**: Automatic retry for transient errors
- **Loading States**: Clear loading indicators during processing

### Integration Points

#### Static Rewards Configuration
- **Automatic Detection**: Detects limited edition vs regular rewards
- **Configuration Validation**: Ensures rewards exist in static config
- **Metadata Integration**: Uses static reward metadata for display

#### Database Integration
- **Limited Edition Tables**: Uses `limited_edition_items` and `limited_edition_claims`
- **User Closet**: Automatic integration with user's closet
- **Activity Logging**: Comprehensive activity tracking
- **WINGS System**: Automatic WINGS distribution

#### Shopify Integration
- **Product URLs**: Direct links to Shopify products
- **Image Management**: CDN images with responsive variants
- **Price Display**: Real-time pricing information

### Performance Optimizations

#### Caching Strategy
- **Static Data**: Configuration cached in memory
- **User Data**: Real-time updates with optimistic UI
- **Image Caching**: CDN caching with version control

#### Database Optimization
- **Indexed Queries**: Optimized database queries
- **Batch Operations**: Efficient data processing
- **Connection Pooling**: Optimized database connections

### Usage Examples

#### Basic QR Scanning
```javascript
// QR code is automatically processed
const result = await handleScanSuccess(qrResult);

// Limited edition items show enhanced modal
if (showLimitedEditionModal) {
  // Enhanced modal with mint number and supply info
}

// Regular items show standard modal
if (reward) {
  // Standard reward modal
}
```

#### Error Handling
```javascript
try {
  const result = await processLimitedEditionQR(qrData, userId);
  if (!result.success) {
    console.error(result.error);
    // Show user-friendly error message
  }
} catch (error) {
  console.error('QR processing error:', error);
  // Handle unexpected errors
}
```

#### Availability Checking
```javascript
const availability = await checkLimitedEditionAvailability(rewardId);
if (availability.available) {
  // Proceed with claiming
} else {
  // Show appropriate error message
  console.log(availability.reason);
}
```

### Testing

#### Test QR Codes
```javascript
// Limited Edition QR Code
const limitedEditionQR = {
  type: 'monarch_reward',
  rewardId: 'MONARCH_VARSITY_JACKET',
  season: 'Spring2025',
  timestamp: Date.now()
};

// Regular Reward QR Code
const regularQR = {
  type: 'monarch_reward',
  rewardId: 'CLASSIC_MONARCH_TEE',
  season: 'Spring2025',
  timestamp: Date.now()
};
```

#### Test Functions
```javascript
// Test limited edition processing
const result = await processLimitedEditionQR(testQR, userId);

// Test availability checking
const availability = await checkLimitedEditionAvailability('MONARCH_VARSITY_JACKET');

// Test validation
const validation = validateLimitedEditionQR(JSON.stringify(testQR));
```

### Future Enhancements

#### Planned Features
- **Batch Scanning**: Multiple QR codes in sequence
- **Offline Support**: Cached validation for offline scanning
- **Social Sharing**: Share limited edition claims
- **Analytics Dashboard**: Real-time scanning analytics
- **Push Notifications**: Limited edition availability alerts

#### Scalability Improvements
- **Horizontal Scaling**: Multi-region support
- **Caching Layer**: Redis integration
- **CDN Optimization**: Global image delivery
- **Performance Monitoring**: Real-time performance metrics

---

**PapillonLabs Monarch Passport MVP**  
*Enterprise-grade QR scanning with limited edition support* 