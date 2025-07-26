# 🔒 Monarch Passport MVP - Security Guide

## 🚨 IMMEDIATE ACTIONS REQUIRED

### If you just exposed .env file:
1. **IMMEDIATE**: Rotate all Supabase API keys
2. **IMMEDIATE**: Check Supabase logs for unauthorized access
3. **IMMEDIATE**: Run `npm run security:audit` to scan for other issues
4. **WITHIN 1 HOUR**: Update environment variables in Vercel
5. **WITHIN 2 HOURS**: Review and update all security measures

---

## 🛡️ Security Setup Overview

This project implements a comprehensive security framework to protect against:
- Environment variable exposure
- API key leaks
- Database security breaches
- File upload vulnerabilities
- Authentication bypasses
- Code injection attacks

---

## 📋 Security Tools & Scripts

### Available Commands

```bash
# Environment validation
npm run validate-env

# Security scanning
npm run security:scan

# Security monitoring
npm run security:monitor

# Full security audit
npm run security:audit

# Complete security check
npm run security:full
```

### Pre-commit Hooks
- **Automatic**: Environment validation before every commit
- **Automatic**: Security scanning before every commit
- **Automatic**: Detection of .env files in commits
- **Automatic**: Detection of potential secrets in commits

---

## 🔐 Environment Variables Security

### Required Variables
```bash
REACT_APP_SUPABASE_URL=https://your-project.supabase.co
REACT_APP_SUPABASE_ANON_KEY=your-anon-key
```

### Optional Variables
```bash
REACT_APP_SUPABASE_SERVICE_ROLE_KEY=your-service-role-key
REACT_APP_DEBUG_MODE=false
REACT_APP_BETA_FEATURES_ENABLED=false
```

### Security Rules
1. **NEVER** commit `.env` files to Git
2. **NEVER** hardcode API keys in source code
3. **ALWAYS** use `REACT_APP_` prefix for client-side variables
4. **REGULARLY** rotate API keys
5. **MONITOR** for unauthorized access

---

## 🛠️ Security Features

### 1. Environment Validation
- **Automatic**: Checks for required environment variables
- **Automatic**: Validates environment variable formats
- **Automatic**: Detects potential sensitive data patterns
- **Automatic**: Warns about missing recommended variables

### 2. Security Scanning
- **Code Analysis**: Scans for hardcoded credentials
- **Pattern Detection**: Identifies potential security vulnerabilities
- **Dependency Check**: Audits npm packages for vulnerabilities
- **Git History**: Checks for exposed secrets in commit history

### 3. Security Monitoring
- **Real-time**: Monitors for suspicious activity
- **Alerting**: Notifies about potential security threats
- **Logging**: Comprehensive security event logging
- **Pattern Recognition**: Detects attack patterns

### 4. Pre-commit Protection
- **Automatic**: Prevents commits with .env files
- **Automatic**: Blocks commits with potential secrets
- **Automatic**: Runs security validation before commits
- **Automatic**: Ensures code quality standards

---

## 🚨 Incident Response

### Emergency Contacts
- **Security Lead**: [Add contact info]
- **Development Lead**: [Add contact info]
- **Supabase Support**: https://supabase.com/support
- **Vercel Support**: https://vercel.com/support

### Immediate Response Steps
1. **STOP** all development activities
2. **ASSESS** the scope of the incident
3. **DOCUMENT** all evidence and actions
4. **NOTIFY** security team immediately
5. **CONTAIN** the threat
6. **RECOVER** from the incident

### Detailed Procedures
See [INCIDENT_RESPONSE.md](./INCIDENT_RESPONSE.md) for complete incident response procedures.

---

## 🔍 Security Auditing

### Daily Checks
```bash
# Run security scan
npm run security:scan

# Check for dependency vulnerabilities
npm audit

# Validate environment
npm run validate-env
```

### Weekly Checks
```bash
# Full security audit
npm run security:audit

# Review security logs
tail -f logs/security.log

# Check for unusual activity
npm run security:monitor
```

### Monthly Checks
- Complete security audit (see [SECURITY_AUDIT.md](./SECURITY_AUDIT.md))
- Review and update security procedures
- Conduct security training
- Update incident response plan

---

## 🛡️ Best Practices

### Development
1. **ALWAYS** run security checks before committing
2. **NEVER** commit sensitive data
3. **ALWAYS** validate user inputs
4. **NEVER** trust client-side data
5. **ALWAYS** use HTTPS in production

### Deployment
1. **ALWAYS** validate environment variables
2. **NEVER** deploy with security warnings
3. **ALWAYS** monitor for unusual activity
4. **NEVER** skip security checks
5. **ALWAYS** keep dependencies updated

### Monitoring
1. **DAILY**: Check security alerts
2. **WEEKLY**: Review access logs
3. **MONTHLY**: Conduct security audits
4. **QUARTERLY**: Update security procedures

---

## 📊 Security Metrics

### Key Performance Indicators
- Number of security incidents
- Time to detect security issues
- Time to resolve security issues
- Number of failed login attempts
- Number of suspicious activities detected

### Monitoring Dashboard
- Real-time security alerts
- Failed login attempt tracking
- Suspicious IP monitoring
- File upload activity
- API call rate monitoring

---

## 🔧 Configuration

### Security Scanner Configuration
Edit `scripts/security-scan.js` to customize:
- Security patterns to detect
- File types to scan
- Directories to exclude
- Alert thresholds

### Monitoring Configuration
Edit `scripts/security-monitor.js` to customize:
- Alert thresholds
- Time windows
- Notification methods
- Log file locations

### Pre-commit Configuration
Edit `.husky/pre-commit` to customize:
- Pre-commit checks
- Validation rules
- Error messages

---

## 📚 Additional Resources

### Documentation
- [Security Audit Checklist](./SECURITY_AUDIT.md)
- [Incident Response Procedures](./INCIDENT_RESPONSE.md)
- [Environment Variables Guide](./.env.example)

### External Resources
- [OWASP Security Guidelines](https://owasp.org/)
- [Supabase Security Best Practices](https://supabase.com/docs/guides/security)
- [React Security Best Practices](https://reactjs.org/docs/security.html)
- [Vercel Security Documentation](https://vercel.com/docs/security)

### Training
- Regular security training sessions
- Code review security guidelines
- Security incident response training
- Best practices workshops

---

## 🚀 Getting Started

### First Time Setup
```bash
# 1. Install dependencies
npm install

# 2. Copy environment template
cp .env.example .env

# 3. Fill in your environment variables
# Edit .env file with your actual values

# 4. Run security validation
npm run validate-env

# 5. Run security scan
npm run security:scan

# 6. Start development
npm start
```

### Daily Development
```bash
# Start development (includes security checks)
npm start

# Run security checks manually
npm run security:audit

# Monitor for security issues
npm run security:monitor
```

### Before Committing
```bash
# Security checks run automatically via pre-commit hook
git add .
git commit -m "Your commit message"
# Pre-commit hook will run security validation automatically
```

---

## ⚠️ Important Notes

### Critical Security Rules
1. **NEVER** commit `.env` files
2. **NEVER** hardcode API keys
3. **ALWAYS** run security checks before deploying
4. **ALWAYS** monitor for unusual activity
5. **NEVER** ignore security warnings

### Emergency Procedures
1. **IMMEDIATE**: Contact security team
2. **DOCUMENT**: All actions and evidence
3. **CONTAIN**: The security threat
4. **RECOVER**: From the incident
5. **LEARN**: From the experience

---

*Last Updated: [Date]*
*Security Version: 1.0*
*Next Review: [Date]* 