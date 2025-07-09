import React, { useState } from 'react';
import styled, { css, createGlobalStyle } from 'styled-components';
import GlassCard from '../components/GlassCard';
import { useThemes } from '../hooks/useThemes';
import { gradientThemes } from '../styles/theme';



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

const PassportBook = styled.div`
  background: linear-gradient(135deg, rgba(30,30,40,0.85) 0%, rgba(76,28,140,0.13) 100%), rgba(76, 28, 140, 0.15);
  backdrop-filter: blur(20px);
  -webkit-backdrop-filter: blur(20px);
  border: 3px solid #FFD700;
  border-radius: 20px;
  padding: 32px;
  margin: 2rem auto;
  max-width: 600px;
  min-height: 700px; /* Extended height */
  box-shadow: 
    0 0 20px 0 rgba(255,215,0,0.2),
    0 0 40px 0 rgba(255,215,0,0.1),
    inset 0 1px 0 rgba(255,215,0,0.15);
  position: relative;
  
  /* Add book spine effect */
  &::before {
    content: '';
    position: absolute;
    left: 24px;
    top: 20px;
    bottom: 20px;
    width: 2px;
    background: linear-gradient(180deg, #FFD700 0%, rgba(255,215,0,0.3) 50%, #FFD700 100%);
    box-shadow: 0 0 4px rgba(255,215,0,0.3);
  }
  
  @media (max-width: 767px) {
    padding: 24px;
    margin: 1.5rem auto;
    min-height: 600px; /* Adjusted for mobile */
    
    &::before {
      left: 16px;
      top: 16px;
      bottom: 16px;
    }
  }
`;

const PassportTitle = styled.div`
  text-align: center;
  font-family: 'Outfit', sans-serif;
  font-weight: 700;
  font-size: 1.8rem;
  color: #FFD700;
  margin-bottom: 2rem;
  margin-left: 20px; /* Offset for book spine */
  text-transform: uppercase;
  letter-spacing: 2px;
  text-shadow: 0 0 10px rgba(255,215,0,0.3);
  
  @media (min-width: 768px) {
    font-size: 2rem;
    margin-left: 24px;
  }
  
  @media (max-width: 767px) {
    font-size: 1.5rem;
    margin-left: 16px;
    margin-bottom: 1.5rem;
    letter-spacing: 1px;
  }
`;

const Grid = styled.div`
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 1.5rem;
  margin-left: 20px; /* Offset for book spine */
  
  @media (min-width: 768px) {
    grid-template-columns: repeat(3, 1fr);
    gap: 2rem;
    margin-left: 24px;
  }
  
  @media (max-width: 767px) {
    margin-left: 16px;
    gap: 1rem;
  }
`;

const StampCard = styled.div`
  background: ${({ theme }) => theme.colors?.glass?.background || 'linear-gradient(135deg, rgba(20,20,20,0.95) 0%, rgba(30,30,30,0.90) 50%, rgba(15,15,15,0.98) 100%)'};
  border: 3px solid #FFD700;
  border-radius: 8px;
  box-shadow: 
    0 0 8px 0 rgba(255,215,0,0.15),
    0 0 16px 0 rgba(255,215,0,0.08),
    inset 0 1px 0 rgba(255,215,0,0.1);
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  min-width: 0;
  min-height: 60px;
  aspect-ratio: 1/1;
  padding: 0.4rem 0.2rem;
  position: relative;
  transition: transform 0.18s cubic-bezier(0.4,0,0.2,1), box-shadow 0.18s, border 0.18s;
  
  /* Add passport stamp border effect */
  &::before {
    content: '';
    position: absolute;
    top: 4px;
    left: 4px;
    right: 4px;
    bottom: 4px;
    border: 1px dashed rgba(255,215,0,0.4);
    border-radius: 4px;
    pointer-events: none;
  }
  

  
  &:hover {
    border: 3px solid #FFD700;
    transform: translateY(-2px) scale(1.02);
    box-shadow: 
      0 0 12px 0 rgba(255,215,0,0.3),
      0 0 24px 0 rgba(255,215,0,0.15),
      inset 0 1px 0 rgba(255,215,0,0.2);
      
    &::before {
      border-color: rgba(255,215,0,0.6);
    }
  }
  
  &.rectangular {
    aspect-ratio: 1.5/1; /* Make it rectangular instead of square */
    grid-column: 1 / -1; /* Span across all columns */
    justify-self: center; /* Center it horizontally */
    max-width: 150px; /* Limit its width */
  }
  
  @media (max-width: 767px) {
    min-height: 50px;
    aspect-ratio: 1/1;
    padding: 0.3rem 0.15rem;
    font-size: 0.8rem;
  }
`;

