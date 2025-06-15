import React, { useState } from 'react';
import styled, { css } from 'styled-components';

const gold = '#FFD700';

const Container = styled.div`
  min-height: 100vh;
  background: ${({ theme }) => theme.colors.background};
  color: ${({ theme }) => theme.colors.text.primary};
  padding: 2.5rem 1rem 6rem 1rem;
  max-width: 1100px;
  margin: 0 auto;
`;

const Title = styled.h1`
  font-size: 2.2rem;
  font-weight: 700;
  color: ${({ theme }) => theme.colors.text.primary};
  margin-bottom: 2rem;
  text-align: left;
`;

const FilterTabs = styled.div`
  display: flex;
  gap: 0.5rem;
  margin-bottom: 1.5rem;
  overflow-x: auto;
  -webkit-overflow-scrolling: touch;
  scrollbar-width: none;
  -ms-overflow-style: none;
  &::-webkit-scrollbar {
    display: none;
  }
`;

const FilterTab = styled.button`
  background: ${({ active }) => active ? 'linear-gradient(135deg, rgba(255,255,255,0.13) 0%, rgba(127,63,191,0.10) 100%)' : 'transparent'};
  border: 2px solid ${({ active }) => active ? gold : 'rgba(255,255,255,0.1)'};
  border-radius: 12px;
  padding: 0.6rem 1.2rem;
  color: ${({ theme, active }) => active ? theme.colors.text.primary : theme.colors.text.secondary};
  font-size: 0.95rem;
  font-weight: 500;
  cursor: pointer;
  white-space: nowrap;
  transition: all 0.2s;
  &:hover {
    border-color: ${gold};
    color: ${({ theme }) => theme.colors.text.primary};
  }
`;

const ItemGrid = styled.div`
  display: grid;
  gap: 16px;
  @media (max-width: 768px) {
    grid-template-columns: repeat(2, 1fr);
  }
  @media (min-width: 769px) {
    grid-template-columns: repeat(auto-fill, minmax(240px, 1fr));
  }
`;

const ItemCard = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  text-align: center;
  background: linear-gradient(135deg, rgba(255,255,255,0.13) 0%, rgba(127,63,191,0.10) 100%);
  border: 2.5px solid ${gold};
  border-radius: 18px;
  box-shadow: 0 2px 16px 0 rgba(255,215,0,0.05), 0 0 16px 0 rgba(127,63,191,0.05);
  backdrop-filter: blur(18px);
  -webkit-backdrop-filter: blur(18px);
  padding: 24px 16px;
  min-height: 280px;
  aspect-ratio: 4/5;
  cursor: pointer;
  position: relative;
  transition: transform 0.18s cubic-bezier(0.4,0,0.2,1), box-shadow 0.18s;
  &:hover {
    transform: translateY(-2px) scale(1.03);
    box-shadow: 0 4px 16px 0 rgba(255,215,0,0.09), 0 0 24px 0 rgba(127,63,191,0.09);
  }
  @media (max-width: 768px) {
    min-height: 170px;
    padding: 16px 8px;
    aspect-ratio: 1/1;
  }
`;

const ItemIcon = styled.div`
  font-size: 2.4rem;
  margin-bottom: 0.7rem;
  margin-top: 0.2rem;
  filter: drop-shadow(0 1px 2px rgba(0,0,0,0.18));
  text-align: center;
`;

const ItemTitle = styled.h3`
  font-size: 1.15rem;
  font-weight: 600;
  color: ${({ theme }) => theme.colors.text.primary};
  margin: 0 0 0.3rem 0;
  text-align: center;
  line-height: 1.2;
`;

const RarityBadge = styled.span`
  background: ${({ rarity }) => {
    switch(rarity) {
      case 'Legendary': return 'linear-gradient(135deg, #FFD700 0%, #FFA500 100%)';
      case 'Epic': return 'linear-gradient(135deg, #9370DB 0%, #4B0082 100%)';
      case 'Rare': return 'linear-gradient(135deg, #4169E1 0%, #0000CD 100%)';
      default: return 'linear-gradient(135deg, #808080 0%, #404040 100%)';
    }
  }};
  color: white;
  padding: 0.22rem 0.7rem;
  border-radius: 8px;
  font-size: 0.75rem;
  font-weight: 600;
  margin: 0.4rem 0 0.2rem 0;
  display: inline-block;
