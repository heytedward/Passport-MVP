import React, { useState, useEffect } from 'react';
import styled, { useTheme } from 'styled-components';
import GlassCard from '../components/GlassCard';
import RecentActivityModal from '../components/RecentActivityModal';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import { createClient } from '@supabase/supabase-js';

const Container = styled.div`
  min-height: 100vh;
  background: ${({ theme }) => theme.colors.background};
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 32px 8px 100px 8px;
  @media (min-width: 900px) {
    padding: 48px 0 120px 0;
  }
`;

const TopRow = styled.div`
  display: flex;
  flex-direction: row;
  gap: 24px;
  width: 100%;
  max-width: 900px;
  margin: 0 auto 32px auto;
`;

const gold = '#FFD700';

const ProfileHeader = styled(GlassCard)`
  flex: 1;
  width: 50%;
  min-width: 0;
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 32px 0 24px 0;
  border: 2.5px solid ${gold};
  box-shadow: 0 0 8px 0 rgba(255,215,0,0.10);
  cursor: pointer;
  transition: box-shadow 0.2s, transform 0.2s;
  &:hover, &:focus {
    box-shadow: 0 0 16px 0 rgba(255,215,0,0.25);
    transform: translateY(-2px) scale(1.02);
    outline: none;
  }
`;

const Avatar = styled.div`
  width: 80px;
  height: 80px;
  border-radius: 50%;
  background: ${({ theme }) => theme.gradients.primary};
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 2.8rem;
  color: #fff;
  box-shadow: 0 0 16px 0 #7F3FBF88;
  margin-bottom: 16px;
  border: 2.5px solid ${({ theme }) => theme.colors.accent};
`;

const ProfileName = styled.div`
  font-family: ${({ theme }) => theme.typography.fontFamily.heading};
  color: ${({ theme }) => theme.colors.text.primary};
  font-size: 1.3rem;
  font-weight: 700;
  margin-bottom: 4px;
`;

const ProfileEmail = styled.div`
  font-family: ${({ theme }) => theme.typography.fontFamily.body};
  color: ${({ theme }) => theme.colors.text.secondary};
  font-size: 1rem;
  margin-bottom: 8px;
`;

const BalanceCard = styled(GlassCard)`
  flex: 1;
  width: 50%;
  min-width: 0;
  display: flex;
  flex-direction: column;
  align-items: center;
  border: 2.5px solid ${gold};
  box-shadow: 0 0 8px 0 rgba(255,215,0,0.10);
  padding: 32px 0 24px 0;
  transition: box-shadow 0.2s, transform 0.2s;
  &:hover, &:focus {
    box-shadow: 0 0 16px 0 rgba(255,215,0,0.25);
    transform: translateY(-2px) scale(1.02);
    outline: none;
  }
`;

const BalanceLabel = styled.div`
  font-family: ${({ theme }) => theme.typography.fontFamily.heading};
  color: ${({ theme }) => theme.colors.accent};
  font-size: 1.3rem;
  margin-bottom: 8px;
`;

const BalanceValue = styled.div`
  font-family: ${({ theme }) => theme.typography.fontFamily.heading};
  color: ${({ theme }) => theme.colors.secondary};
  font-size: 2.5rem;
  font-weight: bold;
  letter-spacing: 2px;
`;

const SectionCard = styled(GlassCard)`
  width: 100%;
  max-width: 900px;
  margin: 0 auto 32px auto;
  padding: 32px 32px 24px 32px;
  border: 2.5px solid ${gold};
  box-shadow: 0 0 8px 0 rgba(255,215,0,0.10);
  transition: box-shadow 0.2s, transform 0.2s;
  @media (max-width: 600px) {
    padding: 20px 8px 16px 8px;
  }
  &:hover, &:focus {
    box-shadow: 0 0 16px 0 rgba(255,215,0,0.25);
    transform: translateY(-2px) scale(1.02);
    outline: none;
  }
`;



