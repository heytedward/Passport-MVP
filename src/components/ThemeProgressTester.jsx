import React, { useState } from 'react';
import styled from 'styled-components';
import { useAuth } from '../hooks/useAuth';
import { useTheme } from '../hooks/useTheme';
import { progressTracker } from '../utils/progressTracker';
import { supabase } from '../utils/supabaseClient';
import GlassCard from './GlassCard';

const TestContainer = styled.div`
  padding: 2rem;
  max-width: 800px;
  margin: 0 auto;
`;

const TestSection = styled(GlassCard)`
  margin-bottom: 2rem;
  padding: 1.5rem;
`;

const TestButton = styled.button`
  background: linear-gradient(135deg, #FFB000 0%, #FF9F1C 100%);
  color: #000;
  border: none;
  border-radius: 8px;
  padding: 0.75rem 1.5rem;
  margin: 0.5rem;
  cursor: pointer;
  font-weight: 600;
  transition: all 0.2s ease;
  
  &:hover {
    transform: translateY(-2px);
    box-shadow: 0 4px 12px rgba(255, 176, 0, 0.3);
  }
  
  &:disabled {
    opacity: 0.5;
    cursor: not-allowed;
    transform: none;
  }
`;

const ProgressDisplay = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 1rem;
  margin: 1rem 0;
`;

const ProgressItem = styled.div`
  background: rgba(255, 255, 255, 0.05);
  border: 1px solid rgba(255, 255, 255, 0.1);
  border-radius: 8px;
  padding: 1rem;
  text-align: center;
`;

const ProgressLabel = styled.div`
  font-size: 0.8rem;
  color: ${({ theme }) => theme.colors.text.secondary};
  margin-bottom: 0.5rem;
  text-transform: uppercase;
  letter-spacing: 0.5px;
`;

const ProgressValue = styled.div`
  font-size: 1.5rem;
  font-weight: 700;
  color: ${({ theme }) => theme.colors.text.primary};
`;

const ThemeDisplay = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(150px, 1fr));
  gap: 1rem;
  margin: 1rem 0;
`;

const ThemeItem = styled.div`
  background: ${({ unlocked, equipped }) => 
    unlocked 
      ? equipped 
        ? 'linear-gradient(135deg, rgba(255, 176, 0, 0.2) 0%, rgba(255, 176, 0, 0.1) 100%)'
        : 'rgba(255, 255, 255, 0.05)'
      : 'rgba(255, 255, 255, 0.02)'
  };
  border: 2px solid ${({ unlocked, equipped }) => 
    equipped ? '#FFB000' : unlocked ? 'rgba(255, 255, 255, 0.2)' : 'rgba(255, 255, 255, 0.1)'
  };
  border-radius: 12px;
  padding: 1rem;
  text-align: center;
  opacity: ${({ unlocked }) => unlocked ? 1 : 0.5};
`;

const ThemeName = styled.div`
  font-weight: 600;
  color: ${({ theme }) => theme.colors.text.primary};
  margin-bottom: 0.5rem;
`;

const ThemeStatus = styled.div`
  font-size: 0.7rem;
  color: ${({ unlocked, equipped, theme }) => 
    equipped ? '#FFB000' : unlocked ? theme.colors.text.secondary : '#ff6b6b'
  };
  text-transform: uppercase;
  letter-spacing: 0.5px;
`;

const StatusMessage = styled.div`
  background: ${({ type }) => 
    type === 'success' ? 'rgba(76, 175, 80, 0.1)' : 
    type === 'error' ? 'rgba(244, 67, 54, 0.1)' : 
    'rgba(255, 176, 0, 0.1)'
  };
  border: 1px solid ${({ type }) => 
    type === 'success' ? 'rgba(76, 175, 80, 0.3)' : 
    type === 'error' ? 'rgba(244, 67, 54, 0.3)' : 
    'rgba(255, 176, 0, 0.3)'
  };
  border-radius: 8px;
  padding: 1rem;
  margin: 1rem 0;
  color: ${({ type }) => 
    type === 'success' ? '#4CAF50' : 
    type === 'error' ? '#F44336' : 
    '#FFB000'
  };
`;

