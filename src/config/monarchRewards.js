/**
 * Monarch Rewards Configuration System
 * PapillonLabs Monarch Passport MVP
 * 
 * This module provides static product data for both regular and limited edition items
 * with Shopify integration, nature-themed naming, and comprehensive metadata.
 */

// TypeScript-style type definitions (for documentation and IDE support)
/**
 * @typedef {Object} ShopifyImage
 * @property {string} id - Shopify image ID
 * @property {string} src - Image URL
 * @property {string} alt - Alt text for accessibility
 * @property {number} width - Image width
 * @property {number} height - Image height
 */

/**
 * @typedef {Object} LimitedEditionConfig
 * @property {number} totalSupply - Total number of items available
 * @property {number} bonusWings - Additional WINGS awarded for exclusivity
 * @property {'ultra_rare' | 'legendary' | 'mythic'} exclusivityLevel - Rarity tier
 * @property {string} [endDate] - Optional end date (ISO string)
 * @property {boolean} [isActive] - Whether the limited edition is currently active
 */

/**
 * @typedef {Object} MonarchReward
 * @property {string} rewardId - Unique reward identifier
 * @property {string} name - Display name
 * @property {string} description - Detailed description
 * @property {string} category - Product category
 * @property {'common' | 'uncommon' | 'rare' | 'epic' | 'legendary' | 'mythic'} rarity - Rarity level
 * @property {number} wingsValue - Base WINGS value
 * @property {string} season - Season identifier
 * @property {boolean} isActive - Whether the reward is currently available
 * @property {ShopifyImage[]} images - Product images from Shopify
 * @property {string} shopifyProductId - Shopify product ID for integration
 * @property {number} shopifyPrice - Price in cents
 * @property {string} [shopifyHandle] - Shopify product handle for URLs
 * @property {LimitedEditionConfig} [limitedEdition] - Limited edition configuration
 * @property {Object} metadata - Additional metadata
 */

// Shopify base configuration
const SHOPIFY_CONFIG = {
  baseUrl: 'https://papillonbrand.us',
  imageBaseUrl: 'https://cdn.shopify.com/s/files/1/',
  imageSuffix: '/files/',
  defaultImageSize: '600x600',
  altImageSize: '1200x1200'
};

// Nature-themed color palette for Monarch Passport
const MONARCH_COLORS = {
  primary: '#FFB000', // Golden Monarch
  secondary: '#7F3FBF', // Purple Chrysalis
  accent: '#10B981', // Green Nectar
  dark: '#1F2937', // Dark Wing
  light: '#F9FAFB', // Light Bloom
  gradient: {
    monarch: 'linear-gradient(135deg, #FFB000 0%, #FF9F1C 100%)',
    chrysalis: 'linear-gradient(135deg, #7F3FBF 0%, #5B21B6 100%)',
    nectar: 'linear-gradient(135deg, #10B981 0%, #059669 100%)',
    wing: 'linear-gradient(135deg, #1F2937 0%, #111827 100%)'
  }
};

// Exclusivity levels with descriptions
const EXCLUSIVITY_LEVELS = {
  ultra_rare: {
    name: 'Ultra Rare',
    description: 'Extremely limited availability',
    color: '#FFB000',
    multiplier: 2.0
  },
  legendary: {
    name: 'Legendary',
    description: 'Legendary status with unique features',
    color: '#7F3FBF',
    multiplier: 3.0
  },
  mythic: {
    name: 'Mythic',
    description: 'Mythical rarity - the rarest of all',
    color: '#10B981',
    multiplier: 5.0
  }
};

// Helper function to generate Shopify image URLs
const generateShopifyImage = (productId, imageId, filename, alt = '') => ({
  id: imageId,
  src: `${SHOPIFY_CONFIG.imageBaseUrl}${productId}${SHOPIFY_CONFIG.imageSuffix}${filename}?v=${Date.now()}`,
  alt: alt,
  width: 600,
  height: 600,
  srcSet: {
    small: `${SHOPIFY_CONFIG.imageBaseUrl}${productId}${SHOPIFY_CONFIG.imageSuffix}${filename}?width=300&height=300`,
    medium: `${SHOPIFY_CONFIG.imageBaseUrl}${productId}${SHOPIFY_CONFIG.imageSuffix}${filename}?width=600&height=600`,
    large: `${SHOPIFY_CONFIG.imageBaseUrl}${productId}${SHOPIFY_CONFIG.imageSuffix}${filename}?width=1200&height=1200`
  }
});

