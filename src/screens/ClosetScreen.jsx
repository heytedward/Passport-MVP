import React, { useState, useMemo, useCallback, memo } from 'react';
import styled from 'styled-components';
import { useNavigate } from 'react-router-dom';
import GlassCard from '../components/GlassCard';
import { useTheme } from '../hooks/useTheme';
import { useCloset } from '../hooks/useCloset';
import { useAuth } from '../hooks/useAuth';
import { gradientThemes } from '../styles/theme';
import NavBar from '../components/NavBar';



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

  "Butterfly Wallpaper": {
    obtained: "Community Event Reward",
    date: "March 22, 2025",
    location: "Digital Drop",
    season: "Genesis Collection"
  },

};

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
  
  @media (max-width: 768px) {
    padding: 1rem 0.5rem 6rem 0.5rem;
  }
  
  @media (max-width: 480px) {
    padding: 0.75rem 0.25rem 6rem 0.25rem;
  }
`;

const ScreenTitle = styled.h1`
  font-family: ${({ theme }) => theme.typography.fontFamily.heading};
  font-weight: 700;
  color: ${({ theme }) => theme.colors.text.primary};
  font-size: 2rem;
  margin-bottom: 1.5rem;
  text-align: center;
  
  @media (max-width: 768px) {
    font-size: 1.75rem;
    margin-bottom: 1rem;
  }
  
  @media (max-width: 480px) {
    font-size: 1.5rem;
    margin-bottom: 0.75rem;
  }
`;

const MainFilterTabs = styled.div`
  display: flex;
  gap: 1rem;
  margin-bottom: 1.5rem;
  justify-content: center;
  
  @media (max-width: 768px) {
    gap: 0.75rem;
    margin-bottom: 1rem;
  }
  
  @media (max-width: 480px) {
    gap: 0.5rem;
    margin-bottom: 0.75rem;
  }
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
    grid-template-columns: repeat(3, 1fr);
    gap: 8px;
  }
  
  @media (max-width: 480px) {
    grid-template-columns: repeat(3, 1fr);
    gap: 6px;
  }
  
  @media (max-width: 360px) {
    grid-template-columns: repeat(2, 1fr);
    gap: 6px;
  }
`;

// Styled components for memoized components
const StyledItemCard = styled(GlassCard)`
  padding: 1.5rem;
  cursor: pointer;
  transition: all 0.2s ease;
  
  @media (max-width: 768px) {
    padding: 1rem;
  }
  
  @media (max-width: 480px) {
    padding: 0.75rem;
  }
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

