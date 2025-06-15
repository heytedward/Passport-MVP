import React from 'react';
import styled, { keyframes, useTheme } from 'styled-components';
import { useNavigate } from 'react-router-dom';
import GlassCard from '../components/GlassCard';
import GlowButton from '../components/GlowButton';

const fadeIn = keyframes`
  from { opacity: 0; transform: translateY(20px); }
  to { opacity: 1; transform: translateY(0); }
`;

const pulse = keyframes`
  0% { transform: scale(1); }
  50% { transform: scale(1.05); }
  100% { transform: scale(1); }
`;

const WelcomeContainer = styled.div`
  min-height: 100vh;
  background: ${({ theme }) => theme.colors.background};
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 20px;
  position: relative;
  overflow: hidden;
  
  &::before {
    content: '';
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background: ${({ theme }) => theme.gradients.primary};
    opacity: 0.1;
    z-index: 0;
  }
`;

const HeroCard = styled(GlassCard)`
  max-width: 600px;
  width: 100%;
  text-align: center;
  animation: ${fadeIn} 1s ease-out;
  z-index: 1;
`;

const Title = styled.h1`
  font-family: ${({ theme }) => theme.typography.fontFamily.heading};
  font-weight: ${({ theme }) => theme.typography.fontWeight.bold};
  color: ${({ theme }) => theme.colors.text.primary};
  font-size: 3rem;
  margin-bottom: 1rem;
  background: ${({ theme }) => theme.gradients.primary};
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
`;

const Subtitle = styled.p`
  font-family: ${({ theme }) => theme.typography.fontFamily.body};
  color: ${({ theme }) => theme.colors.text.secondary};
  font-size: 1.2rem;
  margin-bottom: 2rem;
  line-height: 1.6;
`;

const CTAButton = styled(GlowButton)`
  animation: ${pulse} 2s infinite;
  font-size: 1.2rem;
  padding: 20px 40px;
`;

const WelcomeScreen = () => {
  const navigate = useNavigate();

  return (
    <WelcomeContainer>
      <HeroCard>
        <Title>Monarch Passport</Title>
        <Subtitle>
          Your digital passport to exclusive experiences. Join us on a journey
          of discovery and connection.
        </Subtitle>
        <CTAButton onClick={() => navigate('/login')}>
          JOIN THE JOURNEY
        </CTAButton>
      </HeroCard>
    </WelcomeContainer>
  );
};

export default WelcomeScreen; 