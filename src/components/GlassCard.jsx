import styled, { keyframes } from 'styled-components';

const goldGlow = keyframes`
  0%, 100% { 
    box-shadow: 
      0 0 12px 0 rgba(255,215,0,0.15),
      0 0 24px 0 rgba(255,215,0,0.08),
      inset 0 1px 0 rgba(255,215,0,0.1);
  }
  50% { 
    box-shadow: 
      0 0 20px 0 rgba(255,215,0,0.3),
      0 0 40px 0 rgba(255,215,0,0.15),
      inset 0 1px 0 rgba(255,215,0,0.2);
  }
`;

const GlassCard = styled.div`
  position: relative;
  background: ${({ theme }) => theme.colors?.glass?.background || 'linear-gradient(135deg, rgba(20,20,20,0.95) 0%, rgba(30,30,30,0.90) 50%, rgba(15,15,15,0.98) 100%)'};
  border-radius: 20px;
  border: 3px solid ${({ theme }) => theme.colors?.accent?.gold || '#FFD700'};
  box-shadow: 
    0 0 12px 0 rgba(255,215,0,0.15),
    0 0 24px 0 rgba(255,215,0,0.08),
    inset 0 1px 0 rgba(255,215,0,0.1);
  backdrop-filter: blur(18px);
  -webkit-backdrop-filter: blur(18px);
  overflow: hidden;
  transition: transform 0.18s cubic-bezier(0.4,0,0.2,1), box-shadow 0.18s, border 0.18s;
  
  &:hover {
    transform: translateY(-3px) scale(1.02);
    border: 3px solid ${({ theme }) => theme.colors?.accent?.gold || '#FFD700'};
    box-shadow: 
      0 0 20px 0 rgba(255,215,0,0.3),
      0 0 40px 0 rgba(255,215,0,0.15),
      inset 0 1px 0 rgba(255,215,0,0.2);
    animation: ${goldGlow} 2s ease-in-out infinite;
  }
  
  /* Content positioning */
  > * {
    position: relative;
    z-index: 1;
  }
`;

export default GlassCard; 