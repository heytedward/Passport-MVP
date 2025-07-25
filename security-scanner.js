#!/usr/bin/env node

/**
 * 🔒 Monarch Passport MVP - Security Scanner
 * Automated vulnerability detection for the codebase
 */

const fs = require('fs');
const path = require('path');
const crypto = require('crypto');

class SecurityScanner {
  constructor() {
    this.findings = [];
    this.riskLevels = {
      CRITICAL: 'CRITICAL',
      HIGH: 'HIGH',
      MEDIUM: 'MEDIUM',
      LOW: 'LOW'
    };
    this.categories = {
      SECRETS: 'Secrets & Credentials',
      CRYPTO: 'Cryptography',
      AUTH: 'Authentication',
      INJECTION: 'Injection Vulnerabilities',
      XSS: 'Cross-Site Scripting',
      CONFIG: 'Configuration',
      DEPS: 'Dependencies',
      API: 'API Security'
    };
  }

  // Security patterns to scan for
  getSecurityPatterns() {
    return {
      [this.categories.SECRETS]: {
        patterns: [
          { regex: /PAPILLON_SECRET/gi, risk: this.riskLevels.CRITICAL, description: 'Hardcoded secret found' },
          { regex: /password\s*[=:]\s*['"][^'"]{1,20}['"]/gi, risk: this.riskLevels.HIGH, description: 'Hardcoded password' },
          { regex: /api[_-]?key\s*[=:]\s*['"][^'"]+['"]/gi, risk: this.riskLevels.HIGH, description: 'Hardcoded API key' },
          { regex: /secret[_-]?key\s*[=:]\s*['"][^'"]+['"]/gi, risk: this.riskLevels.HIGH, description: 'Hardcoded secret key' },
          { regex: /admin[_-]?password/gi, risk: this.riskLevels.CRITICAL, description: 'Admin password reference' },
          { regex: /process\.env\.\w+/g, risk: this.riskLevels.MEDIUM, description: 'Environment variable usage' }
        ]
      },
      [this.categories.CRYPTO]: {
        patterns: [
          { regex: /xorEncrypt|xorDecrypt/gi, risk: this.riskLevels.CRITICAL, description: 'Weak XOR encryption used' },
          { regex: /btoa|atob/gi, risk: this.riskLevels.HIGH, description: 'Base64 encoding (not encryption)' },
          { regex: /md5|sha1(?!256)/gi, risk: this.riskLevels.HIGH, description: 'Weak hashing algorithm' },
          { regex: /Math\.random\(\)/gi, risk: this.riskLevels.MEDIUM, description: 'Non-cryptographic random number' }
        ]
      },
      [this.categories.AUTH]: {
        patterns: [
          { regex: /role\s*===?\s*['"]admin['"]/gi, risk: this.riskLevels.HIGH, description: 'Hardcoded admin role check' },
          { regex: /localStorage\.setItem.*token/gi, risk: this.riskLevels.MEDIUM, description: 'Token stored in localStorage' },
          { regex: /document\.cookie/gi, risk: this.riskLevels.MEDIUM, description: 'Direct cookie manipulation' },
          { regex: /auth\.signInWithPassword/gi, risk: this.riskLevels.LOW, description: 'Password authentication' }
        ]
      },
      [this.categories.INJECTION]: {
        patterns: [
          { regex: /innerHTML\s*[=]/gi, risk: this.riskLevels.HIGH, description: 'Potential XSS via innerHTML' },
          { regex: /eval\s*\(/gi, risk: this.riskLevels.CRITICAL, description: 'Use of eval() function' },
          { regex: /new Function\(/gi, risk: this.riskLevels.HIGH, description: 'Dynamic code execution' },
          { regex: /dangerouslySetInnerHTML/gi, risk: this.riskLevels.HIGH, description: 'React dangerouslySetInnerHTML' }
        ]
      },
      [this.categories.API]: {
        patterns: [
          { regex: /fetch\(\s*['"][^'"]*['"](?![^)]*method)/gi, risk: this.riskLevels.MEDIUM, description: 'GET request without explicit method' },
          { regex: /cors\s*:\s*['"]?\*['"]?/gi, risk: this.riskLevels.HIGH, description: 'Wildcard CORS policy' },
          { regex: /\.json\(\).*catch/gi, risk: this.riskLevels.LOW, description: 'JSON parsing with error handling' }
        ]
      }
    };
  }

  // Scan a single file
  scanFile(filePath) {
    try {
      const content = fs.readFileSync(filePath, 'utf8');
      const patterns = this.getSecurityPatterns();
      
      Object.entries(patterns).forEach(([category, { patterns: categoryPatterns }]) => {
        categoryPatterns.forEach(({ regex, risk, description }) => {
          const matches = content.match(regex);
          if (matches) {
            matches.forEach(match => {
              const lines = content.split('\n');
              const lineNumber = this.getLineNumber(content, match);
              
              this.findings.push({
                file: filePath,
                line: lineNumber,
                category,
                risk,
                description,
                code: match.trim(),
                context: this.getContext(lines, lineNumber - 1)
              });
            });
          }
        });
      });
    } catch (error) {
      console.error(`Error scanning ${filePath}:`, error.message);
    }
  }

  // Get line number for a match
  getLineNumber(content, match) {
    const beforeMatch = content.indexOf(match);
    const beforeLines = content.substring(0, beforeMatch).split('\n');
    return beforeLines.length;
  }

  // Get context around the line
  getContext(lines, lineIndex) {
    const start = Math.max(0, lineIndex - 1);
    const end = Math.min(lines.length, lineIndex + 2);
    return lines.slice(start, end).map((line, i) => ({
      number: start + i + 1,
      code: line,
      highlight: start + i === lineIndex
    }));
  }

  // Scan directory recursively
  scanDirectory(dir, extensions = ['.js', '.jsx', '.ts', '.tsx', '.json', '.sql']) {
    const files = fs.readdirSync(dir);
    
    files.forEach(file => {
      const filePath = path.join(dir, file);
      const stat = fs.statSync(filePath);
      
      if (stat.isDirectory()) {
        // Skip node_modules and build directories
        if (!['node_modules', 'build', 'dist', '.git'].includes(file)) {
          this.scanDirectory(filePath, extensions);
        }
      } else if (extensions.some(ext => file.endsWith(ext))) {
        this.scanFile(filePath);
      }
    });
  }

  // Generate security report
  generateReport() {
    const report = {
      timestamp: new Date().toISOString(),
      summary: {
        totalFindings: this.findings.length,
        critical: this.findings.filter(f => f.risk === this.riskLevels.CRITICAL).length,
        high: this.findings.filter(f => f.risk === this.riskLevels.HIGH).length,
        medium: this.findings.filter(f => f.risk === this.riskLevels.MEDIUM).length,
        low: this.findings.filter(f => f.risk === this.riskLevels.LOW).length
      },
      findings: this.findings.sort((a, b) => {
        const riskOrder = { CRITICAL: 4, HIGH: 3, MEDIUM: 2, LOW: 1 };
        return riskOrder[b.risk] - riskOrder[a.risk];
      })
    };

    return report;
  }

  // Display findings in console
  displayFindings() {
    console.log('\n🔒 MONARCH PASSPORT MVP - SECURITY SCAN RESULTS\n');
    console.log('=' .repeat(60));
    
    const summary = this.generateReport().summary;
    
    // Risk level colors
    const colors = {
      CRITICAL: '\x1b[91m',  // Bright red
      HIGH: '\x1b[31m',      // Red
      MEDIUM: '\x1b[33m',    // Yellow
      LOW: '\x1b[36m',       // Cyan
      RESET: '\x1b[0m',      // Reset
      BOLD: '\x1b[1m'        // Bold
    };

    console.log(`${colors.BOLD}SUMMARY:${colors.RESET}`);
    console.log(`Total Findings: ${summary.totalFindings}`);
    console.log(`${colors.CRITICAL}Critical: ${summary.critical}${colors.RESET}`);
    console.log(`${colors.HIGH}High: ${summary.high}${colors.RESET}`);
    console.log(`${colors.MEDIUM}Medium: ${summary.medium}${colors.RESET}`);
    console.log(`${colors.LOW}Low: ${summary.low}${colors.RESET}\n`);

    if (this.findings.length === 0) {
      console.log('✅ No security issues found!');
      return;
    }

    // Group findings by category
    const byCategory = {};
    this.findings.forEach(finding => {
      if (!byCategory[finding.category]) {
        byCategory[finding.category] = [];
      }
      byCategory[finding.category].push(finding);
    });

    Object.entries(byCategory).forEach(([category, findings]) => {
      console.log(`\n${colors.BOLD}${category.toUpperCase()}${colors.RESET}`);
      console.log('-'.repeat(40));
      
      findings.forEach((finding, index) => {
        const riskColor = colors[finding.risk] || colors.RESET;
        console.log(`\n${index + 1}. ${riskColor}[${finding.risk}]${colors.RESET} ${finding.description}`);
        console.log(`   File: ${finding.file}:${finding.line}`);
        console.log(`   Code: ${finding.code}`);
        
        if (finding.context) {
          console.log('   Context:');
          finding.context.forEach(ctx => {
            const prefix = ctx.highlight ? '  >' : '   ';
            console.log(`${prefix} ${ctx.number}: ${ctx.code}`);
          });
        }
      });
    });

    console.log('\n' + '='.repeat(60));
    console.log('🚨 IMMEDIATE ACTIONS REQUIRED:');
    console.log('1. Fix all CRITICAL and HIGH risk findings');
    console.log('2. Rotate any exposed secrets');
    console.log('3. Update encryption methods');
    console.log('4. Review authentication flows');
    console.log('5. Implement proper input validation');
  }

  // Save report to file
  saveReport(filename = 'security-report.json') {
    const report = this.generateReport();
    fs.writeFileSync(filename, JSON.stringify(report, null, 2));
    console.log(`\n📄 Detailed report saved to: ${filename}`);
  }

  // Check for specific Monarch Passport vulnerabilities
  customChecks() {
    console.log('\n🔍 Running custom checks for Monarch Passport...');
    
    // Check for .env exposure
    try {
      if (fs.existsSync('.env')) {
        this.findings.push({
          file: '.env',
          line: 1,
          category: this.categories.SECRETS,
          risk: this.riskLevels.CRITICAL,
          description: '.env file exists in repository',
          code: 'Environment file present',
          context: null
        });
      }
    } catch (error) {
      // .env file not accessible
    }

    // Check package.json for vulnerable dependencies
    try {
      const packageJson = JSON.parse(fs.readFileSync('package.json', 'utf8'));
      const vulnerableDeps = {
        'react-scripts': '5.0.1',  // Check for known vulnerabilities
      };

      Object.entries(vulnerableDeps).forEach(([dep, version]) => {
        if (packageJson.dependencies && packageJson.dependencies[dep] === version) {
          this.findings.push({
            file: 'package.json',
            line: 1,
            category: this.categories.DEPS,
            risk: this.riskLevels.MEDIUM,
            description: `Potentially vulnerable dependency: ${dep}@${version}`,
            code: `"${dep}": "${version}"`,
            context: null
          });
        }
      });
    } catch (error) {
      console.log('Could not read package.json');
    }

    // Check for missing security headers
    this.findings.push({
      file: 'vercel.json or nginx.conf',
      line: 1,
      category: this.categories.CONFIG,
      risk: this.riskLevels.MEDIUM,
      description: 'Security headers not configured',
      code: 'Missing CSP, HSTS, X-Frame-Options',
      context: null
    });
  }
}

// Main execution
function main() {
  const scanner = new SecurityScanner();
  
  console.log('🔒 Starting security scan...');
  
  // Scan the current directory
  scanner.scanDirectory('./');
  
  // Run custom checks
  scanner.customChecks();
  
  // Display results
  scanner.displayFindings();
  
  // Save detailed report
  scanner.saveReport();
  
  // Exit with error code if critical issues found
  const critical = scanner.findings.filter(f => f.risk === scanner.riskLevels.CRITICAL).length;
  if (critical > 0) {
    console.log(`\n❌ Security scan failed with ${critical} critical issues!`);
    process.exit(1);
  }
  
  console.log('\n✅ Security scan completed successfully!');
}

// Run if called directly
if (require.main === module) {
  main();
}

module.exports = SecurityScanner;