# Limited Edition Manager
## Monarch Passport MVP - Utility Functions

### Overview
The Limited Edition Manager provides comprehensive utility functions for checking and managing limited edition availability in Monarch Passport MVP. It includes real-time availability tracking, user collection management, analytics, and security integration.

### Core Functions

#### **1. checkLimitedEditionAvailability(rewardId)**
**Purpose**: Check real-time availability status for a limited edition item

**Features**:
- ✅ **Real-time Supply Check**: Queries current claimed vs total supply
- ✅ **Time-based Validation**: Validates start/end dates
- ✅ **Status Messages**: Human-readable availability status
- ✅ **Edge Case Handling**: Graceful handling of non-limited items
- ✅ **Security Logging**: Comprehensive security event logging

**Returns**: `LimitedEditionAvailability` object
```javascript
{
  available: boolean,
  remainingCount: number,
  totalSupply: number,
  claimedCount: number,
  isActive: boolean,
  startDate: Date | null,
  endDate: Date | null,
  isExpired: boolean,
  isNotStarted: boolean,
  status: string,
  rewardId: string
}
```

**Usage Example**:
```javascript
import { checkLimitedEditionAvailability } from '../utils/limitedEditionManager.js';

const availability = await checkLimitedEditionAvailability('MONARCH_VARSITY_JACKET');
if (availability.available) {
  console.log(`${availability.remainingCount} items remaining!`);
} else {
  console.log(availability.status);
}
```

#### **2. getLimitedEditionStats(rewardId)**
**Purpose**: Get comprehensive analytics for a limited edition item

**Features**:
- ✅ **Claim Rate Analysis**: Daily and overall claim rates
- ✅ **Time Statistics**: First/last claim dates and intervals
- ✅ **Recent Activity**: Last 10 claims with details
- ✅ **Exclusivity Breakdown**: Mint number distribution
- ✅ **Performance Metrics**: Average time between claims

**Returns**: `LimitedEditionStats` object
```javascript
{
  totalSupply: number,
  claimedCount: number,
  remainingCount: number,
  claimRate: number,
  dailyClaimRate: number,
  firstClaimDate: Date,
  lastClaimDate: Date,
  averageTimeBetweenClaims: number,
  recentActivity: Array,
  exclusivityBreakdown: Object
}
```

**Usage Example**:
```javascript
import { getLimitedEditionStats } from '../utils/limitedEditionManager.js';

const stats = await getLimitedEditionStats('MONARCH_VARSITY_JACKET');
console.log(`Claim Rate: ${stats.claimRate}%`);
console.log(`Daily Rate: ${stats.dailyClaimRate} claims/day`);
console.log(`Recent Claims: ${stats.recentActivity.length}`);
```

#### **3. getUserLimitedEditionItems(userId)**
**Purpose**: Get all limited edition items owned by a user

**Features**:
- ✅ **Complete Collection**: All user's limited edition items
- ✅ **Mint Numbers**: Individual mint numbers for each item
- ✅ **Claim Details**: Claim dates and locations
- ✅ **Exclusivity Levels**: Automatic exclusivity calculation
- ✅ **Sorted Results**: Sorted by rarity and mint number

**Returns**: `UserLimitedEditionItem[]` array
```javascript
[{
  id: string,
  limitedEditionId: string,
  rewardId: string,
  mintNumber: number,
  claimedAt: Date,
  qrScanLocation: string,
  limitedEditionInfo: Object,
  exclusivityLevel: string,
  totalSupply: number,
  rarityPercentage: string
}]
```

**Usage Example**:
```javascript
import { getUserLimitedEditionItems } from '../utils/limitedEditionManager.js';

const userItems = await getUserLimitedEditionItems(userId);
userItems.forEach(item => {
  console.log(`${item.rewardId} - Mint #${item.mintNumber} of ${item.totalSupply}`);
  console.log(`Exclusivity: ${item.exclusivityLevel}`);
});
```

#### **4. getUserLimitedEditionSummary(userId)**
**Purpose**: Get comprehensive summary of user's limited edition collection

**Features**:
- ✅ **Collection Statistics**: Total items, supply, average rarity
- ✅ **Exclusivity Breakdown**: Distribution by exclusivity level
- ✅ **Rarity Analysis**: Rarest and most recent items
- ✅ **Collection Value**: Calculated collection value score
- ✅ **Performance Metrics**: Collection growth and trends

**Returns**: Collection summary object
```javascript
{
  totalItems: number,
  totalSupply: number,
  averageRarity: number,
  exclusivityBreakdown: Object,
  rarestItem: UserLimitedEditionItem,
  mostRecentItem: UserLimitedEditionItem,
  collectionValue: number
}
```

**Usage Example**:
```javascript
import { getUserLimitedEditionSummary } from '../utils/limitedEditionManager.js';

