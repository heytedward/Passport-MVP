# 🦋 Monarch Passport Shopify Metafields Setup
## PapillonLabs Automatic Self-Sorting Configuration

### Overview
This guide provides the complete metafield structure for automatic self-sorting of Monarch Passport items in Shopify. These metafields will enable automatic categorization, filtering, and display organization.

### Metafield Namespace: `monarch_passport`

#### 1. Product Type Classification
**Metafield Key:** `product_type`
**Type:** Single line text
**Description:** Primary product classification for Monarch Passport items
**Values:**
- `physical_item` - Physical fashion items (clothing, accessories)
- `digital_collectible` - Digital items (themes, wallpapers, passes)
- `limited_edition` - Limited edition physical items
- `theme_unlock` - Passport theme unlocks

#### 2. Rarity Level
**Metafield Key:** `rarity_level`
**Type:** Single line text
**Description:** Monarch Passport rarity classification
**Values:**
- `common` - Basic items (25 WNGS)
- `uncommon` - Standard items (40-80 WNGS)
- `rare` - Premium items (100-150 WNGS)
- `epic` - High-end items (200+ WNGS)
- `legendary` - Limited editions (150+ WNGS + bonus)
- `mythic` - Ultra-limited editions (300+ WNGS + bonus)

#### 3. Category Classification
**Metafield Key:** `monarch_category`
**Type:** Single line text
**Description:** Monarch Passport category for filtering
**Values:**
- `jackets` - Varsity jackets, windbreakers
- `tops` - T-shirts, hoodies, sweaters
- `headwear` - Snapbacks, beanies, caps
- `accessories` - Chains, pins, bags
- `footwear` - Sneakers, shoes
- `themes` - Passport themes and customizations
- `wallpapers` - Digital wallpapers
- `tickets` - Event tickets
- `posters` - Digital posters
- `badges` - Achievement badges
- `passes` - VIP passes

#### 4. Collection Association
**Metafield Key:** `collection_name`
**Type:** Single line text
**Description:** Monarch Passport collection name
**Values:**
- `Monarch Collection` - Core brand items
- `Chrysalis Collection` - Transformation-themed items
- `Nectar Collection` - Sweet, desirable items
- `Wing Collection` - Flight and freedom items
- `Bloom Collection` - Growth and beauty items
- `Pollinate Collection` - Community and sharing items

#### 5. Season Information
**Metafield Key:** `season`
**Type:** Single line text
**Description:** Monarch Passport season identifier
**Values:**
- `S1` - Season 1 (Spring 2025)
- `S2` - Season 2 (Summer 2025)
- `S3` - Season 3 (Fall 2025)
- `S4` - Season 4 (Winter 2025)

#### 6. WNGS Value
**Metafield Key:** `wings_value`
**Type:** Number
**Description:** WNGS currency value for the item
**Format:** Integer (e.g., 25, 150, 300)

#### 7. Limited Edition Configuration
**Metafield Key:** `limited_edition_config`
**Type:** JSON
**Description:** Limited edition item configuration
**Structure:**
```json
{
  "is_limited_edition": true,
  "total_supply": 100,
  "claimed_count": 0,
  "exclusivity_level": "legendary",
  "bonus_wings": 200,
  "end_date": "2025-06-30T23:59:59Z",
  "mint_number": null
}
```

#### 8. Item Type Classification
**Metafield Key:** `item_type`
**Type:** Single line text
**Description:** Detailed item type classification
**Values:**
- `physical_item` - Physical fashion items
- `digital_collectible` - Digital collectibles
- `theme_unlock` - Passport theme unlocks
- `achievement_badge` - Achievement badges
- `event_ticket` - Event tickets
- `vip_pass` - VIP passes

#### 9. Exclusivity Level
**Metafield Key:** `exclusivity_level`
**Type:** Single line text
**Description:** Exclusivity classification for limited editions
**Values:**
- `ultra_rare` - 2x multiplier, limited supply
- `legendary` - 3x multiplier, exclusive features
- `mythic` - 5x multiplier, rarest tier

#### 10. Release Date
**Metafield Key:** `release_date`
**Type:** Date
**Description:** Item release date for sorting
**Format:** YYYY-MM-DD

#### 11. Card Metadata
**Metafield Key:** `card_metadata`
**Type:** JSON
**Description:** Card game metadata for display
**Structure:**
```json
{
  "card_number": "001/150",
  "artist": "PapillonLabs",
  "card_type": "Fashion Item",
  "special_ability": "Style Boost",
  "stats": {
    "hp": 160,
    "attack": 80,
    "defense": 120,
    "speed": 90
  }
}
```

#### 12. Sustainability Information
**Metafield Key:** `sustainability_info`
**Type:** JSON
**Description:** Sustainability and material information
**Structure:**
```json
{
  "material": "100% organic cotton",
  "sustainability_rating": "eco_friendly",
  "care_instructions": "Machine wash cold",
  "eco_certifications": ["GOTS", "OEKO-TEX"]
}
```

