import React, { useState, useEffect } from 'react';
import styled from 'styled-components';
import { createClient } from '@supabase/supabase-js';
import { useAuth } from '../hooks/useAuth';
import { useStamps } from '../hooks/useStamps';
import { useQuests } from '../hooks/useQuests';
import GlassCard from './GlassCard';
import LiveCountdown from './LiveCountdown';

const supabase = createClient(
  process.env.REACT_APP_SUPABASE_URL,
  process.env.REACT_APP_SUPABASE_ANON_KEY
);

const ModalOverlay = styled.div`
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(18, 18, 18, 0.8);
  backdrop-filter: blur(20px);
  z-index: 2000;
  display: flex;
  align-items: center;
  justify-content: center;
  animation: fadeIn 0.3s ease;
  padding: 1rem;
  
  /* Ensure the overlay is clickable */
  pointer-events: auto;
  
  @keyframes fadeIn {
    from { opacity: 0; }
    to { opacity: 1; }
  }
`;

const ModalCard = styled(GlassCard)`
  max-width: 500px;
  width: 100%;
  max-height: 80vh;
  overflow: hidden;
  display: flex;
  flex-direction: column;
  position: relative;
  pointer-events: auto;
`;

const ModalHeader = styled.div`
  padding: 32px 32px 24px 32px;
  border-bottom: 3px solid ${({ theme }) => theme.colors.accent.gold};
`;

const ModalTitle = styled.h2`
  font-family: ${({ theme }) => theme.typography.fontFamily.heading};
  color: ${({ theme }) => theme.colors.text.primary};
  margin: 0 0 16px 0;
  font-size: ${({ theme }) => theme.typography.fontSize.h2};
  font-weight: ${({ theme }) => theme.typography.fontWeight.bold};
`;

const CountdownSection = styled.div`
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 1rem;
  padding: 16px;
  background: rgba(255, 176, 0, 0.05);
  border-radius: 12px;
  border: 1px solid rgba(255, 176, 0, 0.2);
  margin-bottom: 16px;
`;

const CountdownLabel = styled.div`
  font-family: 'Space Grotesk', sans-serif;
  font-size: 0.9rem;
  color: ${({ theme }) => theme.colors.text.secondary};
  font-weight: 500;
`;

const ModalBody = styled.div`
  flex: 1;
  overflow-y: auto;
  padding: 24px 32px 32px 32px;
`;

const QuestContainer = styled.div`
  display: flex;
  flex-direction: column;
  gap: 18px;
`;

const QuestCard = styled.div`
  display: flex;
  align-items: center;
  gap: 18px;
  padding: 24px;
  background: rgba(255, 255, 255, 0.05);
  border-radius: 20px;
  border: 3px solid ${({ theme }) => theme.colors.accent.gold};
  transition: all ${({ theme }) => theme.animation.duration.normal} ${({ theme }) => theme.animation.timing.smooth};
  cursor: pointer;
  
  &:hover {
    transform: translateY(-3px) scale(1.02);
    box-shadow: ${({ theme }) => theme.effects.neonGlow};
  }
`;

const QuestIcon = styled.div`
  width: 48px;
  height: 48px;
  border-radius: 20px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 1.5rem;
  background: ${({ platform, theme }) => 
    platform === 'twitter' ? theme.colors.accent.cyan : theme.colors.accent.pink};
`;

const QuestContent = styled.div`
  flex: 1;
`;

const QuestTitle = styled.div`
  font-family: ${({ theme }) => theme.typography.fontFamily.heading};
  color: ${({ theme }) => theme.colors.text.primary};
  font-weight: ${({ theme }) => theme.typography.fontWeight.bold};
  font-size: ${({ theme }) => theme.typography.fontSize.body};
  margin-bottom: 8px;
`;

const QuestDescription = styled.div`
  font-family: ${({ theme }) => theme.typography.fontFamily.body};
  color: ${({ theme }) => theme.colors.text.secondary};
  font-size: ${({ theme }) => theme.typography.fontSize.small};
`;

