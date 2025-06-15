import React, { useState, useEffect } from 'react';
import styled from 'styled-components';

const Overlay = styled.div`
  position: fixed;
  top: 0; left: 0; right: 0; bottom: 0;
  background: rgba(18,18,18,0.55);
  backdrop-filter: blur(8px);
  z-index: 2000;
  display: flex;
  align-items: center;
  justify-content: center;
`;

const Modal = styled.div`
  position: relative;
  width: 320px;
  max-width: 90vw;
  height: 420px;
  perspective: 1200px;
  display: flex;
  align-items: center;
  justify-content: center;
`;

const Card = styled.div`
  width: 100%;
  height: 100%;
  position: relative;
  transform-style: preserve-3d;
  transition: transform 0.6s cubic-bezier(0.4,0,0.2,1);
  ${({ flipped }) => flipped && 'transform: rotateY(180deg);'}
`;

const CardFace = styled.div`
  position: absolute;
  width: 100%;
  height: 100%;
  backface-visibility: hidden;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  border-radius: 20px;
  background: ${({ theme }) => theme.colors.glass.background}, rgba(255,255,255,0.13);
  box-shadow: 0 0 32px 0 rgba(255,215,0,0.18), 0 0 24px 0 rgba(127,63,191,0.22);
  border: 1.5px solid rgba(255,255,255,0.35);
  padding: 32px 16px;
`;

const CardFront = styled(CardFace)`
  font-size: 5rem;
  font-family: 'Outfit', sans-serif;
  color: #fff;
`;

const CardBack = styled(CardFace)`
  transform: rotateY(180deg);
  color: #fff;
  font-family: 'Space Grotesk', sans-serif;
  font-size: 1.1rem;
  justify-content: flex-start;
  padding-top: 48px;
`;

const FlippableCard = ({ emoji, date, season, rarity, onClose }) => {
  const [flipped, setFlipped] = useState(false);

  // Reset flip state when a new card is opened
  useEffect(() => {
    setFlipped(false);
  }, [emoji]);

  // Close on overlay click
  const handleOverlayClick = e => {
    if (e.target === e.currentTarget) onClose();
  };

  // Flip on click/tap or key
  const handleFlip = () => setFlipped(f => !f);

  return (
    <Overlay onClick={handleOverlayClick}>
      <Modal>
        <Card flipped={flipped} onClick={handleFlip} tabIndex={0} aria-pressed={flipped} role="button" onKeyDown={e => (e.key === 'Enter' || e.key === ' ') && handleFlip()}>
          <CardFront>
            {emoji}
            <div style={{ marginTop: 18, fontSize: '1.1rem', opacity: 0.7 }}>Tap or swipe to flip</div>
          </CardFront>
          <CardBack>
            <div style={{ marginBottom: 18, fontWeight: 700, fontSize: '1.2rem' }}>Stamp Details</div>
            <div><b>Date Earned:</b> {date}</div>
            <div><b>Season:</b> {season}</div>
            {rarity && <div><b>Rarity:</b> {rarity}</div>}
            <div style={{ marginTop: 24, fontSize: '0.95rem', opacity: 0.7 }}>Tap or swipe to flip back</div>
          </CardBack>
        </Card>
      </Modal>
    </Overlay>
  );
};

export default FlippableCard; 