import React, { useState } from 'react';
import styled, { css, createGlobalStyle } from 'styled-components';
import GlassCard from '../components/GlassCard';

const GlobalStyle = createGlobalStyle`
  html, body {
    background: #121212 !important;
    color: white;
    min-height: 100vh;
    margin: 0;
    padding: 0;
  }
`;

const borderColors = [
  '#e74c3c', // red
  '#3498db', // blue
  '#2ecc71', // green
  '#f39c12', // orange
  '#9b59b6', // purple
  '#1abc9c', // cyan
  '#e67e22', // orange
];

const achievements = [
  { icon: '📍', label: 'Attended Pop-up', date: '2025-03-18', location: 'SoHo, NYC', wings: 15, description: 'First interaction with Monarch brand experience at our exclusive pop-up location.' },
  { icon: '👥', label: 'Added 2 Friends', date: '2025-03-15', location: 'Digital', wings: 10, description: 'Built connections within the Monarch community by adding friends.' },
  { icon: '🧥', label: 'Scanned My Jacket', date: '2025-03-14', location: 'Home', wings: 20, description: 'Added your first Monarch jacket to your digital collection.' },
  { icon: '🎉', label: 'Joined My First Event', date: '2025-03-10', location: 'Downtown', wings: 25, description: 'Participated in your first Monarch community gathering.' },
  { icon: '🏷️', label: 'Tagged on Social', date: '2025-03-08', location: 'Instagram', wings: 15, description: 'Spread the word about Monarch on your social platforms.' },
  { icon: '✅', label: 'Completed My First Quest', date: '2025-03-05', location: 'Digital', wings: 30, description: 'Completed your first Monarch collection quest.' },
  { icon: '💎', label: '7th Achievement', date: '2025-03-01', location: 'Digital', wings: 50, description: 'Reached a significant milestone in your Monarch journey.' },
];

const Container = styled.div`
  padding: 2rem 1rem 6rem 1rem;
  max-width: 100vw;
  overflow-x: hidden;
`;

const ScreenTitle = styled.h1`
  font-family: 'Outfit', sans-serif;
  font-weight: 700;
  color: ${({ theme }) => theme.colors.text.primary};
  font-size: 2rem;
  margin-bottom: 1.5rem;
  text-align: center;
`;

const Grid = styled.div`
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 1rem;
  margin: 2rem 0;
  @media (min-width: 768px) {
    grid-template-columns: repeat(3, 1fr);
    gap: 1.5rem;
  }
`;

const StampCard = styled.div`
  background: linear-gradient(135deg, rgba(255,255,255,0.13) 0%, rgba(127,63,191,0.10) 100%);
  border: 2.5px dashed #e74c3c;
  ${({ bordercolor }) => bordercolor && css`border-color: ${bordercolor};`}
  border-radius: 18px;
  box-shadow: 0 2px 16px 0 rgba(255,215,0,0.05), 0 0 16px 0 rgba(127,63,191,0.05);
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  min-width: 0;
  min-height: 120px;
  aspect-ratio: 4/5;
  padding: 1.1rem 0.7rem;
  transition: transform 0.18s cubic-bezier(0.4,0,0.2,1), box-shadow 0.18s;
  &:hover {
    transform: translateY(-2px) scale(1.03);
    box-shadow: 0 4px 16px 0 rgba(255,215,0,0.09), 0 0 24px 0 rgba(127,63,191,0.09);
  }
  &.full-width {
    grid-column: 1 / -1;
    justify-self: center;
    max-width: 300px;
  }
  @media (max-width: 767px) {
    min-height: 90px;
    aspect-ratio: 1/1;
    padding: 0.7rem 0.3rem;
    font-size: 0.95rem;
  }
`;

const StampIcon = styled.div`
  font-size: 2.2rem;
  margin-bottom: 0.5rem;
  @media (max-width: 767px) {
    font-size: 1.7rem;
    margin-bottom: 0.3rem;
  }
`;

const StampLabel = styled.div`
  font-size: 1.05rem;
  text-align: center;
  color: ${({ theme }) => theme.colors.text.primary};
  margin-bottom: 0.1rem;
  @media (max-width: 767px) {
    font-size: 0.95rem;
  }
`;

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

const LargeStampIcon = styled.div`
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

function StampModal({ stamp, open, onClose }) {
  const [isFlipped, setIsFlipped] = useState(false);
  if (!open || !stamp) return null;
  return (
    <ModalOverlay onClick={onClose}>
      <CloseButton onClick={onClose} aria-label="Close">×</CloseButton>
      <ModalCard onClick={e => e.stopPropagation()}>
        <FlipInner isflipped={isFlipped}>
          <FrontFace onClick={() => setIsFlipped(true)}>
            <LargeStampIcon>{stamp.icon}</LargeStampIcon>
            <ModalTitle>{stamp.label}</ModalTitle>
            <ModalHint>Tap to flip</ModalHint>
          </FrontFace>
          <BackFace onClick={() => setIsFlipped(false)}>
            <ModalTitle>How You Earned This</ModalTitle>
            <ModalDetails>
              <div><ModalDetailLabel>Date:</ModalDetailLabel> {stamp.date}</div>
              <div><ModalDetailLabel>Location:</ModalDetailLabel> {stamp.location}</div>
              <div><ModalDetailLabel>WINGS:</ModalDetailLabel> +{stamp.wings}</div>
            </ModalDetails>
            <ModalDescription>{stamp.description}</ModalDescription>
            <ModalHint>Tap to flip back</ModalHint>
          </BackFace>
        </FlipInner>
      </ModalCard>
    </ModalOverlay>
  );
}

const PassportScreen = () => {
  const [modalIdx, setModalIdx] = useState(null);

  return (
    <>
      <GlobalStyle />
      <Container>
        <ScreenTitle>My Monarch Passport</ScreenTitle>
        <Grid>
          {achievements.map((achievement, idx) => (
            <StampCard
              key={idx}
              bordercolor={borderColors[idx % borderColors.length]}
              onClick={() => setModalIdx(idx)}
              aria-label={achievement.label}
              className={idx === 6 ? 'full-width' : ''}
            >
              <StampIcon>{achievement.icon}</StampIcon>
              <StampLabel>{achievement.label}</StampLabel>
            </StampCard>
          ))}
        </Grid>
        <StampModal
          stamp={achievements[modalIdx]}
          open={modalIdx !== null}
          onClose={() => setModalIdx(null)}
        />
      </Container>
    </>
  );
};

export default PassportScreen; 