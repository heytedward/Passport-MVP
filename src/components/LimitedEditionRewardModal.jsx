/**
 * Limited Edition Reward Modal
 * PapillonLabs Monarch Passport MVP
 * 
 * Enhanced modal component for displaying limited edition rewards
 * with mint numbers, exclusivity levels, enhanced visual effects,
 * social sharing hints, and collection value messaging.
 */

import React, { useState } from 'react';
import styled, { keyframes } from 'styled-components';
import GlassCard from './GlassCard';
import GlowButton from './GlowButton';

const limitedEditionReveal = keyframes`
  0% { 
    opacity: 0; 
    transform: scale(0.3) rotate(-15deg); 
    filter: blur(10px);
  }
  50% { 
    opacity: 0.8; 
    transform: scale(1.2) rotate(5deg); 
    filter: blur(2px);
  }
  100% { 
    opacity: 1; 
    transform: scale(1) rotate(0deg); 
    filter: blur(0px);
  }
`;

const mintNumberGlow = keyframes`
  0%, 100% { 
    box-shadow: 0 0 20px rgba(255, 176, 0, 0.6);
    transform: scale(1);
  }
  50% { 
    box-shadow: 0 0 40px rgba(255, 176, 0, 0.9);
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

const valueGlow = keyframes`
  0%, 100% { 
    text-shadow: 0 0 10px rgba(255, 176, 0, 0.5);
  }
  50% { 
    text-shadow: 0 0 20px rgba(255, 176, 0, 0.8);
  }
`;

const Container = styled.div`
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(18, 18, 18, 0.9);
  backdrop-filter: blur(20px);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
  padding: 1rem;
`;

const ModalCard = styled(GlassCard)`
  padding: 2rem;
  text-align: center;
  animation: ${limitedEditionReveal} 0.8s ease-out;
  max-width: 90vw;
  width: 480px;
  position: relative;
  overflow: hidden;
  
  &::before {
    content: '';
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    height: 4px;
    background: ${props => props.exclusivityColor || '#FFB000'};
    background: linear-gradient(90deg, 
      ${props => props.exclusivityColor || '#FFB000'} 0%, 
      ${props => props.exclusivityColor || '#FFB000'}80 50%, 
      ${props => props.exclusivityColor || '#FFB000'} 100%
    );
  }

  /* Sparkle effects */
  &::after {
    content: '✨';
    position: absolute;
    top: 10%;
    right: 10%;
    font-size: 1.5rem;
    animation: ${sparkleAnimation} 3s ease-in-out infinite;
    animation-delay: 0.5s;
  }
`;

const ExclusivityBadge = styled.div`
  position: absolute;
  top: 1rem;
  right: 1rem;
  background: ${props => props.color || '#FFB000'};
  color: #000;
  padding: 0.5rem 1rem;
  border-radius: 20px;
  font-size: 0.8rem;
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: 0.5px;
  animation: ${exclusivityPulse} 2s ease-in-out infinite;
  box-shadow: 0 4px 15px rgba(255, 176, 0, 0.3);
  z-index: 2;
`;

const MintNumberContainer = styled.div`
  display: flex;
  align-items: center;
  justify-content: center;
  margin: 1.5rem 0;
  gap: 1rem;
  position: relative;
