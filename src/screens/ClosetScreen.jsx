import React, { useState, useEffect } from 'react';
import styled from 'styled-components';
import { createClient } from '@supabase/supabase-js';
import { useNavigate } from 'react-router-dom';
import GlassCard from '../components/GlassCard';
import { useThemes } from '../hooks/useThemes';
import { gradientThemes } from '../styles/theme';
import LimitedEditionBadge from '../components/LimitedEditionBadge';
import MintNumberDisplay from '../components/MintNumberDisplay';
import ExclusivityIndicator from '../components/ExclusivityIndicator';
import { useMonarchRewards } from '../hooks/useMonarchRewards';

const supabase = createClient(
  process.env.REACT_APP_SUPABASE_URL,
  process.env.REACT_APP_SUPABASE_ANON_KEY
);

// Item details for the flip cards
const itemBackDetails = {
  "Spring Jacket": {
    obtained: "Scanned QR at Papillon Flagship Store",
    date: "March 15, 2025", 
    location: "SoHo, NYC",
    season: "Spring 2025"
  },
  "Gold Chain": {
    obtained: "Scanned QR at Papillon Pop-up Store",
    date: "March 12, 2025",
    location: "Times Square, NYC", 
    season: "Spring 2025"
  },
  "Summer Hat": {
    obtained: "Scanned QR at Papillon Beach Event",
    date: "March 10, 2025",
    location: "Montauk, NY",
    season: "Summer 2025"
  },
  "Classic Hoodie": {
    obtained: "Scanned QR at Papillon Street Event",
    date: "March 8, 2025",
    location: "Brooklyn, NYC",
    season: "Classic Collection"
  },
  "Denim Jeans": {
    obtained: "Scanned QR at Papillon Denim Launch",
    date: "March 5, 2025",
    location: "LES, NYC",
    season: "Spring 2025"
  },
  "Long Sleeve Tee": {
    obtained: "Scanned QR at Papillon Essential Drop",
    date: "March 1, 2025",
    location: "Papillon Studio",
    season: "Classic Collection"
  },
  // "Monarch Badge": {
  //   obtained: "Achievement Unlocked",
  //   date: "March 20, 2025",
  //   location: "Digital Achievement",
  //   season: "Genesis Collection"
  // },
  // "VIP Pass": {
  //   obtained: "Scanned QR at VIP Event",
  //   date: "March 18, 2025",
  //   location: "Papillon HQ",
  //   season: "Spring 2025"
  // },
  "Butterfly Wallpaper": {
    obtained: "Community Event Reward",
    date: "March 22, 2025",
    location: "Digital Drop",
    season: "Genesis Collection"
  },
  // "Papillon Theme Song": {
  //   obtained: "Exclusive Audio Release",
  //   date: "March 20, 2025",
  //   location: "Digital Release",
  //   season: "Audio Collection"
  // },
  // "Golden Butterfly Sticker": {
  //   obtained: "Achievement Milestone",
  //   date: "March 18, 2025",
  //   location: "Digital Reward",
  //   season: "Sticker Pack Vol.1"
  // },
  // "3D Butterfly Model": {
  //   obtained: "Special Event Drop",
  //   date: "March 25, 2025",
  //   location: "Digital Event",
  //   season: "3D Collection"
  // }
};

// Updated mock data - removed tokens category, added new digital categories
const mockClosetItems = [
  {
    id: 1,
    item_type: 'physical_item',
    item_id: 'spring-jacket-001',
    name: 'Spring Jacket',
    rarity: 'rare',
    category: 'jackets',
    mint_number: 37,
    wings_earned: 75,
    earned_date: '2025-03-15',
    earned_via: 'qr_scan'
  },
  {
    id: 2,
    item_type: 'physical_item',
    item_id: 'gold-chain-001',
    name: 'Gold Chain',
    rarity: 'epic',
    category: 'accessories',
    mint_number: 3,
    wings_earned: 150,
    earned_date: '2025-03-12',
    earned_via: 'qr_scan'
  },
  {
    id: 3,
    item_type: 'physical_item',
    item_id: 'summer-hat-001',
    name: 'Summer Hat',
    rarity: 'common',
    category: 'headwear',
    mint_number: 21,
    wings_earned: 15,
    earned_date: '2025-03-10',
    earned_via: 'qr_scan'
  },
  {
    id: 4,
    item_type: 'physical_item',
    item_id: 'classic-hoodie-001',
    name: 'Classic Hoodie',
    rarity: 'rare',
    category: 'tops',
    mint_number: 89,
    wings_earned: 75,
    earned_date: '2025-03-08',
    earned_via: 'qr_scan'
  },
  {
    id: 5,
    item_type: 'physical_item',
    item_id: 'denim-jeans-001',
    name: 'Denim Jeans',
    rarity: 'rare',
    category: 'bottoms',
    mint_number: 156,
    wings_earned: 75,
    earned_date: '2025-03-05',
    earned_via: 'qr_scan'
  },
  {
    id: 6,
    item_type: 'physical_item',
    item_id: 'long-sleeve-tee-001',
    name: 'Long Sleeve Tee',
    rarity: 'common',
    category: 'tops',
    mint_number: 203,
    wings_earned: 15,
    earned_date: '2025-03-01',
    earned_via: 'qr_scan'
  },
  // {
  //   id: 7,
  //   item_type: 'digital_collectible',
  //   item_id: 'monarch-badge-001',
  //   name: 'Monarch Badge',
  //   rarity: 'legendary',
  //   category: 'badges',
  //   mint_number: 1,
  //   wings_earned: 300,
  //   earned_date: '2025-03-20',
  //   earned_via: 'achievement'
  // },
  // {
  //   id: 8,
  //   item_type: 'digital_collectible',
  //   item_id: 'vip-pass-001',
  //   name: 'VIP Pass',
  //   rarity: 'epic',
  //   category: 'passes',
  //   mint_number: 7,
  //   wings_earned: 150,
  //   earned_date: '2025-03-18',
  //   earned_via: 'qr_scan'
  // },
  // NEW DIGITAL COLLECTIBLE CATEGORIES (removed tokens)
  {
    id: 9,
    item_type: 'digital_collectible',
    item_id: 'butterfly-wallpaper-001',
    name: 'Butterfly Wallpaper',
    rarity: 'epic',
    category: 'wallpapers',
    mint_number: 12,
    wings_earned: 150,
    earned_date: '2025-03-22',
    earned_via: 'achievement',
    file_type: 'image',
    file_url: 'https://example.com/wallpaper.jpg'
  },
  // {
  //   id: 10,
  //   item_type: 'digital_collectible',
  //   item_id: 'papillon-theme-song-001',
  //   name: 'Papillon Theme Song',
  //   rarity: 'rare',
  //   category: 'audio_stickers',
  //   mint_number: 45,
  //   wings_earned: 35,
  //   earned_date: '2025-03-20',
  //   earned_via: 'community_event',
  //   file_type: 'audio',
  //   file_url: 'https://example.com/theme.mp3'
  // },
  // {
  //   id: 11,
  //   item_type: 'digital_collectible',
  //   item_id: 'golden-butterfly-sticker-001',
  //   name: 'Golden Butterfly Sticker',
  //   rarity: 'legendary',
  //   category: 'stickers',
  //   mint_number: 5,
  //   wings_earned: 60,
  //   earned_date: '2025-03-18',
  //   earned_via: 'milestone',
  //   file_type: 'image',
  //   file_url: 'https://example.com/sticker.png'
  // },
  // {
  //   id: 12,
  //   item_type: 'digital_collectible',
  //   item_id: '3d-butterfly-001',
  //   name: '3D Butterfly Model',
  //   rarity: 'epic',
  //   category: 'stickers',
  //   mint_number: 15,
  //   wings_earned: 50,
  //   earned_date: '2025-03-25',
  //   earned_via: 'special_event',
  //   file_type: '3d_model',
  //   file_url: 'https://example.com/3d-butterfly.glb',
  //   preview_mp4: 'https://example.com/3d-butterfly-preview.mp4' // MP4 preview for 3D objects
  // }
];