const SectionTitle = styled.h2`
  font-family: ${({ theme }) => theme.typography.fontFamily.heading};
  color: ${({ theme }) => theme.colors.text.primary};
  font-size: 1.5rem;
  margin-bottom: 24px;
  text-align: left;
  letter-spacing: 1px;
`;



const TransactionStatus = styled.div`
  font-family: ${({ theme }) => theme.typography.fontFamily.heading};
  color: ${({ theme }) => theme.colors.accent.green};
  font-size: ${({ theme }) => theme.typography.fontSize.body};
  font-weight: ${({ theme }) => theme.typography.fontWeight.bold};
`;

const TransactionDate = styled.div`
  font-family: ${({ theme }) => theme.typography.fontFamily.body};
  color: ${({ theme }) => theme.colors.text.secondary};
  font-size: ${({ theme }) => theme.typography.fontSize.body};
`;

const ProgressSection = styled(SectionCard)`
  display: flex;
  flex-direction: column;
  align-items: center;
  margin-bottom: 0;
`;

const ProgressBarContainer = styled.div`
  background: ${({ theme }) => theme.colors.glass.background};
  border: 3px solid ${({ theme }) => theme.colors.accent.gold};
  border-radius: 20px;
  height: 24px;
  margin-bottom: 24px;
  overflow: hidden;
  width: 100%;
  max-width: 700px;
`;

const ProgressBar = styled.div`
  height: 100%;
  border-radius: 20px;
  background: ${({ color, theme }) => color || theme.colors.accent.gold};
  width: ${({ value }) => value}%;
  transition: width ${({ theme }) => theme.animation.duration.slow};
`;

const AchievementsRow = styled.div`
  display: flex;
  justify-content: center;
  gap: 32px;
  margin-top: 24px;
`;

const AchievementIcon = styled.div`
  width: 64px;
  height: 64px;
  background: ${({ theme }) => theme.gradients.primary};
  border: 3px solid ${({ theme }) => theme.colors.accent.gold};
  border-radius: 20px;
  display: flex;
  align-items: center;
  justify-content: center;
  color: ${({ theme }) => theme.colors.text.primary};
  font-size: 2.2rem;
  box-shadow: ${({ theme }) => theme.effects.neonGlow};
  transition: all ${({ theme }) => theme.animation.duration.normal} ${({ theme }) => theme.animation.timing.smooth};
  
  &:hover {
    transform: translateY(-3px) scale(1.02);
  }
`;

const ModalOverlay = styled.div`
  position: fixed;
  top: 0; left: 0; right: 0; bottom: 0;
  background: rgba(18, 18, 18, 0.75);
  backdrop-filter: blur(16px);
  z-index: 2000;
  display: flex;
  align-items: center;
  justify-content: center;
  animation: fadeIn 0.3s;
  @keyframes fadeIn {
    from { opacity: 0; }
    to { opacity: 1; }
  }
`;

const ModalCard = styled.div`
  background: linear-gradient(135deg, rgba(30,30,30,0.95) 0%, rgba(127,63,191,0.13) 100%);
  border: 2.5px solid ${gold};
  border-radius: 22px;
  box-shadow: 0 8px 40px 0 rgba(255,215,0,0.10), 0 0 32px 0 rgba(127,63,191,0.10);
  padding: 2.2rem 1.5rem 1.5rem 1.5rem;
  min-width: 320px;
  max-width: 95vw;
  width: 100%;
  max-width: 400px;
  position: relative;
  display: flex;
  flex-direction: column;
  align-items: center;
  @media (max-width: 500px) {
    min-width: 0;
    padding: 1.2rem 0.7rem 1.2rem 0.7rem;
  }
`;

const ModalTitle = styled.h2`
  font-family: 'Outfit', sans-serif;
  font-size: 1.3rem;
  font-weight: 700;
  color: #fff;
  margin-bottom: 0.7rem;
  text-align: center;
`;

const ModalButton = styled.button`
  width: 100%;
  max-width: 320px;
  margin-bottom: 1rem;
  padding: 0.85rem 0;
  border-radius: 12px;
  border: 2px solid ${gold};
  background: transparent;
  color: #fff;
  font-family: 'Outfit', sans-serif;
  font-size: 1.08rem;
  font-weight: 600;
  cursor: pointer;
  transition: background 0.18s, color 0.18s;
  &:hover, &:focus {
    background: ${gold};
    color: #000000;
    outline: none;
  }
`;

