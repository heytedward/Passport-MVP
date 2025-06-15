import React from 'react';
import styled from 'styled-components';

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

const ModalCard = styled.div`
  background: linear-gradient(135deg, rgba(30,30,30,0.95) 0%, rgba(127,63,191,0.13) 100%);
  border: 2.5px solid #FFD700;
  border-radius: 22px;
  box-shadow: 0 8px 40px 0 rgba(255,215,0,0.10), 0 0 32px 0 rgba(127,63,191,0.10);
  padding: 2.2rem 1.5rem 1.5rem 1.5rem;
  width: 100%;
  max-width: 400px;
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

function ReferralModal({ open, onClose }) {
  const handleOverlayClick = (e) => {
    if (e.target === e.currentTarget) onClose();
  };

  if (!open) return null;

  return (
    <ModalOverlay onClick={handleOverlayClick}>
      <ModalCard>
        <ModalClose onClick={onClose}>×</ModalClose>
        <ModalTitle>Share Referral</ModalTitle>
        <div style={{ width: '100%', textAlign: 'center', marginTop: '0.2rem' }}>
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
      </ModalCard>
    </ModalOverlay>
  );
}

export default ReferralModal; 