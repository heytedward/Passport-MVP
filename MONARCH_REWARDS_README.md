# Monarch Rewards Configuration System
## PapillonLabs Monarch Passport MVP

### Overview
The Monarch Rewards Configuration System provides a comprehensive solution for managing both regular and limited edition items with Shopify integration, nature-themed naming, and seamless integration with the limited edition tracking system.

### Architecture

#### Core Components
1. **Static Configuration** (`src/config/monarchRewards.js`)
2. **TypeScript Definitions** (`src/config/monarchRewards.d.ts`)
3. **Integration Utilities** (`src/utils/rewardIntegration.js`)
4. **React Hooks** (`src/hooks/useMonarchRewards.js`)
5. **Limited Edition System** (Database + `useLimitedEditions.js`)

### Static Rewards Configuration

#### Product Categories
- **Jackets**: Varsity jackets, windbreakers
- **Tops**: T-shirts, hoodies, sweaters
- **Headwear**: Snapbacks, beanies, caps
- **Accessories**: Chains, pins, bags
- **Themes**: Passport themes and customizations

#### Rarity Levels
- **Common**: Basic items (25 WINGS)
- **Uncommon**: Standard items (40-80 WINGS)
- **Rare**: Premium items (100-150 WINGS)
- **Epic**: High-end items (200+ WINGS)
- **Legendary**: Limited editions (150+ WINGS + bonus)
- **Mythic**: Ultra-limited editions (300+ WINGS + bonus)

#### Exclusivity Levels (Limited Editions)
- **Ultra Rare**: 2x multiplier, limited supply
- **Legendary**: 3x multiplier, exclusive features
- **Mythic**: 5x multiplier, rarest tier

### Limited Edition Items

#### 1. Monarch Varsity Jacket
- **Supply**: 100 pieces
- **Price**: $299.00
- **Bonus WINGS**: 200
- **Exclusivity**: Legendary
- **Features**: Embroidered design, individual numbering

#### 2. Golden Monarch Chain
- **Supply**: 50 pieces
- **Price**: $599.00
- **Bonus WINGS**: 500
- **Exclusivity**: Mythic
- **Features**: 14k gold-plated, handcrafted pendant

#### 3. Chrysalis Collection Hoodie
- **Supply**: 200 pieces
- **Price**: $129.00
- **Bonus WINGS**: 150
- **Exclusivity**: Ultra Rare
- **Features**: Gradient design, sustainable materials

#### 4. Nectar Collection Tee
- **Supply**: 150 pieces
- **Price**: $45.00
- **Bonus WINGS**: 100
- **Exclusivity**: Ultra Rare
- **Features**: Exclusive colorway, organic cotton

### Regular Items

#### Classic Monarch Tee
- **Price**: $35.00
- **WINGS**: 25
- **Features**: Iconic design, sustainable materials

#### Monarch Snapback
- **Price**: $28.00
- **WINGS**: 40
- **Features**: Embroidered design, adjustable fit

#### Wing Collection Pins
- **Price**: $18.00
- **WINGS**: 60
- **Features**: Collectible design, enamel finish

#### Bloom Collection Hoodie
- **Price**: $89.00
- **WINGS**: 80
- **Features**: Sustainable materials, comfortable fit

#### Pollinate Collection Bag
- **Price**: $22.00
- **WINGS**: 30
- **Features**: Eco-friendly, recycled materials

### Shopify Integration

#### Configuration
```javascript
const SHOPIFY_CONFIG = {
  baseUrl: 'https://papillonbrand.us',
  imageBaseUrl: 'https://cdn.shopify.com/s/files/1/',
  imageSuffix: '/files/',
  defaultImageSize: '600x600',
  altImageSize: '1200x1200'
};
```

#### Image Management
- **Responsive Images**: Small, medium, large variants
- **Alt Text**: Accessibility support
- **CDN Integration**: Fast loading
- **Cache Busting**: Version control

#### Product URLs
```javascript
// Generate Shopify product URL
const url = RewardUtils.getShopifyUrl('MONARCH_VARSITY_JACKET');
// Returns: https://papillonbrand.us/products/monarch-varsity-jacket-limited
```

### Nature-Themed Naming Convention

#### Collections
- **Monarch**: Core brand items
- **Chrysalis**: Transformation-themed items
- **Nectar**: Sweet, desirable items
- **Wing**: Flight and freedom items
- **Bloom**: Growth and beauty items
- **Pollinate**: Community and sharing items

#### Color Palette
```javascript
const MONARCH_COLORS = {
  primary: '#FFB000',    // Golden Monarch
  secondary: '#7F3FBF',  // Purple Chrysalis
  accent: '#10B981',     // Green Nectar
  dark: '#1F2937',       // Dark Wing
  light: '#F9FAFB'       // Light Bloom
};
```

### React Integration

#### Main Hook: `useMonarchRewards()`
```javascript
const {
  rewards,
  userRewards,
  loading,
  claimReward,
  getRewardsByCategory,
  getLimitedEditionRewards,
  canUserClaim,
  getRewardStats
} = useMonarchRewards();
```

#### Admin Hook: `useMonarchRewardsAdmin()`
```javascript
const {
  initializeLimitedEditions,
  syncStaticRewards,
  validateConfiguration,
  getAnalytics
} = useMonarchRewardsAdmin();
```

