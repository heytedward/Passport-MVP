import React, { useState, useEffect } from 'react';
import styled from 'styled-components';
import { createClient } from '@supabase/supabase-js';
import GlassCard from './GlassCard';

const supabase = createClient(
  process.env.REACT_APP_SUPABASE_URL,
  process.env.REACT_APP_SUPABASE_ANON_KEY
);

const LeaderboardCard = styled(GlassCard)`
  padding: 2rem;
  margin: 1rem 0;
`;

const LeaderboardItem = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 1rem;
  border-radius: 12px;
  background: rgba(255, 255, 255, 0.05);
  margin-bottom: 0.5rem;
  
  ${({ rank }) => rank <= 3 && `
    border: 2px solid ${rank === 1 ? '#FFD700' : rank === 2 ? '#C0C0C0' : '#CD7F32'};
    background: rgba(${rank === 1 ? '255,215,0' : rank === 2 ? '192,192,192' : '205,127,50'}, 0.1);
  `}
`;

const RankBadge = styled.div`
  width: 40px;
  height: 40px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: bold;
  background: ${({ rank }) => 
    rank === 1 ? '#FFD700' : 
    rank === 2 ? '#C0C0C0' : 
    rank === 3 ? '#CD7F32' : '#666'};
  color: ${({ rank }) => rank <= 3 ? '#000' : '#fff'};
`;

const UserInfo = styled.div`
  flex: 1;
  margin-left: 1rem;
`;

const UserName = styled.div`
  font-weight: 600;
  color: #fff;
`;

const ReferralCount = styled.div`
  font-size: 0.9rem;
  color: #aaa;
`;

const WingsEarned = styled.div`
  font-weight: bold;
  color: #FFB000;
`;

const ReferralLeaderboard = ({ maxItems = 10 }) => {
  const [leaderboard, setLeaderboard] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadLeaderboard();
  }, []);

  const loadLeaderboard = async () => {
    try {
      const { data, error } = await supabase
        .from('user_profiles')
        .select('id, display_name, username, total_referrals, referral_wings_earned')
        .gt('total_referrals', 0)
        .order('total_referrals', { ascending: false })
        .order('referral_wings_earned', { ascending: false })
        .limit(maxItems);

      if (error) throw error;

      const formattedData = data.map((user, index) => ({
        rank: index + 1,
        name: user.display_name || user.username || `User ${user.id.slice(0, 8)}`,
        referrals: user.total_referrals,
        wingsEarned: user.referral_wings_earned
      }));

      setLeaderboard(formattedData);
    } catch (error) {
      console.error('Error loading leaderboard:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <LeaderboardCard>
        <h3>🏆 Referral Leaderboard</h3>
        <div>Loading...</div>
      </LeaderboardCard>
    );
  }

  return (
    <LeaderboardCard>
      <h3 style={{ marginBottom: '1.5rem', color: '#FFD700' }}>🏆 Referral Leaderboard</h3>
      {leaderboard.map((user) => (
        <LeaderboardItem key={user.rank} rank={user.rank}>
          <RankBadge rank={user.rank}>
            {user.rank <= 3 ? ['🥇', '🥈', '🥉'][user.rank - 1] : user.rank}
          </RankBadge>
          <UserInfo>
            <UserName>{user.name}</UserName>
            <ReferralCount>{user.referrals} referrals</ReferralCount>
          </UserInfo>
          <WingsEarned>{user.wingsEarned} WNGS</WingsEarned>
        </LeaderboardItem>
      ))}
    </LeaderboardCard>
  );
};

export default ReferralLeaderboard; 