const ModalClose = styled.button`
  position: absolute;
  top: 18px;
  right: 18px;
  background: none;
  border: none;
  color: #fff;
  font-size: 1.5rem;
  cursor: pointer;
  z-index: 10;
  border-radius: 50%;
  width: 36px;
  height: 36px;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: background 0.2s;
  &:hover {
    background: rgba(255,255,255,0.08);
  }
`;

const QRContainer = styled.div`
  width: 120px;
  height: 120px;
  background: #fff;
  border-radius: 16px;
  margin: 0 auto 1rem auto;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 2.5rem;
  color: #000000;
  box-shadow: 0 2px 12px 0 rgba(255,215,0,0.10);
`;

const ReferralList = styled.div`
  display: flex;
  flex-direction: column;
  gap: 1rem;
`;

const ReferralItem = styled.div`
  display: flex;
  align-items: center;
  gap: 1rem;
  padding: 1rem;
  background: rgba(255, 255, 255, 0.05);
  border-radius: 12px;
  border: 1px solid rgba(255, 255, 255, 0.1);
`;

const ReferralIcon = styled.div`
  width: 40px;
  height: 40px;
  border-radius: 8px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 1.2rem;
  background: ${({ theme }) => theme.colors.accent.purple};
`;

const ReferralContent = styled.div`
  flex: 1;
`;

const ReferralTitle = styled.div`
  color: ${({ theme }) => theme.colors.text.primary};
  font-weight: 600;
  margin-bottom: 0.25rem;
`;

const ReferralDescription = styled.div`
  color: ${({ theme }) => theme.colors.text.secondary};
  font-size: 0.875rem;
`;

const ReferralMeta = styled.div`
  display: flex;
  flex-direction: column;
  align-items: flex-end;
  gap: 0.25rem;
`;

const ReferralStatus = styled.div`
  color: ${({ theme }) => theme.colors.accent.green};
  font-weight: 600;
  font-size: 0.875rem;
`;

const ReferralReward = styled.div`
  color: ${({ theme }) => theme.colors.accent.gold};
  font-weight: 600;
  font-size: 0.875rem;
`;

const ShareReferralButton = styled.button`
  background: linear-gradient(135deg, #FFB000 0%, #FF9F1C 100%);
  border: 3px solid #FFB000;
  border-radius: 20px;
  color: #000;
  font-family: 'Outfit', sans-serif;
  font-weight: 700;
  font-size: 1rem;
  padding: 16px 32px;
  cursor: pointer;
  transition: all 0.3s cubic-bezier(0.4,0,0.2,1);
  margin-top: 24px;
  width: 100%;
  max-width: 200px;
  align-self: center;
  box-shadow: 
    0 0 20px 0 rgba(255,176,0,0.2),
    0 0 40px 0 rgba(255,176,0,0.1);
  
  &:hover {
    transform: translateY(-3px) scale(1.02);
    box-shadow: 
      0 0 30px 0 rgba(255,176,0,0.4),
      0 0 60px 0 rgba(255,176,0,0.2);
  }
  
  &:active {
    transform: translateY(-1px) scale(1.01);
  }
`;

// Activity item components that match the referral pattern
const ActivityList = styled.div`
  display: flex;
  flex-direction: column;
  gap: 18px;
`;

const ActivityItem = styled.div`
  display: flex;
  align-items: center;
  gap: 18px;
  padding: 24px;
  background: rgba(255, 255, 255, 0.05);
  border-radius: 20px;
  border: 3px solid ${({ theme }) => theme.colors.accent.gold};
  transition: all ${({ theme }) => theme.animation.duration.normal} ${({ theme }) => theme.animation.timing.smooth};
  
  &:hover {
    transform: translateY(-3px) scale(1.02);
    box-shadow: ${({ theme }) => theme.effects.neonGlow};
  }
`;

