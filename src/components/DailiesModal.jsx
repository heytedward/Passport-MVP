import React, { useState, useEffect } from 'react';
import styled from 'styled-components';
import { createClient } from '@supabase/supabase-js';
import { useAuth } from '../hooks/useAuth';
import { useStamps } from '../hooks/useStamps';
import GlassCard from './GlassCard';

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
  margin: 0 0 24px 0;
  font-size: ${({ theme }) => theme.typography.fontSize.h2};
  font-weight: ${({ theme }) => theme.typography.fontWeight.bold};
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

  // Load today's completed quests from database
  useEffect(() => {
    if (isOpen && user) {
      loadTodaysCompletions();
    }
  }, [isOpen, user]);

  const loadTodaysCompletions = async () => {
    if (!user) return;
    
    try {
      const today = new Date().toISOString().split('T')[0]; // YYYY-MM-DD format
      
      const { data, error } = await supabase
        .from('daily_completions')
        .select('quest_id')
        .eq('user_id', user.id)
        .eq('completion_date', today);

      if (error) {
        console.error('Error loading daily completions:', error);
        return;
      }

      const completed = new Set(data.map(d => d.quest_id));
      setCompletedQuests(completed);
    } catch (err) {
      console.error('Error loading daily completions:', err);
    }
  };

  const recordDailyCompletion = async (questId, wingsAmount, questTitle) => {
    if (!user) return;
    
    try {
      const today = new Date().toISOString().split('T')[0];
      
      // Insert daily completion record
      const { error: completionError } = await supabase
        .from('daily_completions')
        .insert({
          user_id: user.id,
          quest_id: questId,
          completion_date: today,
          wings_earned: wingsAmount,
          quest_title: questTitle
        })
        .select()
        .single();

      if (completionError) {
        console.error('Error recording daily completion:', completionError);
        return;
      }

      // Award WNGS using the RPC function
      const { error: wingsError } = await supabase.rpc('add_wings_to_user', {
        user_id_param: user.id,
        wings_amount: wingsAmount,
        activity_type_param: 'daily_quest',
        description_param: `Completed daily quest: ${questTitle}`
      });

      if (wingsError) {
        console.error('Error awarding WNGS:', wingsError);
      }

      // Check for streak and award streak stamp if needed
      await checkAndAwardStreak();
      
    } catch (err) {
      console.error('Error in recordDailyCompletion:', err);
    }
  };

  const checkAndAwardStreak = async () => {
    if (!user) return;
    
    try {
      // Get last 7 days of completions
      const sevenDaysAgo = new Date();
      sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 6); // Today + 6 days ago = 7 days total
      
      const { data, error } = await supabase
        .from('daily_completions')
        .select('completion_date')
        .eq('user_id', user.id)
        .gte('completion_date', sevenDaysAgo.toISOString().split('T')[0])
        .order('completion_date', { ascending: false });

      if (error) {
        console.error('Error checking streak:', error);
        return;
      }

      // Check if we have completions for 7 consecutive days
      const uniqueDates = [...new Set(data.map(d => d.completion_date))];
      
      if (uniqueDates.length >= 7) {
        // Check if the dates are consecutive (including today)
        const today = new Date().toISOString().split('T')[0];
        const sortedDates = uniqueDates.sort().reverse(); // Most recent first
        
        let consecutiveDays = 0;
        let currentDate = new Date(today);
        
        for (let i = 0; i < sortedDates.length && i < 7; i++) {
          const expectedDate = currentDate.toISOString().split('T')[0];
          if (sortedDates[i] === expectedDate) {
            consecutiveDays++;
            currentDate.setDate(currentDate.getDate() - 1);
          } else {
            break;
          }
        }
        
        if (consecutiveDays >= 7) {
          try {
            // Only award streak stamp if awardStreakStamp function is available
            if (typeof awardStreakStamp === 'function') {
              await awardStreakStamp(7);
              console.log('🔥 Streak Master stamp awarded for 7-day streak!');
            } else {
              console.log('🔥 7-day streak achieved! (Streak stamp function not available)');
            }
          } catch (stampError) {
            console.warn('Streak stamp might already be earned or function unavailable:', stampError);
          }
        }
      }
    } catch (err) {
      console.error('Error checking streak:', err);
    }
  };

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
      await recordDailyCompletion('twitter', 10, 'Say GM on Twitter/X');
      
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
      await recordDailyCompletion('instagram', 15, 'Engage on Instagram');
      
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