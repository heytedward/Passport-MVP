import React from 'react';
import styled from 'styled-components';

const ErrorContainer = styled.div`
  background: var(--theme-card-bg, rgba(255, 255, 255, 0.1));
  border: var(--theme-card-border, 1px solid rgba(255, 255, 255, 0.2));
  border-radius: 12px;
  padding: 20px;
  margin: 16px 0;
  backdrop-filter: var(--theme-card-blur, blur(10px));
  text-align: center;
`;

const ErrorTitle = styled.h3`
  color: var(--theme-error, #EF4444);
  font-size: 1.125rem;
  font-weight: 600;
  margin-bottom: 8px;
`;

const ErrorMessage = styled.p`
  color: var(--theme-text-secondary, #CCCCCC);
  font-size: 0.875rem;
  margin-bottom: 16px;
  line-height: 1.5;
`;

const RetryButton = styled.button`
  background: var(--theme-button-gradient, linear-gradient(135deg, #FFB000 0%, #FFD700 100%));
  color: var(--theme-text-primary, #FFFFFF);
  border: none;
  border-radius: 8px;
  padding: 8px 16px;
  font-size: 0.875rem;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.3s ease;

  &:hover {
    background: var(--theme-button-hover, linear-gradient(135deg, #E69A00 0%, #E6C200 100%));
    transform: translateY(-1px);
  }
`;

const ErrorDetails = styled.details`
  margin-top: 12px;
  text-align: left;
`;

const ErrorSummary = styled.summary`
  color: var(--theme-text-muted, #999999);
  font-size: 0.75rem;
  cursor: pointer;
  margin-bottom: 8px;
  
  &:hover {
    color: var(--theme-text-secondary, #CCCCCC);
  }
`;

const ErrorCode = styled.pre`
  background: rgba(0, 0, 0, 0.3);
  border-radius: 4px;
  padding: 8px;
  font-size: 0.75rem;
  color: var(--theme-text-muted, #999999);
  overflow-x: auto;
  white-space: pre-wrap;
  word-break: break-word;
`;

class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { 
      hasError: false, 
      error: null, 
      errorInfo: null,
      errorCount: 0
    };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true };
  }

  componentDidCatch(error, errorInfo) {
    console.error('🦋 Monarch Passport Error Boundary caught an error:', error, errorInfo);
    
    this.setState(prevState => ({
      error: error,
      errorInfo: errorInfo,
      errorCount: prevState.errorCount + 1
    }));

    // Log error to console for debugging
    console.group('🦋 Monarch Passport Error Details');
    console.error('Error:', error);
    console.error('Error Info:', errorInfo);
    console.error('Component Stack:', errorInfo.componentStack);
    console.groupEnd();

    // In production, you might want to send this to an error reporting service
    if (process.env.NODE_ENV === 'production') {
      // Example: sendErrorToService(error, errorInfo);
    }
  }

  handleRetry = () => {
    this.setState({ 
      hasError: false, 
      error: null, 
      errorInfo: null 
    });
  };

  handleReset = () => {
    this.setState({ 
      hasError: false, 
      error: null, 
      errorInfo: null,
      errorCount: 0
    });
    
    // Force a page reload if there have been multiple errors
    if (this.state.errorCount > 2) {
      window.location.reload();
    }
  };

  render() {
    if (this.state.hasError) {
      const isMultipleErrors = this.state.errorCount > 1;
      
      return (
        <ErrorContainer>
          <ErrorTitle>
            {isMultipleErrors ? '🦋 Multiple Errors Detected' : '🦋 Monarch Passport Error'}
          </ErrorTitle>
          
          <ErrorMessage>
            {isMultipleErrors 
              ? 'Something went wrong multiple times. This might be a persistent issue.'
              : 'Something went wrong with this component. This might be a temporary issue.'
            }
          </ErrorMessage>

          <div style={{ display: 'flex', gap: '8px', justifyContent: 'center' }}>
            <RetryButton onClick={this.handleRetry}>
              Try Again
            </RetryButton>
            
            {isMultipleErrors && (
              <RetryButton onClick={this.handleReset}>
                Reset & Reload
              </RetryButton>
            )}
          </div>

          {process.env.NODE_ENV === 'development' && this.state.error && (
            <ErrorDetails>
              <ErrorSummary>Show Error Details (Development Only)</ErrorSummary>
              <ErrorCode>
                {this.state.error.toString()}
                {this.state.errorInfo && this.state.errorInfo.componentStack}
              </ErrorCode>
            </ErrorDetails>
          )}
        </ErrorContainer>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary; 