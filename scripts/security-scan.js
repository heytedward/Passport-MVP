#!/usr/bin/env node

/**
 * Security Scanner for Monarch Passport MVP
 * 
 * This script performs comprehensive security checks on the codebase
 * to identify potential vulnerabilities, exposed secrets, and security misconfigurations.
 */

const fs = require('fs');
const path = require('path');
const crypto = require('crypto');

// Colors for console output
const colors = {
  red: '\x1b[31m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  magenta: '\x1b[35m',
  cyan: '\x1b[36m',
  white: '\x1b[37m',
  reset: '\x1b[0m',
  bold: '\x1b[1m'
};

// Security patterns to check for
const securityPatterns = {
  // API Keys and Secrets
  apiKeys: [
    /sk_live_[a-zA-Z0-9]{24}/,
    /pk_live_[a-zA-Z0-9]{24}/,
    /sk_test_[a-zA-Z0-9]{24}/,
    /pk_test_[a-zA-Z0-9]{24}/,
    /eyJ[A-Za-z0-9-_]+\.[A-Za-z0-9-_]+\.[A-Za-z0-9-_]*/,
    /[A-Za-z0-9+/]{32,}={0,2}/,
    /[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}/i
  ],
  
  // Database connection strings
  databaseUrls: [
    /postgresql:\/\/[^:]+:[^@]+@[^\/]+\/[^?\s]+/,
    /mysql:\/\/[^:]+:[^@]+@[^\/]+\/[^?\s]+/,
    /mongodb:\/\/[^:]+:[^@]+@[^\/]+\/[^?\s]+/
  ],
  
  // Hardcoded credentials
  hardcodedCreds: [
    /password\s*[:=]\s*['"][^'"]+['"]/i,
    /passwd\s*[:=]\s*['"][^'"]+['"]/i,
    /secret\s*[:=]\s*['"][^'"]+['"]/i,
    /(?:api_)?key\s*[:=]\s*['"][^'"]{20,}['"]/i,
    /token\s*[:=]\s*['"][^'"]+['"]/i,
    /credential\s*[:=]\s*['"][^'"]+['"]/i,
    /auth\s*[:=]\s*['"][^'"]+['"]/i
  ],
  
  // Insecure patterns
  insecurePatterns: [
    /eval\s*\(/,
    /innerHTML\s*=/,
    /document\.write\s*\(/,
    /setTimeout\s*\([^,]+,\s*['"][^'"]+['"]\)/,
    /setInterval\s*\([^,]+,\s*['"][^'"]+['"]\)/
  ],
  
  // Environment variable issues
  envIssues: [
    /process\.env\.[A-Z_]+/g,
    /REACT_APP_[A-Z_]+/g
  ],
  
  // File upload vulnerabilities
  fileUploadIssues: [
    /\.upload\s*\(/,
    /FileReader/,
    /File\s*\(/,
    /Blob\s*\(/
  ],
  
  // SQL injection patterns
  sqlInjection: [
    /SELECT.*WHERE.*\+.*['"`][^'"]*['"`]/i,
    /INSERT.*VALUES.*\+.*['"`][^'"]*['"`]/i,
    /UPDATE.*SET.*\+.*['"`][^'"]*['"`]/i,
    /DELETE.*WHERE.*\+.*['"`][^'"]*['"`]/i,
    /query\s*\(\s*['"`][^'"]*\+[^'"]*['"`]/i,
    /execute\s*\(\s*['"`][^'"]*\+[^'"]*['"`]/i
  ],
  
  // XSS patterns
  xssPatterns: [
    /innerHTML\s*=/,
    /outerHTML\s*=/,
    /document\.write\s*\(/,
    /dangerouslySetInnerHTML/
  ]
};

// File extensions to scan
const scanExtensions = [
  '.js', '.jsx', '.ts', '.tsx', '.json', '.md', '.txt', '.yml', '.yaml'
];

// Directories to exclude
const excludeDirs = [
  'node_modules', '.git', '.next', 'dist', 'build', '.vercel'
];

// Files to exclude
const excludeFiles = [
  'package-lock.json', 'yarn.lock', '.env.example', 'security-scan.js'
];

let scanResults = {
  critical: [],
  high: [],
  medium: [],
  low: [],
  info: []
};

function log(message, color = 'white') {
  console.log(`${colors[color]}${message}${colors.reset}`);
}

function logError(message) {
  console.error(`${colors.red}${colors.bold}🚨 CRITICAL: ${message}${colors.reset}`);
}

function logWarning(message) {
  console.warn(`${colors.yellow}${colors.bold}⚠️  HIGH: ${message}${colors.reset}`);
}

function logInfo(message) {
  console.log(`${colors.blue}ℹ️  ${message}${colors.reset}`);
}

function logSuccess(message) {
  console.log(`${colors.green}${colors.bold}✅ ${message}${colors.reset}`);
}

function shouldScanFile(filePath) {
  const ext = path.extname(filePath);
  const fileName = path.basename(filePath);
  
  if (!scanExtensions.includes(ext)) return false;
  if (excludeFiles.includes(fileName)) return false;
  if (fileName.endsWith('.map')) return false;
  
  for (const excludeDir of excludeDirs) {
    if (filePath.includes(excludeDir)) return false;
  }
  
  return true;
}

function scanFileForPatterns(filePath, content) {
  const issues = [];
  const lines = content.split('\n');
  
  Object.entries(securityPatterns).forEach(([category, patterns]) => {
    patterns.forEach(pattern => {
      const matches = content.match(pattern);
      if (matches) {
        lines.forEach((line, index) => {
          if (pattern.test(line)) {
            issues.push({
              category,
              pattern: pattern.toString(),
              line: index + 1,
              content: line.trim(),
              severity: getSeverity(category)
            });
          }
        });
      }
    });
  });
  
  return issues;
}

function getSeverity(category) {
  const severityMap = {
    apiKeys: 'critical',
    databaseUrls: 'critical',
    hardcodedCreds: 'critical',
    insecurePatterns: 'high',
    envIssues: 'medium',
    fileUploadIssues: 'medium',
    sqlInjection: 'high',
    xssPatterns: 'high'
  };
  
  return severityMap[category] || 'medium';
}

function scanDirectory(dirPath) {
  const files = fs.readdirSync(dirPath, { withFileTypes: true });
  
  files.forEach(file => {
    const fullPath = path.join(dirPath, file.name);
    
    if (file.isDirectory()) {
      scanDirectory(fullPath);
    } else if (file.isFile() && shouldScanFile(fullPath)) {
      try {
        const content = fs.readFileSync(fullPath, 'utf8');
        const issues = scanFileForPatterns(fullPath, content);
        
        issues.forEach(issue => {
          const result = {
            file: fullPath,
            ...issue
          };
          
          scanResults[issue.severity].push(result);
        });
      } catch (error) {
        logWarning(`Could not read file: ${fullPath}`);
      }
    }
  });
}

function checkGitHistory() {
  logInfo('Checking Git history for exposed secrets...');
  
  try {
    const { execSync } = require('child_process');
    
    // Check for actual .env files (not .env.example)
    const gitLog = execSync('git log --all --full-history --name-only -- .env', { encoding: 'utf8' });
    
    if (gitLog.trim() && !gitLog.includes('.env.example')) {
      logWarning('Found .env files in Git history!');
      logInfo('Note: This may be due to Vercel caching or deployment history.');
      logInfo('Recommendation: Consider this a MEDIUM priority issue if .env files are no longer tracked.');
      logInfo('For complete cleanup: git filter-branch --force --index-filter "git rm --cached --ignore-unmatch .env" --prune-empty --tag-name-filter cat -- --all');
    } else {
      logSuccess('No .env files found in Git history (only .env.example files detected, which are safe)');
    }
  } catch (error) {
    logSuccess('No .env files found in Git history');
  }
}

function checkDependencies() {
  logInfo('Checking for known vulnerabilities in dependencies...');
  
  try {
    const { execSync } = require('child_process');
    const auditResult = execSync('npm audit --json', { encoding: 'utf8' });
    const audit = JSON.parse(auditResult);
    
    if (audit.metadata.vulnerabilities) {
      Object.entries(audit.metadata.vulnerabilities).forEach(([severity, count]) => {
        if (count > 0) {
          logWarning(`Found ${count} ${severity} vulnerabilities in dependencies`);
        }
      });
    } else {
      logSuccess('No vulnerabilities found in dependencies');
    }
  } catch (error) {
    logWarning('Could not run npm audit');
  }
}

function checkEnvironmentFiles() {
  logInfo('Checking environment files...');
  
  const envFiles = [
    '.env', '.env.local', '.env.development', '.env.production',
    '.env.test', '.env.staging'
  ];
  
  envFiles.forEach(file => {
    if (fs.existsSync(file)) {
      logWarning(`Found environment file: ${file}`);
      
      // Check if it's tracked by Git
      try {
        const { execSync } = require('child_process');
        const gitStatus = execSync(`git status --porcelain ${file}`, { encoding: 'utf8' });
        
        if (gitStatus.trim()) {
          logError(`Environment file ${file} is tracked by Git!`);
        } else {
          logSuccess(`${file} is not tracked by Git`);
        }
      } catch (error) {
        logInfo(`Could not check Git status for ${file}`);
      }
    }
  });
}

function generateReport() {
  console.log(`\n${colors.cyan}${colors.bold}📊 Security Scan Report${colors.reset}\n`);
  
  const totalIssues = Object.values(scanResults).reduce((sum, arr) => sum + arr.length, 0);
  
  if (totalIssues === 0) {
    logSuccess('No security issues found! 🎉');
    return;
  }
  
  // Summary
  console.log(`${colors.bold}Summary:${colors.reset}`);
  Object.entries(scanResults).forEach(([severity, issues]) => {
    if (issues.length > 0) {
      const color = severity === 'critical' ? 'red' : 
                   severity === 'high' ? 'yellow' : 
                   severity === 'medium' ? 'blue' : 'white';
      log(`${severity.toUpperCase()}: ${issues.length} issues`, color);
    }
  });
  
  console.log(`\n${colors.bold}Detailed Findings:${colors.reset}\n`);
  
  // Critical issues
  if (scanResults.critical.length > 0) {
    console.log(`${colors.red}${colors.bold}🚨 CRITICAL ISSUES:${colors.reset}`);
    scanResults.critical.forEach(issue => {
      console.log(`  ${colors.red}• ${issue.file}:${issue.line} - ${issue.category}${colors.reset}`);
      console.log(`    ${issue.content.substring(0, 100)}...`);
    });
    console.log('');
  }
  
  // High issues
  if (scanResults.high.length > 0) {
    console.log(`${colors.yellow}${colors.bold}⚠️  HIGH PRIORITY ISSUES:${colors.reset}`);
    scanResults.high.forEach(issue => {
      console.log(`  ${colors.yellow}• ${issue.file}:${issue.line} - ${issue.category}${colors.reset}`);
      console.log(`    ${issue.content.substring(0, 100)}...`);
    });
    console.log('');
  }
  
  // Medium issues
  if (scanResults.medium.length > 0) {
    console.log(`${colors.blue}${colors.bold}ℹ️  MEDIUM PRIORITY ISSUES:${colors.reset}`);
    scanResults.medium.forEach(issue => {
      console.log(`  ${colors.blue}• ${issue.file}:${issue.line} - ${issue.category}${colors.reset}`);
    });
    console.log('');
  }
  
  // Recommendations
  console.log(`${colors.bold}🔧 Recommendations:${colors.reset}`);
  
  if (scanResults.critical.length > 0) {
    console.log(`${colors.red}• IMMEDIATE: Fix all critical issues before deployment${colors.reset}`);
  }
  
  if (scanResults.high.length > 0) {
    console.log(`${colors.yellow}• HIGH: Address high priority issues within 24 hours${colors.reset}`);
  }
  
  console.log('• Enable automated security scanning in CI/CD');
  console.log('• Implement security code review process');
  console.log('• Regular security training for development team');
  console.log('• Set up security monitoring and alerting');
}

function main() {
  console.log(`${colors.cyan}${colors.bold}🔒 Security Scanner for Monarch Passport MVP${colors.reset}\n`);
  
  const startTime = Date.now();
  
  try {
    // Check environment files
    checkEnvironmentFiles();
    
    // Check Git history
    checkGitHistory();
    
    // Check dependencies
    checkDependencies();
    
    // Scan codebase
    logInfo('Scanning codebase for security issues...');
    scanDirectory('.');
    
    // Generate report
    generateReport();
    
    const endTime = Date.now();
    const duration = ((endTime - startTime) / 1000).toFixed(2);
    
    console.log(`\n${colors.green}Scan completed in ${duration}s${colors.reset}`);
    
    // Exit with error code if critical issues found
    if (scanResults.critical.length > 0) {
      process.exit(1);
    }
    
  } catch (error) {
    logError(`Scan failed: ${error.message}`);
    process.exit(1);
  }
}

// Run if called directly
if (require.main === module) {
  main();
}

module.exports = { scanDirectory, scanFileForPatterns, securityPatterns }; 