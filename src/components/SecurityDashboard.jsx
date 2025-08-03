import React, { useState, useEffect } from 'react';
import styled from 'styled-components';
import { enhancedSecurity } from '../utils/enhancedSecurity';
import GlassCard from './GlassCard';
import GlowButton from './GlowButton';

const DashboardContainer = styled.div`
  padding: 2rem;
  max-width: 1200px;
  margin: 0 auto;
`;

const DashboardGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
  gap: 2rem;
  margin-bottom: 2rem;
`;

const SecurityCard = styled(GlassCard)`
  padding: 1.5rem;
  position: relative;
  overflow: hidden;
`;

const ThreatLevelIndicator = styled.div`
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  height: 4px;
  background: ${({ level }) => {
    switch (level) {
      case 'CRITICAL': return 'linear-gradient(90deg, #ff4757, #ff3838)';
      case 'HIGH': return 'linear-gradient(90deg, #ffa502, #ff6348)';
      case 'MEDIUM': return 'linear-gradient(90deg, #ffb142, #ffa502)';
      case 'LOW': return 'linear-gradient(90deg, #2ed573, #7bed9f)';
      default: return 'linear-gradient(90deg, #2ed573, #7bed9f)';
    }
  }};
`;

const MetricValue = styled.div`
  font-size: 2rem;
  font-weight: bold;
  color: ${({ theme }) => theme.colors.accent.gold};
  margin-bottom: 0.5rem;
`;

const MetricLabel = styled.div`
  font-size: 0.9rem;
  color: ${({ theme }) => theme.colors.text.secondary};
  text-transform: uppercase;
  letter-spacing: 0.5px;
`;

const AlertList = styled.div`
  max-height: 400px;
  overflow-y: auto;
`;

const AlertItem = styled.div`
  padding: 1rem;
  margin-bottom: 1rem;
  border-radius: 8px;
  background: ${({ severity }) => {
    switch (severity) {
      case 'HIGH': return 'rgba(255, 71, 87, 0.1)';
      case 'MEDIUM': return 'rgba(255, 165, 2, 0.1)';
      case 'LOW': return 'rgba(46, 213, 115, 0.1)';
      default: return 'rgba(116, 125, 136, 0.1)';
    }
  }};
  border-left: 4px solid ${({ severity }) => {
    switch (severity) {
      case 'HIGH': return '#ff4757';
      case 'MEDIUM': return '#ffa502';
      case 'LOW': return '#2ed573';
      default: return '#747d88';
    }
  }};
`;

const AlertHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 0.5rem;
`;

const AlertType = styled.div`
  font-weight: bold;
  color: ${({ theme }) => theme.colors.text.primary};
`;

const AlertTime = styled.div`
  font-size: 0.8rem;
  color: ${({ theme }) => theme.colors.text.secondary};
`;

const AlertData = styled.div`
  font-size: 0.9rem;
  color: ${({ theme }) => theme.colors.text.secondary};
  margin-top: 0.5rem;
`;

const ActionButtons = styled.div`
  display: flex;
  gap: 1rem;
  margin-top: 1rem;
`;

const StatusIndicator = styled.div`
  display: inline-block;
  width: 12px;
  height: 12px;
  border-radius: 50%;
  background: ${({ status }) => status === 'active' ? '#2ed573' : '#ff4757'};
  margin-right: 0.5rem;
`;