const ThemeProgressTester = () => {
  const { user } = useAuth();
  const { 
    ownedThemes, 
    currentTheme, 
    switchTheme, 
    ownsTheme,
    loading: themesLoading 
  } = useTheme();
  
  const [status, setStatus] = useState('');
  const [isUpdating, setIsUpdating] = useState(false);

  // Simple function to unlock all themes for testing
  const unlockAllThemes = async () => {
    setIsUpdating(true);
    try {
      const { error } = await supabase
        .from('user_profiles')
        .update({ 
          themes_unlocked: ['frequencyPulse', 'solarShine', 'echoGlass', 'retroFrame', 'nightScan'],
          total_scans: 10,
          total_quests_completed: 10,
          total_items_collected: 10,
          wings_balance: 1000
        })
        .eq('id', user.id);

      if (error) throw error;
      
      setStatus({ type: 'success', message: 'All themes unlocked for testing! Refresh the page to see changes.' });
    } catch (error) {
      setStatus({ type: 'error', message: `Error unlocking themes: ${error.message}` });
    } finally {
      setIsUpdating(false);
    }
  };

  const testActions = [
    {
      name: 'Simulate QR Scan',
      action: async () => {
        setIsUpdating(true);
        try {
          await progressTracker.updateScanProgress(user.id);
          setStatus({ type: 'success', message: 'QR scan progress updated! Check if Solar Shine theme unlocked.' });
        } catch (error) {
          setStatus({ type: 'error', message: `Error updating scan progress: ${error.message}` });
        } finally {
          setIsUpdating(false);
        }
      }
    },
    {
      name: 'Simulate Quest Completion',
      action: async () => {
        setIsUpdating(true);
        try {
          await progressTracker.updateQuestProgress(user.id);
          setStatus({ type: 'success', message: 'Quest progress updated! Check if Echo Glass theme unlocked.' });
        } catch (error) {
          setStatus({ type: 'error', message: `Error updating quest progress: ${error.message}` });
        } finally {
          setIsUpdating(false);
        }
      }
    },
    {
      name: 'Simulate Item Collection',
      action: async () => {
        setIsUpdating(true);
        try {
          await progressTracker.updateItemProgress(user.id);
          setStatus({ type: 'success', message: 'Item progress updated! Check if Retro Frame theme unlocked.' });
        } catch (error) {
          setStatus({ type: 'error', message: `Error updating item progress: ${error.message}` });
        } finally {
          setIsUpdating(false);
        }
      }
    },
    {
      name: 'Simulate WNGS Earned (100)',
      action: async () => {
        setIsUpdating(true);
        try {
          await progressTracker.updateWingsProgress(user.id, 100);
          setStatus({ type: 'success', message: 'WNGS progress updated! Check if Night Scan theme unlocked.' });
        } catch (error) {
          setStatus({ type: 'error', message: `Error updating WNGS progress: ${error.message}` });
        } finally {
          setIsUpdating(false);
        }
      }
    }
  ];

  const availableThemes = [
    { key: 'frequencyPulse', name: 'Frequency Pulse', requirement: 'Default theme' },
    { key: 'solarShine', name: 'Solar Shine', requirement: '1 QR scan' },
    { key: 'echoGlass', name: 'Echo Glass', requirement: '3 quests' },
    { key: 'retroFrame', name: 'Retro Frame', requirement: '10 items' },
    { key: 'nightScan', name: 'Night Scan', requirement: '500 WNGS' }
  ];

  if (!user) {
    return (
      <TestContainer>
        <TestSection>
          <h2>Theme Progress Tester</h2>
          <p>Please log in to test the theme system.</p>
        </TestSection>
      </TestContainer>
    );
  }

  if (themesLoading) {
    return (
      <TestContainer>
        <TestSection>
          <h2>Theme Progress Tester</h2>
          <p>Loading theme data...</p>
        </TestSection>
      </TestContainer>
    );
  }

  return (
    <TestContainer>
      <TestSection>
        <h2>Theme Progress Tester</h2>
        <p>Test the theme unlocking system by simulating user actions.</p>
        
        {status && (
          <StatusMessage type={status.type}>
            {status.message}
          </StatusMessage>
        )}

        <h3>Quick Test Setup</h3>
        <div style={{ marginBottom: '2rem' }}>
          <TestButton
            onClick={unlockAllThemes}
            disabled={isUpdating}
            style={{ 
              background: 'linear-gradient(135deg, #4CAF50 0%, #45a049 100%)',
              fontSize: '1.1rem',
              padding: '1rem 2rem'
            }}
          >
            🎁 Unlock All Themes for Testing
          </TestButton>
          <p style={{ fontSize: '0.9rem', marginTop: '0.5rem', opacity: 0.7 }}>
            This will unlock all themes and set high progress values for testing purposes.
          </p>
        </div>

        <h3>Current Progress</h3>
        <ProgressDisplay>
          <ProgressItem>
            <ProgressLabel>QR Scans</ProgressLabel>
            <ProgressValue>{userProgress.totalScans}</ProgressValue>
          </ProgressItem>
          <ProgressItem>
            <ProgressLabel>Quests Completed</ProgressLabel>
            <ProgressValue>{userProgress.totalQuests}</ProgressValue>
          </ProgressItem>
          <ProgressItem>
            <ProgressLabel>Items Collected</ProgressLabel>
            <ProgressValue>{userProgress.totalItems}</ProgressValue>
          </ProgressItem>
          <ProgressItem>
            <ProgressLabel>WNGS Balance</ProgressLabel>
            <ProgressValue>{userProgress.totalWings}</ProgressValue>
          </ProgressItem>
        </ProgressDisplay>

        <h3>Test Actions (Broken - Use Quick Setup Above)</h3>
        <div>
          {testActions.map((action, index) => (
            <TestButton
              key={index}
              onClick={action.action}
              disabled={isUpdating}
              style={{ opacity: 0.5 }}
            >
              {action.name}
            </TestButton>
          ))}
        </div>
      </TestSection>

      <TestSection>
        <h3>Available Themes</h3>
        <ThemeDisplay>
          {availableThemes.map(theme => {
            const unlocked = checkThemeOwnership(theme.key);
            const equipped = equippedTheme === theme.key;
            
            return (
              <ThemeItem key={theme.key} unlocked={unlocked} equipped={equipped}>
                <ThemeName>{theme.name}</ThemeName>
                <ThemeStatus unlocked={unlocked} equipped={equipped}>
                  {equipped ? '✓ Equipped' : unlocked ? '✓ Unlocked' : '🔒 Locked'}
                </ThemeStatus>
                <div style={{ fontSize: '0.7rem', marginTop: '0.5rem', opacity: 0.7 }}>
                  {theme.requirement}
                </div>
                {unlocked && !equipped && (
                  <TestButton
                    onClick={() => equipTheme(theme.key)}
                    style={{ marginTop: '0.5rem', fontSize: '0.7rem', padding: '0.5rem 1rem' }}
                  >
                    Equip
                  </TestButton>
                )}
              </ThemeItem>
            );
          })}
        </ThemeDisplay>
      </TestSection>

      <TestSection>
        <h3>Debug Info</h3>
        <div style={{ fontSize: '0.8rem', fontFamily: 'monospace' }}>
          <div>User ID: {user.id}</div>
          <div>Owned Themes: {JSON.stringify(ownedThemes)}</div>
          <div>Equipped Theme: {equippedTheme}</div>
        </div>
      </TestSection>
    </TestContainer>
  );
};

export default ThemeProgressTester; 