const QuestMeta = styled.div`
  display: flex;
  flex-direction: column;
  align-items: flex-end;
  gap: 8px;
`;

const QuestStatus = styled.div`
  font-family: ${({ $completed, theme }) => 
    $completed ? theme.colors.accent.green : theme.colors.text.secondary};
  font-weight: ${({ theme }) => theme.typography.fontWeight.bold};
  font-size: ${({ theme }) => theme.typography.fontSize.small};
`;

const QuestDate = styled.div`
  font-family: ${({ theme }) => theme.typography.fontFamily.body};
  color: ${({ theme }) => theme.colors.text.secondary};
  font-size: 0.75rem;
`;

const QuestReward = styled.div`
  font-family: ${({ theme }) => theme.typography.fontFamily.heading};
  color: ${({ theme }) => theme.colors.accent.gold};
  font-weight: ${({ theme }) => theme.typography.fontWeight.bold};
  font-size: ${({ theme }) => theme.typography.fontSize.small};
`;

const CloseButton = styled.button`
  position: absolute;
  top: 24px;
  right: 24px;
  background: transparent;
  border: 3px solid ${({ theme }) => theme.colors.accent.gold};
  color: ${({ theme }) => theme.colors.text.primary};
  font-size: 1.5rem;
  cursor: pointer;
  z-index: 10;
  padding: 0;
  width: 48px;
  height: 48px;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 20px;
  transition: all ${({ theme }) => theme.animation.duration.normal} ${({ theme }) => theme.animation.timing.smooth};
  
  &:hover {
    transform: translateY(-3px) scale(1.02);
    background: ${({ theme }) => theme.colors.accent.gold};
    color: ${({ theme }) => theme.colors.background};
    box-shadow: ${({ theme }) => theme.effects.neonGlow};
  }
  
  &:focus {
    outline: none;
    transform: translateY(-3px) scale(1.02);
    background: ${({ theme }) => theme.colors.accent.gold};
    color: ${({ theme }) => theme.colors.background};
  }
`;

const CompleteLaterButton = styled.button`
  background: rgba(255, 255, 255, 0.1);
  color: rgba(255, 255, 255, 0.8);
  border: 1px solid rgba(255, 255, 255, 0.2);
  border-radius: 12px;
  padding: 12px 24px;
  font-size: 0.95rem;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s ease;
  margin-top: 1rem;
  width: 100%;
  
  &:hover {
    background: rgba(255, 255, 255, 0.15);
    border-color: rgba(255, 255, 255, 0.3);
  }
`;

const CompletionMessage = styled.div`
  margin-top: 1rem;
  padding: 1rem;
  background: rgba(34, 197, 94, 0.1);
  border: 1px solid rgba(34, 197, 94, 0.3);
  border-radius: 12px;
  text-align: center;
  color: #22C55E;
`;

