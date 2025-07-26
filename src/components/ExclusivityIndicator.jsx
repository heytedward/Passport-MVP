/**
 * Exclusivity Indicator
 * PapillonLabs Monarch Passport MVP
 * 
 * Component for displaying collection tier status,
 * rarity information, and exclusivity levels.
 */

import React from 'react';
import styled, { keyframes } from 'styled-components';

const tierGlow = keyframes`
  0%, 100% { 
    box-shadow: 0 0 10px rgba(255, 176, 0, 0.3);
    transform: scale(1);
  }
  50% { 
    box-shadow: 0 0 20px rgba(255, 176, 0, 0.6);
    transform: scale(1.05);
  }
`;

const pulseAnimation = keyframes`
  0%, 100% { 
    opacity: 0.8;
    transform: scale(1);
  }
  50% { 
    opacity: 1;
    transform: scale(1.1);
  }
`;

const Container = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 0.5rem;
  padding: 1rem;
  background: ${props => props.background || 'rgba(255, 176, 0, 0.1)'};
  border: 1px solid ${props => props.borderColor || 'rgba(255, 176, 0, 0.3)'};
  border-radius: 12px;
  position: relative;
  transition: all 0.3s ease;

  &:hover {
    transform: translateY(-2px);
    box-shadow: 0 8px 25px rgba(255, 176, 0, 0.2);
  }
`;

const TierBadge = styled.div`
  background: ${props => props.color || '#FFB000'};
  color: #000;
  padding: 0.5rem 1rem;
  border-radius: 20px;
  font-size: 0.8rem;
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: 0.5px;
  animation: ${props => props.isPremium ? tierGlow : 'none'} 3s ease-in-out infinite;
  box-shadow: 0 4px 15px rgba(255, 176, 0, 0.3);
  position: relative;

  /* Premium indicator */
  ${props => props.isPremium && `
    &::before {
      content: '✨';
      position: absolute;
      top: -0.5rem;
      right: -0.5rem;
      font-size: 0.8rem;
      animation: ${pulseAnimation} 2s ease-in-out infinite;
    }
  `}
`;

const TierIcon = styled.div`
  font-size: 2rem;
  margin-bottom: 0.5rem;
  animation: ${pulseAnimation} 3s ease-in-out infinite;
`;

const TierTitle = styled.h3`
  font-size: 1rem;
  color: ${({ theme }) => theme.colors.text.primary};
  margin: 0 0 0.5rem 0;
  font-weight: 700;
  text-align: center;
`;

const TierDescription = styled.p`
  font-size: 0.8rem;
  color: ${({ theme }) => theme.colors.text.secondary};
  text-align: center;
  line-height: 1.4;
  margin: 0;
`;

const StatsGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 1rem;
  margin-top: 1rem;
  width: 100%;
`;

const StatItem = styled.div`
  text-align: center;
  
  .label {
    font-size: 0.7rem;
    color: ${({ theme }) => theme.colors.text.secondary};
    margin-bottom: 0.25rem;
    text-transform: uppercase;
    letter-spacing: 0.5px;
  }
  
  .value {
    font-size: 1rem;
    font-weight: 700;
    color: ${({ theme }) => theme.colors.text.primary};
  }
`;

