# 🚨 Monarch Passport MVP - Incident Response Procedures

## 🚨 IMMEDIATE RESPONSE CHECKLIST

### 🔴 CRITICAL INCIDENT (0-1 HOUR)

#### 1. IMMEDIATE ACTIONS
- [ ] **STOP** - Cease all development/deployment activities
- [ ] **ASSESS** - Determine scope and severity of the incident
- [ ] **ISOLATE** - Disconnect affected systems if necessary
- [ ] **DOCUMENT** - Record timestamp, initial observations, and evidence

#### 2. NOTIFICATION ESCALATION
- [ ] **IMMEDIATE**: Contact security team lead
- [ ] **WITHIN 30 MIN**: Notify development team
- [ ] **WITHIN 1 HOUR**: Notify stakeholders and legal team
- [ ] **WITHIN 2 HOURS**: Prepare user communication if needed

#### 3. EVIDENCE PRESERVATION
- [ ] **DO NOT DELETE** any logs or files
- [ ] **CREATE BACKUP** of all relevant data
- [ ] **SCREENSHOT** any visible evidence
- [ ] **DOCUMENT** all actions taken

---

## 📋 INCIDENT CLASSIFICATION

### 🔴 CRITICAL (Response: 0-1 hour)
- Exposed API keys or secrets
- Database breach
- User data compromise
- Authentication bypass
- Financial data exposure

### 🟡 HIGH (Response: 1-4 hours)
- Failed login attempts (10+ from same IP)
- Suspicious file uploads
- Unusual API activity
- Potential data access

### 🟢 MEDIUM (Response: 4-24 hours)
- Failed login attempts (5-10 from same IP)
- Unusual user behavior
- Performance anomalies
- Minor configuration issues

### 🔵 LOW (Response: 24-72 hours)
- Failed login attempts (<5 from same IP)
- Minor security warnings
- Performance degradation
- Documentation updates

---

## 🛠️ SPECIFIC INCIDENT RESPONSES

### 1. EXPOSED ENVIRONMENT VARIABLES

#### IMMEDIATE ACTIONS:
```bash
# 1. Rotate all exposed keys
# 2. Check Git history for other secrets
git log --all --full-history -- .env*

# 3. Remove from Git history if found
git filter-branch --force --index-filter "git rm --cached --ignore-unmatch .env" --prune-empty --tag-name-filter cat -- --all

# 4. Force push to remove from remote
git push origin --force --all
```

#### SUPABASE SPECIFIC:
- [ ] **IMMEDIATE**: Rotate Supabase API keys in dashboard
- [ ] **IMMEDIATE**: Check Supabase logs for unauthorized access
- [ ] **WITHIN 1 HOUR**: Review all database access patterns
- [ ] **WITHIN 2 HOURS**: Update all environment variables in Vercel

#### VERIFICATION:
- [ ] Confirm new keys are working
- [ ] Test all application functionality
- [ ] Monitor for any failed requests
- [ ] Check for any remaining exposed secrets

### 2. DATABASE SECURITY BREACH

#### IMMEDIATE ACTIONS:
- [ ] **IMMEDIATE**: Check Supabase dashboard for unusual activity
- [ ] **IMMEDIATE**: Review recent database logs
- [ ] **WITHIN 30 MIN**: Identify affected tables and data
- [ ] **WITHIN 1 HOUR**: Assess data sensitivity and user impact

#### SUPABASE RESPONSE:
```sql
-- Check for unusual access patterns
SELECT 
  auth.users.email,
  auth.users.created_at,
  auth.users.last_sign_in_at
FROM auth.users 
WHERE last_sign_in_at > NOW() - INTERVAL '24 hours'
ORDER BY last_sign_in_at DESC;

-- Check for failed authentication attempts
SELECT 
  auth.audit_log_entries.event_type,
  auth.audit_log_entries.created_at,
  auth.audit_log_entries.ip_address
FROM auth.audit_log_entries 
WHERE created_at > NOW() - INTERVAL '24 hours'
  AND event_type = 'login_failed'
ORDER BY created_at DESC;
```

