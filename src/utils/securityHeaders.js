/**
 * Security Headers Management for Monarch Passport MVP
 * 
 * This module provides security headers including:
 * - Content Security Policy (CSP)
 * - HTTP Strict Transport Security (HSTS)
 * - X-Frame-Options
 * - X-Content-Type-Options
 * - Referrer Policy
 * - Permissions Policy
 */

// Content Security Policy configuration
const CSP_CONFIG = {
  development: {
    'default-src': ["'self'"],
    'script-src': [
      "'self'",
      "'unsafe-inline'",
      "'unsafe-eval'",
      'https://cdn.jsdelivr.net',
      'https://unpkg.com'
    ],
    'style-src': [
      "'self'",
      "'unsafe-inline'",
      'https://fonts.googleapis.com'
    ],
    'font-src': [
      "'self'",
      'https://fonts.gstatic.com',
      'data:'
    ],
    'img-src': [
      "'self'",
      'data:',
      'https:',
      'blob:'
    ],
    'connect-src': [
      "'self'",
      'https://*.supabase.co',
      'https://*.vercel.app',
      'wss://*.supabase.co'
    ],
    'frame-src': ["'none'"],
    'object-src': ["'none'"],
    'base-uri': ["'self'"],
    'form-action': ["'self'"],
    'frame-ancestors': ["'none'"],
    'upgrade-insecure-requests': []
  },
  production: {
    'default-src': ["'self'"],
    'script-src': [
      "'self'",
      'https://cdn.jsdelivr.net'
    ],
    'style-src': [
      "'self'",
      'https://fonts.googleapis.com'
    ],
    'font-src': [
      "'self'",
      'https://fonts.gstatic.com',
      'data:'
    ],
    'img-src': [
      "'self'",
      'data:',
      'https:',
      'blob:'
    ],
    'connect-src': [
      "'self'",
      'https://*.supabase.co',
      'https://*.vercel.app',
      'wss://*.supabase.co'
    ],
    'frame-src': ["'none'"],
    'object-src': ["'none'"],
    'base-uri': ["'self'"],
    'form-action': ["'self'"],
    'frame-ancestors': ["'none'"],
    'upgrade-insecure-requests': []
  }
};

function getCSPPolicy() {
  const environment = process.env.NODE_ENV || 'development';
  const policies = CSP_CONFIG[environment] || CSP_CONFIG.development;
  
  return Object.entries(policies)
    .map(([directive, sources]) => {
      if (sources.length === 0) {
        return directive;
      }
      return `${directive} ${sources.join(' ')}`;
    })
    .join('; ');
}

function getStrictCSPPolicy() {
  const policies = CSP_CONFIG.production;
  
  return Object.entries(policies)
    .map(([directive, sources]) => {
      if (sources.length === 0) {
        return directive;
      }
      return `${directive} ${sources.join(' ')}`;
    })
    .join('; ');
}

// Security headers configuration
const SECURITY_HEADERS = {
  // Content Security Policy
  'Content-Security-Policy': getCSPPolicy(),
  
  // HTTP Strict Transport Security
  'Strict-Transport-Security': 'max-age=31536000; includeSubDomains; preload',
  
  // Prevent clickjacking
  'X-Frame-Options': 'DENY',
  
  // Prevent MIME type sniffing
  'X-Content-Type-Options': 'nosniff',
  
  // Referrer policy
  'Referrer-Policy': 'strict-origin-when-cross-origin',
  
  // Permissions policy
  'Permissions-Policy': 'camera=(), microphone=(), geolocation=(), payment=()',
  
  // XSS Protection (legacy but still useful)
  'X-XSS-Protection': '1; mode=block',
  
  // Prevent caching of sensitive pages
  'Cache-Control': 'no-store, no-cache, must-revalidate, proxy-revalidate',
  'Pragma': 'no-cache',
  'Expires': '0'
};

// Development headers (less restrictive)
const DEVELOPMENT_HEADERS = {
  ...SECURITY_HEADERS,
  'Content-Security-Policy': getCSPPolicy(),
  'Strict-Transport-Security': 'max-age=0', // Disable HSTS in development
};

