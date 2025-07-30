import React, { useState, useEffect } from 'react';
import { supabase } from '../utils/supabaseClient';
import { useAuth } from '../hooks/useAuth';
import styled from 'styled-components';

const TestContainer = styled.div`
  padding: 20px;
  background: rgba(255, 255, 255, 0.1);
  border-radius: 12px;
  backdrop-filter: blur(10px);
  border: 1px solid rgba(255, 255, 255, 0.2);
  margin: 20px;
  max-width: 800px;
`;

const TestSection = styled.div`
  margin: 15px 0;
  padding: 15px;
  background: rgba(0, 0, 0, 0.2);
  border-radius: 8px;
  border-left: 4px solid ${props => props.status === 'success' ? '#4CAF50' : props.status === 'error' ? '#f44336' : '#FFB000'};
`;

const TestTitle = styled.h3`
  color: #FFB000;
  margin: 0 0 10px 0;
  font-size: 16px;
`;

const TestResult = styled.div`
  font-family: 'JetBrains Mono', monospace;
  font-size: 12px;
  color: ${props => props.status === 'success' ? '#4CAF50' : props.status === 'error' ? '#f44336' : '#FFB000'};
  white-space: pre-wrap;
  word-break: break-word;
`;

const Button = styled.button`
  background: linear-gradient(135deg, #FFB000, #FFD700);
  border: none;
  padding: 10px 20px;
  border-radius: 8px;
  color: #000;
  font-weight: bold;
  cursor: pointer;
  margin: 5px;
  transition: all 0.3s ease;

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

const StatusIndicator = styled.div`
  display: inline-block;
  width: 12px;
  height: 12px;
  border-radius: 50%;
  background: ${props => props.status === 'success' ? '#4CAF50' : props.status === 'error' ? '#f44336' : '#FFB000'};
  margin-right: 8px;
