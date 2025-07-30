import React from 'react';
import styled from 'styled-components';

const AvatarContainer = styled.div`
  position: relative;
  width: ${props => props.size || 40}px;
  height: ${props => props.size || 40}px;
  border-radius: 50%;
  overflow: hidden;
  background: linear-gradient(135deg, #1a1a2e, #16213e);
  border: 2px solid #FFB000;
  box-shadow: 0 0 10px rgba(255, 176, 0, 0.2);
  flex-shrink: 0;
`;

const AvatarImage = styled.img`
  width: 100%;
  height: 100%;
  object-fit: cover;
  border-radius: 50%;
`;

const AvatarPlaceholder = styled.div`
  width: 100%;
  height: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: ${props => Math.max(12, props.size * 0.3)}px;
  color: #FFB000;
  background: linear-gradient(135deg, #1a1a2e, #16213e);
`;

const AvatarDisplay = ({ 
  avatarUrl, 
  size = 40, 
  alt = "User avatar",
  showBorder = true,
  className 
}) => {
  return (
    <AvatarContainer 
      size={size} 
      className={className}
      style={!showBorder ? { border: 'none', boxShadow: 'none' } : {}}
    >
      {avatarUrl ? (
        <AvatarImage 
          src={avatarUrl} 
          alt={alt}
          onError={(e) => {
            e.target.style.display = 'none';
            e.target.nextSibling.style.display = 'flex';
          }}
        />
      ) : null}
      <AvatarPlaceholder size={size}>
        🦋
      </AvatarPlaceholder>
    </AvatarContainer>
  );
};

export default AvatarDisplay; 