const summary = await getUserLimitedEditionSummary(userId);
console.log(`Collection: ${summary.totalItems} items`);
console.log(`Total Supply: ${summary.totalSupply}`);
console.log(`Collection Value: ${summary.collectionValue}`);
console.log(`Rarest: ${summary.rarestItem.rewardId} #${summary.rarestItem.mintNumber}`);
```

#### **5. checkUserLimitedEditionClaim(userId, rewardId)**
**Purpose**: Check if a user has already claimed a specific limited edition item

**Features**:
- ✅ **Claim Status**: Whether user has already claimed
- ✅ **Eligibility Check**: Can the user claim this item
- ✅ **Claim Details**: Mint number and claim information
- ✅ **Availability Status**: Current availability status
- ✅ **Reason Codes**: Clear reason for claim status

**Returns**: Claim status object
```javascript
{
  hasClaimed: boolean,
  canClaim: boolean,
  userClaim: Object | null,
  availability: LimitedEditionAvailability,
  reason: string
}
```

**Usage Example**:
```javascript
import { checkUserLimitedEditionClaim } from '../utils/limitedEditionManager.js';

const claimStatus = await checkUserLimitedEditionClaim(userId, 'MONARCH_VARSITY_JACKET');
if (claimStatus.hasClaimed) {
  console.log(`Already claimed! Mint #${claimStatus.userClaim.mintNumber}`);
} else if (claimStatus.canClaim) {
  console.log('Available for claim!');
} else {
  console.log(`Cannot claim: ${claimStatus.reason}`);
}
```

#### **6. getActiveLimitedEditions()**
**Purpose**: Get all currently active limited edition items

**Features**:
- ✅ **Active Items Only**: Only currently active limited editions
- ✅ **Supply Information**: Current supply and claimed counts
- ✅ **Date Information**: Start and end dates
- ✅ **Sorted Results**: Ordered by creation date
- ✅ **Real-time Data**: Current availability status

**Returns**: Array of active limited edition items
```javascript
[{
  id: string,
  rewardId: string,
  totalSupply: number,
  claimedCount: number,
  remainingCount: number,
  startDate: Date | null,
  endDate: Date | null,
  isActive: boolean,
  createdAt: Date,
  updatedAt: Date
}]
```

**Usage Example**:
```javascript
import { getActiveLimitedEditions } from '../utils/limitedEditionManager.js';

const activeItems = await getActiveLimitedEditions();
activeItems.forEach(item => {
  console.log(`${item.rewardId}: ${item.remainingCount}/${item.totalSupply} remaining`);
});
```

#### **7. getLimitedEditionAnalytics()**
**Purpose**: Get comprehensive analytics for admin dashboard

**Features**:
- ✅ **Overall Statistics**: Total items, supply, claim rates
- ✅ **Activity Tracking**: Recent activity (7/30 days)
- ✅ **Popular Items**: Most claimed limited editions
- ✅ **Performance Metrics**: Average supply and claim rates
- ✅ **Trend Analysis**: Collection growth and trends

**Returns**: Analytics object
```javascript
{
  totalLimitedEditions: number,
  activeLimitedEditions: number,
  totalSupply: number,
  totalClaimed: number,
  totalRemaining: number,
  overallClaimRate: number,
  recentActivity: Object,
  popularItems: Array,
  averageSupply: number
}
```

**Usage Example**:
```javascript
import { getLimitedEditionAnalytics } from '../utils/limitedEditionManager.js';

