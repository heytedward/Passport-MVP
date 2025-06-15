import React, { useState, useEffect } from 'react';
import styled from 'styled-components';

const itemBackDetails = {
  "Neon Nights": {
    obtained: "Scanned QR at Monarch Flagship Store",
    date: "March 5, 2025", 
    location: "Times Square, NYC",
    owner: "Alex Chen",
    season: "Spring '25",
    color: "Electric Blue",
    description: "Ultra-premium legendary jacket with electroluminescent fibers",
    story: "The crown jewel of our Spring 2025 collection, featuring cutting-edge smart fabric technology."
  },
  "Cyber Punk": {
    obtained: "Scanned QR at Monarch Pop-up Store",
    date: "March 10, 2025",
    location: "SoHo, NYC",
    owner: "Alex Chen", 
    season: "Spring '25",
    color: "Neon Purple",
    description: "Limited edition jacket from Spring 2025 collection",
    story: "Part of the cyberpunk-inspired streetwear line"
  },
  "Urban Explorer": {
    obtained: "Scanned QR at Monarch Street Event",
    date: "March 15, 2025",
    location: "Brooklyn, NYC",
    owner: "Alex Chen",
    season: "Spring '25", 
    color: "Military Green",
    description: "Tactical streetwear for urban adventures",
    story: "Designed for the modern city explorer with hidden pockets and weather resistance."
  },
  "Spring 2025": {
    obtained: "Completed Spring Collection Quest", 
    date: "March 20, 2025",
    location: "Digital Achievement",
    owner: "Alex Chen",
    season: "Spring '25",
    color: "Digital Gold",
    description: "Commemorative stamp for completing Spring 2025 collection",
    story: "Earned by collecting 5 items from the Spring 2025 lineup."
  },
  "Summer 2025": {
    obtained: "Early Access Preview Event",
    date: "March 25, 2025", 
    location: "Monarch Studio, Manhattan",
    owner: "Alex Chen",
    season: "Summer '25",
    color: "Sunset Orange",
    description: "Exclusive preview stamp for upcoming Summer collection",
    story: "Special access to our Summer 2025 preview showcase."
  },
  "Gold Chain": {
    obtained: "Scanned QR at Luxury Pop-up",
    date: "March 12, 2025",
    location: "Madison Ave, NYC",
    owner: "Alex Chen",
    season: "Spring '25",
    color: "18K Gold",
    description: "18k gold-plated chain with Monarch logo pendant", 
    story: "Handcrafted accessory representing ultimate luxury and status."
  },
  "Silver Watch": {
    obtained: "Milestone Achievement Reward",
    date: "March 18, 2025",
    location: "Digital Reward",
    owner: "Alex Chen",
    season: "Spring '25",
    color: "Platinum Silver",
    description: "Premium timepiece for dedicated collectors",
    story: "Awarded for reaching Level 5 in the Monarch ecosystem."
  }
};

const ModalOverlay = styled.div`
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.8);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
  padding: 20px;
`;

const CardContainer = styled.div`
  width: 90vw;
  max-width: 400px;
  height: 70vh;
  max-height: 600px;
  position: relative;
`;

const Card = styled.div`
  width: 100%;
  height: 100%;
  border-radius: 20px;
  background: linear-gradient(135deg, rgba(255,255,255,0.18) 0%, rgba(76,28,140,0.13) 100%), 
              rgba(76, 28, 140, 0.15);
  border: 1.5px solid rgba(255,255,255,0.35);
  box-shadow: 0 0 32px 0 rgba(255,215,0,0.18), 0 0 24px 0 rgba(127,63,191,0.22);
  backdrop-filter: blur(20px);
  color: white;
  padding: 40px 30px;
  cursor: pointer;
  transition: transform 0.3s ease;
  display: flex;
  flex-direction: column;
  position: relative;
  
  &:hover {
    transform: scale(1.02);
  }
`;

const CloseButton = styled.button`
  position: absolute;
  top: 20px;
  right: 20px;
  background: none;
  border: none;
  color: white;
  font-size: 28px;
  cursor: pointer;
  z-index: 10;
  width: 40px;
  height: 40px;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 50%;
  transition: background 0.2s;
  
  &:hover {
    background: rgba(255, 255, 255, 0.1);
  }
`;

// Front Side Components
const FrontSide = styled.div`
  display: ${({ show }) => show ? 'flex' : 'none'};
  flex-direction: column;
  align-items: center;
  justify-content: center;
  height: 100%;
  text-align: center;
`;

const RarityBadge = styled.div`
  position: absolute;
  top: 20px;
  left: 20px;
  background: ${({ rarity }) => {
    switch(rarity) {
      case 'legendary': return '#FFD700';
      case 'epic': return '#9B4BFF';
      case 'rare': return '#4B9CD3';
      default: return '#7F3FBF';
    }
  }};
  color: ${({ rarity }) => rarity === 'legendary' ? '#000' : '#fff'};
  padding: 6px 12px;
  border-radius: 12px;
  font-size: 0.8rem;
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: 0.5px;
`;

const ItemIcon = styled.div`
  width: 120px;
  height: 120px;
  background: rgba(255, 255, 255, 0.1);
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 3.5rem;
  margin-bottom: 30px;
  border: 2px solid rgba(255, 255, 255, 0.2);
  position: relative;
`;

