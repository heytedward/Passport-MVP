import React from 'react';
import styled, { keyframes } from 'styled-components';
import { useNavigate } from 'react-router-dom';
import { theme } from '../styles/theme';

const pulse = keyframes`
  0% { box-shadow: 0 0 0 0 ${theme.colors.accent}55; }
  70% { box-shadow: 0 0 0 16px rgba(244,160,25,0); }
  100% { box-shadow: 0 0 0 0 rgba(244,160,25,0); }
`;

const Fab = styled.button`
  position: fixed;
  bottom: 32px;
  left: 32px;
  z-index: 2001;
  background: ${theme.gradients.primary};
  color: #fff;
  border: none;
  border-radius: 50%;
  width: 64px;
  height: 64px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 2rem;
  box-shadow: 0 0 24px 0 ${theme.colors.accent}88;
  animation: ${pulse} 2s infinite;
  cursor: pointer;
  transition: background 0.2s, box-shadow 0.2s;
  outline: none;
  border: 2.5px solid ${theme.colors.accent};
  backdrop-filter: blur(12px);

  &:hover, &:focus {
    background: ${theme.colors.accent};
    color: #fff;
    box-shadow: 0 0 32px 0 ${theme.colors.accent};
  }

  @media (max-width: 600px) {
    bottom: 16px;
    left: 16px;
    width: 54px;
    height: 54px;
    font-size: 1.5rem;
  }
`;

const FloatingScanButton = () => {
  const navigate = useNavigate();
  return (
    <Fab onClick={() => navigate('/scan')} aria-label="Scan to Earn">
      <svg width="32" height="32" viewBox="0 0 32 32" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
        <rect x="6" y="6" width="20" height="20" rx="4"/>
        <circle cx="16" cy="16" r="4"/>
      </svg>
    </Fab>
  );
};

export default FloatingScanButton; 