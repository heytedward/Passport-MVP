import styled, { keyframes } from 'styled-components';

const pulseGlow = keyframes`
  0% { box-shadow: 0 0 16px 0 ${({ theme }) => theme.colors.accent}55; }
  100% { box-shadow: 0 0 32px 0 ${({ theme }) => theme.colors.accent}; }
`;

const GlowButton = styled.button`
  background: ${({ theme }) => theme.gradients.primary};
  color: ${({ theme }) => theme.colors.text.primary};
  border: 2px solid ${({ theme }) => theme.colors.accent};
  border-radius: 12px;
  box-shadow: 0 0 16px 0 ${({ theme }) => theme.colors.accent}55;
  font-size: 1.1rem;
  font-weight: 600;
  padding: 0.75rem 2rem;
  cursor: pointer;
  transition: background ${({ theme }) => theme.animation.duration.normal} ${({ theme }) => theme.animation.timing.smooth},
    box-shadow ${({ theme }) => theme.animation.duration.normal} ${({ theme }) => theme.animation.timing.smooth},
    color ${({ theme }) => theme.animation.duration.normal} ${({ theme }) => theme.animation.timing.smooth},
    transform 0.1s cubic-bezier(0.4,0,0.2,1);
  
  &:hover {
    animation: ${pulseGlow} 1s infinite alternate;
    background: ${({ theme }) => theme.gradients.gold};
    color: ${({ theme }) => theme.colors.text.primary};
    outline: none;
  }
  &:focus {
    outline: 2px solid ${({ theme }) => theme.colors.highlight};
    outline-offset: 2px;
  }
  &:active {
    transform: scale(0.95);
    transition: transform 0.1s cubic-bezier(0.4,0,0.2,1);
  }
`;

export default GlowButton; 