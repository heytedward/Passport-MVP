/**
 * Mint Number Display
 * PapillonLabs Monarch Passport MVP
 * 
 * Component for displaying limited edition mint numbers
 * with premium styling and supply information.
 */

import React from 'react';
import styled, { keyframes } from 'styled-components';

const mintGlow = keyframes`
  0%, 100% { 
    box-shadow: 0 0 15px rgba(255, 176, 0, 0.4);
    transform: scale(1);
  }
  50% { 
    box-shadow: 0 0 25px rgba(255, 176, 0, 0.7);
    transform: scale(1.02);
  }
`;

const numberPulse = keyframes`
  0%, 100% { 
    opacity: 1;
    transform: scale(1);
  }
  50% { 
    opacity: 0.9;
    transform: scale(1.05);
  }
`;

const Container = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 0.5rem;
  position: relative;
`;

const MintBadge = styled.div`
  background: linear-gradient(135deg, #FFB000 0%, #FF9F1C 100%);
  color: #000;
  padding: 0.75rem 1.5rem;
  border-radius: 25px;
  font-size: 1.1rem;
  font-weight: 700;
  text-align: center;
  position: relative;
  animation: ${mintGlow} 3s ease-in-out infinite;
  box-shadow: 0 4px 15px rgba(255, 176, 0, 0.3);
  transition: all 0.3s ease;
  cursor: pointer;

  &:hover {
    transform: translateY(-2px);
    box-shadow: 0 6px 20px rgba(255, 176, 0, 0.5);
  }

  /* Mint label */
  &::before {
    content: 'MINT #';
    position: absolute;
    top: -0.5rem;
    left: 50%;
    transform: translateX(-50%);
    font-size: 0.7rem;
    font-weight: 600;
    color: rgba(0, 0, 0, 0.7);
    background: rgba(255, 255, 255, 0.9);
    padding: 0.2rem 0.5rem;
    border-radius: 10px;
    white-space: nowrap;
  }

  /* Supply info */
  &::after {
    content: 'OF ${props => props.totalSupply || '100'}';
    position: absolute;
    bottom: -0.5rem;
    left: 50%;
    transform: translateX(-50%);
    font-size: 0.6rem;
    font-weight: 600;
    color: rgba(0, 0, 0, 0.7);
    background: rgba(255, 255, 255, 0.9);
    padding: 0.2rem 0.5rem;
    border-radius: 10px;
    white-space: nowrap;
  }
`;

const MintNumber = styled.span`
  font-size: 1.3rem;
  font-weight: 800;
  animation: ${numberPulse} 2s ease-in-out infinite;
  text-shadow: 0 2px 4px rgba(0, 0, 0, 0.3);
`;

const SupplyInfo = styled.div`
  display: flex;
  align-items: center;
  gap: 0.5rem;
  font-size: 0.8rem;
  color: ${({ theme }) => theme.colors.text.secondary};
  margin-top: 0.5rem;
`;

const SupplyItem = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  text-align: center;
  
  .label {
    font-size: 0.7rem;
    color: ${({ theme }) => theme.colors.text.secondary};
    margin-bottom: 0.2rem;
    text-transform: uppercase;
    letter-spacing: 0.5px;
  }
  
  .value {
    font-size: 0.9rem;
    font-weight: 700;
    color: ${({ theme }) => theme.colors.text.primary};
  }
`;

const RarityIndicator = styled.div`
  position: absolute;
  top: -0.5rem;
  right: -0.5rem;
  width: 1.5rem;
  height: 1.5rem;
  border-radius: 50%;
  background: ${props => {
    if (props.rarity === 'mythic') return '#10B981';
    if (props.rarity === 'legendary') return '#7F3FBF';
    if (props.rarity === 'ultra_rare') return '#FFB000';
    return '#FF6B35';
  }};
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 0.8rem;
  color: white;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.3);
  z-index: 3;
`;

const MintNumberDisplay = ({ 
  mintNumber, 
  totalSupply, 
  rarity = 'limited',
  size = 'medium',
  showSupplyInfo = true,
  className = ''
}) => {
  if (!mintNumber) return null;

  // Size variants
  const sizeStyles = {
    small: {
      padding: '0.5rem 1rem',
      fontSize: '0.9rem',
      numberSize: '1.1rem',
      badgeSize: '0.6rem'
    },
    medium: {
      padding: '0.75rem 1.5rem',
      fontSize: '1.1rem',
      numberSize: '1.3rem',
      badgeSize: '0.7rem'
    },
    large: {
      padding: '1rem 2rem',
      fontSize: '1.3rem',
      numberSize: '1.5rem',
      badgeSize: '0.8rem'
    }
  };

  const currentSize = sizeStyles[size] || sizeStyles.medium;

  // Get rarity icon
  const getRarityIcon = (rarity) => {
    const icons = {
      mythic: '🔥',
      legendary: '🌟',
      ultra_rare: '💎',
      limited: '🦋',
      exclusive: '🎯'
    };
    return icons[rarity] || '🦋';
  };

  // Calculate rarity percentage
  const rarityPercentage = totalSupply ? ((mintNumber / totalSupply) * 100).toFixed(1) : null;

  return (
    <Container className={className}>
      <MintBadge
        totalSupply={totalSupply}
        style={{
          padding: currentSize.padding,
          fontSize: currentSize.fontSize
        }}
        aria-label={`Mint number ${mintNumber} of ${totalSupply || 'limited'} supply`}
      >
        <MintNumber style={{ fontSize: currentSize.numberSize }}>
          {mintNumber}
        </MintNumber>
        
        {/* Rarity indicator */}
        <RarityIndicator 
          rarity={rarity}
          aria-label={`${rarity} rarity level`}
        >
          {getRarityIcon(rarity)}
        </RarityIndicator>
      </MintBadge>

      {showSupplyInfo && totalSupply && (
        <SupplyInfo>
          <SupplyItem>
            <div className="label">Supply</div>
            <div className="value">{totalSupply}</div>
          </SupplyItem>
          <SupplyItem>
            <div className="label">Position</div>
            <div className="value">{rarityPercentage}%</div>
          </SupplyItem>
        </SupplyInfo>
      )}
    </Container>
  );
};

export default MintNumberDisplay; 