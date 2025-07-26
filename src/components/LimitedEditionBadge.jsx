/**
 * Limited Edition Badge
 * PapillonLabs Monarch Passport MVP
 * 
 * Special badge component for limited edition items
 * with exclusivity levels, rarity indicators, and premium styling.
 */

import React from 'react';
import styled, { keyframes } from 'styled-components';

const badgeGlow = keyframes`
  0%, 100% { 
    box-shadow: 0 0 10px rgba(255, 176, 0, 0.3);
    transform: scale(1);
  }
  50% { 
    box-shadow: 0 0 20px rgba(255, 176, 0, 0.6);
    transform: scale(1.05);
  }
`;

const exclusivityPulse = keyframes`
  0%, 100% { 
    opacity: 0.8;
    transform: scale(1);
  }
  50% { 
    opacity: 1;
    transform: scale(1.1);
  }
`;

const sparkleAnimation = keyframes`
  0%, 100% { 
    opacity: 0;
    transform: scale(0) rotate(0deg);
  }
  50% { 
    opacity: 1;
    transform: scale(1) rotate(180deg);
  }
`;

const BadgeContainer = styled.div`
  position: relative;
  display: inline-flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.5rem 1rem;
  border-radius: 20px;
  font-size: 0.8rem;
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: 0.5px;
  background: ${props => props.color || '#FFB000'};
  color: #000;
  animation: ${props => props.isPremium ? badgeGlow : 'none'} 3s ease-in-out infinite;
  box-shadow: 0 4px 15px rgba(255, 176, 0, 0.3);
  z-index: 2;
  transition: all 0.3s ease;

  &:hover {
    transform: translateY(-2px);
    box-shadow: 0 6px 20px rgba(255, 176, 0, 0.4);
  }

  /* Sparkle effect for premium badges */
  ${props => props.isPremium && `
    &::before {
      content: '✨';
      position: absolute;
      top: -0.5rem;
      right: -0.5rem;
      font-size: 0.8rem;
      animation: ${sparkleAnimation} 2s ease-in-out infinite;
      animation-delay: 1s;
    }
  `}
`;

const ExclusivityIcon = styled.span`
  font-size: 1rem;
  animation: ${exclusivityPulse} 2s ease-in-out infinite;
`;

const BadgeText = styled.span`
  font-weight: 700;
  text-shadow: 0 1px 2px rgba(0, 0, 0, 0.3);
`;

const LimitedEditionBadge = ({ 
  exclusivityLevel = 'limited',
  size = 'medium',
  showIcon = true,
  className = ''
}) => {
  // Define exclusivity levels and their properties
  const exclusivityConfig = {
    founders: {
      color: '#10B981', // Emerald green
      icon: '👑',
      text: 'Founders',
      isPremium: true
    },
    vip: {
      color: '#7F3FBF', // Purple
      icon: '⭐',
      text: 'VIP',
      isPremium: true
    },
    ultra_rare: {
      color: '#FFB000', // Gold
      icon: '💎',
      text: 'Ultra Rare',
      isPremium: true
    },
    legendary: {
      color: '#7F3FBF', // Purple
      icon: '🌟',
      text: 'Legendary',
      isPremium: true
    },
    mythic: {
      color: '#10B981', // Emerald green
      icon: '🔥',
      text: 'Mythic',
      isPremium: true
    },
    limited: {
      color: '#FFB000', // Gold
      icon: '🦋',
      text: 'Limited',
      isPremium: false
    },
    exclusive: {
      color: '#FF6B35', // Orange
      icon: '🎯',
      text: 'Exclusive',
      isPremium: false
    }
  };

  const config = exclusivityConfig[exclusivityLevel] || exclusivityConfig.limited;

  // Size variants
  const sizeStyles = {
    small: {
      padding: '0.25rem 0.75rem',
      fontSize: '0.7rem',
      iconSize: '0.8rem'
    },
    medium: {
      padding: '0.5rem 1rem',
      fontSize: '0.8rem',
      iconSize: '1rem'
    },
    large: {
      padding: '0.75rem 1.25rem',
      fontSize: '0.9rem',
      iconSize: '1.2rem'
    }
  };

  const currentSize = sizeStyles[size] || sizeStyles.medium;

  return (
    <BadgeContainer
      color={config.color}
      isPremium={config.isPremium}
      style={{
        padding: currentSize.padding,
        fontSize: currentSize.fontSize
      }}
      className={className}
      aria-label={`${config.text} limited edition item`}
    >
      {showIcon && (
        <ExclusivityIcon style={{ fontSize: currentSize.iconSize }}>
          {config.icon}
        </ExclusivityIcon>
      )}
      <BadgeText>{config.text}</BadgeText>
    </BadgeContainer>
  );
};

export default LimitedEditionBadge; 