const ItemGlow = styled.div`
  position: absolute;
  top: 50%;
  left: 50%;
  width: 140px;
  height: 140px;
  border-radius: 50%;
  pointer-events: none;
  transform: translate(-50%, -50%);
  background: ${({ rarity }) => {
    switch(rarity) {
      case 'legendary': return 'radial-gradient(circle, rgba(255,215,0,0.3) 0%, rgba(255,215,0,0.1) 50%, transparent 70%)';
      case 'epic': return 'radial-gradient(circle, rgba(155,75,255,0.3) 0%, rgba(155,75,255,0.1) 50%, transparent 70%)';
      case 'rare': return 'radial-gradient(circle, rgba(75,156,211,0.3) 0%, rgba(75,156,211,0.1) 50%, transparent 70%)';
      default: return 'radial-gradient(circle, rgba(127,63,191,0.3) 0%, rgba(127,63,191,0.1) 50%, transparent 70%)';
    }
  }};
  animation: gentlePulse 3s ease-in-out infinite alternate;
  
  @keyframes gentlePulse {
    0% { opacity: 0.7; transform: translate(-50%, -50%) scale(0.9); }
    100% { opacity: 0.9; transform: translate(-50%, -50%) scale(1.05); }
  }
`;

const ItemName = styled.h2`
  font-size: 1.8rem;
  font-weight: 700;
  margin-bottom: 10px;
  font-family: 'Outfit', sans-serif;
`;

const ItemInfo = styled.div`
  font-size: 1rem;
  color: rgba(255, 255, 255, 0.7);
  margin-bottom: 8px;
`;

const FlipHint = styled.div`
  position: absolute;
  bottom: 30px;
  left: 50%;
  transform: translateX(-50%);
  font-size: 0.9rem;
  color: rgba(255, 255, 255, 0.5);
  font-style: italic;
`;

// Back Side Components
const BackSide = styled.div`
  display: ${({ show }) => show ? 'flex' : 'none'};
  flex-direction: column;
  height: 100%;
  text-align: left;
`;

const BackHeader = styled.h2`
  font-size: 1.6rem;
  text-align: center;
  margin-bottom: 30px;
  font-family: 'Outfit', sans-serif;
`;

const DetailsGrid = styled.div`
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 20px;
  margin-bottom: 30px;
`;

const DetailItem = styled.div`
  &.full-width {
    grid-column: 1 / -1;
  }
`;

const DetailLabel = styled.div`
  font-size: 0.85rem;
  color: rgba(255, 255, 255, 0.6);
  text-transform: uppercase;
  letter-spacing: 0.5px;
  margin-bottom: 5px;
`;

const DetailValue = styled.div`
  font-size: 1rem;
  font-weight: 600;
  color: white;
`;

const Description = styled.div`
  color: rgba(255, 255, 255, 0.8);
  line-height: 1.5;
  font-size: 0.9rem;
  text-align: center;
  margin-top: auto;
`;

const ItemModal = ({ item, isOpen, onClose }) => {
  const [showBack, setShowBack] = useState(false);
  
  useEffect(() => {
    if (isOpen) {
      setShowBack(false);
    }
  }, [isOpen]);
  
  if (!isOpen || !item) return null;
  
  const details = itemBackDetails[item.name] || {
    owner: "Alex Chen",
    date: "March 2025",
    season: "Spring '25",
    color: "Classic",
    location: "NYC",
    description: "Premium item from Monarch collection"
  };
  
  const handleCardClick = (e) => {
    e.stopPropagation();
    setShowBack(!showBack);
  };
  
  const handleOverlayClick = (e) => {
    if (e.target === e.currentTarget) {
      onClose();
    }
  };
  
  const handleCloseClick = (e) => {
    e.stopPropagation();
    onClose();
  };
  
  return (
    <ModalOverlay onClick={handleOverlayClick}>
      <CardContainer>
        <Card onClick={handleCardClick}>
          <CloseButton onClick={handleCloseClick}>×</CloseButton>
          {/* FRONT SIDE */}
          <FrontSide show={!showBack}>
            <RarityBadge rarity={item.rarity}>
              {item.rarity || 'Common'}
            </RarityBadge>
            <div style={{ position: 'relative' }}>
              <ItemIcon>
                👕
              </ItemIcon>
              <ItemGlow rarity={item.rarity} />
            </div>
            <ItemName>{item.name}</ItemName>
            <ItemInfo>Owner: {details.owner}</ItemInfo>
            <ItemInfo>{details.season}</ItemInfo>
            <FlipHint>Tap to flip</FlipHint>
          </FrontSide>
          {/* BACK SIDE */}
          <BackSide show={showBack}>
            <BackHeader>{item.name}</BackHeader>
            <DetailsGrid>
              <DetailItem>
                <DetailLabel>Earned on</DetailLabel>
                <DetailValue>{details.date}</DetailValue>
              </DetailItem>
              <DetailItem>
                <DetailLabel>Season</DetailLabel>
                <DetailValue>{details.season}</DetailValue>
              </DetailItem>
              <DetailItem>
                <DetailLabel>Method</DetailLabel>
                <DetailValue>Scan</DetailValue>
              </DetailItem>
              <DetailItem>
                <DetailLabel>Color</DetailLabel>
                <DetailValue>{details.color}</DetailValue>
              </DetailItem>
              <DetailItem className="full-width">
                <DetailLabel>Location</DetailLabel>
                <DetailValue>{details.location}</DetailValue>
              </DetailItem>
              <DetailItem className="full-width">
                <DetailLabel>Collection</DetailLabel>
                <DetailValue>Monarch Spring 2025</DetailValue>
              </DetailItem>
            </DetailsGrid>
            <Description>
              {details.description}
              {details.story && (
                <>
                  <br /><br />
                  {details.story}
                </>
              )}
            </Description>
            <FlipHint>Tap to flip back</FlipHint>
          </BackSide>
        </Card>
      </CardContainer>
    </ModalOverlay>
  );
};

export default ItemModal; 