// Theme unlock requirements
const themeUnlockRequirements = {
  frequencyPulse: {
    name: 'Frequency Pulse',
    description: 'The default theme - available to all users',
    requirements: ['Sign up for Monarch Passport'],
    unlocked: true,
    icon: '🌊',
    rarity: 'common'
  },
  solarShine: {
    name: 'Solar Shine',
    description: 'Bright golden energy theme',
    requirements: ['Scan 10 QR codes', 'Earn 100 WNGS'],
    unlocked: false,
    icon: '☀️',
    rarity: 'rare'
  },
  echoGlass: {
    name: 'Echo Glass',
    description: 'Mysterious dark glass theme',
    requirements: ['Complete 5 daily quests', 'Reach level 5'],
    unlocked: false,
    icon: '🌑',
    rarity: 'epic'
  },
  retroFrame: {
    name: 'Retro Frame',
    description: 'Classic vintage aesthetic',
    requirements: ['Collect 3 physical items', 'Join community event'],
    unlocked: false,
    icon: '📼',
    rarity: 'rare'
  },
  nightScan: {
    name: 'Night Scan',
    description: 'Elite scanner theme for night owls',
    requirements: ['Scan QR code after midnight', 'Earn 500 WNGS', 'Complete weekly challenge'],
    unlocked: false,
    icon: '🌙',
    rarity: 'legendary'
  }
};

const Container = styled.div`
  max-width: 1200px;
  margin: 0 auto;
  padding: 2rem 1rem 6rem 1rem;
  min-height: 100vh;
`;

const ScreenTitle = styled.h1`
  font-family: ${({ theme }) => theme.typography.fontFamily.heading};
  font-weight: 700;
  color: ${({ theme }) => theme.colors.text.primary};
  font-size: 2rem;
  margin-bottom: 1.5rem;
  text-align: center;
`;

const MainFilterTabs = styled.div`
  display: flex;
  gap: 1rem;
  margin-bottom: 1.5rem;
  justify-content: center;
`;

const SubFilterTabs = styled.div`
  display: flex;
  gap: 0.8rem;
  margin-bottom: 2rem;
  overflow-x: auto;
  padding-bottom: 0.5rem;
  position: relative;
  top: 3x;
  
  &::-webkit-scrollbar {
    height: 4px;
  }
  
  &::-webkit-scrollbar-track {
    background: rgba(255, 255, 255, 0.1);
    border-radius: 2px;
  }
  
  &::-webkit-scrollbar-thumb {
    background: ${({ theme }) => theme.colors.accent.purple};
    border-radius: 2px;
  }
`;

const FilterTab = styled.button`
  padding: 0.5rem 2rem;
  border-radius: 12px;
  border: 2px solid ${({ active, theme }) => (active ? theme.colors.accent.gold : 'transparent')};
  background: ${({ active, theme, type }) => {
    if (active) {
      return type === 'main' ? theme.colors.accent.gold : theme.colors.accent.purple;
    }
    return 'rgba(255, 255, 255, 0.05)';
  }};
  color: ${({ active, theme }) => 
    active ? (theme.colors.background === '#000000' ? '#000000' : theme.colors.text.primary) : theme.colors.text.secondary};
  font-weight: ${({ active }) => active ? '600' : '500'};
  cursor: pointer;
  transition: all 0.2s ease;
  white-space: nowrap;
  min-width: fit-content;
  
  &:hover {
    background: ${({ active, theme, type }) => {
      if (active) return null;
      return type === 'main' ? 'rgba(255, 176, 0, 0.1)' : 'rgba(76, 28, 140, 0.1)';
    }};
    transform: translateY(-1px);
  }
`;

const ItemsGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 12px;
  margin-bottom: 2rem;
  
  @media (max-width: 768px) {
    grid-template-columns: repeat(2, 1fr);
    gap: 8px;
  }
  
  @media (max-width: 480px) {
    grid-template-columns: repeat(1, 1fr);
    gap: 8px;
  }
`;

const ItemCard = styled(GlassCard)`
  padding: 1.5rem;
  cursor: pointer;
  transition: all 0.2s ease;
  border: 3px solid ${({ rarity, theme, isLimitedEdition }) => {
    if (isLimitedEdition) return '#FFB000';
    switch(rarity) {
      case 'legendary': return theme.colors.accent.gold;
      case 'epic': return '#9B4BFF';
      case 'rare': return '#4B9CD3';
      default: return theme.colors.accent.purple;
    }
  }};
  box-shadow: 
    0 0 12px 0 ${({ rarity, isLimitedEdition }) => {
      if (isLimitedEdition) return 'rgba(255,176,0,0.2)';
      switch(rarity) {
        case 'legendary': return 'rgba(255,215,0,0.15)';
        case 'epic': return 'rgba(155,75,255,0.15)';
        case 'rare': return 'rgba(75,156,211,0.15)';
        default: return 'rgba(76,28,140,0.15)';
      }
    }},
    0 0 24px 0 ${({ rarity, isLimitedEdition }) => {
      if (isLimitedEdition) return 'rgba(255,176,0,0.1)';
      switch(rarity) {
        case 'legendary': return 'rgba(255,215,0,0.08)';
        case 'epic': return 'rgba(155,75,255,0.08)';
        case 'rare': return 'rgba(75,156,211,0.08)';
        default: return 'rgba(76,28,140,0.08)';
      }
    }},
    inset 0 1px 0 ${({ rarity }) => {
      switch(rarity) {
        case 'legendary': return 'rgba(255,215,0,0.1)';
        case 'epic': return 'rgba(155,75,255,0.1)';
        case 'rare': return 'rgba(75,156,211,0.1)';
        default: return 'rgba(76,28,140,0.1)';
      }
    }};
  
  &:hover {
    transform: translateY(-3px) scale(1.02);
    box-shadow: 
      0 0 20px 0 ${({ rarity }) => {
        switch(rarity) {
          case 'legendary': return 'rgba(255,215,0,0.3)';
          case 'epic': return 'rgba(155,75,255,0.3)';
          case 'rare': return 'rgba(75,156,211,0.3)';
          default: return 'rgba(76,28,140,0.3)';
        }
      }},
      0 0 40px 0 ${({ rarity }) => {
        switch(rarity) {
          case 'legendary': return 'rgba(255,215,0,0.15)';
          case 'epic': return 'rgba(155,75,255,0.15)';
          case 'rare': return 'rgba(75,156,211,0.15)';
          default: return 'rgba(76,28,140,0.15)';
        }
      }},
      inset 0 1px 0 ${({ rarity }) => {
        switch(rarity) {
          case 'legendary': return 'rgba(255,215,0,0.2)';
          case 'epic': return 'rgba(155,75,255,0.2)';
          case 'rare': return 'rgba(75,156,211,0.2)';
          default: return 'rgba(76,28,140,0.2)';
        }
      }};
  }
`;

const CardIcon = styled.div`
  width: 100%;
  height: 60%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 3rem;
  margin-bottom: 0.5rem;
  position: relative;
  
  @media (max-width: 768px) {
    font-size: 2.5rem;
  }
  
  @media (max-width: 480px) {
    font-size: 2rem;
  }
`;

const CardContent = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  text-align: center;
  flex: 1;
  justify-content: space-between;
`;

const CardName = styled.div`
  font-size: 0.9rem;
  font-weight: 600;
  color: ${({ theme }) => theme.colors.text.primary};
  margin-bottom: 0.5rem;
  line-height: 1.2;
  word-wrap: break-word;
  
  @media (max-width: 768px) {
    font-size: 0.8rem;
  }
  
  @media (max-width: 480px) {
    font-size: 0.75rem;
  }
`;

const CardRarity = styled.div`
  font-size: 0.7rem;
  font-weight: 500;
  color: ${({ rarity, theme }) => {
    switch(rarity) {
      case 'legendary': return theme.colors.accent.gold;
      case 'epic': return '#9B4BFF';
      case 'rare': return '#4B9CD3';
      default: return theme.colors.text.secondary;
    }
  }};
  text-transform: uppercase;
  letter-spacing: 0.5px;
  margin-bottom: 0.5rem;
  
  @media (max-width: 768px) {
    font-size: 0.6rem;
  }
`;

const MintNumberBadge = styled.div`
  position: absolute;
  bottom: 8px;
  left: 8px;
  background: rgba(0, 0, 0, 0.8);
  color: white;
  font-size: 0.7rem;
  font-weight: 600;
  padding: 2px 6px;
  border-radius: 8px;
  border: 1px solid rgba(255, 255, 255, 0.2);
  
  @media (max-width: 768px) {
    font-size: 0.6rem;
    padding: 1px 4px;
  }
`;