const ExclusivityIndicator = ({ 
  tier = 'limited',
  rarity = 'limited',
  totalSupply,
  claimedCount,
  size = 'medium',
  showStats = true,
  className = ''
}) => {
  // Define tier configurations
  const tierConfig = {
    founders: {
      color: '#10B981',
      icon: '👑',
      title: 'Founders Tier',
      description: 'Exclusive early adopter collection with maximum rarity',
      background: 'rgba(16, 185, 129, 0.1)',
      borderColor: 'rgba(16, 185, 129, 0.3)',
      isPremium: true
    },
    vip: {
      color: '#7F3FBF',
      icon: '⭐',
      title: 'VIP Tier',
      description: 'Premium collection with high exclusivity',
      background: 'rgba(127, 63, 191, 0.1)',
      borderColor: 'rgba(127, 63, 191, 0.3)',
      isPremium: true
    },
    ultra_rare: {
      color: '#FFB000',
      icon: '💎',
      title: 'Ultra Rare',
      description: 'Extremely limited collection with high value',
      background: 'rgba(255, 176, 0, 0.1)',
      borderColor: 'rgba(255, 176, 0, 0.3)',
      isPremium: true
    },
    legendary: {
      color: '#7F3FBF',
      icon: '🌟',
      title: 'Legendary',
      description: 'Rare collection with significant exclusivity',
      background: 'rgba(127, 63, 191, 0.1)',
      borderColor: 'rgba(127, 63, 191, 0.3)',
      isPremium: true
    },
    mythic: {
      color: '#10B981',
      icon: '🔥',
      title: 'Mythic',
      description: 'Ultra-exclusive collection with maximum rarity',
      background: 'rgba(16, 185, 129, 0.1)',
      borderColor: 'rgba(16, 185, 129, 0.3)',
      isPremium: true
    },
    limited: {
      color: '#FFB000',
      icon: '🦋',
      title: 'Limited Edition',
      description: 'Limited supply collection with exclusivity',
      background: 'rgba(255, 176, 0, 0.1)',
      borderColor: 'rgba(255, 176, 0, 0.3)',
      isPremium: false
    },
    exclusive: {
      color: '#FF6B35',
      icon: '🎯',
      title: 'Exclusive',
      description: 'Special collection with unique characteristics',
      background: 'rgba(255, 107, 53, 0.1)',
      borderColor: 'rgba(255, 107, 53, 0.3)',
      isPremium: false
    }
  };

  const config = tierConfig[tier] || tierConfig.limited;

  // Calculate statistics
  const availableCount = totalSupply ? totalSupply - (claimedCount || 0) : null;
  const claimPercentage = totalSupply && claimedCount ? ((claimedCount / totalSupply) * 100).toFixed(1) : null;

  // Size variants
  const sizeStyles = {
    small: {
      padding: '0.75rem',
      iconSize: '1.5rem',
      titleSize: '0.9rem',
      descriptionSize: '0.7rem'
    },
    medium: {
      padding: '1rem',
      iconSize: '2rem',
      titleSize: '1rem',
      descriptionSize: '0.8rem'
    },
    large: {
      padding: '1.25rem',
      iconSize: '2.5rem',
      titleSize: '1.2rem',
      descriptionSize: '0.9rem'
    }
  };

  const currentSize = sizeStyles[size] || sizeStyles.medium;

  return (
    <Container
      background={config.background}
      borderColor={config.borderColor}
      style={{ padding: currentSize.padding }}
      className={className}
      aria-label={`${config.title} exclusivity indicator`}
    >
      <TierIcon style={{ fontSize: currentSize.iconSize }}>
        {config.icon}
      </TierIcon>

      <TierBadge
        color={config.color}
        isPremium={config.isPremium}
        aria-label={`${config.title} tier badge`}
      >
        {config.title}
      </TierBadge>

      <TierTitle style={{ fontSize: currentSize.titleSize }}>
        {config.title}
      </TierTitle>

      <TierDescription style={{ fontSize: currentSize.descriptionSize }}>
        {config.description}
      </TierDescription>

      {showStats && totalSupply && (
        <StatsGrid>
          <StatItem>
            <div className="label">Total Supply</div>
            <div className="value">{totalSupply}</div>
          </StatItem>
          <StatItem>
            <div className="label">Claimed</div>
            <div className="value">{claimedCount || 0}</div>
          </StatItem>
          <StatItem>
            <div className="label">Available</div>
            <div className="value">{availableCount || 0}</div>
          </StatItem>
          <StatItem>
            <div className="label">Progress</div>
            <div className="value">{claimPercentage || 0}%</div>
          </StatItem>
        </StatsGrid>
      )}
    </Container>
  );
};

export default ExclusivityIndicator; 