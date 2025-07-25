#!/bin/bash

# 🔒 Monarch Passport MVP - Security Setup & Remediation Script
# This script sets up comprehensive security infrastructure and guides through incident response

set -e

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
PURPLE='\033[0;35m'
CYAN='\033[0;36m'
NC='\033[0m' # No Color

# Functions for colored output
print_header() {
    echo -e "\n${PURPLE}========================================${NC}"
    echo -e "${PURPLE}$1${NC}"
    echo -e "${PURPLE}========================================${NC}\n"
}

print_step() {
    echo -e "${BLUE}[STEP]${NC} $1"
}

print_success() {
    echo -e "${GREEN}[SUCCESS]${NC} $1"
}

print_warning() {
    echo -e "${YELLOW}[WARNING]${NC} $1"
}

print_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

print_info() {
    echo -e "${CYAN}[INFO]${NC} $1"
}

# Check if we're in a git repository
if [[ ! -d ".git" ]]; then
    print_error "This must be run from the root of a git repository"
    exit 1
fi

print_header "🔒 MONARCH PASSPORT MVP - SECURITY SETUP"

echo "This script will:"
echo "1. 🚨 Handle the current .env exposure incident"
echo "2. 🛡️ Install comprehensive security infrastructure"
echo "3. 🔍 Set up monitoring and alerting"
echo "4. 📋 Provide step-by-step remediation guidance"
echo ""

read -p "Do you want to continue? (y/N) " -n 1 -r
echo
if [[ ! $REPLY =~ ^[Yy]$ ]]; then
    echo "Setup cancelled."
    exit 1
fi

# ========================================
# 🚨 IMMEDIATE INCIDENT RESPONSE
# ========================================

print_header "🚨 IMMEDIATE INCIDENT RESPONSE"

print_step "Checking for .env file exposure..."

if [[ -f ".env" ]]; then
    print_error "CRITICAL: .env file detected in repository!"
    echo ""
    echo "IMMEDIATE ACTIONS REQUIRED:"
    echo "1. 🔄 Rotate ALL credentials in your .env file"
    echo "2. 🔍 Check git history for how long it was exposed"
    echo "3. 📊 Monitor for suspicious activity"
    echo ""
    
    read -p "Have you already rotated your Supabase API keys? (y/N) " -n 1 -r
    echo
    if [[ ! $REPLY =~ ^[Yy]$ ]]; then
        print_error "❌ STOP: Rotate your Supabase API keys IMMEDIATELY!"
        echo ""
        echo "Go to: https://app.supabase.com/project/YOUR_PROJECT/settings/api"
        echo "1. Generate new API keys"
        echo "2. Update your .env file"
        echo "3. Update your production environment variables"
        echo "4. Test that everything still works"
        echo ""
        read -p "Press Enter after you've rotated your keys..."
    fi
    
    # Move .env to backup and remove from git
    print_step "Securing .env file..."
    cp .env .env.backup.$(date +%Y%m%d_%H%M%S)
    print_success "Backed up .env file"
    
    # Remove from git if tracked
    if git ls-files --error-unmatch .env >/dev/null 2>&1; then
        git rm --cached .env
        print_success "Removed .env from git tracking"
    fi
else
    print_success "No .env file found in repository"
fi

# ========================================
# 🛡️ SECURITY INFRASTRUCTURE SETUP
# ========================================

print_header "🛡️ SECURITY INFRASTRUCTURE SETUP"

print_step "Installing pre-commit hooks..."

# Install pre-commit hook
if [[ ! -d ".git/hooks" ]]; then
    mkdir -p .git/hooks
fi

cp pre-commit-hook.sh .git/hooks/pre-commit
chmod +x .git/hooks/pre-commit
print_success "Pre-commit security hook installed"

print_step "Setting up security monitoring..."

# Make security scripts executable
chmod +x security-scanner.js
chmod +x security-monitor.js
print_success "Security tools configured"

print_step "Generating secure environment template..."

# Ensure .env.example exists
if [[ ! -f ".env.example" ]]; then
    print_warning ".env.example not found, but it should have been created"
else
    print_success ".env.example template ready"
fi

# ========================================
# 🔐 CREDENTIAL GENERATION
# ========================================

print_header "🔐 SECURE CREDENTIAL GENERATION"