const DailiesModal = ({ isOpen, onClose, onQuestComplete }) => {
  const { user } = useAuth();
  const { awardStreakStamp } = useStamps();
  const [completedQuests, setCompletedQuests] = useState(new Set());
  const [loading, setLoading] = useState(false);

  const {
    todaysCompletions,
    loadTodaysCompletions,
    markQuestComplete
  } = useQuests();

  useEffect(() => {
    if (isOpen) {
      loadTodaysCompletions();
    }
  }, [isOpen, loadTodaysCompletions]);



  if (!isOpen) return null;

  const handleOverlayClick = (e) => {
    if (e.target === e.currentTarget) {
      onClose();
    }
  };

  const handleTwitterQuest = async () => {
    if (completedQuests.has('twitter')) return;
    
    setLoading(true);
    try {
      // Pre-compose tweet with GM message
      const tweetText = encodeURIComponent("GM @PapillonBrandUs 🦋 #PapillonBrand #PapillonMorning #GM");
      const twitterUrl = `https://twitter.com/intent/tweet?text=${tweetText}`;
      
      // Open Twitter in new tab
      window.open(twitterUrl, '_blank');
      
      // Record completion and award WNGS
      await markQuestComplete('twitter');
      
      // Update local state
      setCompletedQuests(prev => new Set([...prev, 'twitter']));
      
      // Notify parent component to refresh balance
      if (onQuestComplete) {
        onQuestComplete();
      }
      
    } catch (error) {
      console.error('Error completing Twitter quest:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleInstagramQuest = async () => {
    if (completedQuests.has('instagram')) return;
    
    setLoading(true);
    try {
      // Open Instagram to Papillon brand page
      const instagramUrl = 'https://instagram.com/papillonbrand.us';
      window.open(instagramUrl, '_blank');
      
      // Record completion and award WNGS
      await markQuestComplete('instagram');
      
      // Update local state
      setCompletedQuests(prev => new Set([...prev, 'instagram']));
      
      // Notify parent component to refresh balance
      if (onQuestComplete) {
        onQuestComplete();
      }
      
    } catch (error) {
      console.error('Error completing Instagram quest:', error);
    } finally {
      setLoading(false);
    }
  };

  const quests = [
    {
      id: 'twitter',
      platform: 'twitter',
      icon: '🐦',
      title: 'Say GM on Twitter/X',
      description: 'Tweet "GM @PapillonBrandUs" to start your day',
      reward: '+10 WNGS',
      action: handleTwitterQuest,
      completed: completedQuests.has('twitter'),
      date: completedQuests.has('twitter') ? 'Mar 18, 2025' : ''
    },
    {
      id: 'instagram',
      platform: 'instagram', 
      icon: '📸',
      title: 'Engage on Instagram',
      description: 'Like, comment, or share our latest post',
      reward: '+15 WNGS',
      action: handleInstagramQuest,
      completed: completedQuests.has('instagram'),
      date: completedQuests.has('instagram') ? 'Mar 17, 2025' : ''
    }
  ];

  const allCompleted = quests.every(quest => quest.completed);
  const totalWings = quests.reduce((sum, quest) => {
    return quest.completed ? sum + parseInt(quest.reward.match(/\d+/)[0]) : sum;
  }, 0);

  return (
    <ModalOverlay onClick={handleOverlayClick}>
      <ModalCard onClick={e => e.stopPropagation()}>
        <CloseButton onClick={(e) => {
          e.stopPropagation();
          onClose();
        }}>×</CloseButton>
        
        <ModalHeader>
          <ModalTitle>Daily Social Quests</ModalTitle>
          <CountdownSection>
            <CountdownLabel>Next reset in:</CountdownLabel>
            <LiveCountdown 
              targetDate={new Date().setHours(24, 0, 0, 0)} 
              size="1rem"
              showSeconds={false}
            />
          </CountdownSection>
        </ModalHeader>

        <ModalBody>
          <QuestContainer>
            {quests.map(quest => (
              <QuestCard 
                key={quest.id}
                onClick={quest.completed ? null : quest.action}
                style={{
                  cursor: quest.completed ? 'default' : 'pointer'
                }}
              >
                <QuestIcon platform={quest.platform}>
                  {quest.icon}
                </QuestIcon>
                <QuestContent>
                  <QuestTitle>{quest.title}</QuestTitle>
                  <QuestDescription>{quest.description}</QuestDescription>
                </QuestContent>
                <QuestMeta>
                  <QuestStatus $completed={quest.completed}>
                    {quest.completed ? 'Completed' : 'Available'}
                  </QuestStatus>
                  {quest.date && <QuestDate>{quest.date}</QuestDate>}
                  {quest.completed && (
                    <QuestReward>{quest.reward}</QuestReward>
                  )}
                </QuestMeta>
              </QuestCard>
            ))}
          </QuestContainer>
        </ModalBody>
      </ModalCard>
    </ModalOverlay>
  );
};

export default DailiesModal; 