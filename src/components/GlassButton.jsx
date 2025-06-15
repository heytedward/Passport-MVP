import styled from 'styled-components';

const GlassButton = styled.button`
  background: linear-gradient(135deg, rgba(255,255,255,0.18) 0%, rgba(76,28,140,0.13) 100%), ${({ theme }) => theme.colors.glass.background};
  border: 1.5px solid rgba(255,255,255,0.35);
  border-radius: 12px;
  box-shadow: 0 0 16px 0 rgba(255,215,0,0.10), 0 0 8px 0 rgba(127,63,191,0.10);
  color: ${({ theme }) => theme.colors.text.primary};
  font-size: 1.05rem;
  font-weight: 600;
  padding: 0.6rem 1.6rem;
  cursor: pointer;
  backdrop-filter: blur(14px);
  -webkit-backdrop-filter: blur(14px);
  transition: background 0.3s, box-shadow 0.3s, color 0.3s, border 0.3s, transform 0.15s;
  outline: none;
  margin-top: 12px;
  width: 180px;
  display: flex;
  align-items: center;
  justify-content: center;
  &:hover, &:focus {
    box-shadow: 0 0 32px 0 rgba(255,215,0,0.22), 0 0 16px 0 rgba(127,63,191,0.18);
    background: linear-gradient(135deg, rgba(255,255,255,0.22) 0%, rgba(255,215,0,0.10) 100%);
    color: ${({ theme }) => theme.colors.highlight};
    transform: translateY(-2px) scale(1.03);
  }
  &:active {
    transform: scale(0.97);
  }
`;

export default GlassButton; 