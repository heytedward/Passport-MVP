// Performance optimization utilities for Monarch Passport MVP

// Preload critical resources
export const preloadCriticalResources = () => {
  // Preload critical CSS
  const criticalCSS = document.createElement('link');
  criticalCSS.rel = 'preload';
  criticalCSS.as = 'style';
  criticalCSS.href = '/static/css/main.css';
  document.head.appendChild(criticalCSS);

  // Preload critical fonts
  const fontPreload = document.createElement('link');
  fontPreload.rel = 'preload';
  fontPreload.as = 'font';
  fontPreload.crossOrigin = 'anonymous';
  fontPreload.href = '/static/media/fonts.woff2';
  document.head.appendChild(fontPreload);
};

// Lazy load non-critical components
export const lazyLoadComponent = (importFunc, fallback = null) => {
  const LazyComponent = React.lazy(importFunc);
  
  return (props) => (
    <React.Suspense fallback={fallback}>
      <LazyComponent {...props} />
    </React.Suspense>
  );
};

// Optimize images based on device capabilities
export const getOptimizedImageSrc = (src, options = {}) => {
  if (!src) return null;

  const {
    width = 512,
    quality = 85,
    format = 'auto'
  } = options;

  // Check if WebP is supported
  const supportsWebP = () => {
    const canvas = document.createElement('canvas');
    canvas.width = 1;
    canvas.height = 1;
    return canvas.toDataURL('image/webp').indexOf('data:image/webp') === 0;
  };

  // Generate optimized src
  if (format === 'webp' && supportsWebP()) {
    return src.replace(/\.(jpg|jpeg|png)$/i, '.webp');
  }

  return src;
};

// Debounce function for performance
export const debounce = (func, wait) => {
  let timeout;
  return function executedFunction(...args) {
    const later = () => {
      clearTimeout(timeout);
      func(...args);
    };
    clearTimeout(timeout);
    timeout = setTimeout(later, wait);
  };
};

// Throttle function for performance
export const throttle = (func, limit) => {
  let inThrottle;
  return function() {
    const args = arguments;
    const context = this;
    if (!inThrottle) {
      func.apply(context, args);
      inThrottle = true;
      setTimeout(() => inThrottle = false, limit);
    }
  };
};

// Cache management
export class PerformanceCache {
  constructor(maxSize = 100) {
    this.cache = new Map();
    this.maxSize = maxSize;
  }

  set(key, value, ttl = 300000) { // 5 minutes default TTL
    if (this.cache.size >= this.maxSize) {
      const firstKey = this.cache.keys().next().value;
      this.cache.delete(firstKey);
    }

    this.cache.set(key, {
      value,
      expiry: Date.now() + ttl
    });
  }

  get(key) {
    const item = this.cache.get(key);
    if (!item) return null;

    if (Date.now() > item.expiry) {
      this.cache.delete(key);
      return null;
    }

    return item.value;
  }

  clear() {
    this.cache.clear();
  }

  size() {
    return this.cache.size;
  }
}

// Bundle size analyzer
export const analyzeBundleSize = () => {
  if (process.env.NODE_ENV === 'development') {
    const bundleSize = {
      total: 0,
      chunks: {}
    };

    // This would integrate with webpack-bundle-analyzer in production
    console.log('Bundle size analysis available in production build');
    return bundleSize;
  }
};

// Performance monitoring
export const performanceMonitor = {
  marks: new Map(),
  
  start(label) {
    if (performance.mark) {
      performance.mark(`${label}-start`);
      this.marks.set(label, Date.now());
    }
  },
  
  end(label) {
    if (performance.mark && performance.measure) {
      performance.mark(`${label}-end`);
      performance.measure(label, `${label}-start`, `${label}-end`);
      
      const duration = Date.now() - (this.marks.get(label) || 0);
      console.log(`Performance: ${label} took ${duration}ms`);
      
      this.marks.delete(label);
    }
  },
  
  measure(label, fn) {
    this.start(label);
    const result = fn();
    this.end(label);
    return result;
  }
};

// Memory usage monitoring
export const memoryMonitor = {
  getMemoryUsage() {
    if (performance.memory) {
      return {
        used: performance.memory.usedJSHeapSize,
        total: performance.memory.totalJSHeapSize,
        limit: performance.memory.jsHeapSizeLimit
      };
    }
    return null;
  },
  
  logMemoryUsage() {
    const usage = this.getMemoryUsage();
    if (usage) {
      console.log('Memory usage:', {
        used: `${(usage.used / 1024 / 1024).toFixed(2)} MB`,
        total: `${(usage.total / 1024 / 1024).toFixed(2)} MB`,
        limit: `${(usage.limit / 1024 / 1024).toFixed(2)} MB`
      });
    }
  }
};

// Service Worker registration for caching
export const registerServiceWorker = async () => {
  if ('serviceWorker' in navigator) {
    try {
      const registration = await navigator.serviceWorker.register('/sw.js');
      console.log('Service Worker registered:', registration);
      return registration;
    } catch (error) {
      console.log('Service Worker registration failed:', error);
    }
  }
};

// Initialize performance optimizations
export const initializePerformanceOptimizations = () => {
  // Preload critical resources
  preloadCriticalResources();
  
  // Register service worker
  registerServiceWorker();
  
  // Monitor memory usage periodically
  setInterval(() => {
    memoryMonitor.logMemoryUsage();
  }, 30000); // Every 30 seconds
  
  console.log('Performance optimizations initialized');
};

export default {
  preloadCriticalResources,
  lazyLoadComponent,
  getOptimizedImageSrc,
  debounce,
  throttle,
  PerformanceCache,
  analyzeBundleSize,
  performanceMonitor,
  memoryMonitor,
  registerServiceWorker,
  initializePerformanceOptimizations
}; 