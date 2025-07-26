import React, { useState, useEffect, useCallback } from 'react';
import styled from 'styled-components';
import { useNavigate } from 'react-router-dom';
import { createClient } from '@supabase/supabase-js';
import { useAuth } from '../hooks/useAuth';
import { useStamps } from '../hooks/useStamps';
import { useQuests } from '../hooks/useQuests';
import DailiesModal from '../components/DailiesModal';
import LiveCountdown from '../components/LiveCountdown';

const supabase = createClient(
  process.env.REACT_APP_SUPABASE_URL,
  process.env.REACT_APP_SUPABASE_ANON_KEY
);

// Custom hook for weekly WNGS tracking
const useWeeklyWings = (userId) => {
  const [weeklyStats, setWeeklyStats] = useState({
    currentWeekWings: 0,
    totalWings: 0,
    weekStartDate: null,
    daysLeftInWeek: 0
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const loadWeeklyStats = useCallback(async () => {
    if (!userId) {
      setLoading(false);
      return;
    }
    
    try {
      setLoading(true);
      setError(null);
      console.log('Loading weekly stats for user:', userId);

      // Add timeout to prevent infinite loading
      const timeoutPromise = new Promise((_, reject) => 
        setTimeout(() => reject(new Error('Request timeout')), 5000)
      );

      const queryPromise = supabase
        .from('user_profiles')
        .select('wings_balance, current_week_wings, week_start_date')
        .eq('id', userId)
        .single();

      const { data: profile, error } = await Promise.race([queryPromise, timeoutPromise]);

      if (error) {
        console.error('Error fetching profile:', error);
        
        // If user profile doesn't exist, create it
        if (error.code === 'PGRST116') {
          console.log('User profile not found, creating...');
          const { error: insertError } = await supabase
            .from('user_profiles')
            .insert({
              id: userId,
              wings_balance: 0,
              current_week_wings: 0,
              week_start_date: new Date().toISOString()
            });
          
          if (insertError) {
            console.error('Error creating user profile:', insertError);
          }
        }
        
        // Set default values
        setWeeklyStats({
          currentWeekWings: 0,
          totalWings: 0,
          weekStartDate: null,
          daysLeftInWeek: 0
        });
        return;
      }

      console.log('Profile data:', profile);

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

      console.log('Weekly stats updated:', {
        currentWeekWings: profile?.current_week_wings || 0,
        totalWings: profile?.wings_balance || 0,
      });

    } catch (err) {
      console.error('Error loading weekly stats:', err);
      setError(err.message);
      setWeeklyStats({
        currentWeekWings: 0,
        totalWings: 0,
        weekStartDate: null,
        daysLeftInWeek: 0
      });
    } finally {
      setLoading(false);
    }
  }, [userId]);

  useEffect(() => {
    if (userId) {
      loadWeeklyStats();
      
      // Real-time subscriptions temporarily disabled due to React Strict Mode conflicts
      // Will re-enable with proper singleton pattern later
      // 
      // const channelName = `home_wngs_updates_${userId}`;
      // const subscription = supabase
      //   .channel(channelName)
      //   .on('postgres_changes', {
      //     event: 'UPDATE',
      //     schema: 'public',
      //     table: 'user_profiles',
      //     filter: `id=eq.${userId}`
      //   }, (payload) => {
      //     console.log('Profile updated via real-time (Home):', payload);
      //     setWeeklyStats(prev => ({
      //       ...prev,
      //       currentWeekWings: payload.new.current_week_wings || 0,
      //       totalWings: payload.new.wings_balance || 0,
      //     }));
      //   })
      //   .subscribe();

      // return () => {
      //   subscription.unsubscribe();
      // };
    } else {
      setLoading(false);
    }
  }, [userId, loadWeeklyStats]);

  // Add timeout for loading state
  useEffect(() => {
    const maxLoadingTimeout = setTimeout(() => {
      if (loading) {
        console.warn('⚠️ Weekly stats loading timeout');
        setLoading(false);
        setError('Loading timeout - please try again');
      }
    }, 10000);

    return () => clearTimeout(maxLoadingTimeout);
  }, [loading]);

  // Get formatted weekly progress text
  const getWeeklyProgressText = () => {
    if (error) {
      return "Error loading WNGS data";
    }
    if (weeklyStats.currentWeekWings === 0) {
      return "You've earned 0 WNGS this week";
    } else if (weeklyStats.currentWeekWings === 1) {
      return "You've earned 1 WNGS this week";
    } else {
      return `You've earned ${weeklyStats.currentWeekWings} WNGS this week`;
    }
  };

  return {
    weeklyStats,
    loading,
    error,
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



function HomeScreen() {
  const [showDailiesModal, setShowDailiesModal] = useState(false);
  const navigate = useNavigate();
  const { user } = useAuth();
  const { awardPassportStamp, hasStamp } = useStamps();
  const { quests, loading: questsLoading } = useQuests();

  // Use the weekly wings hook
  const { weeklyStats, loading, error, getWeeklyProgressText, refreshStats } = useWeeklyWings(user?.id);

  // Award passport stamp on first visit
  useEffect(() => {
    const awardWelcomeStamp = async () => {
      if (user && !hasStamp('received_passport')) {
        try {
          await awardPassportStamp();
          console.log('🏅 Welcome to Monarch! Passport stamp awarded!');
        } catch (error) {
          console.warn('Failed to award passport stamp:', error);
        }
      }
    };

    awardWelcomeStamp();
  }, [user, hasStamp, awardPassportStamp]);

  // Get active quests for display (show first 3 active quests)
  const activeQuests = quests ? quests.filter(q => !q.completed).slice(0, 3) : [];
  const activeQuestsCount = quests ? quests.filter(q => !q.completed).length : 0;

  // Mock stamp data for demonstration
  const stampData = {
    current: 0,
    total: 9,
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
            <ProgressSub>
              0 Active • Complete to earn rewards
            </ProgressSub>
            <QuestsSection>
              <div style={{ textAlign: 'center', padding: '1rem', color: 'rgba(255,255,255,0.6)', fontSize: '1.2rem' }}>
                No current quests
              </div>
            </QuestsSection>
          </HalfCardContent>
        </FullCard>
      </CardRow>

      <BottomRow>
        <HalfCard onClick={() => navigate('/passport')} aria-label="Go to Passport" style={{ cursor: 'pointer' }}>
          <HalfCardContent>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', width: '100%' }}>
              <div style={{ flex: 1 }}>
                <ProgressText>Passport</ProgressText>
                <ProgressSub>{stampData.current}/{stampData.total} stamps</ProgressSub>
              </div>
              <div style={{ 
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                marginLeft: '90px'
              }}>
                <div style={{ 
                  fontSize: '2.5rem', 
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  width: '80px',
                  height: '80px',
                  background: 'rgba(255, 176, 0, 0.1)',
                  border: '2px solid rgba(255, 176, 0, 0.3)',
                  borderRadius: '12px',
                  marginBottom: '0.5rem',
                  color: '#FFB000',
                  fontWeight: '700'
                }}>
                  {stampData.current}/{stampData.total}
                </div>
                <div style={{ 
                  fontSize: '0.8rem', 
                  color: 'rgba(255, 255, 255, 0.7)',
                  textAlign: 'center'
                }}>
                  View Passport
                </div>
              </div>
            </div>
          </HalfCardContent>
        </HalfCard>
        <HalfCard onClick={() => navigate('/season-roadmap')} aria-label="View Season Roadmap" style={{ cursor: 'pointer' }}>
          <HalfCardContent>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', width: '100%' }}>
              <div style={{ flex: 1 }}>
                <ProgressText>Digital Genesis</ProgressText>
                <ProgressSub>Spring '25</ProgressSub>
              </div>
              <div style={{ 
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                marginLeft: '90px'
              }}>
                <div style={{ 
                  fontSize: '2.5rem', 
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  width: '80px',
                  height: '80px',
                  background: 'rgba(255, 176, 0, 0.1)',
                  border: '2px solid rgba(255, 176, 0, 0.3)',
                  borderRadius: '12px',
                  marginBottom: '0.5rem',
                  color: '#FFB000',
                  fontWeight: '700'
                }}>
                  <LiveCountdown 
                    targetDate={new Date('2025-09-07T12:00:00')} 
                    size="2.5rem"
                    showLabels={false}
                    showSeconds={false}
                    showHours={false}
                    showMinutes={false}
                  />
                </div>
                <div style={{ 
                  fontSize: '0.8rem', 
                  color: 'rgba(255, 255, 255, 0.7)',
                  textAlign: 'center'
                }}>
                  Days Left
                </div>
              </div>
            </div>
          </HalfCardContent>
        </HalfCard>
      </BottomRow>

      {showDailiesModal && (
        <DailiesModal
          isOpen={showDailiesModal}
          onClose={() => setShowDailiesModal(false)}
          onQuestComplete={refreshStats}
        />
      )}
      
      {/* Version Indicator */}
      <div style={{
        position: 'fixed',
        bottom: '80px',
        left: '50%',
        transform: 'translateX(-50%)',
        fontSize: '0.7rem',
        color: 'rgba(255, 255, 255, 0.5)',
        textAlign: 'center',
        zIndex: 10,
        pointerEvents: 'none'
      }}>
        Beta v0.1.0
      </div>
    </Container>
  );
}

export default HomeScreen; 