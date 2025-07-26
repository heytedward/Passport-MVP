#!/usr/bin/env node

/**
 * Security Scanner Configuration
 * 
 * This file contains configurable patterns and filters for the security scanner.
 * Modify these settings to customize what the scanner detects and filters out.
 */

module.exports = {
  // Scanning configuration
  scanConfig: {
    // File extensions to scan
    extensions: ['.js', '.jsx', '.ts', '.tsx', '.json', '.md', '.txt', '.yml', '.yaml'],
    
    // Directories to exclude from scanning
    excludeDirs: ['node_modules', '.git', '.next', 'dist', 'build', '.vercel', 'coverage'],
    
    // Files to exclude from scanning
    excludeFiles: ['package-lock.json', 'yarn.lock', '.env.example', 'security-scan.js'],
    
    // Maximum file size to scan (in bytes)
    maxFileSize: 1024 * 1024, // 1MB
  },

  // Pattern sensitivity levels
  sensitivityLevels: {
    // STRICT: Catch everything, may have false positives
    // BALANCED: Good balance of detection vs false positives (default)
    // PERMISSIVE: Only catch obvious security issues
    level: 'BALANCED',
    
    strict: {
      apiKeyMinLength: 10,
      secretMinLength: 5,
      enableContextFiltering: false
    },
    
    balanced: {
      apiKeyMinLength: 20,
      secretMinLength: 8,
      enableContextFiltering: true
    },
    
    permissive: {
      apiKeyMinLength: 32,
      secretMinLength: 16,
      enableContextFiltering: true
    }
  },

  // Custom patterns to add to scanning
  customPatterns: {
    // Add your own security patterns here
    // Example:
    // customApiKeys: [
    //   /your-custom-api-pattern-here/
    // ]
  },

  // Whitelist patterns - these will be ignored even if they match security patterns
  whitelist: {
    // Whitelist specific strings
    strings: [
      'process.env.NODE_ENV',
      'process.env.REACT_APP_',
      'REACT_APP_SUPABASE_URL',
      'REACT_APP_SUPABASE_ANON_KEY'
    ],
    
    // Whitelist specific file patterns
    filePatterns: [
      /.*\.example$/,
      /.*\.template$/,
      /.*\.sample$/,
      /.*test.*\.js$/,
      /.*spec.*\.js$/
    ],
    
    // Whitelist specific line patterns
    linePatterns: [
      /\/\/ TODO:/,
      /\/\/ FIXME:/,
      /\/\/ NOTE:/,
      /console\.log\(/,
      /console\.debug\(/
    ]
  },

  // False positive filters configuration
  falsePositiveFilters: {
    // Skip function names containing these terms
    functionNameKeywords: [
      'Edition', 'Limited', 'Reward', 'Status', 'Manager', 'Handler', 'Processor'
    ],
    
    // Skip lines containing these safe patterns
    safePatterns: [
      'import ', 'export ', 'from ', '//', '/*', '*/', '<!--',
      'function ', 'const ', 'let ', 'var ', 'class '
    ],
    
    // Skip environment variables with these prefixes (they're safe for client-side)
    safeEnvPrefixes: [
      'REACT_APP_',
      'NEXT_PUBLIC_',
      'VUE_APP_',
      'GATSBY_'
    ],
    
    // Skip file types for certain categories
    skipForFileTypes: {
      'hardcodedCreds': ['.md', '.txt', '.rst', '.json'],
      'apiKeys': ['.md', '.txt', '.rst'],
      'envIssues': ['.md', '.txt', '.rst', '.json']
    }
  },

  // Reporting configuration
  reporting: {
    // Show filtered false positives count
    showFilteredCount: true,
    
    // Maximum number of issues to show per category
    maxIssuesPerCategory: 50,
    
    // Show line content in report
    showLineContent: true,
    
    // Truncate long lines at this length
    maxLineLength: 100,
    
    // Colors for different severity levels
    colors: {
      critical: 'red',
      high: 'yellow',
      medium: 'blue',
      low: 'white',
      info: 'cyan',
      success: 'green'
    }
  },

  // Advanced filtering options
  advancedFiltering: {
    // Skip issues in generated files
    skipGeneratedFiles: true,
    
    // Skip issues in test files
    skipTestFiles: true,
    
    // Skip issues in documentation
    skipDocumentation: true,
    
    // Minimum confidence score (0-100) to report an issue
    minConfidenceScore: 70,
    
    // Context analysis - look at surrounding lines for better detection
    contextAnalysis: {
      enabled: true,
      linesBefore: 2,
      linesAfter: 2
    }
  },

  // Integration settings
  integration: {
    // Exit with error code if critical issues found
    exitOnCritical: true,
    
    // Exit with error code if high issues found
    exitOnHigh: false,
    
    // Generate JSON output file
    generateJsonReport: false,
    jsonReportPath: './security-scan-report.json',
    
    // Send results to external service
    webhook: {
      enabled: false,
      url: '',
      headers: {}
    }
  }
};