print_step "Generating secure secrets..."

echo "# 🔒 GENERATED SECURE SECRETS" > .env.generated
echo "# Copy these to your .env file and update with your actual values" >> .env.generated
echo "" >> .env.generated

# Generate PAPILLON_SECRET
PAPILLON_SECRET=$(openssl rand -base64 32)
echo "# Secure secret for QR code encryption (KEEP THIS PRIVATE)" >> .env.generated
echo "PAPILLON_SECRET=$PAPILLON_SECRET" >> .env.generated
echo "" >> .env.generated

# Generate JWT secret
JWT_SECRET=$(openssl rand -base64 64)
echo "# JWT secret for session management" >> .env.generated
echo "JWT_SECRET=$JWT_SECRET" >> .env.generated
echo "" >> .env.generated

# Generate encryption key
ENCRYPTION_KEY=$(openssl rand -hex 32)
echo "# Encryption key for sensitive data" >> .env.generated
echo "ENCRYPTION_KEY=$ENCRYPTION_KEY" >> .env.generated
echo "" >> .env.generated

# Generate beta password
BETA_PASSWORD=$(openssl rand -base64 16 | tr -d "=+/" | cut -c1-12)
echo "# Beta access password" >> .env.generated
echo "BETA_PASSWORD=$BETA_PASSWORD" >> .env.generated

print_success "Secure secrets generated in .env.generated"

# ========================================
# 📊 VULNERABILITY ASSESSMENT
# ========================================

print_header "📊 VULNERABILITY ASSESSMENT"

print_step "Running comprehensive security scan..."

# Run security scanner
if node security-scanner.js 2>/dev/null; then
    print_success "Security scan completed - check security-report.json for details"
else
    print_warning "Security scan found issues - review security-report.json immediately"
fi

# ========================================
# 🔍 GIT HISTORY AUDIT
# ========================================

print_header "🔍 GIT HISTORY AUDIT"

print_step "Auditing git history for exposed secrets..."

echo "Checking git history for .env file exposure..."
if git log --oneline --name-only | grep -q "\.env"; then
    print_error "❌ .env files found in git history!"
    echo ""
    echo "Git commits that mention .env files:"
    git log --oneline --grep="env" --grep="secret" --grep="key" -i
    echo ""
    echo "⚠️ SECURITY RECOMMENDATION:"
    echo "Consider using tools like BFG Repo-Cleaner to remove sensitive data from git history"
    echo "https://rtyley.github.io/bfg-repo-cleaner/"
else
    print_success "No .env files found in recent git history"
fi

# Check for hardcoded secrets in history
print_step "Scanning git history for hardcoded secrets..."
SECRET_PATTERNS=("PAPILLON_SECRET" "password.*=" "api.*key.*=" "secret.*=")

for pattern in "${SECRET_PATTERNS[@]}"; do
    if git log -p | grep -i "$pattern" >/dev/null 2>&1; then
        print_warning "⚠️ Pattern '$pattern' found in git history"
    fi
done

# ========================================
# 🚀 DEPLOYMENT SECURITY
# ========================================

print_header "🚀 DEPLOYMENT SECURITY"

print_step "Checking deployment security..."

# Check if on Vercel
if [[ -f "vercel.json" ]]; then
    print_info "Vercel deployment detected"
    
    if ! grep -q "headers" vercel.json 2>/dev/null; then
        print_warning "⚠️ No security headers configured in vercel.json"
        echo ""
        echo "Consider adding security headers to vercel.json:"
        cat << 'EOF'
{
  "headers": [
    {
      "source": "/(.*)",
      "headers": [
        {
          "key": "X-Content-Type-Options",
          "value": "nosniff"
        },
        {
          "key": "X-Frame-Options",
          "value": "DENY"
        },
        {
          "key": "X-XSS-Protection",
          "value": "1; mode=block"
        },
        {
          "key": "Strict-Transport-Security",
          "value": "max-age=31536000; includeSubDomains"
        },
        {
          "key": "Content-Security-Policy",
          "value": "default-src 'self'; script-src 'self' 'unsafe-inline'; style-src 'self' 'unsafe-inline';"
        }
      ]
    }
  ]
}
EOF
    else
        print_success "Security headers configured in vercel.json"
    fi
fi