### Shopify Admin Setup Instructions

#### Step 1: Create Metafield Definitions
1. Go to **Settings > Custom data > Metafields**
2. Click **Add definition**
3. Select **Products** as the owner
4. Create each metafield with the specifications above

#### Step 2: Bulk Import Metafield Values
Use Shopify's bulk import feature or API to set metafield values for existing products.

#### Step 3: Create Automated Collections
Create collections that automatically include products based on metafield values:

**Monarch Passport - Physical Items**
```
Product metafield: monarch_passport.product_type equals physical_item
```

**Monarch Passport - Limited Editions**
```
Product metafield: monarch_passport.product_type equals limited_edition
```

**Monarch Passport - Legendary Items**
```
Product metafield: monarch_passport.rarity_level equals legendary
```

**Monarch Passport - Mythic Items**
```
Product metafield: monarch_passport.rarity_level equals mythic
```

**Monarch Passport - Jackets**
```
Product metafield: monarch_passport.monarch_category equals jackets
```

**Monarch Passport - Themes**
```
Product metafield: monarch_passport.monarch_category equals themes
```

### API Integration for Automatic Updates

#### Metafield Update Endpoint
```javascript
// Update product metafields via Shopify Admin API
const updateProductMetafields = async (productId, metafields) => {
  const response = await fetch(`/admin/api/2024-01/products/${productId}/metafields.json`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'X-Shopify-Access-Token': process.env.SHOPIFY_ACCESS_TOKEN
    },
    body: JSON.stringify({ metafields })
  });
  return response.json();
};
```

#### Example Metafield Update
```javascript
const metafields = [
  {
    namespace: "monarch_passport",
    key: "product_type",
    value: "limited_edition",
    type: "single_line_text_field"
  },
  {
    namespace: "monarch_passport",
    key: "rarity_level",
    value: "legendary",
    type: "single_line_text_field"
  },
  {
    namespace: "monarch_passport",
    key: "wings_value",
    value: "150",
    type: "number_integer"
  }
];
```

### Liquid Template Integration

#### Product Card Template
```liquid
{% assign monarch_type = product.metafields.monarch_passport.product_type %}
{% assign monarch_rarity = product.metafields.monarch_passport.rarity_level %}
{% assign monarch_category = product.metafields.monarch_passport.monarch_category %}

<div class="product-card monarch-product" 
     data-type="{{ monarch_type }}"
     data-rarity="{{ monarch_rarity }}"
     data-category="{{ monarch_category }}">
  
  {% if monarch_rarity == 'legendary' or monarch_rarity == 'mythic' %}
    <div class="limited-edition-badge">{{ monarch_rarity | upcase }}</div>
  {% endif %}
  
  <div class="product-info">
    <h3>{{ product.title }}</h3>
    <p class="rarity">{{ monarch_rarity | capitalize }}</p>
    <p class="category">{{ monarch_category | capitalize }}</p>
  </div>
</div>
```

#### Collection Filtering
```liquid
{% assign rarity_filter = request.query_string | split: 'rarity=' | last %}
{% assign category_filter = request.query_string | split: 'category=' | last %}

{% for product in collection.products %}
  {% assign product_rarity = product.metafields.monarch_passport.rarity_level %}
  {% assign product_category = product.metafields.monarch_passport.monarch_category %}
  
  {% if rarity_filter == blank or product_rarity == rarity_filter %}
    {% if category_filter == blank or product_category == category_filter %}
      <!-- Display product -->
    {% endif %}
  {% endif %}
{% endfor %}
```

### Benefits of This Metafield Structure

1. **Automatic Self-Sorting**: Products automatically appear in relevant collections
2. **Advanced Filtering**: Customers can filter by rarity, category, type
3. **Limited Edition Tracking**: Automatic identification of limited edition items
4. **Seasonal Organization**: Items automatically sorted by season
5. **WNGS Integration**: Direct integration with Monarch Passport currency system
6. **Sustainability Tracking**: Material and sustainability information readily available
7. **Card Game Integration**: Metadata for card-based display in the app
8. **API Automation**: Easy programmatic updates and synchronization

### Maintenance and Updates

#### Regular Tasks
1. **Season Updates**: Update season metafields for new seasons
2. **Rarity Adjustments**: Modify rarity levels as needed
3. **Collection Updates**: Add new collections and update metafields
4. **Limited Edition Tracking**: Update supply counts and availability

#### Automation Scripts
Create scripts to automatically update metafields based on:
- New product additions
- Limited edition status changes
- Seasonal transitions
- Rarity adjustments

This metafield structure provides a comprehensive foundation for automatic self-sorting and organization of your Monarch Passport items in Shopify. 