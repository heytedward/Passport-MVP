import styled from 'styled-components';

const GlassButton = styled.button`
  background: rgba(255, 255, 255, 0.1);
  border: 3px solid ${({ theme }) => theme.colors.accent.gold};
  border-radius: 20px;
  color: ${({ theme }) => theme.colors.text.primary};
  font-family: ${({ theme }) => theme.typography.fontFamily.body};
  font-size: ${({ theme }) => theme.typography.fontSize.body};
  font-weight: ${({ theme }) => theme.typography.fontWeight.medium};
  padding: 16px 32px;
  cursor: pointer;
  backdrop-filter: blur(14px);
  -webkit-backdrop-filter: blur(14px);
  transition: all ${({ theme }) => theme.animation.duration.normal} ${({ theme }) => theme.animation.timing.smooth};
  outline: none;
  margin-top: 24px;
  width: 200px;
  display: flex;
  align-items: center;
  justify-content: center;
  
  &:hover, &:focus {
    transform: translateY(-3px) scale(1.02);
    background: ${({ theme }) => theme.colors.accent.gold};
    color: ${({ theme }) => theme.colors.background};
    box-shadow: ${({ theme }) => theme.effects.neonGlow};
  }
  &:active {
    transform: translateY(-1px) scale(1.01);
  }
`;

export default GlassButton; 