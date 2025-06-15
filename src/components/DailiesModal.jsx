import React, { useState } from 'react';
import styled from 'styled-components';

const ModalOverlay = styled.div`
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(18, 18, 18, 0.75);
  backdrop-filter: blur(16px);
  z-index: 2000;
  display: flex;
  align-items: center;
  justify-content: center;
  animation: fadeIn 0.3s;
  @keyframes fadeIn {
    from { opacity: 0; }
    to { opacity: 1; }
  }
`;

const ModalCard = styled.div`
  background: linear-gradient(135deg, rgba(30,30,30,0.95) 0%, rgba(127,63,191,0.13) 100%);
  border: 2.5px solid #FFD700;
  border-radius: 22px;
  box-shadow: 0 8px 40px 0 rgba(255,215,0,0.10), 0 0 32px 0 rgba(127,63,191,0.10);
  padding: 2.2rem 1.5rem 1.5rem 1.5rem;
  width: 100%;
  max-width: 350px;
  position: relative;
  display: flex;
  flex-direction: column;
  align-items: center;
  @media (max-width: 500px) {
    min-width: 0;
    padding: 1.2rem 0.7rem 1.2rem 0.7rem;
  }
`;

const ModalTitle = styled.h2`
  font-family: 'Outfit', sans-serif;
  font-size: 1.3rem;
  font-weight: 700;
  color: #fff;
  margin-bottom: 0.7rem;
  text-align: center;
`;

const ModalQuestion = styled.div`
  font-family: 'Space Grotesk', sans-serif;
  font-size: 1.08rem;
  color: #FFD700;
  margin-bottom: 1.5rem;
  text-align: center;
`;

const ModalButton = styled.button`
  width: 100%;
  max-width: 320px;
  margin-bottom: 1rem;
  padding: 0.85rem 0;
  border-radius: 12px;
  border: 2px solid #FFD700;
  background: transparent;
  color: #fff;
  font-family: 'Outfit', sans-serif;
  font-size: 1.08rem;
  font-weight: 600;
  cursor: pointer;
  transition: background 0.18s, color 0.18s;
  &:hover, &:focus {
    background: #FFD700;
    color: #121212;
    outline: none;
  }
`;

const ModalClose = styled.button`
  position: absolute;
  top: 18px;
  right: 18px;
  background: none;
  border: none;
  color: #fff;
  font-size: 1.5rem;
  cursor: pointer;
  z-index: 10;
  border-radius: 50%;
  width: 36px;
  height: 36px;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: background 0.2s;
  &:hover {
    background: rgba(255,255,255,0.08);
  }
`;

const QRContainer = styled.div`
  width: 120px;
  height: 120px;
  background: #fff;
  border-radius: 16px;
  margin: 0 auto 1rem auto;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 2.5rem;
  color: #121212;
  box-shadow: 0 2px 12px 0 rgba(255,215,0,0.10);
`;

function DailiesModal({ open, onClose }) {
  const [showQR, setShowQR] = useState(false);
  
  const handleOverlayClick = (e) => {
    if (e.target === e.currentTarget) onClose();
  };

  const handleTweet = () => {
    window.open('https://twitter.com/intent/tweet?text=Good%20morning%20@PapillonBrandUs!&hashtags=Papillon', '_blank');
  };

  const handleShareQR = () => {
    setShowQR(true);
  };

  if (!open) return null;

  return (
    <ModalOverlay onClick={handleOverlayClick}>
      <ModalCard>
        <ModalClose onClick={onClose}>×</ModalClose>
        <ModalTitle>Daily Check-in</ModalTitle>
        <ModalQuestion>Have you said Good Morning to us?</ModalQuestion>
        
        {!showQR ? (
          <>
            <ModalButton onClick={handleTweet}>
              Tweet @PapillonBrandUs
            </ModalButton>
            <ModalButton onClick={handleShareQR}>
              Share Referral QR
            </ModalButton>
          </>
        ) : (
          <div style={{ width: '100%', textAlign: 'center' }}>
            <QRContainer>
              {/* Mock QR code placeholder */}
              <span role="img" aria-label="QR">#️⃣</span>
            </QRContainer>
            <div style={{ color: '#FFD700', fontFamily: 'Outfit, sans-serif', fontWeight: 600, fontSize: '1.05rem', marginBottom: 8 }}>
              Join me on Monarch Passport!
            </div>
            <ModalButton
              onClick={() => window.open('https://www.instagram.com/', '_blank')}
            >
              Share to Instagram Story
            </ModalButton>
          </div>
        )}
      </ModalCard>
    </ModalOverlay>
  );
}

export default DailiesModal; 