# Limited Edition Tracking System
## Monarch Passport MVP - PapillonLabs

### Overview
The Limited Edition Tracking System provides secure, atomic claiming of limited edition items with supply management, mint number assignment, and comprehensive analytics.

### Database Schema

#### Tables

**1. `limited_edition_items`**
- Tracks limited edition items with supply management
- Fields: `id`, `reward_id`, `total_supply`, `claimed_count`, `start_date`, `end_date`, `is_active`
- Constraints: Supply validation, date range validation, reward ID format validation

**2. `limited_edition_claims`**
- Records individual user claims with mint numbers
- Fields: `id`, `limited_edition_id`, `user_id`, `mint_number`, `claimed_at`, `qr_scan_location`
- Constraints: Unique user per item, unique mint numbers, location format validation

### Core Functions

#### `claim_limited_edition_item(reward_id, user_id, qr_scan_location)`
**Purpose**: Atomic claiming with race condition protection

**Features**:
- ✅ Race condition protection with `FOR UPDATE SKIP LOCKED`
- ✅ Supply validation and exhaustion checks
- ✅ Duplicate claim prevention
- ✅ Sequential mint number assignment
- ✅ Automatic closet item addition
- ✅ WINGS reward (100 WINGS per claim)
- ✅ Comprehensive error handling

**Returns**:
```sql
TABLE (
    mint_number INTEGER,
    claimed_at TIMESTAMPTZ,
    success BOOLEAN,
    message TEXT
)
```

#### `get_active_limited_editions()`
**Purpose**: Get all currently available limited editions

**Returns**:
```sql
TABLE (
    reward_id TEXT,
    total_supply INTEGER,
    claimed_count INTEGER,
    available_count INTEGER,
    claim_percentage DECIMAL,
    start_date TIMESTAMPTZ,
    end_date TIMESTAMPTZ,
    days_remaining INTEGER
)
```

#### `get_user_limited_editions(user_id)`
**Purpose**: Get all limited editions claimed by a user

**Returns**:
```sql
TABLE (
    reward_id TEXT,
    mint_number INTEGER,
    claimed_at TIMESTAMPTZ,
    total_supply INTEGER,
    claim_percentage DECIMAL,
    qr_scan_location TEXT
)
```

### Security Features

#### Row Level Security (RLS)
- **Users**: Can view active items and their own claims
- **Admins**: Full CRUD access to all limited edition data
- **Functions**: `SECURITY DEFINER` with proper permission checks

#### Data Validation
- Supply constraints (claimed_count ≤ total_supply)
- Date range validation (end_date > start_date)
- Format validation for reward IDs and locations
- Unique constraints prevent duplicates

#### Race Condition Protection
- `FOR UPDATE SKIP LOCKED` prevents concurrent claims
- Atomic transactions ensure data consistency
- Proper error handling and rollback

### React Integration

#### `useLimitedEditions()` Hook
```javascript
const {
  activeLimitedEditions,
  userClaims,
  loading,
  error,
  claimLimitedEdition,
  hasUserClaimed,
  getUserMintNumber,
  refresh
} = useLimitedEditions();
```

#### `useLimitedEditionAdmin()` Hook
```javascript
const {
  createLimitedEdition,
  resetLimitedEdition,
  getAnalytics,
  loading,
  error
} = useLimitedEditionAdmin();
```

### Usage Examples

#### Claiming a Limited Edition Item
```javascript
const result = await claimLimitedEdition('MONARCH_LAUNCH_HOODIE', 'NYC_Store');
if (result.success) {
  console.log(`Claimed mint #${result.mintNumber}`);
} else {
  console.error(result.message);
}
```

#### Checking User Claims
```javascript
const hasClaimed = hasUserClaimed('MONARCH_LAUNCH_HOODIE');
const mintNumber = getUserMintNumber('MONARCH_LAUNCH_HOODIE');
```

#### Admin: Creating Limited Edition
```javascript
const result = await createLimitedEdition(
  'NYC_POPUP_EXCLUSIVE',
  50,
  new Date(),
  new Date(Date.now() + 7 * 24 * 60 * 60 * 1000) // 7 days
);
```

### Analytics

#### `limited_edition_analytics` View
Provides comprehensive analytics including:
- Claim percentages
- Total claims per item
- First and last claim timestamps
- Performance metrics

### Sample Data

The system includes sample limited edition items:
- `MONARCH_LAUNCH_HOODIE` (100 supply, 30 days)
- `NYC_POPUP_EXCLUSIVE` (50 supply, 7 days)
- `SEASON_ONE_COLLECTOR` (200 supply, 90 days)
- `BIRTHDAY_SPECIAL_2025` (25 supply, 14 days)

### Migration Files

1. **`limited_edition_schema.sql`**: Core schema, functions, and security
2. **`limited_edition_sample_data.sql`**: Sample data and testing functions

### Testing

#### Test Functions
- `test_claim_limited_edition(reward_id)`: Test claiming
- `reset_limited_edition_for_testing(reward_id)`: Reset for testing (admin only)

#### Sample Queries
```sql
-- Test claiming
SELECT * FROM public.test_claim_limited_edition('MONARCH_LAUNCH_HOODIE');

-- Get user claims
SELECT * FROM public.get_user_limited_editions();

-- Check status
SELECT * FROM public.get_limited_edition_status('MONARCH_LAUNCH_HOODIE');

-- Get active items
SELECT * FROM public.get_active_limited_editions();
```

### Integration Points

#### User Closet
Limited edition items are automatically added to `user_closet` with:
- `item_type`: 'limited_edition'
- `rarity`: 'legendary'
- `metadata`: Contains mint number, supply info, claim details

#### WINGS Rewards
- 100 WINGS awarded per limited edition claim
- Automatically added to user's balance

#### QR Scanning
- Optional `qr_scan_location` tracking
- Integrates with existing QR scanning system

### Performance Optimizations

#### Indexes
- `reward_id` lookups
- Active items filtering
- Date range queries
- User claim history
- Claim timestamps

#### Query Optimization
- Partial indexes for active items
- Efficient date range filtering
- Optimized analytics queries

### Error Handling

#### Common Error Scenarios
- **Supply Exhausted**: "Limited edition supply exhausted"
- **Already Claimed**: "User already claimed this limited edition item"
- **Not Available**: "Limited edition item not found or not available"
- **Invalid Reward**: "Reward data not found"

#### Graceful Degradation
- Comprehensive error messages
- Proper rollback on failures
- User-friendly feedback

### Security Considerations

#### Input Validation
- Reward ID format validation (`^[A-Z0-9_]+$`)
- Location format validation (`^[A-Za-z0-9\s\-_]+$`)
- Supply and date range constraints

#### Access Control
- RLS policies for data access
- Admin-only functions for management
- User isolation for claims

#### Data Integrity
- Foreign key constraints
- Unique constraints
- Check constraints
- Atomic transactions

### Future Enhancements

#### Potential Features
- Batch claiming for events
- Waitlist functionality
- Dynamic pricing based on demand
- Social sharing integration
- Limited edition trading

#### Scalability
- Horizontal scaling support
- Caching strategies
- Performance monitoring
- Analytics dashboard

---

**PapillonLabs Security Implementation**  
*Enterprise-grade limited edition tracking for Monarch Passport MVP* 