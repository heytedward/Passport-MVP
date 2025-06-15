import React from 'react';
import styled, { keyframes } from 'styled-components';

// Color palette
const colors = {
  frequencyPurple: '#622CC6',
  solarGold: '#F44019',
  echoBlack: '#121212',
  smokeGray: '#9E9E9E',
  driftWhite: '#FFFFFF',
};

// Gradient definitions
const gradients = {
  frequencyPulse: `linear-gradient(135deg, ${colors.frequencyPurple} 0%, #9D4EDD 100%)`,
  solarShine: `linear-gradient(135deg, #FF9F1C 0%, ${colors.solarGold} 100%)`,
  echoGlass: `linear-gradient(135deg, rgba(18, 18, 18, 0.8) 0%, rgba(18, 18, 18, 0.6) 100%)`,
  retroFrame: `linear-gradient(135deg, #E0E0E0 0%, ${colors.smokeGray} 100%)`,
  nightScan: `linear-gradient(135deg, #1A237E 0%, ${colors.echoBlack} 100%)`,
};

// Animations
const pulse = keyframes`
  0% { transform: scale(1); }
  50% { transform: scale(1.05); }
  100% { transform: scale(1); }
`;

// Styled Components
const Container = styled.div`
  min-height: 100vh;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  background-color: ${colors.driftWhite};
  padding: 2rem;
`;

const Title = styled.h1`
  font-family: 'Playfair Display', serif;
  font-size: 3.5rem;
  color: ${colors.echoBlack};
  margin-bottom: 1rem;
  text-align: center;
  
  @media (max-width: 768px) {
    font-size: 2.5rem;
  }
`;

const Tagline = styled.p`
  color: ${colors.smokeGray};
  font-size: 1.2rem;
  margin-bottom: 3rem;
  text-align: center;
`;

const ButtonContainer = styled.div`
  display: flex;
  flex-direction: column;
  gap: 1rem;
  width: 100%;
  max-width: 320px;
  margin-bottom: 2rem;
`;

const Button = styled.button<{ variant: 'primary' | 'secondary' | 'google' | 'apple' }>`
  min-height: 44px;
  padding: 0.75rem 1.5rem;
  border-radius: 12px;
  border: none;
  font-size: 1rem;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s ease;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.5rem;

  ${({ variant }) => {
    switch (variant) {
      case 'primary':
        return `
          background: ${colors.frequencyPurple};
          color: ${colors.driftWhite};
          &:hover {
            background: ${gradients.frequencyPulse};
          }
        `;
      case 'secondary':
        return `
          background: ${gradients.solarShine};
          color: ${colors.driftWhite};
          &:hover {
            transform: translateY(-2px);
          }
        `;
      case 'google':
        return `
          background: ${colors.driftWhite};
          color: ${colors.echoBlack};
          border: 1px solid ${colors.smokeGray};
          &:hover {
            background: ${colors.smokeGray}10;
          }
        `;
      case 'apple':
        return `
          background: ${colors.echoBlack};
          color: ${colors.driftWhite};
          &:hover {
            background: ${gradients.nightScan};
          }
        `;
    }
  }}
`;

const DeviceSyncSection = styled.div`
  background: ${gradients.echoGlass};
  backdrop-filter: blur(10px);
  border-radius: 16px;
  padding: 1.5rem;
  text-align: center;
  color: ${colors.smokeGray};
  margin-top: 2rem;
  border: 1px solid ${colors.smokeGray}40;
  animation: ${pulse} 2s infinite ease-in-out;
`;

const ScanIcon = styled.div`
  width: 24px;
  height: 24px;
  margin: 0 auto 1rem;
  border: 2px solid ${colors.frequencyPurple};
  border-radius: 50%;
  position: relative;
  
  &::before {
    content: '';
    position: absolute;
    top: 50%;
    left: 50%;
    transform: translate(-50%, -50%);
    width: 12px;
    height: 12px;
    border: 2px solid ${colors.frequencyPurple};
    border-radius: 2px;
  }
`;

const WelcomeScreen: React.FC = () => {
  return (
    <Container>
      <Title>Papillon®</Title>
      <Tagline>Find Your Wings. Leave a Mark.</Tagline>
      
      <ButtonContainer>
        <Button variant="primary">Sign In</Button>
        <Button variant="secondary">Create Account</Button>
        <Button variant="google">
          <img src="/google-icon.svg" alt="Google" width="20" height="20" />
          Continue with Google
        </Button>
        <Button variant="apple">
          <img src="/apple-icon.svg" alt="Apple" width="20" height="20" />
          Continue with Apple
        </Button>
      </ButtonContainer>

      <DeviceSyncSection>
        <ScanIcon />
        <p>Already connected your jacket? Scan to sync</p>
      </DeviceSyncSection>
    </Container>
  );
};

export default WelcomeScreen; 