const LimitedEditionIndicator = styled.div`
  position: absolute;
  top: 8px;
  right: 8px;
  background: #FFB000;
  color: black;
  font-size: 0.6rem;
  font-weight: 700;
  padding: 2px 6px;
  border-radius: 8px;
  text-transform: uppercase;
  letter-spacing: 0.5px;
  
  @media (max-width: 768px) {
    font-size: 0.5rem;
    padding: 1px 4px;
  }
`;

// New styled component for MP4 preview
const VideoPreview = styled.video`
  width: 100%;
  height: 100%;
  object-fit: cover;
  border-radius: 12px;
`;

const ItemName = styled.h3`
  font-family: ${({ theme }) => theme.typography.fontFamily.heading};
  font-size: 1.1rem;
  color: ${({ theme }) => theme.colors.text.primary};
  margin: 0 0 0.5rem 0;
`;

const ItemDetails = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  font-size: 0.9rem;
  color: ${({ theme }) => theme.colors.text.secondary};
  margin-bottom: 0.5rem;
`;

const ItemCategory = styled.div`
  font-size: 0.8rem;
  color: ${({ theme }) => theme.colors.text.secondary};
  text-transform: capitalize;
`;

const RarityBadge = styled.span`
  color: ${({ rarity, theme }) => {
    switch(rarity) {
      case 'legendary': return theme.colors.accent.gold;
      case 'epic': return '#9B4BFF';
      case 'rare': return '#4B9CD3';
      default: return theme.colors.accent.purple;
    }
  }};
  font-weight: 600;
  text-transform: capitalize;
`;

const EmptyState = styled.div`
  text-align: center;
  padding: 3rem;
  color: ${({ theme }) => theme.colors.text.secondary};
`;

const Stats = styled.div`
  display: flex;
  gap: 2rem;
  justify-content: center;
  margin-bottom: 2rem;
  color: ${({ theme }) => theme.colors.text.secondary};
`;

const LimitedEditionStats = styled.div`
  background: linear-gradient(135deg, rgba(255, 176, 0, 0.1) 0%, rgba(255, 159, 28, 0.1) 100%);
  border: 1px solid rgba(255, 176, 0, 0.3);
  border-radius: 16px;
  padding: 1.5rem;
  margin-bottom: 2rem;
  text-align: center;

  h3 {
    color: ${({ theme }) => theme.colors.accent.gold};
    font-size: 1.2rem;
    margin-bottom: 1rem;
    font-weight: 700;
  }

  .stats-grid {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(120px, 1fr));
    gap: 1rem;
    margin-bottom: 1rem;
  }

  .stat-item {
    text-align: center;
    
    .label {
      font-size: 0.8rem;
      color: ${({ theme }) => theme.colors.text.secondary};
      margin-bottom: 0.25rem;
      text-transform: uppercase;
      letter-spacing: 0.5px;
    }
    
    .value {
      font-size: 1.2rem;
      font-weight: 700;
      color: ${({ theme }) => theme.colors.text.primary};
    }
  }

  .exclusivity-breakdown {
    display: flex;
    justify-content: center;
    gap: 0.5rem;
    flex-wrap: wrap;
  }
`;

// Modal Styles (copied exactly from PassportScreen)
const ModalOverlay = styled.div`
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(18, 18, 18, 0.3);
  backdrop-filter: blur(20px);
  -webkit-backdrop-filter: blur(20px);
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 24px;
`;

const ModalCard = styled.div`
  width: 420px;
  max-width: 90vw;
  height: 600px;
  max-height: 90vh;
  perspective: 1200px;
  background: none;
  border-radius: 24px;
  @media (max-width: 480px) {
    width: 95vw;
    height: 520px;
    min-width: 0;
    padding: 0;
  }
`;

const FlipInner = styled.div`
  width: 100%;
  height: 100%;
  position: relative;
  transition: transform 0.7s cubic-bezier(0.4,0.2,0.2,1);
  transform-style: preserve-3d;
  ${({ isflipped }) => isflipped && `transform: rotateY(180deg);`}
`;

const Face = styled.div`
  position: absolute;
  width: 100%;
  height: 100%;
  backface-visibility: hidden;
  border-radius: 24px;
  background: linear-gradient(135deg, rgba(30,30,40,0.85) 0%, rgba(76,28,140,0.13) 100%), rgba(76, 28, 140, 0.15);
  border: 3px solid #FFD700;
  box-shadow: 
    0 0 20px 0 rgba(255,215,0,0.2),
    0 0 40px 0 rgba(255,215,0,0.1),
    inset 0 1px 0 rgba(255,215,0,0.15);
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 3rem 2rem 2rem 2rem;
`;

const FrontFace = styled(Face)``;
const BackFace = styled(Face)`
  transform: rotateY(180deg);
`;

const CloseButton = styled.button`
  position: absolute;
  top: 16px;
  right: 16px;
  background: none;
  border: none;
  color: white;
  font-size: 24px;
  cursor: pointer;
  z-index: 1;
  width: 32px;
  height: 32px;
  display: flex;
  align-items: center;
  justify-content: center;
`;

const LargeItemIcon = styled.div`
  font-size: 6rem;
  margin-bottom: 2rem;
`;

const LargeVideoPreview = styled.video`
  width: 200px;
  height: 200px;
  object-fit: cover;
  border-radius: 16px;
  margin-bottom: 2rem;
`;

const ModalTitle = styled.h2`
  font-size: 1.8rem;
  font-weight: 700;
  color: ${({ theme }) => theme.colors.text.primary};
  margin-bottom: 1rem;
  text-align: center;
`;

const ModalHint = styled.div`
  font-size: 1.1rem;
  color: #FFD700;
  margin-top: 2rem;
  text-align: center;
`;

const ModalDetails = styled.div`
  margin-top: 0.8rem;
  color: ${({ theme }) => theme.colors.text.primary};
  font-size: 1.2rem;
  text-align: center;
  line-height: 1.6;
