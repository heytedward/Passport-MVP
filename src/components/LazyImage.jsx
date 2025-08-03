import React, { useState, useEffect, useRef } from 'react';
import styled from 'styled-components';

const ImageContainer = styled.div`
  position: relative;
  overflow: hidden;
  background: ${({ theme }) => theme.colors?.background?.secondary || '#2a2a2a'};
  border-radius: ${({ borderRadius }) => borderRadius || '8px'};
  
  &::before {
    content: '';
    display: block;
    padding-top: ${({ aspectRatio }) => aspectRatio || '100%'};
  }
`;

const StyledImage = styled.img`
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  object-fit: ${({ objectFit }) => objectFit || 'cover'};
  opacity: ${({ loaded }) => loaded ? 1 : 0};
  transition: opacity 0.3s ease-in-out;
  filter: ${({ blur }) => blur ? 'blur(10px)' : 'none'};
`;

const Placeholder = styled.div`
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background: linear-gradient(135deg, #2a2a2a 0%, #3a3a3a 100%);
  display: flex;
  align-items: center;
  justify-content: center;
  color: ${({ theme }) => theme.colors?.text?.secondary || '#888'};
  font-size: 14px;
  opacity: ${({ show }) => show ? 1 : 0};
  transition: opacity 0.3s ease-in-out;
`;

const LoadingSpinner = styled.div`
  width: 24px;
  height: 24px;
  border: 2px solid rgba(255, 176, 0, 0.3);
  border-top: 2px solid #FFB000;
  border-radius: 50%;
  animation: spin 1s linear infinite;
  
  @keyframes spin {
    0% { transform: rotate(0deg); }
    100% { transform: rotate(360deg); }
  }
`;

const LazyImage = ({
  src,
  alt,
  width,
  height,
  aspectRatio,
  objectFit = 'cover',
  borderRadius = '8px',
  placeholder = 'Loading...',
  onLoad,
  onError,
  className,
  ...props
}) => {
  const [isLoaded, setIsLoaded] = useState(false);
  const [isInView, setIsInView] = useState(false);
  const [hasError, setHasError] = useState(false);
  const [imageSrc, setImageSrc] = useState(null);
  const imgRef = useRef(null);
  const containerRef = useRef(null);

  // Intersection Observer for lazy loading
  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsInView(true);
          observer.disconnect();
        }
      },
      {
        rootMargin: '50px', // Start loading 50px before the image comes into view
        threshold: 0.1
      }
    );

    if (containerRef.current) {
      observer.observe(containerRef.current);
    }

    return () => observer.disconnect();
  }, []);

  // Load image when in view
  useEffect(() => {
    if (isInView && src) {
      // Check for WebP support and use optimized format
      const img = new Image();
      
      img.onload = () => {
        setImageSrc(src);
        setIsLoaded(true);
        onLoad?.(img);
      };
      
      img.onerror = () => {
        setHasError(true);
        onError?.(new Error(`Failed to load image: ${src}`));
      };
      
      img.src = src;
    }
  }, [isInView, src, onLoad, onError]);

  // Generate optimized src for different screen sizes
  const getOptimizedSrc = (originalSrc) => {
    if (!originalSrc) return null;
    
    // If it's already a WebP image, return as is
    if (originalSrc.includes('.webp')) {
      return originalSrc;
    }
    
    // For other formats, try to use WebP if available
    const webpSrc = originalSrc.replace(/\.(jpg|jpeg|png)$/i, '.webp');
    
    // Return the original src for now (WebP detection would require server-side support)
    return originalSrc;
  };

  const optimizedSrc = getOptimizedSrc(imageSrc);

  return (
    <ImageContainer
      ref={containerRef}
      aspectRatio={aspectRatio}
      borderRadius={borderRadius}
      className={className}
      {...props}
    >
      {!isLoaded && !hasError && (
        <Placeholder show={!isLoaded}>
          <LoadingSpinner />
        </Placeholder>
      )}
      
      {hasError && (
        <Placeholder show={hasError}>
          <div>Failed to load image</div>
        </Placeholder>
      )}
      
      {optimizedSrc && (
        <StyledImage
          ref={imgRef}
          src={optimizedSrc}
          alt={alt}
          loaded={isLoaded}
          objectFit={objectFit}
          onLoad={() => setIsLoaded(true)}
          onError={() => setHasError(true)}
        />
      )}
    </ImageContainer>
  );
};

export default LazyImage; 