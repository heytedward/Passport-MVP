/**
 * Stamp Images Configuration for Monarch Passport MVP
 * 
 * This module contains stamp image configurations and URLs
 * to avoid hardcoded base64 data in main code files.
 */

// Stamp image configurations
export const STAMP_IMAGES = {
  first_item: {
    id: 'first_item',
    name: 'First Item',
    description: 'Collect your first item',
    imageUrl: '/Stamps/stamp_first_item.svg',
    altText: 'First Item Stamp'
  },
  gm: {
    id: 'gm',
    name: 'Good Morning',
    description: 'Complete your first daily quest',
    imageUrl: '/Stamps/stamp_gm.svg',
    altText: 'Good Morning Stamp'
  },
  master: {
    id: 'master',
    name: 'Master Collector',
    description: 'Collect 10 unique items',
    imageUrl: '/Stamps/stamp_master.svg',
    altText: 'Master Collector Stamp'
  },
  passport: {
    id: 'passport',
    name: 'Passport Holder',
    description: 'Unlock your digital passport',
    imageUrl: '/Stamps/stamp_passport.svg',
    altText: 'Passport Holder Stamp'
  },
  qr: {
    id: 'qr',
    name: 'QR Scanner',
    description: 'Scan your first QR code',
    imageUrl: '/Stamps/stamp_qr.svg',
    altText: 'QR Scanner Stamp'
  },
  quest: {
    id: 'quest',
    name: 'Quest Master',
    description: 'Complete 5 quests',
    imageUrl: '/Stamps/stamp_quest.svg',
    altText: 'Quest Master Stamp'
  },
  social: {
    id: 'social',
    name: 'Social Butterfly',
    description: 'Connect with 3 friends',
    imageUrl: '/Stamps/stamp_social.svg',
    altText: 'Social Butterfly Stamp'
  },
  streak: {
    id: 'streak',
    name: 'Streak Keeper',
    description: 'Maintain a 7-day streak',
    imageUrl: '/Stamps/stamp_streak.svg',
    altText: 'Streak Keeper Stamp'
  },
  style: {
    id: 'style',
    name: 'Style Icon',
    description: 'Unlock 3 different themes',
    imageUrl: '/Stamps/stamp_style.svg',
    altText: 'Style Icon Stamp'
  }
};

// Get stamp image by ID
export function getStampImage(stampId) {
  return STAMP_IMAGES[stampId] || null;
}

// Get all stamp images
export function getAllStampImages() {
  return Object.values(STAMP_IMAGES);
}

// Get stamp image URL
export function getStampImageUrl(stampId) {
  const stamp = STAMP_IMAGES[stampId];
  return stamp ? stamp.imageUrl : null;
}

// Get stamp image alt text
export function getStampImageAlt(stampId) {
  const stamp = STAMP_IMAGES[stampId];
  return stamp ? stamp.altText : 'Stamp';
}

export default STAMP_IMAGES; 