const ActivityIcon = styled.div`
  width: 48px;
  height: 48px;
  border-radius: 20px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 1.5rem;
  background: ${({ $type, theme }) => {
    switch ($type) {
      case 'scan': return theme.colors.accent.purple;
      case 'purchase': return theme.colors.accent.pink;
      case 'daily': return theme.colors.accent.green;
      default: return theme.colors.accent.purple;
    }
  }};
`;

const ActivityContent = styled.div`
  flex: 1;
`;

const ActivityTitle = styled.div`
  font-family: ${({ theme }) => theme.typography.fontFamily.heading};
  color: ${({ theme }) => theme.colors.text.primary};
  font-weight: ${({ theme }) => theme.typography.fontWeight.bold};
  font-size: ${({ theme }) => theme.typography.fontSize.body};
  margin-bottom: 8px;
`;

const ActivityDescription = styled.div`
  font-family: ${({ theme }) => theme.typography.fontFamily.body};
  color: ${({ theme }) => theme.colors.text.secondary};
  font-size: ${({ theme }) => theme.typography.fontSize.small};
`;

const ActivityMeta = styled.div`
  display: flex;
  flex-direction: column;
  align-items: flex-end;
  gap: 8px;
`;

const ActivityStatus = styled.div`
  font-family: ${({ theme }) => theme.typography.fontFamily.heading};
  color: ${({ theme }) => theme.colors.accent.green};
  font-weight: ${({ theme }) => theme.typography.fontWeight.bold};
  font-size: ${({ theme }) => theme.typography.fontSize.small};
`;

const ActivityAmount = styled.div`
  font-family: ${({ theme }) => theme.typography.fontFamily.heading};
  color: ${({ $positive, theme }) => 
    $positive ? theme.colors.accent.gold : theme.colors.accent.pink};
  font-weight: ${({ theme }) => theme.typography.fontWeight.bold};
  font-size: ${({ theme }) => theme.typography.fontSize.small};
`;

const ActivityDate = styled.div`
  font-family: ${({ theme }) => theme.typography.fontFamily.body};
  color: ${({ theme }) => theme.colors.text.secondary};
  font-size: 0.75rem;
`;

const ShareButton = styled(ModalButton)`
  margin-top: 0.5rem;
  display: block;
  margin-left: auto;
  margin-right: auto;
`;

const AdminButton = styled(ModalButton)`
  background: ${({ theme }) => theme.colors.accent.gold};
  color: #000;
  margin-top: 1rem;

  &:hover {
    background: #FFC72C;
  }
`;

const ActionButton = styled.button`
  background: ${({ theme }) => theme.colors.primary};
  color: ${({ theme }) => theme.colors.background};
  border: none;
  border-radius: 8px;
  padding: 12px 24px;
  font-family: ${({ theme }) => theme.typography.fontFamily.heading};
  font-size: 1rem;
  font-weight: bold;
  cursor: pointer;
  transition: all 0.2s ease-in-out;

  &:hover {
    transform: scale(1.05);
    box-shadow: 0 0 15px ${({ theme }) => theme.colors.primary};
  }
`;

