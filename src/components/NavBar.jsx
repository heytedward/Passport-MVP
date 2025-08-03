import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import styled, { keyframes } from 'styled-components';

const liquidBrand = keyframes`
  0%, 100% { 
    background-position: 0% 50%; 
  }
  50% { 
    background-position: 100% 50%; 
  }
`;

const Nav = styled.nav`
  position: fixed;
  bottom: 0;
  left: 0;
  right: 0;
  background: rgba(18, 18, 18, 0.95);
  backdrop-filter: blur(20px);
  border-top: 1px solid rgba(255, 255, 255, 0.1);
  padding: 8px 0 max(8px, env(safe-area-inset-bottom));
  z-index: 1000;
  box-shadow: 0 -4px 20px rgba(0, 0, 0, 0.3);
`;

const NavContainer = styled.div`
  max-width: 100%;
  margin: 0 auto;
  display: flex;
  justify-content: space-around;
  align-items: center;
  position: relative;
  padding: 0 20px;
`;



const NavItem = styled(Link)`
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 8px 12px;
  border-radius: 12px;
  text-decoration: none;
  transition: all 0.2s cubic-bezier(0.4, 0, 0.2, 1);
  position: relative;
  min-width: 60px;
  min-height: 48px; /* Ensure 44px+ touch target */
  color: ${({ $isActive }) => 
    $isActive ? '#FFB000' : 'rgba(250, 250, 250, 0.7)'};
  
  ${({ $isActive }) => $isActive && `
    background: rgba(127, 63, 191, 0.15);
    transform: translateY(-2px);
  `}
  
  &:hover {
    color: #FFB000;
    background: rgba(76, 28, 140, 0.1);
    transform: translateY(-1px);
  }
  
  &:active::after {
    content: '';
    position: absolute;
    top: 50%;
    left: 50%;
    width: 20px;
    height: 20px;
    background: rgba(127, 63, 191, 0.3);
    border-radius: 50%;
    transform: translate(-50%, -50%);
    animation: ripple 0.3s ease-out;
  }
`;

const IconContainer = styled.div`
  width: 24px;
  height: 24px;
  display: flex;
  align-items: center;
  justify-content: center;
  margin-bottom: 4px;
  position: relative;
  
  svg {
    width: 22px;
    height: 22px;
    stroke-width: 2;
    transition: all 0.2s ease;
  }
  
  ${({ $isActive }) => $isActive && `
    svg {
      stroke-width: 2.5;
      transform: scale(1.1);
    }
  `}
`;

const Label = styled.span`
  font-size: 11px;
  font-weight: ${({ $isActive }) => $isActive ? '600' : '500'};
  color: ${({ $isActive, theme }) => 
    $isActive ? theme.colors?.accent?.purple || '#7F3FBF' : 'rgba(255, 255, 255, 0.7)'};
  transition: all 0.2s ease;
  text-align: center;
  line-height: 1.2;
`;

const ActiveIndicator = styled.div`
  position: absolute;
  top: -2px;
  left: 50%;
  transform: translateX(-50%);
  width: 4px;
  height: 4px;
  background: ${({ theme }) => theme.colors?.accent?.purple || '#7F3FBF'};
  border-radius: 50%;
  opacity: ${({ $isActive }) => $isActive ? 1 : 0};
  transition: opacity 0.2s ease;
`;

const ScanButtonContainer = styled.div`
  position: relative;
  display: flex;
  align-items: center;
  justify-content: center;
`;