const SecurityDashboard = () => {
  const [securityStatus, setSecurityStatus] = useState(null);
  const [auditData, setAuditData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [refreshInterval, setRefreshInterval] = useState(null);

  useEffect(() => {
    loadSecurityData();
    
    // Set up auto-refresh every 30 seconds
    const interval = setInterval(loadSecurityData, 30000);
    setRefreshInterval(interval);

    return () => {
      if (interval) clearInterval(interval);
    };
  }, []);

  const loadSecurityData = async () => {
    try {
      setLoading(true);
      
      // Get security status
      const status = enhancedSecurity.getSecurityStatus();
      setSecurityStatus(status);
      
      // Get comprehensive audit data
      const audit = enhancedSecurity.auditSecurity();
      setAuditData(audit);
      
    } catch (error) {
      console.error('Error loading security data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleAcknowledgeAlert = (alertId) => {
    enhancedSecurity.acknowledgeAlert(alertId);
    loadSecurityData(); // Refresh data
  };

  const handleCleanup = () => {
    enhancedSecurity.cleanup();
    loadSecurityData(); // Refresh data
  };

  const formatTimestamp = (timestamp) => {
    return new Date(timestamp).toLocaleString();
  };

  const getThreatLevelColor = (level) => {
    switch (level) {
      case 'CRITICAL': return '#ff4757';
      case 'HIGH': return '#ff6348';
      case 'MEDIUM': return '#ffa502';
      case 'LOW': return '#2ed573';
      default: return '#747d88';
    }
  };

  if (loading) {
    return (
      <DashboardContainer>
        <SecurityCard>
          <div>Loading security dashboard...</div>
        </SecurityCard>
      </DashboardContainer>
    );
  }

  return (
    <DashboardContainer>
      <h1 style={{ color: '#FFB000', marginBottom: '2rem' }}>
        Security Dashboard
      </h1>

      {/* Threat Level Overview */}
      <SecurityCard style={{ marginBottom: '2rem' }}>
        <ThreatLevelIndicator level={securityStatus?.threatLevel} />
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div>
            <MetricValue style={{ color: getThreatLevelColor(securityStatus?.threatLevel) }}>
              {securityStatus?.threatLevel || 'UNKNOWN'}
            </MetricValue>
            <MetricLabel>Current Threat Level</MetricLabel>
          </div>
          <div style={{ textAlign: 'right' }}>
            <MetricValue>{securityStatus?.alerts?.length || 0}</MetricValue>
            <MetricLabel>Active Alerts</MetricLabel>
          </div>
        </div>
      </SecurityCard>

      {/* Security Metrics Grid */}
      <DashboardGrid>
        {/* QR Code Security */}
        <SecurityCard>
          <MetricValue>{auditData?.qrStatistics?.totalScans || 0}</MetricValue>
          <MetricLabel>Total QR Scans</MetricLabel>
          <div style={{ marginTop: '1rem', fontSize: '0.9rem' }}>
            <div>Blocked Codes: {auditData?.qrStatistics?.blockedCodes || 0}</div>
            <div>Unique Users: {auditData?.qrStatistics?.uniqueUsers || 0}</div>
            <div>Cached Verifications: {auditData?.qrStatistics?.cachedVerifications || 0}</div>
          </div>
        </SecurityCard>

        {/* Session Management */}
        <SecurityCard>
          <MetricValue>{auditData?.sessionStatistics?.activeSessions || 0}</MetricValue>
          <MetricLabel>Active Sessions</MetricLabel>
          <div style={{ marginTop: '1rem', fontSize: '0.9rem' }}>
            <div>Unique Users: {auditData?.sessionStatistics?.uniqueUsers || 0}</div>
            <div>Avg Session Age: {Math.round(auditData?.sessionStatistics?.averageSessionAge / 1000 / 60)}m</div>
          </div>
        </SecurityCard>

        {/* Security Events */}
        <SecurityCard>
          <MetricValue>{securityStatus?.metrics?.securityAlerts || 0}</MetricValue>
          <MetricLabel>Security Alerts</MetricLabel>
          <div style={{ marginTop: '1rem', fontSize: '0.9rem' }}>
            <div>Suspicious Activities: {securityStatus?.metrics?.suspiciousActivities || 0}</div>
            <div>Blocked Attempts: {securityStatus?.metrics?.blockedAttempts || 0}</div>
            <div>Failed Scans: {securityStatus?.metrics?.failedScans || 0}</div>
          </div>
        </SecurityCard>

        {/* System Health */}
        <SecurityCard>
          <MetricValue>
            <StatusIndicator status="active" />
            Healthy
          </MetricValue>
          <MetricLabel>System Status</MetricLabel>
          <div style={{ marginTop: '1rem', fontSize: '0.9rem' }}>
            <div>Input Validation: <StatusIndicator status="active" /> Active</div>
            <div>RBAC System: <StatusIndicator status="active" /> Active</div>
            <div>Rate Limiting: <StatusIndicator status="active" /> Active</div>
          </div>
        </SecurityCard>
      </DashboardGrid>

      {/* Security Alerts */}
      <SecurityCard>
        <h3 style={{ marginBottom: '1rem', color: '#FFB000' }}>Recent Security Alerts</h3>
        <AlertList>
          {securityStatus?.alerts?.length > 0 ? (
            securityStatus.alerts.map((alert) => (
              <AlertItem key={alert.id} severity={alert.severity}>
                <AlertHeader>
                  <AlertType>{alert.type}</AlertType>
                  <AlertTime>{formatTimestamp(alert.timestamp)}</AlertTime>
                </AlertHeader>
                <AlertData>
                  {JSON.stringify(alert.data, null, 2)}
                </AlertData>
                <ActionButtons>
                  <GlowButton
                    size="small"
                    onClick={() => handleAcknowledgeAlert(alert.id)}
                  >
                    Acknowledge
                  </GlowButton>
                </ActionButtons>
              </AlertItem>
            ))
          ) : (
            <div style={{ textAlign: 'center', color: '#747d88', padding: '2rem' }}>
              No active security alerts
            </div>
          )}
        </AlertList>
      </SecurityCard>

      {/* Action Buttons */}
      <div style={{ marginTop: '2rem', display: 'flex', gap: '1rem' }}>
        <GlowButton onClick={loadSecurityData}>
          Refresh Data
        </GlowButton>
        <GlowButton onClick={handleCleanup}>
          Run Cleanup
        </GlowButton>
      </div>

      {/* Detailed Audit Information */}
      <SecurityCard style={{ marginTop: '2rem' }}>
        <h3 style={{ marginBottom: '1rem', color: '#FFB000' }}>System Audit</h3>
        <div style={{ fontSize: '0.9rem', lineHeight: '1.6' }}>
          <div><strong>Security Events:</strong> {auditData?.securitySystem?.securityEvents || 0}</div>
          <div><strong>Input Validation Rate Limits:</strong> {auditData?.inputValidation?.rateLimits || 0}</div>
          <div><strong>Active Users:</strong> {auditData?.inputValidation?.activeUsers || 0}</div>
          <div><strong>RBAC Roles:</strong> {auditData?.rbac?.roles ? Object.keys(auditData.rbac.roles).length : 0}</div>
          <div><strong>Access Log Entries:</strong> {auditData?.rbac?.accessLogEntries || 0}</div>
        </div>
      </SecurityCard>
    </DashboardContainer>
  );
};

export default SecurityDashboard; 