function ReferralModal({ open, onClose, user }) {
  const [showQR, setShowQR] = useState(true);
  const handleOverlayClick = (e) => {
    if (e.target === e.currentTarget) onClose();
  };
  
  // Get user's profile picture or initial
  const getUserAvatar = () => {
    if (user?.user_metadata?.avatar_url) {
      return (
        <img 
          src={user.user_metadata.avatar_url} 
          alt="Profile" 
          style={{ 
            width: '100%', 
            height: '100%', 
            objectFit: 'cover', 
            borderRadius: '16px' 
          }} 
        />
      );
    } else {
      // Show user's initial in a styled avatar
      const initial = user?.user_metadata?.username ? 
        user.user_metadata.username.charAt(0).toUpperCase() : 
        user?.email ? user.email.charAt(0).toUpperCase() : 'U';
      
      return (
        <div style={{
          width: '100%',
          height: '100%',
          borderRadius: '16px',
          background: 'linear-gradient(135deg, #4C1C8C 0%, #7F3FBF 50%, #9D4EDD 100%)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          fontSize: '2.5rem',
          color: '#fff',
          fontWeight: 'bold'
        }}>
          {initial}
        </div>
      );
    }
  };
  
  return open ? (
    <ModalOverlay onClick={handleOverlayClick}>
      <ModalCard>
        <ModalClose aria-label="Close" onClick={onClose}>×</ModalClose>
        <ModalTitle>Share Referral</ModalTitle>
        {showQR && (
          <div style={{ width: '100%', textAlign: 'center', marginTop: '0.2rem' }}>
            <QRContainer>
              {getUserAvatar()}
            </QRContainer>
            <div style={{ color: '#FFD700', fontFamily: 'Outfit, sans-serif', fontWeight: 600, fontSize: '1.05rem', marginBottom: 8 }}>
              Join me on Monarch Passport!
            </div>
            <ModalButton
              style={{ marginBottom: 0 }}
              onClick={() => window.open('https://www.instagram.com/', '_blank')}
            >
              Share to Instagram Story
            </ModalButton>
          </div>
        )}
      </ModalCard>
    </ModalOverlay>
  ) : null;
}

