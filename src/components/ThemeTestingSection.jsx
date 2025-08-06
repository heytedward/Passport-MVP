import React, { useState, useEffect } from 'react';
import styled from 'styled-components';
import { useTheme } from '../hooks/useTheme';
import { useAuth } from '../hooks/useAuth';
import { supabase } from '../utils/supabaseClient';

// Styled Components for Theme Testing Section
const ThemeTestingContainer = styled.div`
  margin: 20px 0;
  padding: 20px;
  background: var(--theme-card-bg, rgba(255, 255, 255, 0.1));
  border: var(--theme-card-border, 1px solid rgba(255, 255, 255, 0.2));
  border-radius: 16px;
  backdrop-filter: var(--theme-card-blur, blur(10px));
`;

const ThemeTestingTitle = styled.h3`
  color: var(--theme-text-primary, #FFFFFF);
  font-size: 1.25rem;
  font-weight: 600;
  margin-bottom: 20px;
  text-align: center;
`;

const ThemeGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
  gap: 16px;
  margin-bottom: 20px;
`;

const ThemeCard = styled.div`
  position: relative;
  background: var(--theme-card-bg, rgba(255, 255, 255, 0.1));
  border: var(--theme-card-border, 1px solid rgba(255, 255, 255, 0.2));
  border-radius: 12px;
  padding: 16px;
  cursor: ${props => props.owned ? 'pointer' : 'not-allowed'};
  opacity: ${props => props.owned ? 1 : 0.6};
  transition: all 0.3s ease;
  backdrop-filter: var(--theme-card-blur, blur(10px));

  &:hover {
    transform: ${props => props.owned ? 'translateY(-2px)' : 'none'};
    box-shadow: ${props => props.owned ? '0 8px 25px rgba(0, 0, 0, 0.3)' : 'none'};
  }

  ${props => props.isCurrent && `
    border: 2px solid var(--theme-accent, #FFB000);
    box-shadow: 0 0 20px rgba(255, 176, 0, 0.3);
  `}

  ${props => props.isPreview && `
    border: 2px solid var(--theme-accent, #FFB000);
    box-shadow: 0 0 20px rgba(255, 176, 0, 0.5);
    animation: pulse 2s infinite;
  `}

  @keyframes pulse {
    0%, 100% { opacity: 1; }
    50% { opacity: 0.8; }
  }
`;

const ThemePreview = styled.div`
  width: 100%;
  height: 120px;
  border-radius: 8px;
  margin-bottom: 12px;
  background: ${props => props.gradient || props.background || '#0A0A0A'};
  position: relative;
  overflow: hidden;

  &::before {
    content: '';
    position: absolute;
    top: 8px;
    left: 8px;
    right: 8px;
    height: 20px;
    background: ${props => props.cardBg || 'rgba(255, 255, 255, 0.1)'};
    border: ${props => props.cardBorder || '1px solid rgba(255, 255, 255, 0.2)'};
    border-radius: 4px;
    backdrop-filter: ${props => props.cardBlur || 'blur(10px)'};
  }

  &::after {
    content: '';
    position: absolute;
    bottom: 8px;
    left: 8px;
    right: 8px;
    height: 32px;
    background: ${props => props.buttonGradient || 'linear-gradient(135deg, #FFB000 0%, #FFD700 100%)'};
    border-radius: 6px;
  }