// Production headers (strict)
const PRODUCTION_HEADERS = {
  ...SECURITY_HEADERS,
  'Content-Security-Policy': getStrictCSPPolicy(),
  'Strict-Transport-Security': 'max-age=31536000; includeSubDomains; preload',
};

/**
 * Get security headers based on environment
 */
export function getSecurityHeaders() {
  const environment = process.env.NODE_ENV || 'development';
  
  switch (environment) {
    case 'production':
      return PRODUCTION_HEADERS;
    case 'development':
      return DEVELOPMENT_HEADERS;
    default:
      return SECURITY_HEADERS;
  }
}

/**
 * Apply security headers to response
 */
export function applySecurityHeaders(response) {
  const headers = getSecurityHeaders();
  
  Object.entries(headers).forEach(([key, value]) => {
    response.setHeader(key, value);
  });
  
  return response;
}

/**
 * Get CSP header value
 */
export function getCSPHeader() {
  return getSecurityHeaders()['Content-Security-Policy'];
}

/**
 * Get strict CSP header value
 */
export function getStrictCSPHeader() {
  return getStrictCSPPolicy();
}

/**
 * Validate security headers
 */
export function validateSecurityHeaders(headers) {
  const requiredHeaders = [
    'Content-Security-Policy',
    'X-Frame-Options',
    'X-Content-Type-Options',
    'Referrer-Policy'
  ];
  
  const missingHeaders = requiredHeaders.filter(header => !headers[header]);
  
  if (missingHeaders.length > 0) {
    console.warn('Missing security headers:', missingHeaders);
    return false;
  }
  
  return true;
}

/**
 * Security headers audit
 */
export function auditSecurityHeaders() {
  const headers = getSecurityHeaders();
  const audit = {
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV || 'development',
    totalHeaders: Object.keys(headers).length,
    headers: headers,
    validation: validateSecurityHeaders(headers)
  };
  
  return audit;
}

/**
 * Get security headers meta tags as HTML string
 */
export function getSecurityHeadersMetaTags() {
  const headers = getSecurityHeaders();
  
  return `
    <!-- CSP Meta Tag (fallback for older browsers) -->
    <meta http-equiv="Content-Security-Policy" content="${headers['Content-Security-Policy']}" />
    
    <!-- X-Frame-Options Meta Tag -->
    <meta http-equiv="X-Frame-Options" content="${headers['X-Frame-Options']}" />
    
    <!-- X-Content-Type-Options Meta Tag -->
    <meta http-equiv="X-Content-Type-Options" content="${headers['X-Content-Type-Options']}" />
    
    <!-- Referrer Policy Meta Tag -->
    <meta name="referrer" content="${headers['Referrer-Policy']}" />
  `;
}

/**
 * Security headers middleware for Express.js
 */
export function securityHeadersMiddleware(req, res, next) {
  applySecurityHeaders(res);
  next();
}

/**
 * Enhanced security headers with custom policies
 */
export function getEnhancedSecurityHeaders(customPolicies = {}) {
  const baseHeaders = getSecurityHeaders();
  
  // Merge custom policies
  const enhancedHeaders = { ...baseHeaders };
  
  if (customPolicies.csp) {
    enhancedHeaders['Content-Security-Policy'] = customPolicies.csp;
  }
  
  if (customPolicies.hsts) {
    enhancedHeaders['Strict-Transport-Security'] = customPolicies.hsts;
  }
  
  if (customPolicies.frameOptions) {
    enhancedHeaders['X-Frame-Options'] = customPolicies.frameOptions;
  }
  
  return enhancedHeaders;
}

export default {
  getSecurityHeaders,
  applySecurityHeaders,
  getCSPHeader,
  getStrictCSPHeader,
  validateSecurityHeaders,
  auditSecurityHeaders,
  getSecurityHeadersMetaTags,
  securityHeadersMiddleware,
  getEnhancedSecurityHeaders
}; 