`;

const SupabaseConnectionTest = () => {
  const { user, profile, loading: authLoading } = useAuth();
  const [testResults, setTestResults] = useState({});
  const [running, setRunning] = useState(false);
  const [overallStatus, setOverallStatus] = useState('idle');

  const runTest = async (testName, testFunction) => {
    setTestResults(prev => ({
      ...prev,
      [testName]: { status: 'running', message: 'Running test...' }
    }));

    try {
      const result = await testFunction();
      setTestResults(prev => ({
        ...prev,
        [testName]: { status: 'success', message: result }
      }));
      return true;
    } catch (error) {
      setTestResults(prev => ({
        ...prev,
        [testName]: { status: 'error', message: error.message }
      }));
      return false;
    }
  };

  const testBasicConnection = async () => {
    const { data, error } = await supabase.from('user_profiles').select('count').limit(1);
    if (error) throw error;
    return `Connected successfully. Found ${data?.length || 0} profiles.`;
  };

  const testAuthentication = async () => {
    const { data: { session }, error } = await supabase.auth.getSession();
    if (error) throw error;
    return session ? `User authenticated: ${session.user.email}` : 'No active session';
  };

  const testDatabaseTables = async () => {
    const tables = ['user_profiles', 'rewards', 'user_closet', 'user_activity', 'admin_settings'];
    const results = [];

    for (const table of tables) {
      try {
        const { data, error } = await supabase.from(table).select('*').limit(1);
        if (error) {
          results.push(`${table}: ❌ ${error.message}`);
        } else {
          results.push(`${table}: ✅ Accessible`);
        }
      } catch (err) {
        results.push(`${table}: ❌ ${err.message}`);
      }
    }

    return results.join('\n');
  };

  const testRowLevelSecurity = async () => {
    const { data: profiles, error: profilesError } = await supabase
      .from('user_profiles')
      .select('id, email')
      .limit(5);

    const { data: rewards, error: rewardsError } = await supabase
      .from('rewards')
      .select('reward_id, name')
      .limit(5);

    let result = '';
    if (profilesError) {
      result += `user_profiles RLS: ❌ ${profilesError.message}\n`;
    } else {
      result += `user_profiles RLS: ✅ Found ${profiles?.length || 0} profiles\n`;
    }

    if (rewardsError) {
      result += `rewards RLS: ❌ ${rewardsError.message}\n`;
    } else {
      result += `rewards RLS: ✅ Found ${rewards?.length || 0} rewards\n`;
    }

    return result;
  };

  const testUserProfile = async () => {
    if (!user) {
      return 'No authenticated user';
    }

    const { data: profile, error } = await supabase
      .from('user_profiles')
      .select('*')
      .eq('id', user.id)
      .single();

    if (error) throw error;
    return `Profile loaded: ${profile.email} (WNGS: ${profile.wings_balance})`;
  };

  const testRewards = async () => {
    const { data: rewards, error } = await supabase
      .from('rewards')
      .select('reward_id, name, category, rarity')
      .limit(10);

    if (error) throw error;
    return `Found ${rewards?.length || 0} rewards:\n${rewards?.map(r => `- ${r.name} (${r.category}, ${r.rarity})`).join('\n')}`;
  };

  const testUserCloset = async () => {
    if (!user) {
      return 'No authenticated user';
    }

    const { data: closet, error } = await supabase
      .from('user_closet')
      .select('*')
      .eq('user_id', user.id)
      .order('earned_date', { ascending: false });

    if (error) throw error;
    return `User closet: ${closet?.length || 0} items`;
  };

  const testRealTime = async () => {
    return new Promise((resolve) => {
      const channel = supabase
        .channel('test-channel')
        .on('postgres_changes', 
          { event: 'INSERT', schema: 'public', table: 'user_activity' },
          (payload) => {
            resolve('Real-time subscription working');
          }
        )
        .subscribe();

      // Timeout after 3 seconds
      setTimeout(() => {
        channel.unsubscribe();
        resolve('Real-time subscription established (no events received)');
      }, 3000);
    });
  };

  const runAllTests = async () => {
    setRunning(true);
    setOverallStatus('running');

    const tests = [
      { name: 'Basic Connection', fn: testBasicConnection },
      { name: 'Authentication', fn: testAuthentication },
      { name: 'Database Tables', fn: testDatabaseTables },
      { name: 'Row Level Security', fn: testRowLevelSecurity },
      { name: 'User Profile', fn: testUserProfile },
      { name: 'Rewards', fn: testRewards },
      { name: 'User Closet', fn: testUserCloset },
      { name: 'Real-time', fn: testRealTime }
    ];

    let passedTests = 0;
    for (const test of tests) {
      const success = await runTest(test.name, test.fn);
      if (success) passedTests++;
    }

    setOverallStatus(passedTests === tests.length ? 'success' : 'error');
    setRunning(false);
  };

  const clearResults = () => {
    setTestResults({});
    setOverallStatus('idle');
  };

  useEffect(() => {
    // Auto-run basic tests when component mounts
    if (!authLoading) {
      runTest('Basic Connection', testBasicConnection);
      runTest('Authentication', testAuthentication);
    }
  }, [authLoading]);

  return (
    <TestContainer>
      <h2 style={{ color: '#FFB000', marginBottom: '20px' }}>
        🦋 Supabase Connection Test
      </h2>

      <div style={{ marginBottom: '20px' }}>
        <Button onClick={runAllTests} disabled={running}>
          {running ? 'Running Tests...' : 'Run All Tests'}
        </Button>
        <Button onClick={clearResults} disabled={running}>
          Clear Results
        </Button>
      </div>

      <div style={{ marginBottom: '20px', padding: '10px', background: 'rgba(0,0,0,0.3)', borderRadius: '8px' }}>
        <strong>Auth Status:</strong> {authLoading ? 'Loading...' : user ? `Authenticated (${user.email})` : 'Not authenticated'}
        <br />
        <strong>Profile:</strong> {profile ? `Loaded (WNGS: ${profile.wings_balance})` : 'Not loaded'}
      </div>

      {Object.entries(testResults).map(([testName, result]) => (
        <TestSection key={testName} status={result.status}>
          <TestTitle>
            <StatusIndicator status={result.status} />
            {testName}
          </TestTitle>
          <TestResult status={result.status}>
            {result.message}
          </TestResult>
        </TestSection>
      ))}

      {Object.keys(testResults).length > 0 && (
        <TestSection status={overallStatus}>
          <TestTitle>
            <StatusIndicator status={overallStatus} />
            Overall Status
          </TestTitle>
          <TestResult status={overallStatus}>
            {overallStatus === 'success' && 'All tests passed! ✅'}
            {overallStatus === 'error' && 'Some tests failed. Check the results above. ❌'}
            {overallStatus === 'running' && 'Tests are running... ⏳'}
          </TestResult>
        </TestSection>
      )}
    </TestContainer>
  );
};

export default SupabaseConnectionTest; 