`;

const ThemeName = styled.div`
  color: var(--theme-text-primary, #FFFFFF);
  font-size: 1rem;
  font-weight: 600;
  margin-bottom: 4px;
`;

const ThemeDescription = styled.div`
  color: var(--theme-text-secondary, #CCCCCC);
  font-size: 0.875rem;
  margin-bottom: 8px;
`;

const ThemeStatus = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-top: 8px;
`;

const StatusBadge = styled.span`
  padding: 4px 8px;
  border-radius: 12px;
  font-size: 0.75rem;
  font-weight: 500;
  text-transform: uppercase;
  letter-spacing: 0.5px;

  ${props => props.owned ? `
    background: var(--theme-success, #10B981);
    color: white;
  ` : `
    background: var(--theme-text-muted, #999999);
    color: var(--theme-text-primary, #FFFFFF);
  `}

  ${props => props.isCurrent && `
    background: var(--theme-accent, #FFB000);
    color: var(--theme-text-primary, #FFFFFF);
  `}
`;

const ActionButton = styled.button`
  background: var(--theme-button-gradient, linear-gradient(135deg, #FFB000 0%, #FFD700 100%));
  color: var(--theme-text-primary, #FFFFFF);
  border: none;
  border-radius: 6px;
  padding: 6px 12px;
  font-size: 0.75rem;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.3s ease;

  &:hover {
    background: var(--theme-button-hover, linear-gradient(135deg, #E69A00 0%, #E6C200 100%));
    transform: translateY(-1px);
  }

  &:disabled {
    opacity: 0.5;
    cursor: not-allowed;
    transform: none;
  }
`;

const UnlockButton = styled.button`
  background: var(--theme-button-gradient, linear-gradient(135deg, #FFB000 0%, #FFD700 100%));
  color: var(--theme-text-primary, #FFFFFF);
  border: none;
  border-radius: 8px;
  padding: 12px 24px;
  font-size: 0.875rem;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s ease;
  width: 100%;
  margin-top: 16px;

  &:hover {
    background: var(--theme-button-hover, linear-gradient(135deg, #E69A00 0%, #E6C200 100%));
    transform: translateY(-2px);
  }

  &:disabled {
    opacity: 0.5;
    cursor: not-allowed;
    transform: none;
  }
`;

const ErrorMessage = styled.div`
  background: var(--theme-error, #EF4444);
  color: white;
  padding: 12px;
  border-radius: 8px;
  margin-bottom: 16px;
  font-size: 0.875rem;
`;

const SuccessMessage = styled.div`
  background: var(--theme-success, #10B981);
  color: white;
  padding: 12px;
  border-radius: 8px;
  margin-bottom: 16px;
  font-size: 0.875rem;
`;

const PreviewIndicator = styled.div`
  position: absolute;
  top: 8px;
  right: 8px;
  background: var(--theme-accent, #FFB000);
  color: var(--theme-text-primary, #FFFFFF);
  padding: 2px 6px;
  border-radius: 4px;
  font-size: 0.625rem;
  font-weight: 600;
  text-transform: uppercase;
`;

const ThemeTestingSection = () => {
  const { user } = useAuth();
  const {
    currentTheme,
    ownedThemes,
    loading,
    error,
    previewTheme,
    themes,
    switchTheme,
    previewTheme: previewThemeAction,
    clearPreview,
    unlockAllThemes,
    ownsTheme
  } = useTheme();

  const [isUnlockingThemes, setIsUnlockingThemes] = useState(false);
  const [localError, setLocalError] = useState(null);
  const [localSuccess, setLocalSuccess] = useState(null);

  // Clear messages after 3 seconds
  useEffect(() => {
    if (localError) {
      const timer = setTimeout(() => setLocalError(null), 3000);
      return () => clearTimeout(timer);
    }
  }, [localError]);

  useEffect(() => {
    if (localSuccess) {
      const timer = setTimeout(() => setLocalSuccess(null), 3000);
      return () => clearTimeout(timer);
    }
  }, [localSuccess]);

  const handleThemeSelect = async (themeKey) => {
    if (!ownsTheme(themeKey)) {
      setLocalError('Theme not unlocked');
      return;
    }

    try {
      const result = await switchTheme(themeKey);
      if (result.success) {
        setLocalSuccess(`Applied ${themes.find(t => t.key === themeKey)?.name} theme`);
      } else {
        setLocalError(result.error || 'Failed to apply theme');
      }
    } catch (err) {
      setLocalError('Error applying theme');
    }
  };

  const handleThemePreview = (themeKey) => {
    if (!ownsTheme(themeKey)) {
      setLocalError('Theme not unlocked');
      return;
    }
    previewThemeAction(themeKey);
  };

  const handleUnlockAllThemes = async () => {
    setIsUnlockingThemes(true);
    setLocalError(null);
    setLocalSuccess(null);

    try {
      const result = await unlockAllThemes();
      if (result.success) {
        setLocalSuccess('All themes unlocked for testing');
      } else {
        setLocalError(result.error || 'Failed to unlock themes');
      }
    } catch (err) {
      setLocalError('Error unlocking themes');
    } finally {
      setIsUnlockingThemes(false);
    }
  };

  const handleClearPreview = () => {
    clearPreview();
  };

  if (loading) {
    return (
      <ThemeTestingContainer>
        <ThemeTestingTitle>Loading themes...</ThemeTestingTitle>
      </ThemeTestingContainer>
    );
  }

  return (
    <ThemeTestingContainer>
      <ThemeTestingTitle>Theme Testing</ThemeTestingTitle>
      
      {localError && <ErrorMessage>{localError}</ErrorMessage>}
      {localSuccess && <SuccessMessage>{localSuccess}</SuccessMessage>}
      {error && <ErrorMessage>{error}</ErrorMessage>}

      <ThemeGrid>
        {themes.map((theme) => {
          const isOwned = ownsTheme(theme.key);
          const isCurrent = currentTheme === theme.key;
          const isPreviewing = previewTheme === theme.key;

          return (
            <ThemeCard
              key={theme.key}
              owned={isOwned}
              isCurrent={isCurrent}
              isPreview={isPreviewing}
              onClick={() => isOwned && handleThemeSelect(theme.key)}
            >
              {isPreviewing && <PreviewIndicator>Preview</PreviewIndicator>}
              
              <ThemePreview
                gradient={theme.colors.backgroundGradient}
                background={theme.colors.background}
                cardBg={theme.colors.cardBackground}
                cardBorder={theme.colors.cardBorder}
                cardBlur={theme.colors.cardBackdropFilter}
                buttonGradient={theme.colors.buttonGradient}
              />
              
              <ThemeName>{theme.name}</ThemeName>
              <ThemeDescription>{theme.description}</ThemeDescription>
              
              <ThemeStatus>
                <StatusBadge 
                  owned={isOwned} 
                  isCurrent={isCurrent}
                >
                  {isCurrent ? 'Current' : isOwned ? 'Owned' : 'Locked'}
                </StatusBadge>
                
                {isOwned && (
                  <div style={{ display: 'flex', gap: '4px' }}>
                    {!isCurrent && (
                      <ActionButton
                        onClick={(e) => {
                          e.stopPropagation();
                          handleThemeSelect(theme.key);
                        }}
                      >
                        Apply
                      </ActionButton>
                    )}
                    <ActionButton
                      onClick={(e) => {
                        e.stopPropagation();
                        if (isPreviewing) {
                          handleClearPreview();
                        } else {
                          handleThemePreview(theme.key);
                        }
                      }}
                    >
                      {isPreviewing ? 'Clear' : 'Preview'}
                    </ActionButton>
                  </div>
                )}
              </ThemeStatus>
            </ThemeCard>
          );
        })}
      </ThemeGrid>

      <UnlockButton 
        onClick={handleUnlockAllThemes} 
        disabled={isUnlockingThemes}
      >
        {isUnlockingThemes ? 'Unlocking...' : 'Unlock All Themes for Testing'}
      </UnlockButton>
    </ThemeTestingContainer>
  );
};

export default ThemeTestingSection; 