// Helper function to create limited edition configuration
const createLimitedEdition = (totalSupply, bonusWings, exclusivityLevel, endDate = null) => ({
  totalSupply,
  bonusWings,
  exclusivityLevel,
  endDate,
  isActive: true
});

// Main rewards configuration
export const MONARCH_REWARDS = {
  // Limited Edition Items
  MONARCH_VARSITY_JACKET: {
    rewardId: 'MONARCH_VARSITY_JACKET',
    name: 'Monarch Varsity Jacket',
    description: 'Limited edition varsity jacket featuring embroidered Monarch butterfly design with premium wool blend construction. Each piece is individually numbered and includes exclusive PapillonLabs branding.',
    category: 'jackets',
    rarity: 'legendary',
    wingsValue: 150,
    season: 'Spring2025',
    isActive: true,
    shopifyProductId: 'monarch-varsity-jacket-001',
    shopifyPrice: 29900, // $299.00
    shopifyHandle: 'monarch-varsity-jacket-limited',
    limitedEdition: createLimitedEdition(100, 200, 'legendary', '2025-06-30T23:59:59Z'),
    images: [
      generateShopifyImage('monarch-varsity-jacket-001', 'img_001', 'monarch-varsity-front.jpg', 'Monarch Varsity Jacket Front View'),
      generateShopifyImage('monarch-varsity-jacket-001', 'img_002', 'monarch-varsity-back.jpg', 'Monarch Varsity Jacket Back View'),
      generateShopifyImage('monarch-varsity-jacket-001', 'img_003', 'monarch-varsity-detail.jpg', 'Monarch Varsity Jacket Detail')
    ],
    metadata: {
      material: 'Premium wool blend',
      fit: 'Classic varsity fit',
      features: ['Embroidered Monarch design', 'Individual numbering', 'Exclusive branding'],
      care: 'Dry clean only',
      sustainability: 'Eco-friendly materials'
    }
  },

  GOLDEN_MONARCH_CHAIN: {
    rewardId: 'GOLDEN_MONARCH_CHAIN',
    name: 'Golden Monarch Chain',
    description: 'Exclusive 14k gold-plated chain featuring a handcrafted Monarch butterfly pendant. Ultra-limited release with only 50 pieces available worldwide.',
    category: 'accessories',
    rarity: 'mythic',
    wingsValue: 300,
    season: 'Spring2025',
    isActive: true,
    shopifyProductId: 'golden-monarch-chain-001',
    shopifyPrice: 59900, // $599.00
    shopifyHandle: 'golden-monarch-chain-ultra-limited',
    limitedEdition: createLimitedEdition(50, 500, 'mythic', '2025-05-15T23:59:59Z'),
    images: [
      generateShopifyImage('golden-monarch-chain-001', 'img_004', 'golden-chain-front.jpg', 'Golden Monarch Chain Front View'),
      generateShopifyImage('golden-monarch-chain-001', 'img_005', 'golden-chain-detail.jpg', 'Golden Monarch Chain Detail'),
      generateShopifyImage('golden-monarch-chain-001', 'img_006', 'golden-chain-packaging.jpg', 'Golden Monarch Chain Packaging')
    ],
    metadata: {
      material: '14k gold-plated brass',
      chainLength: '18 inches',
      pendantSize: '1.5 inches',
      features: ['Handcrafted pendant', 'Limited numbering', 'Certificate of authenticity'],
      care: 'Store in provided pouch',
      exclusivity: 'Only 50 pieces worldwide'
    }
  },

  CHRYSALIS_COLLECTION_HOODIE: {
    rewardId: 'CHRYSALIS_COLLECTION_HOODIE',
    name: 'Chrysalis Collection Hoodie',
    description: 'Premium cotton blend hoodie featuring the Chrysalis Collection design. Limited to 200 pieces with exclusive gradient detailing.',
    category: 'hoodies',
    rarity: 'epic',
    wingsValue: 100,
    season: 'Spring2025',
    isActive: true,
    shopifyProductId: 'chrysalis-hoodie-001',
    shopifyPrice: 12900, // $129.00
    shopifyHandle: 'chrysalis-collection-hoodie',
    limitedEdition: createLimitedEdition(200, 150, 'ultra_rare', '2025-07-31T23:59:59Z'),
    images: [
      generateShopifyImage('chrysalis-hoodie-001', 'img_007', 'chrysalis-hoodie-front.jpg', 'Chrysalis Hoodie Front View'),
      generateShopifyImage('chrysalis-hoodie-001', 'img_008', 'chrysalis-hoodie-back.jpg', 'Chrysalis Hoodie Back View'),
      generateShopifyImage('chrysalis-hoodie-001', 'img_009', 'chrysalis-hoodie-detail.jpg', 'Chrysalis Hoodie Detail')
    ],
    metadata: {
      material: 'Premium cotton blend',
      fit: 'Relaxed fit',
      features: ['Gradient design', 'Limited edition', 'Exclusive branding'],
      care: 'Machine wash cold',
      sustainability: 'Organic cotton blend'
    }
  },

  NECTAR_COLLECTION_TEE: {
    rewardId: 'NECTAR_COLLECTION_TEE',
    name: 'Nectar Collection Tee',
    description: 'Classic fit t-shirt featuring the Nectar Collection design. Limited to 150 pieces with exclusive colorway.',
    category: 'tops',
    rarity: 'rare',
    wingsValue: 75,
    season: 'Spring2025',
    isActive: true,
    shopifyProductId: 'nectar-tee-001',
    shopifyPrice: 4500, // $45.00
    shopifyHandle: 'nectar-collection-tee',
    limitedEdition: createLimitedEdition(150, 100, 'ultra_rare', '2025-08-31T23:59:59Z'),
    images: [
      generateShopifyImage('nectar-tee-001', 'img_010', 'nectar-tee-front.jpg', 'Nectar Tee Front View'),
      generateShopifyImage('nectar-tee-001', 'img_011', 'nectar-tee-back.jpg', 'Nectar Tee Back View')
    ],
    metadata: {
      material: '100% organic cotton',
      fit: 'Classic fit',
      features: ['Exclusive colorway', 'Limited edition', 'Sustainable materials'],
      care: 'Machine wash cold',
      sustainability: '100% organic cotton'
    }
  },

  // Regular (Unlimited) Items
  CLASSIC_MONARCH_TEE: {
    rewardId: 'CLASSIC_MONARCH_TEE',
    name: 'Classic Monarch Tee',
    description: 'Timeless t-shirt featuring the iconic Monarch butterfly design. Made from premium organic cotton with sustainable practices.',
    category: 'tops',
    rarity: 'common',
    wingsValue: 25,
    season: 'Spring2025',
    isActive: true,
    shopifyProductId: 'classic-monarch-tee-001',
    shopifyPrice: 3500, // $35.00
    shopifyHandle: 'classic-monarch-tee',
    images: [
      generateShopifyImage('classic-monarch-tee-001', 'img_012', 'classic-tee-front.jpg', 'Classic Monarch Tee Front View'),
      generateShopifyImage('classic-monarch-tee-001', 'img_013', 'classic-tee-back.jpg', 'Classic Monarch Tee Back View')
    ],
    metadata: {
      material: '100% organic cotton',
      fit: 'Classic fit',
      features: ['Iconic Monarch design', 'Sustainable materials', 'Comfortable fit'],
      care: 'Machine wash cold',
      sustainability: '100% organic cotton'
    }
  },

  MONARCH_SNAPBACK: {
    rewardId: 'MONARCH_SNAPBACK',
    name: 'Monarch Snapback',
    description: 'Classic snapback cap featuring embroidered Monarch butterfly design. Adjustable fit with premium construction.',
    category: 'headwear',
    rarity: 'uncommon',
    wingsValue: 40,
    season: 'Spring2025',
    isActive: true,
    shopifyProductId: 'monarch-snapback-001',
    shopifyPrice: 2800, // $28.00
    shopifyHandle: 'monarch-snapback',
    images: [
      generateShopifyImage('monarch-snapback-001', 'img_014', 'snapback-front.jpg', 'Monarch Snapback Front View'),
      generateShopifyImage('monarch-snapback-001', 'img_015', 'snapback-side.jpg', 'Monarch Snapback Side View')
    ],
    metadata: {
      material: 'Premium cotton twill',
      fit: 'Adjustable snapback',
      features: ['Embroidered design', 'Adjustable fit', 'Premium construction'],
      care: 'Spot clean only',
      sustainability: 'Sustainable materials'
    }
  },

  WING_COLLECTION_PINS: {
    rewardId: 'WING_COLLECTION_PINS',
    name: 'Wing Collection Pin Set',
    description: 'Collectible enamel pin set featuring various butterfly wing designs. Perfect for collectors and enthusiasts.',
    category: 'accessories',
    rarity: 'rare',
    wingsValue: 60,
    season: 'Spring2025',
    isActive: true,
    shopifyProductId: 'wing-pins-001',
    shopifyPrice: 1800, // $18.00
    shopifyHandle: 'wing-collection-pins',
    images: [
      generateShopifyImage('wing-pins-001', 'img_016', 'wing-pins-set.jpg', 'Wing Collection Pin Set'),
      generateShopifyImage('wing-pins-001', 'img_017', 'wing-pins-individual.jpg', 'Individual Wing Pins')
    ],
    metadata: {
      material: 'Enamel on metal',
      setSize: '5 pins',
      features: ['Collectible design', 'Enamel finish', 'Display case included'],
      care: 'Store in provided case',
      collectibility: 'Limited production runs'
    }
  },

  BLOOM_COLLECTION_HOODIE: {
    rewardId: 'BLOOM_COLLECTION_HOODIE',
    name: 'Bloom Collection Hoodie',
    description: 'Cozy pullover hoodie featuring the Bloom Collection design. Made from sustainable materials with comfortable fit.',
    category: 'hoodies',
    rarity: 'uncommon',
    wingsValue: 80,
    season: 'Spring2025',
    isActive: true,
    shopifyProductId: 'bloom-hoodie-001',
    shopifyPrice: 8900, // $89.00
    shopifyHandle: 'bloom-collection-hoodie',
    images: [
      generateShopifyImage('bloom-hoodie-001', 'img_018', 'bloom-hoodie-front.jpg', 'Bloom Hoodie Front View'),
      generateShopifyImage('bloom-hoodie-001', 'img_019', 'bloom-hoodie-back.jpg', 'Bloom Hoodie Back View')
    ],
    metadata: {
      material: 'Sustainable cotton blend',
      fit: 'Relaxed fit',
      features: ['Bloom design', 'Sustainable materials', 'Comfortable fit'],
      care: 'Machine wash cold',
      sustainability: 'Sustainable cotton blend'
    }
  },

  POLLINATE_COLLECTION_BAG: {
    rewardId: 'POLLINATE_COLLECTION_BAG',
    name: 'Pollinate Collection Bag',
    description: 'Eco-friendly tote bag featuring the Pollinate Collection design. Perfect for everyday use with sustainable construction.',
    category: 'accessories',
    rarity: 'common',
    wingsValue: 30,
    season: 'Spring2025',
    isActive: true,
    shopifyProductId: 'pollinate-bag-001',
    shopifyPrice: 2200, // $22.00
    shopifyHandle: 'pollinate-collection-bag',
    images: [
      generateShopifyImage('pollinate-bag-001', 'img_020', 'pollinate-bag-front.jpg', 'Pollinate Bag Front View'),
      generateShopifyImage('pollinate-bag-001', 'img_021', 'pollinate-bag-interior.jpg', 'Pollinate Bag Interior')
    ],
    metadata: {
      material: 'Recycled canvas',
      dimensions: '15" x 12" x 4"',
      features: ['Eco-friendly design', 'Recycled materials', 'Spacious interior'],
      care: 'Spot clean only',
      sustainability: '100% recycled materials'
    }
  }
};

