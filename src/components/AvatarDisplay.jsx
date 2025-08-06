import React, { useState } from 'react';
import styled from 'styled-components';
import { useAuth } from '../hooks/useAuth';

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
  display: ${props => props.show ? 'block' : 'none'};
`;

const AvatarPlaceholder = styled.div`
  width: 100%;
  height: 100%;
  display: ${props => props.show ? 'flex' : 'none'};
  align-items: center;
  justify-content: center;
  font-size: ${props => Math.max(12, props.size * 0.3)}px;
  color: #FFB000;
  background: linear-gradient(135deg, #1a1a2e, #16213e);
`;

const AvatarDisplay = ({ 
  avatarUrl: propAvatarUrl, 
  size = 40, 
  alt = "User avatar",
  showBorder = true,
  className,
  forceRefresh = false
}) => {
  const { avatarUrl: contextAvatarUrl } = useAuth();
  const [imageError, setImageError] = useState(false);
  const [imageLoaded, setImageLoaded] = useState(false);

  // Use prop avatarUrl if provided, otherwise use context avatarUrl
  const finalAvatarUrl = propAvatarUrl || contextAvatarUrl;

  // Add cache busting if forceRefresh is true
  const getAvatarUrlWithCacheBusting = (url) => {
    if (!url) return null;
    if (forceRefresh) {
      try {
        const urlObj = new URL(url);
        urlObj.searchParams.set('t', Date.now());
        return urlObj.toString();
      } catch (e) {
        return url;
      }
    }
    return url;
  };

  const displayUrl = getAvatarUrlWithCacheBusting(finalAvatarUrl);
  const showImage = displayUrl && !imageError;
  const showPlaceholder = !displayUrl || imageError;

  const handleImageLoad = () => {
    setImageLoaded(true);
    setImageError(false);
  };

  const handleImageError = () => {
    console.warn('Avatar image failed to load:', displayUrl);
    setImageError(true);
    setImageLoaded(false);
  };

  return (
    <AvatarContainer 
      size={size} 
      className={className}
      style={!showBorder ? { border: 'none', boxShadow: 'none' } : {}}
    >
      <AvatarImage 
        src={displayUrl}
        alt={alt}
        show={showImage}
        onLoad={handleImageLoad}
        onError={handleImageError}
      />
      <AvatarPlaceholder 
        size={size}
        show={showPlaceholder}
      >
        🦋
      </AvatarPlaceholder>
    </AvatarContainer>
  );
};

export default AvatarDisplay; 