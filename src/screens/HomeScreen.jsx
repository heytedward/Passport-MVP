import React, { useState, useEffect } from 'react';
import styled from 'styled-components';
import { useNavigate } from 'react-router-dom';
import { createClient } from '@supabase/supabase-js';
import { useAuth } from '../hooks/useAuth';
import DailiesModal from '../components/DailiesModal';

const supabase = createClient(
  process.env.REACT_APP_SUPABASE_URL,
  process.env.REACT_APP_SUPABASE_ANON_KEY
);

// Custom hook for weekly WINGS tracking
const useWeeklyWings = (userId) => {
  const [weeklyStats, setWeeklyStats] = useState({
    currentWeekWings: 0,
    totalWings: 0,
    weekStartDate: null,
    daysLeftInWeek: 0
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (userId) {
      loadWeeklyStats();
      
      // Set up real-time subscription for wings updates
      const subscription = supabase
        .channel('wings_updates')
        .on('postgres_changes', {
          event: '*',
          schema: 'public',
          table: 'user_profiles',
          filter: `id=eq.${userId}`
        }, () => {
          loadWeeklyStats();
        })
        .subscribe();

      return () => subscription.unsubscribe();
    }
  }, [userId]);

  const loadWeeklyStats = async () => {
    try {
      setLoading(true);

      // Get user profile with weekly stats
      const { data: profile, error } = await supabase
        .from('user_profiles')
        .select('wings_balance, current_week_wings, week_start_date')
        .eq('id', userId)
        .single();

      if (error) throw error;

      // Calculate days left in week
      const today = new Date();
      const currentWeekStart = new Date(today);
      currentWeekStart.setDate(today.getDate() - today.getDay() + 1); // Monday
      
      const weekStart = profile?.week_start_date ? new Date(profile.week_start_date) : currentWeekStart;
      const weekEnd = new Date(weekStart);
      weekEnd.setDate(weekStart.getDate() + 6); // Sunday
      
      const daysLeft = Math.max(0, Math.ceil((weekEnd - today) / (1000 * 60 * 60 * 24)));

      setWeeklyStats({
        currentWeekWings: profile?.current_week_wings || 0,
        totalWings: profile?.wings_balance || 0,
        weekStartDate: profile?.week_start_date,
        daysLeftInWeek: daysLeft
      });

    } catch (err) {
      console.error('Error loading weekly stats:', err);
    } finally {
      setLoading(false);
    }
  };

  // Get formatted weekly progress text
  const getWeeklyProgressText = () => {
    if (weeklyStats.currentWeekWings === 0) {
      return "You've earned 0 $WNGS this week";
    } else if (weeklyStats.currentWeekWings === 1) {
      return "You've earned 1 $WNG this week";
    } else {
      return `You've earned ${weeklyStats.currentWeekWings} $WNGS this week`;
    }
  };

  return {
    weeklyStats,
    loading,
    getWeeklyProgressText,
    refreshStats: loadWeeklyStats
  };
};

const gold = '#FFB000'; // Updated to use your theme's correct gold
const purple = '#4C1C8C'; // Updated to use your theme's correct purple
const background = '#000000';

const Container = styled.div`
  min-height: 100vh;
  background: ${({ theme }) => theme.colors?.background || background};
  padding: 0 0 80px 0;
  display: flex;
  flex-direction: column;
  align-items: stretch;
`;

const Header = styled.div`
  padding: 2.2rem 1.2rem 1.2rem 1.2rem;
  text-align: left;
`;

const Welcome = styled.h1`
  font-family: 'Outfit', sans-serif;
  font-size: 1.5rem;
  font-weight: 700;
  color: ${({ theme }) => theme.colors?.text?.primary || '#fff'};
  margin: 0 0 0.3rem 0;
`;

