import styled, { keyframes } from 'styled-components';

const brandGlow = keyframes`
  0%, 100% { 
    box-shadow: 
      0 0 10px rgba(76, 28, 140, 0.3),
      0 0 20px rgba(76, 28, 140, 0.2),
      0 0 30px rgba(76, 28, 140, 0.1);
  }
  50% { 
    box-shadow: 
      0 0 15px rgba(255, 176, 0, 0.4),
      0 0 30px rgba(255, 176, 0, 0.3),
      0 0 45px rgba(255, 176, 0, 0.2);
  }
`;

const liquidBrand = keyframes`
  0%, 100% { 
    background-position: 0% 50%; 
  }
  50% { 
    background-position: 100% 50%; 
  }
`;

const GlassCard = styled.div`
  position: relative;
  background: 
    linear-gradient(135deg, rgba(250,250,250,0.25) 0%, rgba(250,250,250,0.1) 100%),
    linear-gradient(135deg, rgba(76,28,140,0.08) 0%, rgba(255,176,0,0.03) 100%);
  border-radius: 20px;
  border: 1px solid rgba(255,176,0,0.2);
  backdrop-filter: blur(25px);
  -webkit-backdrop-filter: blur(25px);
  overflow: hidden;
  transition: all 0.4s cubic-bezier(0.23, 1, 0.320, 1);
  
  /* Brand liquid effect with correct colors */
  &::before {
    content: '';
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background: linear-gradient(
      45deg,
      transparent 0%,
      rgba(76,28,140,0.05) 25%,
      rgba(255,176,0,0.05) 50%,
      rgba(76,28,140,0.05) 75%,
      transparent 100%
    );
    background-size: 400% 400%;
    animation: ${liquidBrand} 8s ease-in-out infinite;
    pointer-events: none;
    z-index: 0;
  }
  
  /* Correct brand glow border */
  &::after {
    content: '';
    position: absolute;
    inset: -1px;
    border-radius: 21px;
    padding: 1px;
    background: linear-gradient(45deg, #4C1C8C, #FFB000, #4C1C8C);
    mask: linear-gradient(#fff 0 0) content-box, linear-gradient(#fff 0 0);
    mask-composite: xor;
    -webkit-mask-composite: xor;
    opacity: 0;
    transition: opacity 0.3s ease;
    z-index: -1;
  }
  
  &:hover {
    transform: translateY(-6px) scale(1.02);
    border-color: rgba(255,176,0,0.4);
    animation: ${brandGlow} 2s ease-in-out infinite;
    
    &::after {
      opacity: 0.6;
    }
  }
  
  /* Content positioning */
  > * {
    position: relative;
    z-index: 1;
  }
`;

export default GlassCard; 