#### CONTAINMENT:
- [ ] **IMMEDIATE**: Review and tighten RLS policies
- [ ] **WITHIN 1 HOUR**: Implement additional access controls
- [ ] **WITHIN 2 HOURS**: Consider temporary service suspension if critical

### 3. USER DATA COMPROMISE

#### IMMEDIATE ACTIONS:
- [ ] **IMMEDIATE**: Identify affected users
- [ ] **IMMEDIATE**: Determine scope of data exposure
- [ ] **WITHIN 1 HOUR**: Prepare user notification
- [ ] **WITHIN 2 HOURS**: Implement additional security measures

#### USER NOTIFICATION TEMPLATE:
```
Subject: Security Alert - Your Monarch Passport Account

Dear [User Name],

We have detected suspicious activity on your Monarch Passport account. 
As a precautionary measure, we recommend:

1. Change your password immediately
2. Enable two-factor authentication if available
3. Review your recent account activity
4. Contact support if you notice any unauthorized activity

We apologize for any inconvenience and are working to resolve this issue.

Best regards,
Monarch Passport Security Team
```

### 4. FILE UPLOAD SECURITY ISSUE

#### IMMEDIATE ACTIONS:
- [ ] **IMMEDIATE**: Review recent file uploads
- [ ] **IMMEDIATE**: Check for malicious files
- [ ] **WITHIN 30 MIN**: Implement additional file validation
- [ ] **WITHIN 1 HOUR**: Scan existing files for threats

#### SUPABASE STORAGE AUDIT:
```sql
-- Check recent file uploads
SELECT 
  storage.objects.name,
  storage.objects.created_at,
  storage.objects.owner,
  storage.objects.metadata
FROM storage.objects 
WHERE bucket_id = 'avatars'
  AND created_at > NOW() - INTERVAL '24 hours'
ORDER BY created_at DESC;
```

#### CONTAINMENT:
- [ ] **IMMEDIATE**: Tighten file upload restrictions
- [ ] **WITHIN 1 HOUR**: Implement malware scanning
- [ ] **WITHIN 2 HOURS**: Review and update file validation rules

---

## 🔧 TECHNICAL RESPONSE PROCEDURES

### 1. EMERGENCY DEPLOYMENT ROLLBACK

```bash
# 1. Identify the last stable commit
git log --oneline -10

# 2. Create emergency branch
git checkout -b emergency-rollback-[timestamp]

# 3. Revert to last stable commit
git reset --hard [stable-commit-hash]

# 4. Force deploy to production
git push origin emergency-rollback-[timestamp] --force

# 5. Update Vercel deployment
vercel --prod
```

### 2. ENVIRONMENT VARIABLE EMERGENCY UPDATE

```bash
# 1. Update Vercel environment variables
vercel env add REACT_APP_SUPABASE_URL production
vercel env add REACT_APP_SUPABASE_ANON_KEY production

# 2. Redeploy with new variables
vercel --prod

# 3. Verify deployment
curl -I https://your-app.vercel.app
```

### 3. DATABASE EMERGENCY ACCESS CONTROL

```sql
-- 1. Temporarily disable all RLS policies
ALTER TABLE user_profiles DISABLE ROW LEVEL SECURITY;
ALTER TABLE user_closet DISABLE ROW LEVEL SECURITY;
ALTER TABLE rewards DISABLE ROW LEVEL SECURITY;

-- 2. Create emergency admin policy
CREATE POLICY "emergency_admin_access" ON user_profiles
FOR ALL USING (auth.uid() IN (
  SELECT id FROM auth.users WHERE email = 'admin@yourdomain.com'
));

-- 3. Re-enable RLS with emergency policy
ALTER TABLE user_profiles ENABLE ROW LEVEL SECURITY;
```

---

## 📞 CONTACT INFORMATION