const Subtext = styled.div`
  font-family: 'Space Grotesk', sans-serif;
  font-size: 1.05rem;
  color: ${({ theme }) => theme.colors?.accent?.gold || gold};
  font-weight: 500;
  background: ${({ theme }) => `linear-gradient(135deg, ${theme.colors?.accent?.gold || gold}22 0%, ${theme.colors?.accent?.purple || purple}11 100%)`};
  border: 1px solid ${({ theme }) => `${theme.colors?.accent?.gold || gold}33`};
  border-radius: 12px;
  padding: 0.8rem 1.2rem;
  margin-top: 0.8rem;
  display: flex;
  align-items: center;
  gap: 0.5rem;
  transition: all 0.2s ease;
  
  &:hover {
    background: ${({ theme }) => `linear-gradient(135deg, ${theme.colors?.accent?.gold || gold}28 0%, ${theme.colors?.accent?.purple || purple}15 100%)`};
    border-color: ${({ theme }) => `${theme.colors?.accent?.gold || gold}44`};
  }
`;

const WingsIcon = styled.span`
  font-size: 1.1rem;
`;

const CardRow = styled.div`
  padding: 0 1.2rem;
  margin-bottom: 1.2rem;
  display: flex;
  flex-direction: column;
  gap: 1.2rem;
  @media (max-width: 700px) {
    gap: 1rem;
  }
`;

const CardRowInner = styled.div`
  display: flex;
  gap: 1.2rem;
  @media (max-width: 700px) {
    flex-direction: column;
    gap: 1rem;
  }
`;

const GlassCard = styled.button`
  flex: 1;
  background: ${({ theme }) => theme.colors?.glass?.background || 'linear-gradient(135deg, rgba(20,20,20,0.95) 0%, rgba(30,30,30,0.90) 50%, rgba(15,15,15,0.98) 100%)'};
  border: 3px solid ${({ theme }) => theme.colors?.accent?.gold || gold};
  border-radius: 20px;
  box-shadow: 
    0 0 12px 0 rgba(255,215,0,0.15),
    0 0 24px 0 rgba(255,215,0,0.08),
    inset 0 1px 0 rgba(255,215,0,0.1);
  backdrop-filter: blur(18px);
  -webkit-backdrop-filter: blur(18px);
  padding: 18px 18px;
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  cursor: pointer;
  transition: transform 0.18s cubic-bezier(0.4,0,0.2,1), box-shadow 0.18s, border 0.18s;
  outline: none;
  position: relative;
  min-width: 0;
  min-height: 140px;
  &:hover, &:focus {
    border: 3px solid ${({ theme }) => theme.colors?.accent?.gold || gold};
    transform: translateY(-3px) scale(1.02);
    box-shadow: 
      0 0 20px 0 rgba(255,215,0,0.3),
      0 0 40px 0 rgba(255,215,0,0.15),
      inset 0 1px 0 rgba(255,215,0,0.2);
  }
`;

const CardTitle = styled.div`
  font-family: 'Outfit', sans-serif;
  font-size: 1.15rem;
  font-weight: 700;
  color: ${({ theme }) => theme.colors?.text?.primary || '#fff'};
  margin-bottom: 0.5rem;
`;

const CardSub = styled.div`
  font-family: 'Space Grotesk', sans-serif;
  font-size: 1rem;
  color: ${({ theme }) => theme.colors?.text?.secondary || '#6C6C6C'};
  font-weight: 500;
`;

const CardIcon = styled.div`
  font-size: 2.1rem;
  margin-bottom: 0.5rem;
  display: flex;
  align-items: center;
`;

const FullCard = styled(GlassCard)`
  width: 100%;
  min-height: 100px;
  align-items: flex-start;
  flex-direction: column;
  justify-content: flex-start;
  @media (max-width: 700px) {
    flex-direction: column;
    align-items: flex-start;
    min-height: 0;
  }
`;

const BottomRow = styled.div`
  display: flex;
  gap: 1.2rem;
  padding: 0 1.2rem;
  margin-top: 0.5rem;
  margin-bottom: 0.5rem;
  @media (max-width: 700px) {
    flex-direction: column;
    gap: 1rem;
  }
`;

const HalfCard = styled(GlassCard).attrs({ as: 'div' })`
  min-height: 100px;
  padding: 18px 18px;
  flex: 1;
  cursor: default;
  &:hover, &:focus {
    transform: translateY(-3px) scale(1.02);
    box-shadow: 
      0 0 20px 0 rgba(255,215,0,0.3),
      0 0 40px 0 rgba(255,215,0,0.15),
      inset 0 1px 0 rgba(255,215,0,0.2);
  }
`;

const HalfCardContent = styled.div`
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  justify-content: center;
  height: 100%;
`;