const analytics = await getLimitedEditionAnalytics();
console.log(`Total Limited Editions: ${analytics.totalLimitedEditions}`);
console.log(`Overall Claim Rate: ${analytics.overallClaimRate}%`);
console.log(`Recent Activity (7 days): ${analytics.recentActivity.last7Days}`);
```

### Security Features

#### **Input Validation**
- ✅ **User ID Validation**: Validates user IDs using security middleware
- ✅ **Reward ID Validation**: Validates reward ID format and existence
- ✅ **Data Sanitization**: Sanitizes all input data
- ✅ **Type Checking**: Comprehensive type validation

#### **Security Logging**
```javascript
// All functions log security events
logSecurityEvent({
  type: 'LIMITED_EDITION_AVAILABILITY_CHECK',
  rewardId,
  message: 'Checking limited edition availability'
});
```

#### **Error Handling**
- ✅ **Graceful Degradation**: Handles errors without crashing
- ✅ **Detailed Error Messages**: Clear error information
- ✅ **Fallback Values**: Safe default values on errors
- ✅ **Error Logging**: Comprehensive error logging

### Performance Optimizations

#### **Database Queries**
- ✅ **Optimized Queries**: Efficient Supabase queries
- ✅ **Indexed Fields**: Uses indexed fields for performance
- ✅ **Selective Loading**: Only loads required fields
- ✅ **Connection Pooling**: Efficient connection management

#### **Caching Strategy**
- ✅ **Result Caching**: Caches frequently accessed data
- ✅ **Query Optimization**: Minimizes database round trips
- ✅ **Lazy Loading**: Loads data only when needed
- ✅ **Memory Management**: Efficient memory usage

### Integration Examples

#### **QR Scanning Integration**
```javascript
import { checkLimitedEditionAvailability, checkUserLimitedEditionClaim } from '../utils/limitedEditionManager.js';

// In QR scanning flow
const availability = await checkLimitedEditionAvailability(rewardId);
if (availability.available) {
  const claimStatus = await checkUserLimitedEditionClaim(userId, rewardId);
  if (claimStatus.canClaim) {
    // Process limited edition claim
    const result = await claimLimitedEditionItem(rewardId, userId);
    // Show limited edition modal
  }
}
```

#### **Closet Screen Integration**
```javascript
import { getUserLimitedEditionItems, getUserLimitedEditionSummary } from '../utils/limitedEditionManager.js';

// In ClosetScreen component
const userItems = await getUserLimitedEditionItems(userId);
const summary = await getUserLimitedEditionSummary(userId);

// Display limited edition items with special styling
userItems.forEach(item => {
  // Render with LimitedEditionBadge and MintNumberDisplay
});
```

#### **Admin Dashboard Integration**
```javascript
import { getLimitedEditionAnalytics, getLimitedEditionStats } from '../utils/limitedEditionManager.js';

// In admin dashboard
const analytics = await getLimitedEditionAnalytics();
const itemStats = await getLimitedEditionStats('MONARCH_VARSITY_JACKET');

// Display analytics and statistics
```

### Error Handling Patterns

#### **Standard Error Response**
```javascript
// All functions return consistent error responses
{
  success: false,
  error: 'Error message',
  data: null
}
```

#### **Graceful Degradation**
```javascript
// Functions handle errors gracefully
try {
  const result = await checkLimitedEditionAvailability(rewardId);
  return result;
} catch (error) {
  console.error('Error:', error);
  return {
    available: false,
    status: 'Error checking availability',
    error: error.message
  };
}
```

### Testing

#### **Unit Testing**
```javascript
// Test availability checking
const availability = await checkLimitedEditionAvailability('TEST_REWARD');
expect(availability.available).toBeDefined();
expect(availability.remainingCount).toBeGreaterThanOrEqual(0);

// Test user claim checking
const claimStatus = await checkUserLimitedEditionClaim(userId, 'TEST_REWARD');
expect(claimStatus.hasClaimed).toBeDefined();
expect(claimStatus.canClaim).toBeDefined();
```

#### **Integration Testing**
```javascript
// Test complete limited edition flow
const availability = await checkLimitedEditionAvailability(rewardId);
const claimStatus = await checkUserLimitedEditionClaim(userId, rewardId);
const userItems = await getUserLimitedEditionItems(userId);
const summary = await getUserLimitedEditionSummary(userId);

// Verify data consistency
expect(availability.available).toBe(!claimStatus.hasClaimed);
expect(userItems.length).toBe(summary.totalItems);
```

### Future Enhancements

#### **Planned Features**
- **Real-time Updates**: WebSocket integration for live updates
- **Advanced Analytics**: Machine learning insights
- **Market Integration**: External marketplace integration
- **Trading System**: Limited edition trading functionality
- **Auction System**: Limited edition auction system

#### **Performance Improvements**
- **Query Optimization**: Advanced query optimization
- **Caching Layer**: Redis caching integration
- **CDN Integration**: Content delivery network
- **Database Sharding**: Horizontal scaling support

---

**PapillonLabs Monarch Passport MVP**  
*Comprehensive limited edition management with enterprise-grade security and performance* 