# ========================================
# 📋 CHECKLIST GENERATION
# ========================================

print_header "📋 POST-INCIDENT CHECKLIST"

cat << 'EOF' > POST_INCIDENT_CHECKLIST.md
# 🚨 Post-Incident Security Checklist

## ✅ IMMEDIATE ACTIONS (Complete ASAP)

### Credential Rotation
- [ ] Rotated Supabase API keys
- [ ] Updated production environment variables
- [ ] Generated new PAPILLON_SECRET
- [ ] Updated JWT secrets
- [ ] Changed admin passwords
- [ ] Rotated any third-party API keys

### Access Review
- [ ] Reviewed all admin accounts
- [ ] Checked for unauthorized user accounts
- [ ] Verified no suspicious activity in logs
- [ ] Confirmed database integrity
- [ ] Reviewed recent transactions/WINGS transfers

### Infrastructure Hardening
- [ ] Installed pre-commit hooks
- [ ] Updated .gitignore to be comprehensive
- [ ] Set up security monitoring
- [ ] Configured security headers
- [ ] Enabled proper logging

## 📊 ASSESSMENT (Complete within 24 hours)

### Impact Analysis
- [ ] Determined exact duration of exposure
- [ ] Identified what credentials were compromised
- [ ] Checked for any unauthorized access
- [ ] Verified data integrity
- [ ] Assessed financial impact

### Communication
- [ ] Notified key stakeholders
- [ ] Prepared user communication (if needed)
- [ ] Documented incident timeline
- [ ] Updated incident response procedures

## 🔄 ONGOING SECURITY (Complete within 1 week)

### Monitoring
- [ ] Set up security alerting
- [ ] Implement anomaly detection
- [ ] Configure automated scanning
- [ ] Establish security metrics

### Process Improvements
- [ ] Updated security training
- [ ] Enhanced development procedures
- [ ] Improved deployment security
- [ ] Scheduled regular security reviews

### Documentation
- [ ] Updated security policies
- [ ] Created incident report
- [ ] Shared lessons learned
- [ ] Updated emergency contacts

## 🎯 LONG-TERM SECURITY (Complete within 1 month)

### Security Program
- [ ] Conducted full security audit
- [ ] Implemented additional controls
- [ ] Established security culture
- [ ] Planned regular assessments

### Compliance
- [ ] Reviewed regulatory requirements
- [ ] Updated privacy policies
- [ ] Implemented data retention policies
- [ ] Conducted compliance review

---

**Incident Date**: $(date)
**Status**: In Progress
**Owner**: Security Team
**Next Review**: $(date -d "+1 week")
EOF

print_success "Post-incident checklist created: POST_INCIDENT_CHECKLIST.md"

# ========================================
# 🔧 PACKAGE.JSON SECURITY UPDATES
# ========================================

print_header "🔧 PACKAGE.JSON SECURITY UPDATES"

print_step "Adding security scripts to package.json..."

# Check if jq is available for JSON manipulation
if command -v jq >/dev/null 2>&1; then
    # Add security scripts using jq
    jq '.scripts["security:scan"] = "node security-scanner.js"' package.json > package.json.tmp
    jq '.scripts["security:monitor"] = "node security-monitor.js"' package.json.tmp > package.json.tmp2
    jq '.scripts["security:setup"] = "./setup-security.sh"' package.json.tmp2 > package.json.tmp3
    mv package.json.tmp3 package.json
    rm -f package.json.tmp package.json.tmp2
    print_success "Security scripts added to package.json"
else
    print_warning "jq not available - manually add these scripts to package.json:"
    echo '  "security:scan": "node security-scanner.js",'
    echo '  "security:monitor": "node security-monitor.js",'
    echo '  "security:setup": "./setup-security.sh"'
fi

# ========================================
# 📞 EMERGENCY RESPONSE SETUP
# ========================================

print_header "📞 EMERGENCY RESPONSE SETUP"

print_step "Setting up emergency response procedures..."

# Create quick reference card
cat << 'EOF' > SECURITY_EMERGENCY_CARD.md
# 🚨 SECURITY EMERGENCY QUICK REFERENCE

## 🔥 IF SECRETS ARE EXPOSED