const ProgressText = styled.div`
  font-family: 'Outfit', sans-serif;
  font-size: 1.1rem;
  font-weight: 600;
  color: ${({ theme }) => theme.colors?.text?.primary || '#fff'};
`;

const ProgressSub = styled.div`
  font-family: 'Space Grotesk', sans-serif;
  font-size: 0.98rem;
  color: ${({ theme }) => theme.colors?.text?.secondary || '#6C6C6C'};
`;

const CountdownNumber = styled.div`
  font-family: 'Outfit', sans-serif;
  font-size: 2.1rem;
  font-weight: 700;
  color: ${({ theme }) => theme.colors?.accent?.gold || gold};
  margin: 0.1rem 0 0.2rem 0;
`;

const CountdownIcon = styled.span`
  margin-right: 0.5rem;
`;

const QuestsSection = styled.div`
  width: 100%;
  display: flex;
  flex-direction: column;
  gap: 1rem;
  margin-top: 1rem;
`;

const QuestItem = styled.div`
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
`;

const QuestItemInfo = styled.div`
  display: flex;
  align-items: center;
  gap: 0.8rem;
`;

const QuestItemIcon = styled.div`
  font-size: 1.5rem;
`;

const QuestItemTitle = styled.div`
  font-family: 'Space Grotesk', sans-serif;
  font-size: 1rem;
  color: ${({ theme }) => theme.colors?.text?.primary || '#fff'};
`;

const ProgressTextRight = styled.div`
  font-family: 'Space Grotesk', sans-serif;
  font-size: 0.9rem;
  color: ${({ theme }) => theme.colors?.text?.secondary || '#6C6C6C'};
  margin-left: auto;
`;

const ProgressBar = styled.div`
  height: 6px;
  background: rgba(255, 255, 255, 0.1);
  border-radius: 3px;
  overflow: hidden;
  width: 100%;
`;

const ProgressFill = styled.div`
  height: 100%;
  background: ${({ theme }) => theme.colors?.accent?.gold || gold};
  border-radius: 3px;
  transition: width 0.4s cubic-bezier(0.4,0,0.2,1);
  width: ${({ value }) => value}%;
`;

const TestWingsButton = styled.button`
  background: ${({ theme }) => theme.colors?.accent?.gold || gold};
  color: ${({ theme }) => theme.colors?.background || '#000'};
  border: none;
  border-radius: 8px;
  padding: 0.5rem 1rem;
  font-size: 0.9rem;
  font-weight: 600;
  cursor: pointer;
  margin-left: auto;
  transition: all 0.2s ease;
  
  &:hover {
    transform: scale(1.05);
    box-shadow: 0 4px 12px rgba(255,176,0,0.3);
  }
`;

