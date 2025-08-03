import React, { useState, useEffect } from 'react';
import styled, { keyframes } from 'styled-components';

const fadeInOut = keyframes`
  0%, 100% { opacity: 0.7; }
  50% { opacity: 1; }
`;

const CountdownContainer = styled.div`
  display: flex;
  align-items: center;
  gap: 0.5rem;
  font-family: 'Outfit', sans-serif;
  font-weight: 600;
`;

const CountdownSegment = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  min-width: 40px;
`;

const CountdownNumber = styled.div`
  font-size: ${props => props.size || '1.2rem'};
  font-weight: 700;
  color: ${({ theme }) => theme.colors?.accent?.gold || '#FFB000'};
  text-shadow: 0 0 10px rgba(255, 176, 0, 0.3);
`;

const CountdownLabel = styled.div`
  font-size: 0.7rem;
  color: ${({ theme }) => theme.colors?.text?.secondary || '#6C6C6C'};
  text-transform: uppercase;
  letter-spacing: 0.5px;
  margin-top: 2px;
`;

const CountdownSeparator = styled.div`
  font-size: ${props => props.size || '1.2rem'};
  font-weight: 700;
  color: ${({ theme }) => theme.colors?.accent?.gold || '#FFB000'};
  margin: 0 0.2rem;
`;

const LiveCountdown = ({ 
  targetDate, 
  size = '1.2rem', 
  showLabels = true, 
  showSeconds = true,
  showHours = true,
  showMinutes = true,
  onComplete 
}) => {
  const [timeLeft, setTimeLeft] = useState({
    days: 0,
    hours: 0,
    minutes: 0,
    seconds: 0
  });

  useEffect(() => {
    const calculateTimeLeft = () => {
      const now = new Date().getTime();
      const target = new Date(targetDate).getTime();
      const difference = target - now;

      if (difference > 0) {
        const days = Math.floor(difference / (1000 * 60 * 60 * 24));
        const hours = Math.floor((difference % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
        const minutes = Math.floor((difference % (1000 * 60 * 60)) / (1000 * 60));
        const seconds = Math.floor((difference % (1000 * 60)) / 1000);

        setTimeLeft({ days, hours, minutes, seconds });
      } else {
        setTimeLeft({ days: 0, hours: 0, minutes: 0, seconds: 0 });
        if (onComplete) {
          onComplete();
        }
      }
    };

    // Calculate immediately
    calculateTimeLeft();

    // Update every second
    const timer = setInterval(calculateTimeLeft, 1000);

    return () => clearInterval(timer);
  }, [targetDate, onComplete]);

  const formatNumber = (num) => num.toString().padStart(2, '0');

  return (
    <CountdownContainer>
      <CountdownSegment>
        <CountdownNumber size={size}>{formatNumber(timeLeft.days)}</CountdownNumber>
        {showLabels && <CountdownLabel>Days</CountdownLabel>}
      </CountdownSegment>
      
      {showHours && (
        <>
          <CountdownSeparator size={size}>:</CountdownSeparator>
          
          <CountdownSegment>
            <CountdownNumber size={size}>{formatNumber(timeLeft.hours)}</CountdownNumber>
            {showLabels && <CountdownLabel>Hours</CountdownLabel>}
          </CountdownSegment>
        </>
      )}
      
      {showMinutes && (
        <>
          <CountdownSeparator size={size}>:</CountdownSeparator>
          
          <CountdownSegment>
            <CountdownNumber size={size}>{formatNumber(timeLeft.minutes)}</CountdownNumber>
            {showLabels && <CountdownLabel>Mins</CountdownLabel>}
          </CountdownSegment>
        </>
      )}
      
      {showSeconds && (
        <>
          <CountdownSeparator size={size}>:</CountdownSeparator>
          
          <CountdownSegment>
            <CountdownNumber size={size}>{formatNumber(timeLeft.seconds)}</CountdownNumber>
            {showLabels && <CountdownLabel>Secs</CountdownLabel>}
          </CountdownSegment>
        </>
      )}
    </CountdownContainer>
  );
};

export default LiveCountdown; 