function ProfileScreen() {
  const [showReferralModal, setShowReferralModal] = useState(false);
  const [showActivityModal, setShowActivityModal] = useState(false);
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();
  const { user, isAdmin } = useAuth();
  const theme = useTheme();

  useEffect(() => {
    const fetchProfile = async () => {
      if (user) {
        try {
          // Fetch user profile from Supabase
          const supabase = createClient(
            process.env.REACT_APP_SUPABASE_URL,
            process.env.REACT_APP_SUPABASE_ANON_KEY
          );
          
          const { data: userProfile, error } = await supabase
            .from('user_profiles')
            .select('*')
            .eq('id', user.id)
            .single();

          if (userProfile) {
            setProfile({
              name: userProfile.username || user.user_metadata?.username || user.email?.split('@')[0],
              email: user.email,
              avatar: null,
              joinDate: new Date(user.created_at).toLocaleDateString(),
              totalWings: userProfile.wings_balance || 0,
              level: Math.floor((userProfile.wings_balance || 0) / 100) + 1,
              achievements: 0,
              items: 0
            });
          } else {
            // Fallback if no profile found
            setProfile({
              name: user.user_metadata?.username || user.email?.split('@')[0] || 'User',
              email: user.email,
              avatar: null,
              joinDate: new Date(user.created_at).toLocaleDateString(),
              totalWings: 0,
              level: 1,
              achievements: 0,
              items: 0
            });
          }
        } catch (error) {
          console.error('Error fetching profile:', error);
          // Fallback profile
          setProfile({
            name: user.user_metadata?.username || user.email?.split('@')[0] || 'User',
            email: user.email,
            avatar: null,
            joinDate: new Date(user.created_at).toLocaleDateString(),
            totalWings: 0,
            level: 1,
            achievements: 0,
            items: 0
          });
        }
      }
      setLoading(false);
    };
    fetchProfile();
  }, [user]);

  const balance = 0;
  const transactions = [
    { type: 'Scan Quest Earn', amount: '+15 WNGS', positive: true, status: 'Completed', date: 'Mar 18, 2025' },
    { type: 'Shop Purchase', amount: '-25 WNGS', positive: false, status: 'Completed', date: 'Mar 15, 2025' },
    { type: 'Daily Reward', amount: '+5 WNGS', positive: true, status: 'Completed', date: 'Mar 14, 2025' },
  ];
  const progress = [
    { color: theme.colors.secondary, value: 60 },
    { color: theme.colors.accent, value: 80 },
  ];
  const invited = 3, pending = 2, joined = 1, rewards = 50;
  const referralPercent = Math.min((invited / 5) * 100, 100);

  return (
    <Container>
      <TopRow>
        <ProfileHeader onClick={() => navigate('/settings')}>
          <Avatar>
            {user?.user_metadata?.username ? user.user_metadata.username.charAt(0).toUpperCase() : 
             user?.email ? user.email.charAt(0).toUpperCase() : 'U'}
          </Avatar>
          <ProfileName>
            {user?.user_metadata?.username || user?.email?.split('@')[0] || 'User'}
          </ProfileName>
          <ProfileEmail>{user?.email || 'Not logged in'}</ProfileEmail>
        </ProfileHeader>
        <BalanceCard>
          <BalanceLabel>WNGS Balance</BalanceLabel>
          <BalanceValue>{profile?.totalWings?.toLocaleString() || '0'}</BalanceValue>
        </BalanceCard>
      </TopRow>

      <SectionCard style={{ display: 'flex', flexDirection: 'column' }}>
        <SectionTitle>Referral Tracker</SectionTitle>
        <ReferralList>
          <ReferralItem>
            <ReferralIcon>👥</ReferralIcon>
            <ReferralContent>
              <ReferralTitle>Friends Invited</ReferralTitle>
              <ReferralDescription>Shared referral code with friends</ReferralDescription>
            </ReferralContent>
            <ReferralMeta>
              <ReferralStatus>Completed</ReferralStatus>
              <ReferralReward>+50 WINGS</ReferralReward>
            </ReferralMeta>
          </ReferralItem>
          <ReferralItem>
            <ReferralIcon>✅</ReferralIcon>
            <ReferralContent>
              <ReferralTitle>Friend Joined</ReferralTitle>
              <ReferralDescription>New user joined via your referral</ReferralDescription>
            </ReferralContent>
            <ReferralMeta>
              <ReferralStatus>Completed</ReferralStatus>
              <ReferralReward>+25 WINGS</ReferralReward>
            </ReferralMeta>
          </ReferralItem>
        </ReferralList>
        <ShareReferralButton onClick={() => setShowReferralModal(true)}>
          Share Referral
        </ShareReferralButton>
      </SectionCard>

      <SectionCard as="button" onClick={() => setShowActivityModal(true)} style={{ cursor: 'pointer' }}>
        <SectionTitle>Recent Activity</SectionTitle>
        <ActivityList>
          {transactions.map((tx, i) => {
            const getActivityType = (type) => {
              if (type.includes('Scan')) return 'scan';
              if (type.includes('Purchase')) return 'purchase';
              if (type.includes('Daily')) return 'daily';
              return 'scan';
            };
            
            const getActivityIcon = (type) => {
              if (type.includes('Scan')) return '📱';
              if (type.includes('Purchase')) return '🛒';
              if (type.includes('Daily')) return '🎁';
              return '📱';
            };
            
            return (
              <ActivityItem key={i}>
                <ActivityIcon $type={getActivityType(tx.type)}>
                  {getActivityIcon(tx.type)}
                </ActivityIcon>
                <ActivityContent>
                  <ActivityTitle>{tx.type}</ActivityTitle>
                  <ActivityDescription>Transaction completed successfully</ActivityDescription>
                </ActivityContent>
                <ActivityMeta>
                  <ActivityStatus>{tx.status}</ActivityStatus>
                  <ActivityAmount $positive={tx.positive}>{tx.amount}</ActivityAmount>
                  <ActivityDate>{tx.date}</ActivityDate>
                </ActivityMeta>
              </ActivityItem>
            );
          })}
        </ActivityList>
        <div style={{ 
          textAlign: 'center', 
          marginTop: '24px', 
          color: '#FFD700', 
          fontSize: '0.9rem',
          fontWeight: '500'
        }}>
          Click to view all activity →
        </div>
      </SectionCard>

      <ReferralModal 
        open={showReferralModal} 
        onClose={() => setShowReferralModal(false)} 
        user={user}
      />

      <RecentActivityModal 
        isOpen={showActivityModal} 
        onClose={() => setShowActivityModal(false)} 
      />

      {isAdmin && (
        <AdminButton onClick={() => navigate('/admin')}>
          Admin Dashboard
        </AdminButton>
      )}
    </Container>
  );
}

export default ProfileScreen; 