`;

const ItemSub = styled.p`
  font-size: 0.95rem;
  color: ${({ theme }) => theme.colors.text.secondary};
  margin: 0.1rem 0 0 0;
  text-align: center;
`;

// New filter definitions
const PRIMARY_FILTERS = ['All Items', 'Physical', 'Digital'];
const TYPE_FILTERS = [
  { label: 'Outerwear', categories: ['Jackets', 'Hoodies', 'Sweaters'] },
  { label: 'Tops', categories: ['T-Shirts', 'Tank Tops', 'Long Sleeves'] },
  { label: 'Bottoms', categories: ['Sweatpants', 'Shorts', 'Jeans', 'Denim'] },
  { label: 'Headwear', categories: ['Hats', 'Caps', 'Beanies'] },
  { label: 'Accessories', categories: ['Chains', 'Watches', 'Bags', 'Accessories'] },
];

// Digital subcategories for filter
const DIGITAL_SUBCATEGORIES = [
  { label: 'Digital Collectibles', categories: ['digitalCollectibles', 'Badges', 'Exclusive Items'] },
  { label: 'Posters', categories: ['Posters', 'Digital Artwork', 'Prints'] },
  { label: 'Stickers', categories: ['Stickers', 'Digital Sticker Packs'] },
  { label: 'Tickets', categories: ['Tickets', 'Event Passes', 'VIP Access'] },
  { label: 'Songs', categories: ['Songs', 'Exclusive Tracks', 'Playlists'] },
  { label: 'Stamps', categories: ['Stamps', 'Achievement Stamps'] },
];

// Expanded demo items (add more if needed)
const items = [
  // Physical items
  { id: 1, name: 'Spring Jacket', category: 'Jackets', type: 'Physical', rarity: 'Rare', icon: '🧥', mint: '037', date: 'March 2025', location: 'NYC', description: 'Limited edition Monarch jacket.' },
  { id: 2, name: 'Gold Chain', category: 'Chains', type: 'Physical', rarity: 'Epic', icon: '⛓️', mint: '003', date: 'March 2025', location: 'NYC', description: '18k gold-plated chain with Monarch logo.' },
  { id: 4, name: 'Summer Hat', category: 'Hats', type: 'Physical', rarity: 'Common', icon: '🧢', mint: '021', date: 'March 2025', location: 'LA', description: 'Summer hat from Monarch.' },
  { id: 6, name: 'Classic Hoodie', category: 'Hoodies', type: 'Physical', rarity: 'Rare', icon: '🧥', mint: '042', date: 'March 2025', location: 'NYC', description: 'Classic Monarch hoodie.' },
  { id: 7, name: 'Denim Jeans', category: 'Jeans', type: 'Physical', rarity: 'Rare', icon: '👖', mint: '011', date: 'March 2025', location: 'NYC', description: 'Premium denim jeans.' },
  { id: 8, name: 'Long Sleeve Tee', category: 'Long Sleeves', type: 'Physical', rarity: 'Common', icon: '👕', mint: '099', date: 'March 2025', location: 'NYC', description: 'Long sleeve Monarch tee.' },
  { id: 9, name: 'Monarch Watch', category: 'Watches', type: 'Physical', rarity: 'Epic', icon: '⌚', mint: '005', date: 'March 2025', location: 'NYC', description: 'Luxury Monarch watch.' },
  { id: 10, name: 'Canvas Bag', category: 'Bags', type: 'Physical', rarity: 'Rare', icon: '👜', mint: '017', date: 'March 2025', location: 'NYC', description: 'Monarch canvas bag.' },
  // Digital items
  { id: 11, name: 'Monarch Badge', category: 'digitalCollectibles', type: 'Digital', rarity: 'Legendary', icon: '🎖️', mint: 'DC-01', date: 'March 2025', location: 'Digital', description: 'Exclusive Monarch digital collectible badge.' },
  { id: 12, name: 'VIP Pass', category: 'digitalCollectibles', type: 'Digital', rarity: 'Epic', icon: '🎫', mint: 'VIP-07', date: 'March 2025', location: 'Digital', description: 'VIP access digital collectible pass.' },
  { id: 13, name: 'Elite Member Token', category: 'digitalCollectibles', type: 'Digital', rarity: 'Epic', icon: '🪙', mint: 'EMT-01', date: 'March 2025', location: 'Digital', description: 'Elite member digital collectible token.' },
  { id: 14, name: 'Monarch Poster', category: 'Posters', type: 'Digital', rarity: 'Rare', icon: '🖼️', mint: 'PST-01', date: 'March 2025', location: 'Digital', description: 'Limited edition digital poster.' },
  { id: 15, name: 'Sticker Pack', category: 'Stickers', type: 'Digital', rarity: 'Common', icon: '💠', mint: 'STK-01', date: 'March 2025', location: 'Digital', description: 'Digital sticker pack.' },
  { id: 16, name: 'Event Ticket', category: 'Tickets', type: 'Digital', rarity: 'Epic', icon: '🎟️', mint: 'TCK-01', date: 'March 2025', location: 'Digital', description: 'Event ticket for Monarch event.' },
  { id: 17, name: 'Exclusive Song', category: 'Songs', type: 'Digital', rarity: 'Rare', icon: '🎵', mint: 'SNG-01', date: 'March 2025', location: 'Digital', description: 'Exclusive Monarch track.' },
  { id: 18, name: 'Achievement Stamp', category: 'Stamps', type: 'Digital', rarity: 'Rare', icon: '📮', mint: 'STM-01', date: 'March 2025', location: 'Digital', description: 'Achievement digital stamp.' },
];

// Modal Styles
const ModalOverlay = styled.div`
  position: fixed;
  top: 0; left: 0; right: 0; bottom: 0;
  background: rgba(0,0,0,0.55);
  backdrop-filter: blur(8px);
  z-index: 1000;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 24px;
