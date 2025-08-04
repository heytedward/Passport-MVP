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
    width: 40px;
    height: 40px;
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
            <svg viewBox="0 0 1929.64 1459.22" fill="currentColor">
              <g>
                <path d="M965.35,380.63c-53.21,1.58-99.94-37.36-100.16-97.49-.2-54.36,38.41-99.68,100.16-100.14,55.99-.42,98.03,40.8,99.26,97.88,1.22,56.35-42.99,101.52-99.27,99.75Z"/>
                <path d="M966.46,439.05c47.18-2.32,98.18,37.36,98.17,98.68,0,55.27-41.86,99.73-99.63,98.75-60.67-1.03-99.14-42.83-99.9-97.4-.86-61.26,50.23-102.87,101.37-100.03Z"/>
                <path d="M236.74,262.16c4.24,.25,7.04-2.85,10.3-4.95,35.77-23.06,78.33-20.59,112.28,4.79,40.25,30.08,54.38,86.37,35.04,136.47-14.39,37.29-41.54,62.37-78.27,77.53-17.69,7.3-36.28,11.97-55.09,11.84-37.53-.26-71.65-11.49-100.36-36.96-28.13-24.95-43.88-56.5-51.22-92.84-11.23-55.55-1.27-108.45,21.14-159.34,23.73-53.88,60.05-98.07,107.56-132.82C284.89,31.68,337.56,12.12,394.65,3.7c29.15-4.3,58.57-4.72,87.59-1.92,48.25,4.66,94.63,17.27,137.57,40.86,66.42,36.48,115.74,89.41,149.97,156.48,21.05,41.23,34.11,85.05,39.19,131.26,3.15,28.68,5.46,57.46,3.87,86.17-2.65,48.19-11.14,95.48-25.31,141.79-27.17,88.79-71.22,168.99-123.39,245.11-37.17,54.23-77.54,106.01-120.45,155.83-30.53,35.45-61.47,70.51-93.43,104.72-23.31,24.95-46.07,50.49-69.42,75.41-70.8,75.55-143.47,149.3-217.8,221.35-30.3,29.37-61.18,58.3-93.28,85.83-13.53,11.6-28.74,14.4-45.38,11.63-16.21-2.71-27.3-20.35-23.7-36.76,1.96-8.91,6.27-16.77,11.15-24.44,17.42-27.41,37.62-52.79,57.51-78.36,57.5-73.89,115.36-147.49,173.21-221.11,48.68-61.95,96.29-124.71,142.59-188.46,55.87-76.92,109.09-155.58,153.83-239.6,32.46-60.96,59.52-124.21,76.27-191.5,8.52-34.21,13.5-68.98,13.22-104.18-.37-48.6-11.37-95.01-37.3-136.42-33.78-53.94-82.9-86.77-145.84-97.34-59.39-9.98-112.46,6.05-159.33,42.87-24.3,19.09-41.59,43.47-49.46,73.87-.44,1.72-1.16,3.41,.21,5.37Z"/>
                <path d="M1695.11,264.15c-3.87-22.28-12.68-40.21-25.49-56.03-31.54-38.96-73.39-60.6-122.15-68-76.02-11.54-139.34,14.6-190.01,70.76-29.32,32.5-44.49,72.67-51.91,115.55-10.35,59.8-1.62,118.08,14.96,175.64,20.57,71.42,52.55,137.82,89.39,202.03,52.52,91.52,113.86,177.08,177.14,261.33,54.59,72.67,110.97,143.95,167.02,215.48,47.73,60.91,95.63,121.69,141.96,183.68,9.97,13.33,19.6,26.96,27.71,41.55,5.95,10.71,8.2,21.92,3.05,33.67-5.14,11.73-13.86,18.21-26.95,19.23-16.72,1.3-30.31-3.95-43.08-15.07-82.91-72.22-159.38-151.09-236.49-229.24-33.47-33.93-65.79-69.06-98.59-103.68-31.86-33.64-63.52-67.51-94.03-102.36-35.26-40.27-70.04-80.95-103.23-123.02-37.15-47.08-71.74-95.89-102.59-147.23-36.79-61.24-65.49-126.16-84.5-195.23-15.29-55.58-21.92-112.14-19.43-169.67,4.56-105.31,40.12-197.82,115.47-273.1,53.73-53.67,119.21-85.11,194-95.75,92.53-13.17,179.85,2.43,257.42,56.57,75.73,52.85,123.95,124.99,138.04,216.96,7.33,47.83,3.27,95.62-23.74,138.08-25.55,40.17-61.92,64.11-109.97,69.79-41.07,4.85-77.82-6.27-110.35-30.22-45.3-33.36-64.26-94.2-43.97-145.77,16.74-42.55,57.05-69.78,101.87-68.7,16.18,.39,30.85,5.69,44.53,14.04,4.13,2.52,8.2,5.16,13.93,8.77Z"/>
              </g>
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