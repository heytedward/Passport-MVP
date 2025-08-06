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

// Database query optimization utilities
export class DatabaseOptimizer {
  constructor() {
    this.queryCache = new PerformanceCache(50);
    this.batchQueries = new Map();
    this.pendingQueries = [];
  }

  // Optimize closet query with batching
  static optimizeClosetQuery(userId) {
    return {
      query: `
        SELECT 
          uc.id,
          uc.reward_id,
          uc.name,
          uc.rarity,
          uc.category,
          uc.mint_number,
          uc.wings_earned,
          uc.earned_date,
          uc.earned_via,
          uc.is_equipped,
          r.description,
          r.wings_value,
          r.season,
          r.image_url,
          r.is_active
        FROM user_closet uc
        LEFT JOIN rewards r ON uc.reward_id = r.reward_id
        WHERE uc.user_id = $1
        ORDER BY uc.earned_date DESC
      `,
      params: [userId],
      cacheKey: `closet_${userId}`,
      cacheTTL: 120000 // 2 minutes
    };
  }

  // Optimize theme query with batching
  static optimizeThemeQuery(userId) {
    return {
      query: `
        SELECT 
          themes_unlocked,
          equipped_theme,
          total_scans,
          total_quests_completed,
          total_items_collected,
          wings_balance
        FROM user_profiles
        WHERE id = $1
      `,
      params: [userId],
      cacheKey: `themes_${userId}`,
      cacheTTL: 120000 // 2 minutes
    };
  }

  // Batch multiple queries for better performance
  static batchQueries(queries) {
    const batchKey = queries.map(q => q.cacheKey).join('_');
    const batchQuery = {
      query: queries.map(q => q.query).join('; '),
      params: queries.flatMap(q => q.params),
      cacheKey: batchKey,
      cacheTTL: Math.min(...queries.map(q => q.cacheTTL))
    };
    return batchQuery;
  }

  // Prefetch critical data
  static prefetchCriticalData(userId) {
    const queries = [
      this.optimizeClosetQuery(userId),
      this.optimizeThemeQuery(userId)
    ];
    
    return this.batchQueries(queries);
  }
}

// React component optimization utilities
export class ReactOptimizer {
  // Memoize expensive calculations
  static memoizeExpensiveCalculation(calculation, dependencies) {
    const cache = new Map();
    
    return (...args) => {
      const key = JSON.stringify(args);
      if (cache.has(key)) {
        return cache.get(key);
      }
      
      const result = calculation(...args);
      cache.set(key, result);
      return result;
    };
  }

  // Optimize list rendering with virtualization
  static createVirtualizedList(items, itemHeight = 100, containerHeight = 400) {
    const visibleCount = Math.ceil(containerHeight / itemHeight);
    const totalHeight = items.length * itemHeight;
    
    return {
      visibleItems: items.slice(0, visibleCount),
      totalHeight,
      itemHeight,
      visibleCount
    };
  }

  // Optimize image loading
  static createImageLoader(options = {}) {
    const {
      preloadCount = 3,
      lazyLoadThreshold = 100
    } = options;

    return {
      preloadImages: (images) => {
        return images.slice(0, preloadCount).map(src => {
          const img = new Image();
          img.src = src;
          return img;
        });
      },
      
      lazyLoadImages: (images, callback) => {
        const observer = new IntersectionObserver((entries) => {
          entries.forEach(entry => {
            if (entry.isIntersecting) {
              const img = entry.target;
              img.src = img.dataset.src;
              observer.unobserve(img);
              callback && callback(img);
            }
          });
        }, {
          rootMargin: `${lazyLoadThreshold}px`
        });
        
        return observer;
      }
    };
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
  DatabaseOptimizer,
  ReactOptimizer,
  analyzeBundleSize,
  performanceMonitor,
  memoryMonitor,
  registerServiceWorker,
  initializePerformanceOptimizations
}; 