const StampIcon = styled.div`
  font-size: 1.8rem;
  margin-bottom: 0.3rem;
  @media (max-width: 767px) {
    font-size: 1.4rem;
    margin-bottom: 0.2rem;
  }
`;

const StampLabel = styled.div`
  font-size: 0.9rem;
  text-align: center;
  color: ${({ theme }) => theme.colors.text.primary};
  margin-bottom: 0.1rem;
  line-height: 1.2;
  font-weight: 600;
  @media (max-width: 767px) {
    font-size: 0.8rem;
  }
`;

// Modal Styles
const ModalOverlay = styled.div`
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(18, 18, 18, 0.3);
  backdrop-filter: blur(20px);
  -webkit-backdrop-filter: blur(20px);
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
  border-radius: 20px;
  background: linear-gradient(135deg, rgba(30,30,40,0.85) 0%, rgba(76,28,140,0.13) 100%), rgba(76, 28, 140, 0.15);
  backdrop-filter: blur(20px);
  -webkit-backdrop-filter: blur(20px);
  border: 3px dashed #FFD700;
  box-shadow: 
    0 0 20px 0 rgba(255,215,0,0.2),
    0 0 40px 0 rgba(255,215,0,0.1),
    inset 0 1px 0 rgba(255,215,0,0.15);
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 32px;
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

function StampModal({ stamp, open, onClose, gradient }) {
  const [isFlipped, setIsFlipped] = useState(false);
  if (!open || !stamp) return null;
  return (
    <ModalOverlay onClick={onClose}>
      <CloseButton onClick={onClose} aria-label="Close">×</CloseButton>
      <ModalCard onClick={e => e.stopPropagation()}>
        <FlipInner isflipped={isFlipped}>
          <FrontFace gradient={gradient} onClick={() => setIsFlipped(true)}>
            <LargeStampIcon>{stamp.icon}</LargeStampIcon>
            <ModalTitle>{stamp.label}</ModalTitle>
            <ModalHint>Tap to flip</ModalHint>
          </FrontFace>
          <BackFace gradient={gradient} onClick={() => setIsFlipped(false)}>
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
  const { equippedTheme } = useThemes();
  const [modalIdx, setModalIdx] = useState(null);
  
  // Get the current theme gradient
  const currentGradient = gradientThemes[equippedTheme]?.gradient || gradientThemes.frequencyPulse.gradient;

  return (
    <>
      <Container>
        <ScreenTitle>My Monarch Passport</ScreenTitle>
        <PassportBook>
          <PassportTitle>Spring '25</PassportTitle>
          <Grid>
            {achievements.map((achievement, idx) => (
              <StampCard
                key={idx}
                bordercolor={borderColors[idx % borderColors.length]}
                onClick={() => setModalIdx(idx)}
                aria-label={achievement.label}
                className={idx === 6 ? 'rectangular' : ''}
              >
                <StampIcon>{achievement.icon}</StampIcon>
                <StampLabel>{achievement.label}</StampLabel>
              </StampCard>
            ))}
          </Grid>
        </PassportBook>
        <StampModal
          stamp={achievements[modalIdx]}
          open={modalIdx !== null}
          onClose={() => setModalIdx(null)}
          gradient={currentGradient}
        />
      </Container>
    </>
  );
};

export default PassportScreen; 