const ScanButton = styled(Link)`
  display: flex;
  align-items: center;
  justify-content: center;
  width: 56px;
  height: 56px;
  background: linear-gradient(135deg, #4C1C8C 0%, #FFB000 100%);
  border-radius: 18px;
  text-decoration: none;
  color: white;
  font-size: 24px;
  box-shadow: 
    0 8px 25px rgba(76, 28, 140, 0.4),
    0 0 20px rgba(255, 176, 0, 0.3);
  transition: all 0.3s cubic-bezier(0.23, 1, 0.320, 1);
  transform: translateY(-8px);
  position: relative;
  overflow: hidden;
  
  /* Brand shimmer */
  &::before {
    content: '';
    position: absolute;
    top: -50%;
    left: -50%;
    width: 200%;
    height: 200%;
    background: linear-gradient(45deg, 
      transparent 30%, 
      rgba(250,250,250,0.4) 50%, 
      transparent 70%
    );
    transform: rotate(45deg);
    animation: ${liquidBrand} 3s linear infinite;
  }
  
  &:hover {
    transform: translateY(-12px) scale(1.1);
    box-shadow: 
      0 12px 35px rgba(76, 28, 140, 0.6),
      0 0 30px rgba(255, 176, 0, 0.5);
  }
  
  &:active {
    transform: translateY(-6px) scale(0.95);
  }
  
  svg {
    width: 26px;
    height: 26px;
    stroke-width: 2.5;
  }
`;

const NavBar = () => {
  const location = useLocation();
  
  const navItems = [
    { path: '/', icon: 'Home', label: 'Home' },
    { path: '/passport', icon: 'Book', label: 'Passport' },
    { path: '/closet', icon: 'Shirt', label: 'Closet' },
    { path: '/profile', icon: 'User', label: 'Profile' }
  ];
  
  const getIcon = (iconName, isActive) => {
    const color = isActive ? '#7F3FBF' : 'rgba(255, 255, 250, 0.7)';
    
    switch (iconName) {
      case 'Home':
        return (
          <svg viewBox="0 0 24 24" fill="none" stroke={color}>
            <path d="m3 9 9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/>
            <polyline points="9,22 9,12 15,12 15,22"/>
          </svg>
        );
      case 'Book':
        return (
          <svg viewBox="0 0 24 24" fill="none" stroke={color}>
            <path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20"/>
            <path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z"/>
          </svg>
        );
      case 'Shirt':
        return (
          <svg viewBox="0 0 24 24" fill="none" stroke={color}>
            <path d="M20.38 3.46 16 2a4 4 0 0 1-8 0L3.62 3.46a2 2 0 0 0-1.34 2.23l.58 3.47a1 1 0 0 0 .99.84H6v10c0 1.1.9 2 2 2h8a2 2 0 0 0 2-2V10h2.15a1 1 0 0 0 .99-.84l.58-3.47a2 2 0 0 0-1.34-2.23z"/>
          </svg>
        );
      case 'User':
        return (
          <svg viewBox="0 0 24 24" fill="none" stroke={color}>
            <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/>
            <circle cx="12" cy="7" r="4"/>
          </svg>
        );
      default:
        return null;
    }
  };
  
  return (
    <Nav>
      <NavContainer>
        {navItems.slice(0, 2).map((item) => {
          const isActive = location.pathname === item.path;
          return (
            <NavItem key={item.path} to={item.path} $isActive={isActive}>
              <ActiveIndicator $isActive={isActive} />
              <IconContainer $isActive={isActive}>
                {getIcon(item.icon, isActive)}
              </IconContainer>
              <Label $isActive={isActive}>{item.label}</Label>
            </NavItem>
          );
        })}
        
        <ScanButtonContainer>
          <ScanButton to="/scan" aria-label="Scan QR Code">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor">
              <path d="M9 12l2 2 4-4"/>
              <path d="M21 12c0 4.97-4.03 9-9 9s-9-4.03-9-9 4.03-9 9-9c.39 0 .78.03 1.17.08"/>
              <path d="M16 3v6h6"/>
            </svg>
          </ScanButton>
        </ScanButtonContainer>
        
        {navItems.slice(2).map((item) => {
          const isActive = location.pathname === item.path;
          return (
            <NavItem key={item.path} to={item.path} $isActive={isActive}>
              <ActiveIndicator $isActive={isActive} />
              <IconContainer $isActive={isActive}>
                {getIcon(item.icon, isActive)}
              </IconContainer>
              <Label $isActive={isActive}>{item.label}</Label>
            </NavItem>
          );
        })}
      </NavContainer>
    </Nav>
  );
};

export default NavBar; 