`;

const ModalCard = styled.div`
  width: 350px;
  max-width: 90vw;
  height: 370px;
  max-height: 95vh;
  perspective: 1200px;
  background: none;
  border-radius: 24px;
  @media (max-width: 480px) {
    width: 98vw;
    height: 320px;
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
  ${({ isflipped }) => isflipped && css`transform: rotateY(180deg);`}
`;

const Face = styled.div`
  position: absolute;
  width: 100%;
  height: 100%;
  backface-visibility: hidden;
  border-radius: 24px;
  background: linear-gradient(135deg, rgba(30,30,40,0.85) 0%, rgba(76,28,140,0.13) 100%), rgba(76, 28, 140, 0.15);
  border: 2.5px solid #FFD700;
  box-shadow: 0 0 32px 0 rgba(255,215,0,0.10), 0 0 24px 0 rgba(127,63,191,0.13);
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 2rem 1.2rem 1.2rem 1.2rem;
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
  font-size: 4rem;
  margin-bottom: 1.2rem;
`;

const ModalTitle = styled.h2`
  font-size: 1.35rem;
  font-weight: 700;
  color: ${({ theme }) => theme.colors.text.primary};
  margin-bottom: 0.7rem;
  text-align: center;
`;

const ModalHint = styled.div`
  font-size: 0.95rem;
  color: #FFD700;
  margin-top: 1.2rem;
  text-align: center;
`;

const ModalDetails = styled.div`
  margin-top: 0.5rem;
  color: ${({ theme }) => theme.colors.text.primary};
  font-size: 1.05rem;
  text-align: center;
`;

const ModalDetailLabel = styled.span`
  color: #FFD700;
  font-weight: 600;
`;

const ModalDescription = styled.div`
  margin-top: 0.7rem;
  color: ${({ theme }) => theme.colors.text.primary};
  font-size: 1.02rem;
  text-align: center;
`;

// New filter bar styles
const FilterBar = styled.div`
  display: flex;
  gap: 0.5rem;
  margin-bottom: 0.7rem;
  overflow-x: auto;
  -webkit-overflow-scrolling: touch;
  scrollbar-width: none;
  -ms-overflow-style: none;
  &::-webkit-scrollbar { display: none; }
`;

function ItemModal({ item, open, onClose }) {
  const [isFlipped, setIsFlipped] = useState(false);
  if (!open || !item) return null;
  return (
    <ModalOverlay onClick={onClose}>
      <CloseButton onClick={onClose} aria-label="Close">×</CloseButton>
      <ModalCard onClick={e => e.stopPropagation()}>
        <FlipInner isflipped={isFlipped}>
          <FrontFace onClick={() => setIsFlipped(true)}>
            <LargeItemIcon>{item.icon}</LargeItemIcon>
            <ModalTitle>{item.name}</ModalTitle>
            <RarityBadge rarity={item.rarity}>{item.rarity}</RarityBadge>
            <ModalHint>Tap to flip</ModalHint>
          </FrontFace>
          <BackFace onClick={() => setIsFlipped(false)}>
            <ModalTitle>Item Details</ModalTitle>
            <ModalDetails>
              <div><ModalDetailLabel>How obtained:</ModalDetailLabel> Scanned QR at Monarch Store</div>
              <div><ModalDetailLabel>Date earned:</ModalDetailLabel> {item.date}</div>
              <div><ModalDetailLabel>Location:</ModalDetailLabel> {item.location}</div>
            </ModalDetails>
            <ModalDescription>{item.description}</ModalDescription>
            <ModalHint>Tap to flip back</ModalHint>
          </BackFace>
        </FlipInner>
      </ModalCard>
    </ModalOverlay>
  );
}

function ClosetScreen() {
  const [primaryFilter, setPrimaryFilter] = useState('All Items');
  const [typeFilter, setTypeFilter] = useState(null);
  const [digitalFilter, setDigitalFilter] = useState(null);
  const [modalIdx, setModalIdx] = useState(null);

  // Filtering logic
  let filteredItems = items;
  if (primaryFilter === 'Physical') {
    filteredItems = filteredItems.filter(item => item.type === 'Physical');
    if (typeFilter) {
      const typeObj = TYPE_FILTERS.find(t => t.label === typeFilter);
      if (typeObj) {
        filteredItems = filteredItems.filter(item => typeObj.categories.includes(item.category));
      }
    }
  } else if (primaryFilter === 'Digital') {
    filteredItems = filteredItems.filter(item => item.type === 'Digital');
    if (digitalFilter) {
      const digitalObj = DIGITAL_SUBCATEGORIES.find(d => d.label === digitalFilter);
      if (digitalObj) {
        filteredItems = filteredItems.filter(item => digitalObj.categories.includes(item.category));
      }
    }
  }
  // All Items: no further filtering

  return (
    <Container>
      <Title>My Closet</Title>
      {/* Primary filter row */}
      <FilterBar>
        {PRIMARY_FILTERS.map(filter => (
          <FilterTab
            key={filter}
            active={primaryFilter === filter}
            onClick={() => {
              setPrimaryFilter(filter);
              setTypeFilter(null); // Reset type filter when switching primary
              setDigitalFilter(null); // Reset digital filter
            }}
          >
            {filter}
          </FilterTab>
        ))}
      </FilterBar>
      {/* Clothing type filter row (only for Physical) */}
      {primaryFilter === 'Physical' && (
        <FilterBar style={{ marginBottom: '1.5rem' }}>
          {TYPE_FILTERS.map(type => (
            <FilterTab
              key={type.label}
              active={typeFilter === type.label}
              onClick={() => setTypeFilter(typeFilter === type.label ? null : type.label)}
            >
              {type.label}
            </FilterTab>
          ))}
        </FilterBar>
      )}
      {/* Digital subcategory filter row (only for Digital) */}
      {primaryFilter === 'Digital' && (
        <FilterBar style={{ marginBottom: '1.5rem' }}>
          {DIGITAL_SUBCATEGORIES.map(digital => (
            <FilterTab
              key={digital.label}
              active={digitalFilter === digital.label}
              onClick={() => setDigitalFilter(digitalFilter === digital.label ? null : digital.label)}
            >
              {digital.label}
            </FilterTab>
          ))}
        </FilterBar>
      )}
      <ItemGrid>
        {filteredItems.map((item, idx) => (
          <ItemCard key={item.id} onClick={() => setModalIdx(idx)}>
            <ItemIcon>{item.icon}</ItemIcon>
            <ItemTitle>{item.name}</ItemTitle>
            <RarityBadge rarity={item.rarity}>{item.rarity}</RarityBadge>
            <ItemSub>{item.category} {item.mint && <span>• #{item.mint}</span>}</ItemSub>
          </ItemCard>
        ))}
      </ItemGrid>
      <ItemModal
        item={filteredItems[modalIdx]}
        open={modalIdx !== null}
        onClose={() => setModalIdx(null)}
      />
    </Container>
  );
}

export default ClosetScreen; 