`;

const ModalDetailLabel = styled.span`
  color: #FFD700;
  font-weight: 600;
`;

const ModalDescription = styled.div`
  margin-top: 1rem;
  color: ${({ theme }) => theme.colors.text.primary};
  font-size: 1.1rem;
  text-align: center;
  line-height: 1.8;
`;

const Description = styled.div`
  font-size: 1rem;
  color: ${({ theme }) => theme.colors.text.secondary};
  margin-top: 1rem;
  text-align: center;
  line-height: 1.6;
`;

// Item Modal Component (using exact passport logic)
const ItemModal = ({ item, isOpen, onClose }) => {
  const { equipTheme, userProgress } = useThemes();
  const [isFlipped, setIsFlipped] = useState(false);
  const navigate = useNavigate();
  
  if (!isOpen || !item) return null;
  
  const details = itemBackDetails[item.name] || {
    obtained: "Scanned QR at Papillon Store",
    date: "March 2025",
    location: "NYC",
    season: "Spring 2025"
  };
  
  const handleFlip = () => {
    setIsFlipped(!isFlipped);
  };
  
  const handleOverlayClick = (e) => {
    if (e.target === e.currentTarget) {
      onClose();
    }
  };

  const handleEquipTheme = async () => {
    if (item.category === 'themes' && item.unlocked) {
      const success = await equipTheme(item.item_id);
      if (success) {
        onClose();
        // Navigate to passport to see the immediate change
        navigate('/passport');
      }
    }
  };

  // Helper function to get progress for requirements
  const getProgressForRequirement = (req) => {
    switch (req.id) {
      case 'first_scan':
        return userProgress.totalScans;
      case 'quests':
        return userProgress.totalQuests;
      case 'items':
        return userProgress.totalItems;
      case 'wings':
        return userProgress.totalWings;
      default:
        return 0;
    }
  };

  // Check if item has MP4 preview for 3D models
  const hasVideoPreview = item.preview_mp4 && item.file_type === '3d_model';
  
  return (
    <ModalOverlay onClick={handleOverlayClick}>
      <CloseButton onClick={onClose} aria-label="Close">×</CloseButton>
      <ModalCard onClick={e => e.stopPropagation()}>
        <FlipInner isflipped={isFlipped}>
          <FrontFace 
            onClick={() => setIsFlipped(true)}
            style={item.category === 'themes' ? { background: item.gradient } : {}}
          >
            {hasVideoPreview ? (
              <LargeVideoPreview
                autoPlay
                loop
                muted
                playsInline
                src={item.preview_mp4}
              />
            ) : (
              <LargeItemIcon style={{ position: 'relative' }}>
                {getItemIcon(item.category, item.item_type, item)}
                {item.category === 'themes' && !item.unlocked && (
                  <div style={{
                    position: 'absolute',
                    top: '50%',
                    left: '50%',
                    transform: 'translate(-50%, -50%)',
                    fontSize: '2rem',
                    color: '#fff',
                    textShadow: '0 0 8px rgba(0,0,0,0.8)'
                  }}>
                    🔒
                  </div>
                )}
              </LargeItemIcon>
            )}
            <ModalTitle>{item.name}</ModalTitle>
            <ModalDetails>
              {item.rarity.charAt(0).toUpperCase() + item.rarity.slice(1)} • {item.item_type === 'physical_item' ? 'Physical' : 'Digital'}
            </ModalDetails>
            {item.category === 'themes' ? (
              <ModalDescription>{item.description}</ModalDescription>
            ) : (
              <ModalDetails>#{item.mint_number}</ModalDetails>
            )}
            {item.category === 'themes' && item.equipped && (
              <div style={{ color: '#FFD700', marginTop: '1rem', fontWeight: 'bold' }}>
                ✓ Currently Equipped
              </div>
            )}
            <ModalHint>Tap to flip</ModalHint>
          </FrontFace>
          <BackFace onClick={() => setIsFlipped(false)}>
            {item.category === 'themes' ? (
              <>
                {console.log('Modal item:', { 
                  name: item.name, 
                  unlocked: item.unlocked, 
                  equipped: item.equipped,
                  requirements: item.requirements 
                })}
                <ModalTitle>Unlock Requirements</ModalTitle>
                <ModalDetails>
                  <div style={{ textAlign: 'left', lineHeight: '2' }}>
                    {(item.requirements || []).map((req, index) => (
                      <div key={index} style={{ 
                        display: 'flex', 
                        alignItems: 'center', 
                        marginBottom: '12px',
                        color: req.completed ? '#10B981' : '#fff'
                      }}>
                        <span style={{ marginRight: '12px', fontSize: '1.2rem' }}>
                          {req.completed ? '✅' : '⭕'}
                        </span>
                        {req.text}
                        {req.target && (
                          <span style={{ 
                            marginLeft: '8px', 
                            fontSize: '0.9rem', 
                            opacity: 0.7,
                            color: req.completed ? '#10B981' : '#fff'
                          }}>
                            ({getProgressForRequirement(req)}/{req.target})
                          </span>
                        )}
                      </div>
                    ))}
                  </div>
                </ModalDetails>
                {!item.unlocked ? (
                  <ModalDescription style={{ color: '#ff6b6b', marginTop: '1rem' }}>
                    Complete the requirements above to unlock this theme!
                  </ModalDescription>
                ) : (
                  <div style={{ marginTop: '2rem', textAlign: 'center' }}>
                    <button 
                      onClick={(e) => { e.stopPropagation(); handleEquipTheme(); }}
                      style={{
                        background: 'linear-gradient(135deg, #FFB000 0%, #FF9F1C 100%)',
                        color: '#000',
                        border: 'none',
                        borderRadius: '12px',
                        padding: '16px 32px',
                        fontWeight: 'bold',
                        fontSize: '1.1rem',
                        cursor: 'pointer',
                        boxShadow: '0 4px 12px rgba(255, 176, 0, 0.3)',
                        transition: 'all 0.2s ease'
                      }}
                      onMouseEnter={(e) => {
                        e.target.style.transform = 'translateY(-2px)';
                        e.target.style.boxShadow = '0 6px 16px rgba(255, 176, 0, 0.4)';
                      }}
                      onMouseLeave={(e) => {
                        e.target.style.transform = 'translateY(0)';
                        e.target.style.boxShadow = '0 4px 12px rgba(255, 176, 0, 0.3)';
                      }}
                    >
                      🎨 Equip Theme
                    </button>
                  </div>
                )}
              </>
            ) : (
              <>
                <ModalTitle>How You Earned This</ModalTitle>
                <ModalDetails>
                  <div><ModalDetailLabel>Obtained:</ModalDetailLabel> {details.obtained}</div>
                  <div><ModalDetailLabel>Date:</ModalDetailLabel> {details.date}</div>
                  <div><ModalDetailLabel>Location:</ModalDetailLabel> {details.location}</div>
                  <div><ModalDetailLabel>Season:</ModalDetailLabel> {details.season}</div>
                  <div><ModalDetailLabel>WNGS:</ModalDetailLabel> +{item.wings_earned}</div>
                </ModalDetails>
              </>
            )}
            <ModalHint>Tap to flip back</ModalHint>
          </BackFace>
        </FlipInner>
      </ModalCard>
    </ModalOverlay>
  );
};

const ClosetScreen = () => {
  const { ownedThemes, equippedTheme, equipTheme, checkThemeOwnership, getThemeRequirements, userProgress } = useThemes();
  const { getRewardById, getLimitedEditionRewards } = useMonarchRewards();
  const [mainFilter, setMainFilter] = useState('all'); // 'all', 'physical', 'digital', 'limited'
  const [subFilter, setSubFilter] = useState('all');
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState(null);
  const [selectedItem, setSelectedItem] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    // Get current user
    const getUser = async () => {
      try {
        console.log('Getting current user...');
        
        // Add timeout for user auth check
        const timeoutPromise = new Promise((_, reject) => 
          setTimeout(() => reject(new Error('Auth timeout')), 3000)
        );
        
        const authPromise = supabase.auth.getUser();
        const { data: { user } } = await Promise.race([authPromise, timeoutPromise]);
        
        console.log('User auth result:', user ? 'Authenticated' : 'Not authenticated');
        setUser(user);
        
        if (user) {
          await loadUserItems(user.id);
        } else {
          // If no user, show empty state
          console.log('No authenticated user, showing empty state');
          setItems([]);
          setLoading(false);
        }
      } catch (error) {
        console.error('Error getting user:', error);
        console.log('Auth error, showing empty state');
        // On any error, show empty state
        setItems([]);
        setLoading(false);
      }
    };
    getUser();
  }, []);

  const loadUserItems = async (userId) => {
    try {
      setLoading(true);
      console.log('Loading items for user:', userId);
      
      // Check if supabase is properly configured
      if (!process.env.REACT_APP_SUPABASE_URL || !process.env.REACT_APP_SUPABASE_ANON_KEY) {
        console.log('Supabase not configured, showing empty state');
        setItems([]);
        setLoading(false);
        return;
      }
      
      // Add timeout to prevent infinite loading
      const timeoutPromise = new Promise((_, reject) => 
        setTimeout(() => reject(new Error('Database query timeout')), 5000)
      );
      
      const queryPromise = supabase
        .from('user_closet')
        .select('*')
        .eq('user_id', userId)
        .order('earned_date', { ascending: false });

      const { data: closetItems, error } = await Promise.race([queryPromise, timeoutPromise]);

      if (error) {
        console.error('Database error:', error);
        throw error;
      }

      console.log('Database query successful, items found:', closetItems?.length || 0);

      // Use real database items or empty array
      setItems(closetItems || []);
    } catch (error) {
      console.error('Error loading closet items:', error);
      console.log('Error occurred, showing empty state');
      // On error, show empty state
      setItems([]);
    } finally {
      setLoading(false);
    }
  };

  // Convert themes to digital items with proper requirements
  const getThemeItems = () => {
    return Object.entries(gradientThemes).map(([key, theme]) => {
      const themeRequirements = getThemeRequirements(key);
      const isUnlocked = checkThemeOwnership(key);
      
      console.log(`Theme ${key}:`, { 
        isUnlocked, 
        ownedThemes: ownedThemes, 
        requirements: themeRequirements 
      });
      
      return {
        id: `theme-${key}`,
        item_type: 'digital_collectible',
        item_id: key,
        name: theme.name,
        rarity: 'epic', // All themes are epic rarity
        category: 'themes',
        gradient: theme.gradient,
        icon: '🎨',
        description: themeRequirements?.description || '',
        requirements: themeRequirements?.requirements || [],
        unlocked: true, // TEMPORARY: Force all themes unlocked for testing
        equipped: equippedTheme === key,
        earned_date: '2025-03-01',
        earned_via: 'unlock',
        wings_earned: 0
      };
    });
  };

  // Combine regular items with theme items
  const allItems = [...items, ...getThemeItems()];

  // Enhance items with limited edition information
  const enhancedItems = allItems.map(item => {
    const staticReward = getRewardById(item.reward_id || item.item_id);
    const isLimitedEdition = staticReward?.limitedEdition;
    
    return {
      ...item,
      isLimitedEdition,
      limitedEditionConfig: staticReward?.limitedEdition,
      exclusivityLevel: staticReward?.limitedEdition?.exclusivityLevel || 'limited',
      totalSupply: staticReward?.limitedEdition?.totalSupply,
      staticReward
    };
  });

  // Filter items based on selected filters
  const filteredItems = enhancedItems.filter(item => {
    // Main filter (Physical/Digital/Limited)
    if (mainFilter === 'physical' && item.item_type !== 'physical_item') return false;
    if (mainFilter === 'digital' && item.item_type !== 'digital_collectible') return false;
    if (mainFilter === 'limited' && !item.isLimitedEdition) return false;

    // Sub filter (category)
    if (subFilter !== 'all' && item.category !== subFilter) return false;

    return true;
  });

  // Calculate limited edition statistics
  const limitedEditionItems = enhancedItems.filter(item => item.isLimitedEdition);
  const limitedEditionStats = {
    total: limitedEditionItems.length,
    byExclusivity: limitedEditionItems.reduce((acc, item) => {
      const level = item.exclusivityLevel;
      acc[level] = (acc[level] || 0) + 1;
      return acc;
    }, {}),
    totalSupply: limitedEditionItems.reduce((sum, item) => sum + (item.totalSupply || 0), 0),
    averageRarity: limitedEditionItems.length > 0 ? 
      limitedEditionItems.reduce((sum, item) => sum + (item.totalSupply || 0), 0) / limitedEditionItems.length : 0
  };

  // Get unique categories for sub-filters
  const getSubFilterOptions = () => {
    const categories = [...new Set(allItems
      .filter(item => {
        if (mainFilter === 'physical') return item.item_type === 'physical_item';
        if (mainFilter === 'digital') return item.item_type === 'digital_collectible';
        return true;
      })
      .map(item => item.category))];
    
    return categories.sort();
  };

  // Calculate stats
  const stats = {
    total: allItems.length,
    physical: allItems.filter(item => item.item_type === 'physical_item').length,
    digital: allItems.filter(item => item.item_type === 'digital_collectible').length,
    limited: limitedEditionItems.length,
    legendary: allItems.filter(item => item.rarity === 'legendary').length,
    epic: allItems.filter(item => item.rarity === 'epic').length,
  };

  if (loading) {
    return (
      <Container>
        <ScreenTitle>My Closet</ScreenTitle>
        <div style={{ textAlign: 'center', padding: '3rem' }}>Loading your collection...</div>
      </Container>
    );
  }

  return (
    <Container>
      <ScreenTitle>My Closet</ScreenTitle>
      
      <Stats>
        <div>Total: {stats.total}</div>
        <div>Physical: {stats.physical}</div>
        <div>Digital: {stats.digital}</div>
        <div>Limited: {stats.limited}</div>
        <div>Legendary: {stats.legendary}</div>
        <div>Epic: {stats.epic}</div>
      </Stats>

      {/* Limited Edition Collection Stats */}
      {limitedEditionStats.total > 0 && (
        <LimitedEditionStats>
          <h3>Limited Edition Collection</h3>
          <div className="stats-grid">
            <div className="stat-item">
              <div className="label">Total Limited Items</div>
              <div className="value">{limitedEditionStats.total}</div>
            </div>
            <div className="stat-item">
              <div className="label">Total Supply</div>
              <div className="value">{limitedEditionStats.totalSupply.toLocaleString()}</div>
            </div>
            <div className="stat-item">
              <div className="label">Avg. Rarity</div>
              <div className="value">{Math.round(limitedEditionStats.averageRarity)}</div>
            </div>
          </div>
          <div className="exclusivity-breakdown">
            {Object.entries(limitedEditionStats.byExclusivity).map(([level, count]) => (
              <LimitedEditionBadge
                key={level}
                exclusivityLevel={level}
                size="small"
                showIcon={false}
              />
            ))}
          </div>
        </LimitedEditionStats>
      )}

      <MainFilterTabs>
        <FilterTab 
          type="main"
          active={mainFilter === 'all'} 
          onClick={() => {
            setMainFilter('all');
            setSubFilter('all');
          }}
        >
          All Items
        </FilterTab>
        <FilterTab 
          type="main"
          active={mainFilter === 'physical'} 
          onClick={() => {
            setMainFilter('physical');
            setSubFilter('all');
          }}
        >
          Physical
        </FilterTab>
        <FilterTab 
          type="main"
          active={mainFilter === 'digital'} 
          onClick={() => {
            setMainFilter('digital');
            setSubFilter('all');
          }}
        >
          Digital
        </FilterTab>
        <FilterTab 
          type="main"
          active={mainFilter === 'limited'} 
          onClick={() => {
            setMainFilter('limited');
            setSubFilter('all');
          }}
        >
          Limited Edition
        </FilterTab>
      </MainFilterTabs>

      <SubFilterTabs>
        <FilterTab 
          type="sub"
          active={subFilter === 'all'} 
          onClick={() => setSubFilter('all')}
        >
          All Categories
        </FilterTab>
        {getSubFilterOptions().map(category => (
          <FilterTab 
            key={category}
            type="sub"
            active={subFilter === category} 
            onClick={() => setSubFilter(category)}
          >
            {getCategoryDisplayName(category)}
          </FilterTab>
        ))}
      </SubFilterTabs>

      {filteredItems.length > 0 ? (
        <ItemsGrid>
          {filteredItems.map(item => (
            <ItemCard 
              key={item.id}
              rarity={item.rarity}
              isLimitedEdition={item.isLimitedEdition}
              onClick={() => setSelectedItem(item)}
              style={item.category === 'themes' ? {
                background: item.gradient,
                border: item.equipped ? '3px solid #FFD700' : '3px solid rgba(255, 255, 255, 0.2)',
                opacity: item.unlocked ? 1 : 0.6
              } : {}}
            >
              {/* Limited Edition Indicator */}
              {item.isLimitedEdition && (
                <LimitedEditionIndicator>
                  Limited
                </LimitedEditionIndicator>
              )}
              
              {/* Mint Number Badge */}
              {item.mint_number && (
                <MintNumberBadge>
                  #{item.mint_number}
                </MintNumberBadge>
              )}
              
              <CardContent>
                <CardIcon>
                  {item.preview_mp4 && item.file_type === '3d_model' ? (
                    <VideoPreview
                      autoPlay
                      loop
                      muted
                      playsInline
                      src={item.preview_mp4}
                    />
                  ) : (
                    <div style={{ 
                      fontSize: item.category === 'themes' ? '3rem' : '3rem',
                      position: 'relative' 
                    }}>
                      {getItemIcon(item.category, item.item_type, item)}
                      {item.category === 'themes' && !item.unlocked && (
                        <div style={{
                          position: 'absolute',
                          top: '50%',
                          left: '50%',
                          transform: 'translate(-50%, -50%)',
                          fontSize: '1.5rem',
                          color: '#fff',
                          textShadow: '0 0 4px rgba(0,0,0,0.8)'
                        }}>
                          🔒
                        </div>
                      )}
                      {item.category === 'themes' && item.equipped && (
                        <div style={{
                          position: 'absolute',
                          top: '-10px',
                          right: '-10px',
                          fontSize: '1rem',
                          color: '#FFD700'
                        }}>
                          ✓
                        </div>
                      )}
                    </div>
                  )}
                </CardIcon>
                
                <div>
                  <CardName>{item.name}</CardName>
                  <CardRarity rarity={item.rarity}>{item.rarity}</CardRarity>
                  
                  {/* Theme-specific indicators */}
                  {item.category === 'themes' && item.equipped && (
                    <div style={{ 
                      color: '#FFD700', 
                      fontSize: '0.6rem', 
                      fontWeight: '600',
                      textTransform: 'uppercase',
                      letterSpacing: '0.5px'
                    }}>
                      ✓ Equipped
                    </div>
                  )}
                  {item.category === 'themes' && !item.unlocked && (
                    <div style={{ 
                      color: '#ff6b6b', 
                      fontSize: '0.6rem', 
                      fontWeight: '600',
                      textTransform: 'uppercase',
                      letterSpacing: '0.5px'
                    }}>
                      🔒 Locked
                    </div>
                  )}
                </div>
              </CardContent>
            </ItemCard>
          ))}
        </ItemsGrid>
      ) : (
        <EmptyState>
          {loading ? (
            <>
              <div style={{ fontSize: '4rem', marginBottom: '1rem' }}>⏳</div>
              <div style={{ fontSize: '1.2rem', marginBottom: '0.5rem' }}>Loading your closet...</div>
              <div style={{ fontSize: '1rem', color: 'rgba(255,255,255,0.6)' }}>Checking for your Papillon treasures</div>
            </>
          ) : mainFilter === 'all' ? (
            <>
              <div style={{ fontSize: '4rem', marginBottom: '1rem' }}>👕</div>
              <div style={{ fontSize: '1.2rem', marginBottom: '0.5rem' }}>Your closet is looking a bit empty...</div>
              <div style={{ fontSize: '1rem', color: 'rgba(255,255,255,0.6)' }}>Start scanning QR codes to collect your first Papillon items!</div>
            </>
          ) : (
            <>
              <div style={{ fontSize: '4rem', marginBottom: '1rem' }}>🔍</div>
              <div style={{ fontSize: '1.2rem', marginBottom: '0.5rem' }}>No {mainFilter} items found</div>
              <div style={{ fontSize: '1rem', color: 'rgba(255,255,255,0.6)' }}>Try scanning more QR codes or check other categories</div>
            </>
          )}
        </EmptyState>
      )}

      {/* Item Modal */}
      <ItemModal
        item={selectedItem}
        isOpen={!!selectedItem}
        onClose={() => setSelectedItem(null)}
      />
    </Container>
  );
};

// Helper function to get appropriate icon for each item type
const getItemIcon = (category, itemType, item = null) => {
  const physicalIcons = {
    jackets: '🧥',
    tops: '👕',
    bottoms: '👖',
    headwear: '🧢',
    accessories: '⛓️',
    footwear: '👟'
  };

  // Updated digital icons - removed tokens, added new categories
  const digitalIcons = {
    // badges: '🏆',
    // passes: '🎫',
    wallpapers: '🖼️',
    // audio_stickers: '🎵',
    // stickers: '💎',
    tickets: '🎟️',
    posters: '🖼️',
    themes: '🎨'
  };

  if (itemType === 'physical_item') {
    return physicalIcons[category] || '👕';
  } else if (category === 'themes' && item?.icon) {
    return item.icon;
  } else {
    return digitalIcons[category] || '💎';
  }
};

// Helper function to get proper display names for categories
const getCategoryDisplayName = (category) => {
  const displayNames = {
    // audio_stickers: 'Audio Stickers',
    wallpapers: 'Wallpapers',
    // stickers: 'Stickers',
    themes: 'Themes',
    // Keep existing ones
    jackets: 'Jackets',
    tops: 'Tops',
    bottoms: 'Bottoms',
    headwear: 'Headwear',
    accessories: 'Accessories',
    footwear: 'Footwear',
    // badges: 'Badges',
    // passes: 'Passes',
    tickets: 'Tickets',
    posters: 'Posters'
  };
  
  return displayNames[category] || category.charAt(0).toUpperCase() + category.slice(1);
};

export default ClosetScreen; 