function HomeScreen() {
  const [showDailiesModal, setShowDailiesModal] = useState(false);
  const navigate = useNavigate();
  const { user } = useAuth();

  // Use the weekly wings hook
  const { weeklyStats, loading, getWeeklyProgressText } = useWeeklyWings(user?.id);

  // Test function to award wings
  const handleTestWings = async () => {
    if (!user) {
      alert('Please log in to earn WINGS');
      return;
    }

    try {
      // Add 25 test wings
      const { data, error } = await supabase.rpc('add_wings_to_user', {
        user_id_param: user.id,
        wings_amount: 25,
        transaction_type_param: 'test_reward',
        description_param: 'Test wings from home screen',
        reference_id_param: 'test_' + Date.now()
      });

      if (error) throw error;

      alert(`🎉 +25 WINGS earned! New balance: ${data.new_balance}`);
    } catch (error) {
      console.error('Error awarding test wings:', error);
      alert('Error awarding wings: ' + error.message);
    }
  };

  // Example quest progress data
  const questProgress = [
    {
      id: 1,
      title: 'Scan 10 Papillon Items',
      description: 'Scan 10 different Papillon items to unlock exclusive rewards',
      progress: 7,
      total: 10,
      reward: 50,
      icon: '📱',
      category: 'Collection',
      percent: 70
    },
    {
      icon: '🏪',
      title: 'Visit 3 Store Locations',
      progress: 1,
      total: 3,
      percent: 33,
    },
    {
      icon: '👥',
      title: 'Share on Social Media',
      progress: 2,
      total: 5,
      percent: 40,
    },
  ];

  // Mock stamp data for demonstration
  const stampData = {
    current: 2,
    total: 7,
    season: 'Spring \'25',
    lastStamp: {
      name: 'NYC Store Visit',
      date: 'March 15, 2025',
      icon: '🏪'
    }
  };

  return (
    <Container>
      <Header>
        <Welcome>Welcome back, {user?.user_metadata?.display_name || user?.email?.split('@')[0] || 'Collector'}</Welcome>
        <Subtext>
          <WingsIcon>💰</WingsIcon>
          {loading ? 'Loading...' : getWeeklyProgressText()}
          {process.env.NODE_ENV === 'development' && (
            <TestWingsButton onClick={handleTestWings}>
              +25 Test
            </TestWingsButton>
          )}
        </Subtext>
      </Header>

      <CardRow>
        <CardRowInner>
          <GlassCard onClick={() => setShowDailiesModal(true)} aria-label="Go to Dailies">
            <CardIcon>🦋</CardIcon>
            <CardTitle>Dailies</CardTitle>
            <CardSub>Complete daily quests</CardSub>
          </GlassCard>
          <GlassCard onClick={() => window.open('https://papillonbrand.us', '_blank')} aria-label="Shop Now">
            <CardIcon>🛍️</CardIcon>
            <CardTitle>Shop Now</CardTitle>
            <CardSub>Visit Papillon Brand</CardSub>
          </GlassCard>
        </CardRowInner>
      </CardRow>

      <CardRow>
        <FullCard onClick={() => navigate('/quests')} aria-label="Go to Active Quests">
          <HalfCardContent style={{ flex: 1, width: '100%' }}>
            <ProgressText>Active Quests</ProgressText>
            <ProgressSub>2 Active • Complete to earn rewards</ProgressSub>
            <QuestsSection>
              {questProgress.map((q, i) => (
                <QuestItem key={i}>
                  <QuestItemInfo>
                    <QuestItemIcon>{q.icon}</QuestItemIcon>
                    <QuestItemTitle>{q.title}</QuestItemTitle>
                    <ProgressTextRight>
                      {q.progress}/{q.total}
                    </ProgressTextRight>
                  </QuestItemInfo>
                  <ProgressBar>
                    <ProgressFill value={q.percent} />
                  </ProgressBar>
                </QuestItem>
              ))}
            </QuestsSection>
          </HalfCardContent>
        </FullCard>
      </CardRow>

      <BottomRow>
        <HalfCard>
          <HalfCardContent>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', width: '100%' }}>
              <div style={{ flex: 1 }}>
                <ProgressText>Stamp Progress</ProgressText>
                <ProgressSub>{stampData.current}/{stampData.total} Stamps for {stampData.season}</ProgressSub>
              </div>
              <div style={{ 
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                marginLeft: '90px'
              }}>
                <div style={{ 
                  fontSize: '3rem', 
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  width: '80px',
                  height: '80px',
                  background: 'rgba(255, 176, 0, 0.1)',
                  border: '2px solid rgba(255, 176, 0, 0.3)',
                  borderRadius: '12px',
                  marginBottom: '0.5rem'
                }}>
                  🏪
                </div>
                <div style={{ 
                  fontSize: '0.8rem', 
                  color: 'rgba(255, 255, 255, 0.7)',
                  textAlign: 'center'
                }}>
                  Recent Stamps
                </div>
              </div>
            </div>
          </HalfCardContent>
        </HalfCard>
        <HalfCard>
          <HalfCardContent>
            <ProgressText>Season Countdown</ProgressText>
            <ProgressSub>Spring '25 ends in:</ProgressSub>
            <CountdownNumber>
              <CountdownIcon>🌸</CountdownIcon>
              {weeklyStats.daysLeftInWeek > 0 ? `${weeklyStats.daysLeftInWeek} Days` : '23 Days'}
            </CountdownNumber>
            <CardSub>Until Summer '25</CardSub>
          </HalfCardContent>
        </HalfCard>
      </BottomRow>

      <DailiesModal 
        isOpen={showDailiesModal} 
        onClose={() => setShowDailiesModal(false)} 
      />
    </Container>
  );
}

export default HomeScreen; 