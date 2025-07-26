/**
 * TypeScript declarations for Monarch Rewards Configuration System
 * PapillonLabs Monarch Passport MVP
 */

export interface ShopifyImage {
  id: string;
  src: string;
  alt: string;
  width: number;
  height: number;
  srcSet: {
    small: string;
    medium: string;
    large: string;
  };
}

export interface LimitedEditionConfig {
  totalSupply: number;
  bonusWings: number;
  exclusivityLevel: 'ultra_rare' | 'legendary' | 'mythic';
  endDate?: string;
  isActive?: boolean;
}

export interface MonarchReward {
  rewardId: string;
  name: string;
  description: string;
  category: string;
  rarity: 'common' | 'uncommon' | 'rare' | 'epic' | 'legendary' | 'mythic';
  wingsValue: number;
  season: string;
  isActive: boolean;
  images: ShopifyImage[];
  shopifyProductId: string;
  shopifyPrice: number;
  shopifyHandle?: string;
  limitedEdition?: LimitedEditionConfig;
  metadata: Record<string, any>;
}

export interface ExclusivityLevel {
  name: string;
  description: string;
  color: string;
  multiplier: number;
}

export interface MonarchColors {
  primary: string;
  secondary: string;
  accent: string;
  dark: string;
  light: string;
  gradient: {
    monarch: string;
    chrysalis: string;
    nectar: string;
    wing: string;
  };
}

export interface ShopifyConfig {
  baseUrl: string;
  imageBaseUrl: string;
  imageSuffix: string;
  defaultImageSize: string;
  altImageSize: string;
}

export interface RewardUtils {
  getActiveRewards(): MonarchReward[];
  getLimitedEditionRewards(): MonarchReward[];
  getRegularRewards(): MonarchReward[];
  getRewardById(rewardId: string): MonarchReward | null;
  getRewardsByCategory(category: string): MonarchReward[];
  getRewardsByRarity(rarity: string): MonarchReward[];
  getRewardsBySeason(season: string): MonarchReward[];
  isLimitedEdition(rewardId: string): boolean;
  getLimitedEditionConfig(rewardId: string): LimitedEditionConfig | null;
  getTotalWingsValue(rewardId: string): number;
  getShopifyUrl(rewardId: string): string | null;
  getPrimaryImage(rewardId: string): ShopifyImage | null;
  getExclusivityLevel(level: string): ExclusivityLevel | null;
  getAllExclusivityLevels(): Record<string, ExclusivityLevel>;
  getMonarchColors(): MonarchColors;
}

export interface RewardConfig {
  SHOPIFY_CONFIG: ShopifyConfig;
  MONARCH_COLORS: MonarchColors;
  EXCLUSIVITY_LEVELS: Record<string, ExclusivityLevel>;
}

declare const MONARCH_REWARDS: Record<string, MonarchReward>;
declare const RewardUtils: RewardUtils;
declare const REWARD_CONFIG: RewardConfig;

export { MONARCH_REWARDS, RewardUtils, REWARD_CONFIG };
export default MONARCH_REWARDS; 