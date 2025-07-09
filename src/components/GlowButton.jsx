import styled, { keyframes } from 'styled-components';

const pulseGlow = keyframes`
  0% { box-shadow: 0 0 16px 0 ${({ theme }) => theme.colors.accent}55; }
  100% { box-shadow: 0 0 32px 0 ${({ theme }) => theme.colors.accent}; }
`;

const GlowButton = styled.button`
  background: ${({ theme }) => theme.colors.accent.gold};
  color: ${({ theme }) => theme.colors.background};
  border: 3px solid ${({ theme }) => theme.colors.accent.gold};
  border-radius: 20px;
  font-family: ${({ theme }) => theme.typography.fontFamily.heading};
  font-size: ${({ theme }) => theme.typography.fontSize.body};
  font-weight: ${({ theme }) => theme.typography.fontWeight.bold};
  padding: 16px 32px;
  cursor: pointer;
  transition: all ${({ theme }) => theme.animation.duration.normal} ${({ theme }) => theme.animation.timing.smooth};
  
  &:hover {
    transform: translateY(-3px) scale(1.02);
    background: transparent;
    color: ${({ theme }) => theme.colors.accent.gold};
    box-shadow: ${({ theme }) => theme.effects.neonGlow};
  }
  &:focus {
    outline: none;
    transform: translateY(-3px) scale(1.02);
    background: transparent;
    color: ${({ theme }) => theme.colors.accent.gold};
    box-shadow: ${({ theme }) => theme.effects.neonGlow};
  }
  &:active {
    transform: translateY(-1px) scale(1.01);
  }
`;

export default GlowButton; 