const StyledFilterTab = styled.button`
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

const StyledFloatingStatsButton = styled.button`
  position: fixed;
  top: 100px;
  right: 20px;
  z-index: 1000;
  background: linear-gradient(135deg, #FFB000, #FFD700);
  border: none;
  border-radius: 50px;
  padding: 12px 16px;
  display: flex;
  align-items: center;
  gap: 8px;
  cursor: pointer;
  box-shadow: 0 4px 20px rgba(255, 176, 0, 0.3);
  transition: all 0.3s ease;
  font-weight: 600;
  color: #000;
  
  &:hover {
    transform: translateY(-2px);
    box-shadow: 0 6px 25px rgba(255, 176, 0, 0.4);
  }
  
  .stats-icon {
    font-size: 1.2rem;
  }
  
  .stats-count {
    font-size: 1rem;
    font-weight: 700;
  }
  
  @media (max-width: 768px) {
    top: 80px;
    right: 15px;
    padding: 10px 14px;
    
    .stats-icon {
      font-size: 1rem;
    }
    
    .stats-count {
      font-size: 0.9rem;
    }
  }
`;

const ItemCard = memo(({ item, onClick, isLimitedEdition }) => (
  <StyledItemCard 
    rarity={item.rarity}
    isLimitedEdition={isLimitedEdition}
    onClick={onClick}
    style={item.category === 'themes' ? {
      background: item.gradient,
      border: item.equipped ? '3px solid #FFD700' : '3px solid rgba(255, 255, 255, 0.2)',
      opacity: item.unlocked ? 1 : 0.6
    } : {}}
  >
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
  </StyledItemCard>
));

// Memoized FilterTab component
const MemoizedFilterTab = memo(({ type, active, onClick, children }) => (
  <StyledFilterTab 
    type={type}
    active={active} 
    onClick={onClick}
  >
    {children}
  </StyledFilterTab>
));

// Memoized FloatingStatsButton component
const MemoizedFloatingStatsButton = memo(({ count, onClick }) => (
  <StyledFloatingStatsButton onClick={onClick}>
    <span className="stats-count">{count}</span>
  </StyledFloatingStatsButton>
));

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

// Floating Stats Button
const FloatingStatsButton = styled.button`
  position: fixed;
  top: 100px;
  right: 20px;
  z-index: 1000;
  background: linear-gradient(135deg, #FFB000, #FFD700);
  border: none;
  border-radius: 50px;
  padding: 12px 16px;
  display: flex;
  align-items: center;
  gap: 8px;
  cursor: pointer;
  box-shadow: 0 4px 20px rgba(255, 176, 0, 0.3);
  transition: all 0.3s ease;
  font-weight: 600;
  color: #000;
  
  &:hover {
    transform: translateY(-2px);
    box-shadow: 0 6px 25px rgba(255, 176, 0, 0.4);
  }
  
  .stats-icon {
    font-size: 1.2rem;
  }
  
  .stats-count {
    font-size: 1rem;
    font-weight: 700;
  }
  
  @media (max-width: 768px) {
    top: 80px;
    right: 15px;
    padding: 10px 14px;
    
    .stats-icon {
      font-size: 1rem;
    }
    
    .stats-count {
      font-size: 0.9rem;
    }
  }
`;

// Stats Modal
const StatsModal = styled.div`
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.8);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 2000;
  padding: 20px;
`;

const ModalContent = styled.div`
  background: linear-gradient(135deg, rgba(255, 255, 255, 0.1) 0%, rgba(255, 255, 255, 0.05) 100%);
  backdrop-filter: blur(20px);
  border: 1px solid rgba(255, 255, 255, 0.2);
  border-radius: 20px;
  padding: 2rem;
  max-width: 400px;
  width: 100%;
  max-height: 80vh;
  overflow-y: auto;
`;

const ModalHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 1.5rem;
  
  h2 {
    color: ${({ theme }) => theme.colors.text.primary};
    margin: 0;
    font-size: 1.5rem;
  }
`;

const CloseButton = styled.button`
  background: none;
  border: none;
  color: ${({ theme }) => theme.colors.text.secondary};
  font-size: 1.5rem;
  cursor: pointer;
  padding: 0;
  width: 30px;
  height: 30px;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 50%;
  transition: all 0.2s ease;
  
  &:hover {
    background: rgba(255, 255, 255, 0.1);
    color: ${({ theme }) => theme.colors.text.primary};
  }
`;

const StatsGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 1rem;
`;

const StatItem = styled.div`
  text-align: center;
  padding: 1rem;
  background: rgba(255, 255, 255, 0.05);
  border-radius: 12px;
  border: 1px solid rgba(255, 255, 255, 0.1);
`;

const StatLabel = styled.div`
  font-size: 0.8rem;
  color: ${({ theme }) => theme.colors.text.secondary};
  margin-bottom: 0.5rem;
  text-transform: uppercase;
  letter-spacing: 0.5px;
`;

const StatValue = styled.div`
  font-size: 1.5rem;
  font-weight: 700;
  color: ${({ theme }) => theme.colors.text.primary};
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

const ModalCloseButton = styled.button`
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
  const { switchTheme, currentTheme } = useTheme();
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
    console.log('🎨 EQUIP THEME BUTTON CLICKED!');
    console.log('📦 Item details:', {
      name: item.name,
      category: item.category,
      unlocked: item.unlocked,
      item_id: item.item_id,
      equipped: item.equipped
    });
    
    if (item.category === 'themes' && item.unlocked) {
      console.log('✅ Conditions met, calling equipTheme...');
      
      try {
        const result = await switchTheme(item.item_id);
        console.log('🔍 switchTheme result:', result);
        
        if (result.success) {
          console.log('✅ Theme equipped successfully!');
          onClose();
          console.log('🧭 Navigating to passport...');
          navigate('/passport');
        } else {
          console.log('❌ Theme equipping failed:', result.error);
          alert('Failed to equip theme: ' + (result.error || 'Unknown error'));
        }
      } catch (error) {
        console.error('💥 Error in handleEquipTheme:', error);
        alert('Error equipping theme: ' + error.message);
      }
    } else {
      console.log('❌ Conditions not met');
      console.log('📦 Category check:', item.category === 'themes');
      console.log('📦 Unlocked check:', item.unlocked);
    }
  };

  // Check if item has MP4 preview for 3D models
  const hasVideoPreview = item.preview_mp4 && item.file_type === '3d_model';
  
  return (
    <ModalOverlay onClick={handleOverlayClick}>
      <ModalCloseButton onClick={onClose} aria-label="Close">×</ModalCloseButton>
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
                        {req.progressText && (
                          <span style={{ 
                            marginLeft: '8px', 
                            fontSize: '0.9rem', 
                            opacity: 0.7,
                            color: req.completed ? '#10B981' : '#FFD700'
                          }}>
                            ({req.progressText})
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
  const { user, loading: authLoading } = useAuth();
  const { currentTheme, ownsTheme, themes, loading: themesLoading } = useTheme();
  const { 
    closetItems, 
    loading: closetLoading, 
    stats, 
    refreshCloset,
    isCacheValid: closetCacheValid 
  } = useCloset();

  const [mainFilter, setMainFilter] = useState('all');
  const [subFilter, setSubFilter] = useState('all');
  const [selectedItem, setSelectedItem] = useState(null);
  const [showStatsModal, setShowStatsModal] = useState(false);
  const navigate = useNavigate();

  // Memoized theme items calculation
  const themeItems = useMemo(() => {
    return themes.map((theme) => {
      const isUnlocked = ownsTheme(theme.key);
      
      return {
        id: `theme-${theme.key}`,
        item_type: 'digital_collectible',
        item_id: theme.key,
        name: theme.name,
        rarity: 'epic',
        category: 'themes',
        gradient: theme.colors.backgroundGradient || theme.colors.background,
        icon: '🎨',
        description: theme.description || '',
        requirements: [],
        unlocked: isUnlocked,
        equipped: currentTheme === theme.key,
        earned_date: '2025-03-01',
        earned_via: 'unlock',
        wings_earned: 0
      };
    });
  }, [themes, ownsTheme, currentTheme]);

  // Memoized all items
  const allItems = useMemo(() => 
    [...closetItems, ...themeItems], 
    [closetItems, themeItems]
  );

  // Memoized enhanced items
  const enhancedItems = useMemo(() => 
    allItems.map(item => ({
      ...item,
      isLimitedEdition: false
    })), 
    [allItems]
  );

  // Memoized filtered items
  const filteredItems = useMemo(() => 
    enhancedItems.filter(item => {
      if (mainFilter === 'physical' && item.item_type !== 'physical_item') return false;
      if (mainFilter === 'digital' && item.item_type !== 'digital_collectible') return false;
      if (subFilter !== 'all' && item.category !== subFilter) return false;
      return true;
    }), 
    [enhancedItems, mainFilter, subFilter]
  );

  // Memoized sub filter options
  const subFilterOptions = useMemo(() => {
    const categories = [...new Set(allItems
      .filter(item => {
        if (mainFilter === 'physical') return item.item_type === 'physical_item';
        if (mainFilter === 'digital') return item.item_type === 'digital_collectible';
        return true;
      })
      .map(item => item.category))];
    
    return categories.sort();
  }, [allItems, mainFilter]);

  // Memoized display stats
  const displayStats = useMemo(() => ({
    total: stats.total,
    physical: stats.physical,
    digital: stats.digital,
    limited: stats.limited,
    legendary: stats.legendary,
    epic: stats.epic,
  }), [stats]);

  // Memoized callback functions
  const handleItemClick = useCallback((item) => {
    setSelectedItem(item);
  }, []);

  const handleMainFilterChange = useCallback((filter) => {
    setMainFilter(filter);
    setSubFilter('all');
  }, []);

  const handleSubFilterChange = useCallback((filter) => {
    setSubFilter(filter);
  }, []);

  const handleStatsModalToggle = useCallback(() => {
    setShowStatsModal(prev => !prev);
  }, []);

  const handleCloseModal = useCallback(() => {
    setSelectedItem(null);
  }, []);

  // Show loading only if we're actually loading AND don't have any data yet
  const shouldShowLoading = (authLoading || themesLoading || closetLoading) && 
                           (!closetItems || closetItems.length === 0);
  
  // If we have a user but no items and not loading, show empty state
  const hasUserButNoItems = user && !closetLoading && (!closetItems || closetItems.length === 0);
  
  if (shouldShowLoading && !hasUserButNoItems) {
    return (
      <Container>
        <ScreenTitle>My Closet</ScreenTitle>
        
        {/* Skeleton Loading */}
        <div style={{ 
          display: 'grid', 
          gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', 
          gap: '1rem', 
          padding: '1rem 0' 
        }}>
          {[...Array(6)].map((_, i) => (
            <div key={i} style={{
              background: 'rgba(255, 255, 255, 0.05)',
              borderRadius: '12px',
              padding: '1rem',
              height: '200px',
              animation: 'pulse 1.5s ease-in-out infinite',
              border: '1px solid rgba(255, 255, 255, 0.1)'
            }}>
              <div style={{
                width: '60px',
                height: '60px',
                background: 'rgba(255, 255, 255, 0.1)',
                borderRadius: '8px',
                marginBottom: '0.5rem'
              }} />
              <div style={{
                width: '80%',
                height: '16px',
                background: 'rgba(255, 255, 255, 0.1)',
                borderRadius: '4px',
                marginBottom: '0.5rem'
              }} />
              <div style={{
                width: '60%',
                height: '12px',
                background: 'rgba(255, 255, 255, 0.1)',
                borderRadius: '4px'
              }} />
            </div>
          ))}
        </div>
        
        <style>{`
          @keyframes pulse {
            0%, 100% { opacity: 0.6; }
            50% { opacity: 1; }
          }
        `}</style>
        <NavBar />
      </Container>
    );
  }

  return (
    <Container>
      <div style={{ 
        display: 'flex', 
        justifyContent: 'space-between', 
        alignItems: 'center', 
        marginBottom: '1rem' 
      }}>
        <ScreenTitle>My Closet</ScreenTitle>
        <div style={{
          fontSize: '0.8rem',
          color: 'rgba(255, 255, 255, 0.6)',
          display: 'flex',
          alignItems: 'center',
          gap: '0.5rem'
        }}>
          {closetCacheValid && (
            <>
              <span>🔄 Cached</span>
              <button 
                onClick={refreshCloset}
                style={{
                  background: 'rgba(255, 176, 0, 0.1)',
                  border: '1px solid rgba(255, 176, 0, 0.3)',
                  borderRadius: '4px',
                  padding: '0.25rem 0.5rem',
                  color: '#FFB000',
                  fontSize: '0.7rem',
                  cursor: 'pointer'
                }}
              >
                Refresh
              </button>
            </>
          )}
        </div>
      </div>
        
      <>
        {/* Floating Stats Button */}
        <MemoizedFloatingStatsButton 
          count={displayStats.total} 
          onClick={handleStatsModalToggle}
        />

        {/* Stats Modal */}
        {showStatsModal && (
          <StatsModal onClick={handleStatsModalToggle}>
            <ModalContent onClick={(e) => e.stopPropagation()}>
              <ModalHeader>
                <h2>Collection Stats</h2>
                <CloseButton onClick={handleStatsModalToggle}>×</CloseButton>
              </ModalHeader>
              <StatsGrid>
                <StatItem>
                  <StatLabel>Total Items</StatLabel>
                  <StatValue>{displayStats.total}</StatValue>
                </StatItem>
                <StatItem>
                  <StatLabel>Physical</StatLabel>
                  <StatValue>{displayStats.physical}</StatValue>
                </StatItem>
                <StatItem>
                  <StatLabel>Digital</StatLabel>
                  <StatValue>{displayStats.digital}</StatValue>
                </StatItem>
                <StatItem>
                  <StatLabel>Limited Edition</StatLabel>
                  <StatValue>{displayStats.limited}</StatValue>
                </StatItem>
                <StatItem>
                  <StatLabel>Legendary</StatLabel>
                  <StatValue>{displayStats.legendary}</StatValue>
                </StatItem>
                <StatItem>
                  <StatLabel>Epic</StatLabel>
                  <StatValue>{displayStats.epic}</StatValue>
                </StatItem>
              </StatsGrid>
            </ModalContent>
          </StatsModal>
        )}

        <MainFilterTabs>
          <MemoizedFilterTab 
            type="main"
            active={mainFilter === 'all'} 
            onClick={() => handleMainFilterChange('all')}
          >
            All Items
          </MemoizedFilterTab>
          <MemoizedFilterTab 
            type="main"
            active={mainFilter === 'physical'} 
            onClick={() => handleMainFilterChange('physical')}
          >
            Physical
          </MemoizedFilterTab>
          <MemoizedFilterTab 
            type="main"
            active={mainFilter === 'digital'} 
            onClick={() => handleMainFilterChange('digital')}
          >
            Digital
          </MemoizedFilterTab>
        </MainFilterTabs>

        <SubFilterTabs>
          <MemoizedFilterTab 
            type="sub"
            active={subFilter === 'all'} 
            onClick={() => handleSubFilterChange('all')}
          >
            All Categories
          </MemoizedFilterTab>
          {subFilterOptions.map(category => (
            <MemoizedFilterTab 
              key={category}
              type="sub"
              active={subFilter === category} 
              onClick={() => handleSubFilterChange(category)}
            >
              {getCategoryDisplayName(category)}
            </MemoizedFilterTab>
          ))}
        </SubFilterTabs>

        {filteredItems.length > 0 ? (
          <ItemsGrid>
            {filteredItems.map(item => (
              <ItemCard 
                key={item.id}
                item={item}
                onClick={() => handleItemClick(item)}
                isLimitedEdition={item.isLimitedEdition}
              />
            ))}
          </ItemsGrid>
        ) : (
          <EmptyState>
            {closetLoading ? (
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
          onClose={handleCloseModal}
        />
      </>
        
      {/* Navigation Bar */}
      <NavBar />
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

  const digitalIcons = {
    wallpapers: '🖼️',
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

const getCategoryDisplayName = (category) => {
  const displayNames = {
    wallpapers: 'Wallpapers',
    themes: 'Themes',
    jackets: 'Jackets',
    tops: 'Tops',
    bottoms: 'Bottoms',
    headwear: 'Headwear',
    accessories: 'Accessories',
    footwear: 'Footwear',
    tickets: 'Tickets',
    posters: 'Posters'
  };
  
  return displayNames[category] || category.charAt(0).toUpperCase() + category.slice(1);
};





export default ClosetScreen; 