// Utility functions for working with rewards
export const RewardUtils = {
  /**
   * Get all active rewards
   * @returns {MonarchReward[]}
   */
  getActiveRewards() {
    return Object.values(MONARCH_REWARDS).filter(reward => reward.isActive);
  },

  /**
   * Get all limited edition rewards
   * @returns {MonarchReward[]}
   */
  getLimitedEditionRewards() {
    return Object.values(MONARCH_REWARDS).filter(reward => 
      reward.isActive && reward.limitedEdition
    );
  },

  /**
   * Get all regular (unlimited) rewards
   * @returns {MonarchReward[]}
   */
  getRegularRewards() {
    return Object.values(MONARCH_REWARDS).filter(reward => 
      reward.isActive && !reward.limitedEdition
    );
  },

  /**
   * Get reward by ID
   * @param {string} rewardId
   * @returns {MonarchReward|null}
   */
  getRewardById(rewardId) {
    return MONARCH_REWARDS[rewardId] || null;
  },

  /**
   * Get rewards by category
   * @param {string} category
   * @returns {MonarchReward[]}
   */
  getRewardsByCategory(category) {
    return Object.values(MONARCH_REWARDS).filter(reward => 
      reward.isActive && reward.category === category
    );
  },

  /**
   * Get rewards by rarity
   * @param {string} rarity
   * @returns {MonarchReward[]}
   */
  getRewardsByRarity(rarity) {
    return Object.values(MONARCH_REWARDS).filter(reward => 
      reward.isActive && reward.rarity === rarity
    );
  },

  /**
   * Get rewards by season
   * @param {string} season
   * @returns {MonarchReward[]}
   */
  getRewardsBySeason(season) {
    return Object.values(MONARCH_REWARDS).filter(reward => 
      reward.isActive && reward.season === season
    );
  },

  /**
   * Check if reward is limited edition
   * @param {string} rewardId
   * @returns {boolean}
   */
  isLimitedEdition(rewardId) {
    const reward = MONARCH_REWARDS[rewardId];
    return reward ? !!reward.limitedEdition : false;
  },

  /**
   * Get limited edition configuration
   * @param {string} rewardId
   * @returns {LimitedEditionConfig|null}
   */
  getLimitedEditionConfig(rewardId) {
    const reward = MONARCH_REWARDS[rewardId];
    return reward?.limitedEdition || null;
  },

  /**
   * Get total WINGS value for a reward (including limited edition bonus)
   * @param {string} rewardId
   * @returns {number}
   */
  getTotalWingsValue(rewardId) {
    const reward = MONARCH_REWARDS[rewardId];
    if (!reward) return 0;

    const baseWings = reward.wingsValue;
    const bonusWings = reward.limitedEdition?.bonusWings || 0;
    
    return baseWings + bonusWings;
  },

  /**
   * Get Shopify product URL
   * @param {string} rewardId
   * @returns {string|null}
   */
  getShopifyUrl(rewardId) {
    const reward = MONARCH_REWARDS[rewardId];
    if (!reward?.shopifyHandle) return null;
    
    return `${SHOPIFY_CONFIG.baseUrl}/products/${reward.shopifyHandle}`;
  },

  /**
   * Get primary image for a reward
   * @param {string} rewardId
   * @returns {ShopifyImage|null}
   */
  getPrimaryImage(rewardId) {
    const reward = MONARCH_REWARDS[rewardId];
    return reward?.images?.[0] || null;
  },

  /**
   * Get exclusivity level info
   * @param {string} level
   * @returns {Object|null}
   */
  getExclusivityLevel(level) {
    return EXCLUSIVITY_LEVELS[level] || null;
  },

  /**
   * Get all exclusivity levels
   * @returns {Object}
   */
  getAllExclusivityLevels() {
    return EXCLUSIVITY_LEVELS;
  },

  /**
   * Get Monarch color palette
   * @returns {Object}
   */
  getMonarchColors() {
    return MONARCH_COLORS;
  }
};

// Export configuration constants
export const REWARD_CONFIG = {
  SHOPIFY_CONFIG,
  MONARCH_COLORS,
  EXCLUSIVITY_LEVELS
};

// Default export
export default MONARCH_REWARDS; 