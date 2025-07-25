#!/bin/bash

# 🔒 Monarch Passport MVP - Pre-commit Security Hook
# This script prevents sensitive data from being committed to version control

set -e

echo "🔒 Running pre-commit security checks..."

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Function to print colored output
print_status() {
    echo -e "${BLUE}[INFO]${NC} $1"
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

# Check if running in CI environment
if [[ "$CI" == "true" ]]; then
    print_status "Running in CI environment, using appropriate checks"
fi

# ========================================
# 🚨 CRITICAL: SECRET DETECTION
# ========================================

print_status "Checking for exposed secrets..."

# Get list of staged files
STAGED_FILES=$(git diff --cached --name-only --diff-filter=ACM)

# Exit early if no files staged
if [[ -z "$STAGED_FILES" ]]; then
    print_success "No files staged for commit"
    exit 0
fi

# Flag for tracking security violations
SECURITY_VIOLATION=false

# Check for .env files
if echo "$STAGED_FILES" | grep -q "\.env$\|\.env\."; then
    print_error "❌ BLOCKED: Attempting to commit .env files!"
    echo "   Found .env files in staging area:"
    echo "$STAGED_FILES" | grep "\.env"
    echo ""
    echo "   To fix this:"
    echo "   1. Remove .env files from staging: git reset HEAD *.env"
    echo "   2. Add them to .gitignore if not already there"
    echo "   3. Use .env.example for template files instead"
    SECURITY_VIOLATION=true
fi

# Check for common secret patterns in staged files
SECRET_PATTERNS=(
    "PAPILLON_SECRET"
    "password\s*[=:]\s*['\"][^'\"]{1,50}['\"]"
    "api[_-]?key\s*[=:]\s*['\"][^'\"]{10,}"
    "secret[_-]?key\s*[=:]\s*['\"][^'\"]{10,}"
    "jwt[_-]?secret\s*[=:]\s*['\"][^'\"]{10,}"
    "private[_-]?key\s*[=:]\s*['\"][^'\"]{10,}"
    "access[_-]?token\s*[=:]\s*['\"][^'\"]{10,}"
    "auth[_-]?token\s*[=:]\s*['\"][^'\"]{10,}"
    "database[_-]?url\s*[=:]\s*['\"][^'\"]{10,}"
    "mongodb://[^'\"\\s]*:[^'\"\\s]*@"
    "postgres://[^'\"\\s]*:[^'\"\\s]*@"
    "mysql://[^'\"\\s]*:[^'\"\\s]*@"
    "redis://[^'\"\\s]*:[^'\"\\s]*@"
    "['\"][A-Za-z0-9_-]{32,}['\"]"  # Long random strings
    "sk_live_[A-Za-z0-9_-]+"        # Stripe live keys
    "pk_live_[A-Za-z0-9_-]+"        # Stripe live keys
    "rk_live_[A-Za-z0-9_-]+"        # Stripe restricted keys
    "AIza[A-Za-z0-9_-]{35}"         # Google API keys
    "AKIA[A-Z0-9]{16}"              # AWS Access Key
    "github_pat_[A-Za-z0-9_-]+"     # GitHub Personal Access Token
    "ghp_[A-Za-z0-9_-]+"           # GitHub Personal Access Token (classic)
    "ghs_[A-Za-z0-9_-]+"           # GitHub App token
    "ghu_[A-Za-z0-9_-]+"           # GitHub App user token
)

print_status "Scanning staged files for secret patterns..."

for file in $STAGED_FILES; do
    # Skip binary files and large files
    if [[ -f "$file" ]] && file --mime-type "$file" | grep -q "text/"; then
        # Check file size (skip files larger than 1MB)
        file_size=$(wc -c < "$file" 2>/dev/null || echo 0)
        if [[ $file_size -gt 1048576 ]]; then
            print_warning "Skipping large file: $file"
            continue
        fi
        
        for pattern in "${SECRET_PATTERNS[@]}"; do
            if grep -i -P "$pattern" "$file" >/dev/null 2>&1; then
                print_error "❌ POTENTIAL SECRET FOUND in $file"
                echo "   Pattern: $pattern"
                echo "   Preview:"
                grep -i -P "$pattern" "$file" | head -3 | sed 's/^/   > /'
                echo ""
                SECURITY_VIOLATION=true
            fi
        done
    fi
done

# ========================================
# 🔍 FILE TYPE CHECKS
# ========================================

print_status "Checking for prohibited file types..."

# Prohibited file extensions
PROHIBITED_EXTENSIONS=(
    "\.pem$"
    "\.key$" 
    "\.p12$"
    "\.p8$"
    "\.pfx$"
    "\.crt$"
    "\.cert$"
    "\.cer$"
    "\.der$"
    "\.jks$"
    "\.keystore$"
    "\.truststore$"
    "\.sql\.gz$"
    "\.dump$"
    "\.backup$"
    "\.bak$"
    "\.tmp$"
    "\.temp$"
    "\.log$"
    "\.sqlite$"
    "\.sqlite3$"
    "\.db$"
)

for file in $STAGED_FILES; do
    for ext in "${PROHIBITED_EXTENSIONS[@]}"; do
        if echo "$file" | grep -i -E "$ext" >/dev/null; then
            print_error "❌ PROHIBITED FILE TYPE: $file"
            echo "   File type not allowed in repository"
            SECURITY_VIOLATION=true
        fi
    done
done

# Check for large files (>10MB)
print_status "Checking for large files..."
for file in $STAGED_FILES; do
    if [[ -f "$file" ]]; then
        file_size=$(wc -c < "$file" 2>/dev/null || echo 0)
        if [[ $file_size -gt 10485760 ]]; then  # 10MB
            print_warning "⚠️ Large file detected: $file ($(echo "scale=2; $file_size/1024/1024" | bc)MB)"
            echo "   Consider using Git LFS for large files"
        fi
    fi
done

# ========================================
# 🛡️ CODE SECURITY CHECKS
# ========================================

print_status "Running code security analysis..."

# Check for dangerous JavaScript patterns
JS_PATTERNS=(
    "eval\s*\("
    "new\s+Function\s*\("
    "innerHTML\s*="
    "document\.write\s*\("
    "dangerouslySetInnerHTML"
    "setTimeout\s*\(\s*['\"][^'\"]*['\"]"
    "setInterval\s*\(\s*['\"][^'\"]*['\"]"
)

for file in $STAGED_FILES; do
    if [[ "$file" =~ \.(js|jsx|ts|tsx)$ ]]; then
        for pattern in "${JS_PATTERNS[@]}"; do
            if grep -P "$pattern" "$file" >/dev/null 2>&1; then
                print_warning "⚠️ Potentially dangerous code pattern in $file: $pattern"
                grep -n -P "$pattern" "$file" | head -3 | sed 's/^/   /'
            fi
        done
    fi
done

# Check for SQL injection patterns
SQL_PATTERNS=(
    "SELECT.*\+.*"
    "INSERT.*\+.*"
    "UPDATE.*\+.*"
    "DELETE.*\+.*"
    "\\\$\{.*\}"
    "query\s*\+\s*"
)

for file in $STAGED_FILES; do
    if [[ "$file" =~ \.(js|jsx|ts|tsx|sql)$ ]]; then
        for pattern in "${SQL_PATTERNS[@]}"; do
            if grep -i -P "$pattern" "$file" >/dev/null 2>&1; then
                print_warning "⚠️ Potential SQL injection risk in $file"
                grep -i -n -P "$pattern" "$file" | head -2 | sed 's/^/   /'
            fi
        done
    fi
done

# ========================================
# 🧪 AUTOMATED SECURITY SCAN
# ========================================

print_status "Running automated security scanner..."

# Run the security scanner if available
if [[ -f "security-scanner.js" ]]; then
    if node security-scanner.js --staged-files 2>/dev/null; then
        print_success "Automated security scan passed"
    else
        print_warning "Automated security scan found issues (check security-report.json)"
    fi
else
    print_warning "Security scanner not found, skipping automated scan"
fi

# ========================================
# 📝 COMMIT MESSAGE CHECKS
# ========================================

# Get the commit message (if available)
if [[ -f ".git/COMMIT_EDITMSG" ]]; then
    COMMIT_MSG=$(cat .git/COMMIT_EDITMSG)
    
    # Check for secret patterns in commit message
    for pattern in "${SECRET_PATTERNS[@]}"; do
        if echo "$COMMIT_MSG" | grep -i -P "$pattern" >/dev/null 2>&1; then
            print_error "❌ POTENTIAL SECRET in commit message!"
            echo "   Please review your commit message for sensitive data"
            SECURITY_VIOLATION=true
        fi
    done
    
    # Check for TODO/FIXME with security implications
    if echo "$COMMIT_MSG" | grep -i -E "(TODO|FIXME|HACK).*security" >/dev/null 2>&1; then
        print_warning "⚠️ Security-related TODO/FIXME in commit message"
    fi
fi

# ========================================
# 🔧 DEPENDENCY CHECKS
# ========================================

print_status "Checking for dependency-related changes..."

# Check if package.json was modified
if echo "$STAGED_FILES" | grep -q "package\.json\|package-lock\.json\|yarn\.lock"; then
    print_status "Package files modified, consider running 'npm audit' after commit"
    
    # Check for known vulnerable packages (basic check)
    if [[ -f "package.json" ]]; then
        VULNERABLE_PACKAGES=(
            "lodash.*[\"']:[\"'][^\"']*4\.[0-9]+\.[0-9]+"  # Old lodash versions
            "express.*[\"']:[\"'][^\"']*[0-3]\."           # Very old Express versions
        )
        
        for pattern in "${VULNERABLE_PACKAGES[@]}"; do
            if grep -P "$pattern" package.json >/dev/null 2>&1; then
                print_warning "⚠️ Potentially vulnerable dependency pattern detected"
                grep -P "$pattern" package.json | sed 's/^/   /'
            fi
        done
    fi
fi

# ========================================
# 🔐 FINAL SECURITY VALIDATION
# ========================================

print_status "Performing final security validation..."

# Check if .gitignore is properly configured
if [[ ! -f ".gitignore" ]]; then
    print_warning "⚠️ No .gitignore file found - consider adding one"
elif ! grep -q "\.env" .gitignore; then
    print_warning "⚠️ .gitignore doesn't include .env files"
fi

# Verify environment template exists
if [[ ! -f ".env.example" ]]; then
    print_warning "⚠️ No .env.example template found"
fi

# ========================================
# 📊 SECURITY SUMMARY
# ========================================

echo ""
echo "========================================="
echo "🔒 SECURITY CHECK SUMMARY"
echo "========================================="

if [[ "$SECURITY_VIOLATION" == "true" ]]; then
    print_error "❌ COMMIT BLOCKED: Security violations found!"
    echo ""
    echo "To fix these issues:"
    echo "1. Remove sensitive data from staged files"
    echo "2. Add sensitive files to .gitignore"
    echo "3. Use environment variables for secrets"
    echo "4. Review and update your .env.example"
    echo "5. Never commit real credentials or API keys"
    echo ""
    echo "For help, check:"
    echo "- SECURITY_AUDIT_CHECKLIST.md"
    echo "- .env.example for proper configuration"
    echo "- INCIDENT_RESPONSE_PLAN.md if secrets were already exposed"
    echo ""
    exit 1
else
    print_success "✅ All security checks passed!"
    echo ""
    echo "Files being committed:"
    echo "$STAGED_FILES" | sed 's/^/  - /'
    echo ""
    print_status "Remember to:"
    echo "  - Review your changes before pushing"
    echo "  - Keep secrets in environment variables"
    echo "  - Run security scans regularly"
    echo "  - Monitor for unusual activity"
    echo ""
fi

print_success "🔒 Pre-commit security check completed successfully!"
exit 0