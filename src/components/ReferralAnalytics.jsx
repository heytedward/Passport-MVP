import React, { useState, useEffect } from 'react';
import styled from 'styled-components';
import { createClient } from '@supabase/supabase-js';
import GlassCard from './GlassCard';

const supabase = createClient(
  process.env.REACT_APP_SUPABASE_URL,
  process.env.REACT_APP_SUPABASE_ANON_KEY
);

const AnalyticsCard = styled(GlassCard)`
  padding: 1.5rem;
  margin: 1rem 0;
`;

const MetricGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(150px, 1fr));
  gap: 1rem;
  margin-bottom: 1.5rem;
`;

const Metric = styled.div`
  text-align: center;
  padding: 1rem;
  background: rgba(255, 255, 255, 0.05);
  border-radius: 12px;
`;

const MetricValue = styled.div`
  font-size: 2rem;
  font-weight: bold;
  color: ${({ color }) => color || '#FFD700'};
`;

const MetricLabel = styled.div`
  font-size: 0.9rem;
  color: #aaa;
  margin-top: 0.5rem;
`;

const ProgressChart = styled.div`
  background: rgba(255, 255, 255, 0.05);
  border-radius: 12px;
  padding: 1rem;
  margin-top: 1rem;
`;

const ProgressBar = styled.div`
  width: 100%;
  height: 8px;
  background: rgba(255, 255, 255, 0.1);
  border-radius: 4px;
  overflow: hidden;
  margin-bottom: 0.5rem;
`;

const ProgressFill = styled.div`
  height: 100%;
  background: linear-gradient(90deg, #4C1C8C, #FFB000);
  width: ${({ percentage }) => percentage}%;
  border-radius: 4px;
  transition: width 0.5s ease;
`;

const ReferralAnalytics = ({ userId }) => {
  const [analytics, setAnalytics] = useState({
    totalReferrals: 0,
    conversionRate: 0,
    totalWingsEarned: 0,
    avgWingsPerReferral: 0,
    monthlyReferrals: 0,
    weeklyReferrals: 0
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (userId) {
      loadAnalytics();
    }
  }, [userId]);

  const loadAnalytics = async () => {
    try {
      // Get referral data
      const { data: referrals, error: referralsError } = await supabase
        .from('referrals')
        .select('status, created_at, referrer_wings_earned')
        .eq('referrer_id', userId);

      if (referralsError) throw referralsError;

      // Calculate metrics
      const now = new Date();
      const oneWeekAgo = new Date(now - 7 * 24 * 60 * 60 * 1000);
      const oneMonthAgo = new Date(now - 30 * 24 * 60 * 60 * 1000);

      const totalReferrals = referrals.length;
      const completedReferrals = referrals.filter(r => r.status === 'completed').length;
      const conversionRate = totalReferrals > 0 ? (completedReferrals / totalReferrals) * 100 : 0;
      const totalWingsEarned = referrals.reduce((sum, r) => sum + (r.referrer_wings_earned || 0), 0);
      const avgWingsPerReferral = completedReferrals > 0 ? totalWingsEarned / completedReferrals : 0;
      
      const weeklyReferrals = referrals.filter(r => new Date(r.created_at) > oneWeekAgo).length;
      const monthlyReferrals = referrals.filter(r => new Date(r.created_at) > oneMonthAgo).length;

      setAnalytics({
        totalReferrals,
        conversionRate: Math.round(conversionRate),
        totalWingsEarned,
        avgWingsPerReferral: Math.round(avgWingsPerReferral),
        monthlyReferrals,
        weeklyReferrals
      });

    } catch (error) {
      console.error('Error loading analytics:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <AnalyticsCard>
        <h3>📊 Your Referral Analytics</h3>
        <div>Loading analytics...</div>
      </AnalyticsCard>
    );
  }

  return (
    <AnalyticsCard>
      <h3 style={{ marginBottom: '1.5rem', color: '#FFD700' }}>📊 Your Referral Analytics</h3>
      
      <MetricGrid>
        <Metric>
          <MetricValue>{analytics.totalReferrals}</MetricValue>
          <MetricLabel>Total Referrals</MetricLabel>
        </Metric>
        <Metric>
          <MetricValue color="#10B981">{analytics.conversionRate}%</MetricValue>
          <MetricLabel>Conversion Rate</MetricLabel>
        </Metric>
        <Metric>
          <MetricValue color="#FFB000">{analytics.totalWingsEarned}</MetricValue>
          <MetricLabel>WINGS Earned</MetricLabel>
        </Metric>
        <Metric>
          <MetricValue color="#9B4BFF">{analytics.avgWingsPerReferral}</MetricValue>
          <MetricLabel>Avg per Referral</MetricLabel>
        </Metric>
      </MetricGrid>

      <ProgressChart>
        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
          <span style={{ color: '#fff', fontSize: '0.9rem' }}>Weekly Progress</span>
          <span style={{ color: '#aaa', fontSize: '0.9rem' }}>{analytics.weeklyReferrals}/5 goal</span>
        </div>
        <ProgressBar>
          <ProgressFill percentage={Math.min((analytics.weeklyReferrals / 5) * 100, 100)} />
        </ProgressBar>
      </ProgressChart>

      <ProgressChart>
        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
          <span style={{ color: '#fff', fontSize: '0.9rem' }}>Monthly Progress</span>
          <span style={{ color: '#aaa', fontSize: '0.9rem' }}>{analytics.monthlyReferrals}/20 goal</span>
        </div>
        <ProgressBar>
          <ProgressFill percentage={Math.min((analytics.monthlyReferrals / 20) * 100, 100)} />
        </ProgressBar>
      </ProgressChart>
    </AnalyticsCard>
  );
};

export default ReferralAnalytics; 