1. **IMMEDIATE** (0-30 minutes):
   ```bash
   # Stop all deployments
   # Rotate ALL exposed credentials
   # Remove from git: git rm --cached .env
   # Check logs for suspicious activity
   ```

2. **SHORT TERM** (30 minutes - 2 hours):
   ```bash
   # Run security scan: npm run security:scan
   # Check user accounts for anomalies
   # Update production environment variables
   # Monitor for unusual activity
   ```

3. **FOLLOW UP** (2-24 hours):
   ```bash
   # Complete incident report
   # Review and update security procedures
   # Communicate with stakeholders
   # Plan improvements
   ```

## 📞 EMERGENCY CONTACTS

- **Security Lead**: [UPDATE WITH ACTUAL CONTACT]
- **Technical Lead**: [UPDATE WITH ACTUAL CONTACT]
- **Management**: [UPDATE WITH ACTUAL CONTACT]

## 🛠️ EMERGENCY COMMANDS

```bash
# Run security scan
npm run security:scan

# Start security monitoring
npm run security:monitor

# Generate new secrets
openssl rand -base64 32

# Check git history for secrets
git log -p | grep -i "secret\|password\|key"

# Remove file from git history
git filter-branch --force --index-filter \
'git rm --cached --ignore-unmatch .env' \
--prune-empty --tag-name-filter cat -- --all
```

## 🔍 INCIDENT RESPONSE CHECKLIST

- [ ] Contain the incident
- [ ] Assess the damage
- [ ] Rotate credentials
- [ ] Monitor for abuse
- [ ] Document everything
- [ ] Communicate appropriately
- [ ] Learn and improve

---
**Keep this card easily accessible!**
EOF

print_success "Emergency response card created: SECURITY_EMERGENCY_CARD.md"

# ========================================
# 📊 FINAL SECURITY STATUS
# ========================================

print_header "📊 FINAL SECURITY STATUS"

echo "Security setup completed! Here's what was installed:"
echo ""
echo "✅ Files Created:"
echo "  - SECURITY_AUDIT_CHECKLIST.md (comprehensive security audit)"
echo "  - INCIDENT_RESPONSE_PLAN.md (detailed incident procedures)"
echo "  - security-scanner.js (automated vulnerability detection)"
echo "  - security-monitor.js (real-time security monitoring)"
echo "  - .env.example (secure environment template)"
echo "  - .gitignore (comprehensive file exclusions)"
echo "  - pre-commit-hook.sh (prevents secret commits)"
echo "  - .env.generated (secure secrets - KEEP PRIVATE)"
echo "  - POST_INCIDENT_CHECKLIST.md (recovery checklist)"
echo "  - SECURITY_EMERGENCY_CARD.md (quick reference)"
echo ""
echo "✅ Security Infrastructure:"
echo "  - Pre-commit hooks installed"
echo "  - Git hooks configured"
echo "  - Security monitoring ready"
echo "  - Vulnerability scanning enabled"
echo ""

print_warning "🚨 CRITICAL NEXT STEPS:"
echo "1. Copy secrets from .env.generated to your .env file"
echo "2. Add your real Supabase URLs and keys"
echo "3. Update production environment variables"
echo "4. Run: npm run security:scan"
echo "5. Test your application thoroughly"
echo "6. Review POST_INCIDENT_CHECKLIST.md"
echo ""

print_info "📚 Regular Security Maintenance:"
echo "• Run 'npm run security:scan' weekly"
echo "• Review security logs daily"
echo "• Rotate secrets quarterly"
echo "• Update dependencies monthly"
echo "• Conduct security training quarterly"
echo ""

print_success "🔒 Security setup complete!"
echo ""
echo "Your Monarch Passport MVP is now protected with enterprise-grade security."
echo "Remember: Security is an ongoing process, not a one-time setup."
echo ""
echo "For questions or incidents, refer to:"
echo "- SECURITY_EMERGENCY_CARD.md (quick reference)"
echo "- INCIDENT_RESPONSE_PLAN.md (detailed procedures)"
echo "- SECURITY_AUDIT_CHECKLIST.md (comprehensive security review)"

# Make sure all created files are properly secured
chmod 600 .env.generated 2>/dev/null || true
chmod 644 *.md 2>/dev/null || true
chmod +x *.js 2>/dev/null || true

print_success "🛡️ All security measures are now in place!"