`;

const MintNumberBadge = styled.div`
  background: linear-gradient(135deg, #FFB000 0%, #FF9F1C 100%);
  color: #000;
  padding: 0.75rem 1.5rem;
  border-radius: 25px;
  font-size: 1.2rem;
  font-weight: 700;
  animation: ${mintNumberGlow} 3s ease-in-out infinite;
  position: relative;
  
  &::before {
    content: 'MINT #';
    position: absolute;
    top: -0.5rem;
    left: 50%;
    transform: translateX(-50%);
    font-size: 0.7rem;
    font-weight: 600;
    color: rgba(0, 0, 0, 0.7);
  }

  &::after {
    content: 'OF ${props => props.totalSupply || '100'}';
    position: absolute;
    bottom: -0.5rem;
    left: 50%;
    transform: translateX(-50%);
    font-size: 0.6rem;
    font-weight: 600;
    color: rgba(0, 0, 0, 0.7);
  }
`;

const SupplyInfo = styled.div`
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 1rem;
  background: rgba(255, 176, 0, 0.1);
  padding: 1.5rem;
  border-radius: 12px;
  margin: 1.5rem 0;
  border: 1px solid rgba(255, 176, 0, 0.2);
  position: relative;
`;

const SupplyItem = styled.div`
  text-align: center;
  
  .label {
    font-size: 0.8rem;
    color: ${({ theme }) => theme.colors.text.secondary};
    margin-bottom: 0.5rem;
    text-transform: uppercase;
    letter-spacing: 0.5px;
  }
  
  .value {
    font-size: 1.3rem;
    font-weight: 700;
    color: ${({ theme }) => theme.colors.text.primary};
    animation: ${props => props.isHighlighted ? valueGlow : 'none'} 2s ease-in-out infinite;
  }

  .subtitle {
    font-size: 0.7rem;
    color: ${({ theme }) => theme.colors.text.secondary};
    margin-top: 0.25rem;
  }
`;

const RewardImage = styled.div`
  width: 140px;
  height: 140px;
  margin: 0 auto 1.5rem;
  border-radius: 50%;
  background: ${props => props.imageUrl ? `url(${props.imageUrl})` : 'linear-gradient(135deg, #FFB000 0%, #FF9F1C 100%)'};
  background-size: cover;
  background-position: center;
  border: 4px solid ${props => props.exclusivityColor || '#FFB000'};
  box-shadow: 0 8px 25px rgba(255, 176, 0, 0.3);
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 3rem;
  position: relative;
  
  ${props => !props.imageUrl && `
    &::after {
      content: '🦋';
      font-size: 3rem;
    }
  `}

  /* Rarity ring effect */
  &::before {
    content: '';
    position: absolute;
    top: -8px;
    left: -8px;
    right: -8px;
    bottom: -8px;
    border-radius: 50%;
    border: 2px solid ${props => props.exclusivityColor || '#FFB000'};
    opacity: 0.6;
    animation: ${exclusivityPulse} 3s ease-in-out infinite;
  }
`;

const RewardTitle = styled.h2`
  font-family: ${({ theme }) => theme.typography.fontFamily.heading};
  color: ${({ theme }) => theme.colors.text.primary};
  font-size: 1.8rem;
  margin-bottom: 0.5rem;
  font-weight: 700;
`;

const RewardDescription = styled.p`
  color: ${({ theme }) => theme.colors.text.secondary};
  font-size: 1rem;
  line-height: 1.5;
  margin-bottom: 1.5rem;
`;

const WingsEarned = styled.div`
  font-size: 1.6rem;
  color: ${({ theme }) => theme.colors.accent.gold};
  font-weight: 700;
  margin-bottom: 1rem;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.5rem;
  animation: ${valueGlow} 2s ease-in-out infinite;
  
  &::before {
    content: '🦋';
    font-size: 1.4rem;
  }

  .bonus {
    font-size: 0.9rem;
    color: ${({ theme }) => theme.colors.text.secondary};
    margin-left: 0.5rem;
    font-weight: 400;
  }
`;

const CollectionValue = styled.div`
  background: linear-gradient(135deg, rgba(255, 176, 0, 0.1) 0%, rgba(255, 159, 28, 0.1) 100%);
  border: 1px solid rgba(255, 176, 0, 0.3);
  border-radius: 12px;
  padding: 1rem;
  margin: 1.5rem 0;
  text-align: center;
`;

const ValueTitle = styled.h3`
  font-size: 1rem;
  color: ${({ theme }) => theme.colors.accent.gold};
  margin-bottom: 0.5rem;
  font-weight: 600;
`;

const ValueDescription = styled.p`
  font-size: 0.9rem;
  color: ${({ theme }) => theme.colors.text.secondary};
  line-height: 1.4;
  margin: 0;
`;

const SocialSharing = styled.div`
  background: rgba(127, 63, 191, 0.1);
  border: 1px solid rgba(127, 63, 191, 0.3);
  border-radius: 12px;
  padding: 1rem;
  margin: 1.5rem 0;
  text-align: center;
`;

const SocialTitle = styled.h3`
  font-size: 1rem;
  color: #7F3FBF;
  margin-bottom: 0.5rem;
  font-weight: 600;
`;

const SocialDescription = styled.p`
  font-size: 0.9rem;
  color: ${({ theme }) => theme.colors.text.secondary};
  line-height: 1.4;
  margin-bottom: 1rem;
`;

const ShareButton = styled.button`
  background: linear-gradient(135deg, #7F3FBF 0%, #5B21B6 100%);
  border: none;
  color: white;
  padding: 0.75rem 1.5rem;
  font-size: 0.9rem;
  font-weight: 600;
  border-radius: 8px;
  cursor: pointer;
  transition: all 0.3s ease;
  margin: 0 0.5rem;
  
  &:hover {
    transform: translateY(-2px);
    box-shadow: 0 4px 15px rgba(127, 63, 191, 0.4);
  }

  &:disabled {
    opacity: 0.6;
    cursor: not-allowed;
    transform: none;
  }
`;

const ClaimedAt = styled.div`
  font-size: 0.9rem;
  color: ${({ theme }) => theme.colors.text.secondary};
  margin-bottom: 1.5rem;
  font-style: italic;
`;

const ButtonContainer = styled.div`
  display: flex;
  flex-direction: column;
  gap: 1rem;
  margin-top: 2rem;
`;

const ViewInClosetButton = styled(GlowButton)`
  background: linear-gradient(135deg, #7F3FBF 0%, #5B21B6 100%);
  border: none;
  color: white;
  padding: 1rem 2rem;
  font-size: 1rem;
  font-weight: 600;
  border-radius: 12px;
  cursor: pointer;
  transition: all 0.3s ease;
  
  &:hover {
    transform: translateY(-2px);
    box-shadow: 0 8px 25px rgba(127, 63, 191, 0.4);
  }
`;

const CloseButton = styled.button`
  background: transparent;
  border: 2px solid ${({ theme }) => theme.colors.text.secondary};
  color: ${({ theme }) => theme.colors.text.secondary};
  padding: 0.75rem 1.5rem;
  font-size: 1rem;
  border-radius: 12px;
  cursor: pointer;
  transition: all 0.3s ease;
  
  &:hover {
    border-color: ${({ theme }) => theme.colors.text.primary};
    color: ${({ theme }) => theme.colors.text.primary};
  }
`;

const LimitedEditionRewardModal = ({ 
  reward, 
  claimResult, 
  onClose, 
  onShowInCloset 
}) => {
  const [shareAttempted, setShareAttempted] = useState(false);

  if (!reward) return null;

  const {
    name,
    description,
    rarity,
    category,
    limitedEdition,
    images,
    shopifyPrice
  } = reward;

  const {
    mintNumber,
    claimedAt,
    totalWingsValue
  } = claimResult || {};

  const {
    totalSupply,
    claimedCount,
    availableCount,
    claimPercentage
  } = claimResult?.availability || {};

  // Get exclusivity info
  const exclusivityLevel = limitedEdition?.exclusivityLevel;
  const exclusivityColor = exclusivityLevel === 'mythic' ? '#10B981' : 
                          exclusivityLevel === 'legendary' ? '#7F3FBF' : '#FFB000';

  // Get primary image
  const primaryImage = images?.[0]?.src || null;

  // Calculate collection value
  const baseWingsValue = limitedEdition?.baseWings || 100;
  const bonusWings = limitedEdition?.bonusWings || 0;
  const totalWings = baseWingsValue + bonusWings;

  // Format claimed date
  const formatClaimedDate = (dateString) => {
    if (!dateString) return '';
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  // Handle social sharing
  const handleShare = async () => {
    const shareText = `🦋 Just claimed ${name} - Mint #${mintNumber} of ${totalSupply}! Exclusive limited edition from Monarch Passport. #PapillonLabs #LimitedEdition`;
    const shareUrl = window.location.origin;

    if (navigator.share) {
      try {
        await navigator.share({
          title: 'Monarch Passport Limited Edition',
          text: shareText,
          url: shareUrl
        });
      } catch (error) {
        console.log('Share cancelled or failed');
      }
    } else {
      // Fallback to clipboard
      try {
        await navigator.clipboard.writeText(`${shareText}\n${shareUrl}`);
        setShareAttempted(true);
        setTimeout(() => setShareAttempted(false), 3000);
      } catch (error) {
        console.log('Clipboard not available');
      }
    }
  };

  // Get collection value message
  const getCollectionValueMessage = () => {
    const percentage = claimPercentage || 0;
    if (percentage < 25) {
      return "Early adopter! This item is part of an exclusive collection that's just getting started.";
    } else if (percentage < 50) {
      return "Growing collection! This limited edition is becoming increasingly rare as more collectors join.";
    } else if (percentage < 75) {
      return "Rare find! Over half the supply has been claimed, making this item highly exclusive.";
    } else {
      return "Ultra rare! Nearly all items have been claimed. You're among the final collectors.";
    }
  };

  return (
    <Container onClick={onClose} role="dialog" aria-modal="true" aria-labelledby="reward-title">
      <ModalCard 
        onClick={(e) => e.stopPropagation()}
        exclusivityColor={exclusivityColor}
      >
        {/* Exclusivity Badge */}
        <ExclusivityBadge color={exclusivityColor} aria-label={`${exclusivityLevel} rarity level`}>
          {exclusivityLevel?.replace('_', ' ').toUpperCase() || 'LIMITED'}
        </ExclusivityBadge>

        {/* Reward Image */}
        <RewardImage 
          imageUrl={primaryImage}
          exclusivityColor={exclusivityColor}
          aria-label={`${name} product image`}
        />

        {/* Mint Number */}
        {mintNumber && (
          <MintNumberContainer>
            <MintNumberBadge totalSupply={totalSupply} aria-label={`Mint number ${mintNumber} of ${totalSupply}`}>
              {mintNumber}
            </MintNumberBadge>
          </MintNumberContainer>
        )}

        {/* Reward Title */}
        <RewardTitle id="reward-title">{name}</RewardTitle>

        {/* Reward Description */}
        <RewardDescription>{description}</RewardDescription>

        {/* Supply Information */}
        {totalSupply && (
          <SupplyInfo role="region" aria-label="Supply information">
            <SupplyItem isHighlighted={true}>
              <div className="label">Total Supply</div>
              <div className="value">{totalSupply}</div>
              <div className="subtitle">Limited Edition</div>
            </SupplyItem>
            <SupplyItem>
              <div className="label">Claimed</div>
              <div className="value">{claimedCount || 0}</div>
              <div className="subtitle">Collectors</div>
            </SupplyItem>
            <SupplyItem>
              <div className="label">Available</div>
              <div className="value">{availableCount || 0}</div>
              <div className="subtitle">Remaining</div>
            </SupplyItem>
            <SupplyItem isHighlighted={claimPercentage > 75}>
              <div className="label">Progress</div>
              <div className="value">{claimPercentage?.toFixed(1) || 0}%</div>
              <div className="subtitle">Claimed</div>
            </SupplyItem>
          </SupplyInfo>
        )}

        {/* WINGS Earned */}
        {totalWingsValue && (
          <WingsEarned aria-label={`Earned ${totalWingsValue} WINGS`}>
            +{totalWingsValue} WINGS
            {bonusWings > 0 && (
              <span className="bonus">(+{bonusWings} bonus)</span>
            )}
          </WingsEarned>
        )}

        {/* Collection Value */}
        <CollectionValue role="region" aria-label="Collection value information">
          <ValueTitle>Collection Value</ValueTitle>
          <ValueDescription>
            {getCollectionValueMessage()}
          </ValueDescription>
        </CollectionValue>

        {/* Social Sharing */}
        <SocialSharing role="region" aria-label="Social sharing options">
          <SocialTitle>Share Your Achievement</SocialTitle>
          <SocialDescription>
            Show off your exclusive limited edition item to the Monarch community!
          </SocialDescription>
          <ShareButton 
            onClick={handleShare}
            disabled={shareAttempted}
            aria-label="Share limited edition claim"
          >
            {shareAttempted ? 'Copied!' : 'Share'}
          </ShareButton>
        </SocialSharing>

        {/* Claimed Date */}
        {claimedAt && (
          <ClaimedAt aria-label={`Claimed on ${formatClaimedDate(claimedAt)}`}>
            Claimed on {formatClaimedDate(claimedAt)}
          </ClaimedAt>
        )}

        {/* Buttons */}
        <ButtonContainer>
          {onShowInCloset && (
            <ViewInClosetButton onClick={onShowInCloset} aria-label="View item in closet">
              View in Closet
            </ViewInClosetButton>
          )}
          <CloseButton onClick={onClose} aria-label="Close modal">
            Close
          </CloseButton>
        </ButtonContainer>
      </ModalCard>
    </Container>
  );
};

export default LimitedEditionRewardModal; 