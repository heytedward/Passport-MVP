import React from 'react';
import styled, { keyframes } from 'styled-components';

const glow = keyframes`
  0%, 100% { box-shadow: 0 0 5px #FFB000, 0 0 10px #FFB000, 0 0 15px #FFB000; }
  50% { box-shadow: 0 0 10px #FFB000, 0 0 20px #FFB000, 0 0 30px #FFB000; }
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