### Utility Functions

#### RewardUtils
```javascript
// Get all active rewards
const activeRewards = RewardUtils.getActiveRewards();

// Get limited edition rewards
const limitedEditions = RewardUtils.getLimitedEditionRewards();

// Get reward by ID
const reward = RewardUtils.getRewardById('MONARCH_VARSITY_JACKET');

// Check if limited edition
const isLimited = RewardUtils.isLimitedEdition('MONARCH_VARSITY_JACKET');

// Get total WINGS value (including bonus)
const totalWings = RewardUtils.getTotalWingsValue('MONARCH_VARSITY_JACKET');
```

#### RewardIntegration
```javascript
// Initialize limited editions in database
await initializeLimitedEditions();

// Sync static rewards with database
await syncStaticRewards();

// Get reward with limited edition status
const rewardWithStatus = await getRewardWithLimitedEditionStatus('MONARCH_VARSITY_JACKET');

// Validate configuration
const validation = validateRewardConfiguration();
```

### Database Integration

#### Static Rewards Table
```sql
CREATE TABLE static_rewards (
  reward_id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  description TEXT,
  category TEXT NOT NULL,
  rarity TEXT NOT NULL,
  wings_value INTEGER DEFAULT 0,
  season TEXT,
  is_active BOOLEAN DEFAULT true,
  data JSONB -- Contains Shopify and metadata
);
```

#### Limited Edition Integration
- **Automatic Creation**: Limited editions created from static config
- **Status Tracking**: Real-time availability and claim status
- **Mint Numbers**: Sequential numbering for exclusivity
- **Analytics**: Comprehensive performance tracking

### Usage Examples

#### Claiming a Limited Edition
```javascript
const result = await claimReward('MONARCH_VARSITY_JACKET', 'NYC_Store');
if (result.success) {
  console.log(`Claimed mint #${result.mintNumber}`);
  console.log(`Earned ${result.totalWings} WINGS`);
}
```

#### Displaying Rewards
```javascript
const limitedEditions = getLimitedEditionRewards();
const userRewards = getUserLimitedEditions();

// Check if user can claim
const canClaim = canUserClaim('MONARCH_VARSITY_JACKET');

// Get reward stats
const stats = getRewardStats();
console.log(`User has ${stats.userTotalRewards} rewards`);
```

#### Admin Operations
```javascript
// Initialize limited editions
const initResult = await initializeLimitedEditions();

// Validate configuration
const validation = validateConfiguration();
if (!validation.isValid) {
  console.error('Configuration errors:', validation.errors);
}

// Get analytics
const analytics = await getAnalytics();
console.log(`Total rewards: ${analytics.totalRewards}`);
```

### Security Features

#### Input Validation
- **Reward ID Format**: `^[A-Z0-9_]+$`
- **Price Validation**: Positive integers only
- **Supply Validation**: Positive integers for limited editions
- **Date Validation**: Future dates for end dates

#### Access Control
- **RLS Policies**: User-specific data access
- **Admin Functions**: Admin-only operations
- **Function Security**: `SECURITY DEFINER` for database functions

#### Data Integrity
- **Foreign Key Constraints**: Referential integrity
- **Unique Constraints**: Prevent duplicates
- **Check Constraints**: Business rule validation

### Performance Optimizations

#### Caching Strategy
- **Static Data**: Configuration cached in memory
- **User Data**: Real-time updates with optimistic UI
- **Images**: CDN caching with version control

#### Database Indexes
- **Reward ID**: Fast lookups
- **Category/Rarity**: Filtered queries
- **Limited Edition**: Status queries
- **User Claims**: User-specific data

#### Query Optimization
- **Batch Operations**: Bulk data processing
- **Selective Loading**: Load only needed data
- **Efficient Joins**: Optimized database queries

### Error Handling

#### Common Scenarios
- **Supply Exhausted**: Limited edition sold out
- **Already Claimed**: User already owns item
- **Invalid Reward**: Reward not found
- **Authentication**: User not logged in

#### Graceful Degradation
- **Fallback Images**: Default images on error
- **Error Messages**: User-friendly feedback
- **Retry Logic**: Automatic retry for transient errors

### Testing

#### Configuration Validation
```javascript
const validation = validateRewardConfiguration();
console.log('Valid:', validation.isValid);
console.log('Errors:', validation.errors);
console.log('Warnings:', validation.warnings);
```

#### Test Functions
```javascript
// Test claiming
const result = await claimReward('MONARCH_VARSITY_JACKET');

// Test limited edition status
const status = await getLimitedEditionStatus('MONARCH_VARSITY_JACKET');

// Test user claims
const userClaims = getUserLimitedEditions();
```

### Future Enhancements

#### Planned Features
- **Dynamic Pricing**: Supply-based pricing
- **Waitlist System**: Queue for sold-out items
- **Social Sharing**: Share limited editions
- **Trading System**: User-to-user trading
- **Auction System**: Bidding on rare items

#### Scalability
- **Horizontal Scaling**: Multi-region support
- **Caching Layer**: Redis integration
- **CDN Optimization**: Global image delivery
- **Analytics Dashboard**: Real-time insights

---

**PapillonLabs Monarch Passport MVP**  
*Enterprise-grade rewards system with nature-themed design* 