### EMERGENCY CONTACTS
- **Security Lead**: [Add contact info]
- **Development Lead**: [Add contact info]
- **Legal Team**: [Add contact info]
- **Stakeholders**: [Add contact info]

### EXTERNAL CONTACTS
- **Supabase Support**: https://supabase.com/support
- **Vercel Support**: https://vercel.com/support
- **GitHub Security**: https://github.com/security
- **Local Law Enforcement**: [Add if applicable]

### COMMUNICATION CHANNELS
- **Emergency Slack**: #security-incidents
- **Emergency Email**: security@yourdomain.com
- **Emergency Phone**: [Add phone number]

---

## 📊 INCIDENT DOCUMENTATION

### INCIDENT REPORT TEMPLATE

```
INCIDENT REPORT
===============

Incident ID: [GENERATE UNIQUE ID]
Date/Time: [TIMESTAMP]
Severity: [CRITICAL/HIGH/MEDIUM/LOW]
Status: [OPEN/IN PROGRESS/RESOLVED/CLOSED]

DESCRIPTION
----------
[Detailed description of the incident]

IMPACT ASSESSMENT
----------------
- Users affected: [NUMBER]
- Data compromised: [YES/NO - DETAILS]
- Service disruption: [YES/NO - DETAILS]
- Financial impact: [ESTIMATE]

ROOT CAUSE
----------
[Analysis of what caused the incident]

RESPONSE ACTIONS
---------------
1. [Action taken]
2. [Action taken]
3. [Action taken]

CONTAINMENT MEASURES
-------------------
[Steps taken to contain the incident]

RECOVERY ACTIONS
---------------
[Steps taken to recover from the incident]

LESSONS LEARNED
--------------
[What we learned and how to prevent future incidents]

PREVENTION MEASURES
------------------
[New measures implemented to prevent recurrence]

TIMELINE
--------
[Detailed timeline of events and actions]

EVIDENCE
--------
[Links to logs, screenshots, and other evidence]

SIGNATURES
----------
Security Lead: ________________
Development Lead: _____________
Legal Review: _________________
```

---

## 🔄 POST-INCIDENT PROCEDURES

### 1. IMMEDIATE (0-24 hours)
- [ ] Complete incident documentation
- [ ] Conduct initial lessons learned session
- [ ] Implement immediate security improvements
- [ ] Notify all stakeholders of resolution

### 2. SHORT-TERM (1-7 days)
- [ ] Conduct detailed root cause analysis
- [ ] Review and update security procedures
- [ ] Implement additional monitoring
- [ ] Conduct team security training

### 3. LONG-TERM (1-4 weeks)
- [ ] Complete security audit
- [ ] Update incident response procedures
- [ ] Implement preventive measures
- [ ] Schedule follow-up review

---

## 🛡️ PREVENTION CHECKLIST

### DAILY
- [ ] Review security alerts and logs
- [ ] Check for failed login attempts
- [ ] Monitor unusual API activity
- [ ] Review file upload patterns

### WEEKLY
- [ ] Run security scan on codebase
- [ ] Review access logs
- [ ] Check for dependency vulnerabilities
- [ ] Review environment variable usage

### MONTHLY
- [ ] Conduct security audit
- [ ] Update security procedures
- [ ] Review incident response plan
- [ ] Conduct security training

### QUARTERLY
- [ ] Comprehensive security assessment
- [ ] Penetration testing
- [ ] Security policy review
- [ ] Team security training

---

## 📋 INCIDENT RESPONSE KIT

### TOOLS TO HAVE READY
- [ ] Security scanner scripts
- [ ] Database backup procedures
- [ ] Emergency deployment procedures
- [ ] Communication templates
- [ ] Evidence collection tools
- [ ] Contact information database

### DOCUMENTATION TO MAINTAIN
- [ ] System architecture diagrams
- [ ] Database schema documentation
- [ ] API documentation
- [ ] Security configuration details
- [ ] Recovery procedures
- [ ] Legal compliance requirements

---

*Last Updated: [Date]*
*Next Review: [Date]*
*Version: 1.0* 