/**
 * Performance optimization utilities
 * Implements lazy loading, memoization, and other performance enhancements
 */

import { memo, useMemo, useCallback, lazy, useState, useEffect, useRef } from 'react';
import PropTypes from 'prop-types';

/**
 * Debounce utility for search and input handling
 * @param {Function} func - Function to debounce
 * @param {number} delay - Delay in milliseconds
 * @returns {Function} - Debounced function
 */
export const debounce = (func, delay) => {
  let timeoutId;
  return (...args) => {
    clearTimeout(timeoutId);
    timeoutId = setTimeout(() => func.apply(null, args), delay);
  };
};

/**
 * Throttle utility for scroll and resize events
 * @param {Function} func - Function to throttle
 * @param {number} limit - Time limit in milliseconds
 * @returns {Function} - Throttled function
 */
export const throttle = (func, limit) => {
  let inThrottle;
  return (...args) => {
    if (!inThrottle) {
      func.apply(null, args);
      inThrottle = true;
      setTimeout(() => inThrottle = false, limit);
    }
  };
};

/**
 * Lazy load components for code splitting
 */
export const LazyComponents = {
  Programme: lazy(() => import('../pages/Programme')),
  QA: lazy(() => import('../pages/QA')),
  Map: lazy(() => import('../pages/Map')),
  News: lazy(() => import('../pages/News')),
  Sponsors: lazy(() => import('../pages/Sponsors')),
  MyAgenda: lazy(() => import('../pages/MyAgenda')),
  SessionDetail: lazy(() => import('../pages/SessionDetail'))
};

/**
 * Memoized session list component
 */
export const MemoizedSessionList = memo(({ sessions, onSessionClick }) => {
  const sortedSessions = useMemo(() => {
    return [...sessions].sort((a, b) => {
      const dateA = new Date(a.start_time);
      const dateB = new Date(b.start_time);
      return dateA - dateB;
    });
  }, [sessions]);

  const handleSessionClick = useCallback((sessionId) => {
    onSessionClick?.(sessionId);
  }, [onSessionClick]);

  return (
    <div className="session-list">
      {sortedSessions.map(session => (
        <div
          key={session.id}
          className="session-item"
          onClick={() => handleSessionClick(session.id)}
          onKeyDown={(e) => {
            if (e.key === 'Enter' || e.key === ' ') {
              e.preventDefault();
              handleSessionClick(session.id);
            }
          }}
          role="button"
          tabIndex={0}
        >
          <h3>{session.title}</h3>
          <p>{new Date(session.start_time).toLocaleString()}</p>
        </div>
      ))}
    </div>
  );
});

MemoizedSessionList.displayName = 'MemoizedSessionList';

MemoizedSessionList.propTypes = {
  sessions: PropTypes.array.isRequired,
  onSessionClick: PropTypes.func
};

/**
 * Virtual scrolling utility for large lists
 */
export class VirtualScroller {
  constructor({
    itemHeight = 100,
    containerHeight = 400,
    overscan = 5
  } = {}) {
    this.itemHeight = itemHeight;
    this.containerHeight = containerHeight;
    this.overscan = overscan;
  }

  /**
   * Calculate visible items based on scroll position
   * @param {number} scrollTop - Current scroll position
   * @param {number} totalItems - Total number of items
   * @returns {Object} - Visible range and offset
   */
  getVisibleRange(scrollTop, totalItems) {
    const visibleItemCount = Math.ceil(this.containerHeight / this.itemHeight);
    const startIndex = Math.floor(scrollTop / this.itemHeight);
    const endIndex = Math.min(
      startIndex + visibleItemCount + this.overscan,
      totalItems - 1
    );

    const visibleStartIndex = Math.max(0, startIndex - this.overscan);
    const offsetY = visibleStartIndex * this.itemHeight;

    return {
      startIndex: visibleStartIndex,
      endIndex,
      offsetY,
      totalHeight: totalItems * this.itemHeight
    };
  }
}

/**
 * Image lazy loading utility
 */
export const LazyImage = memo(({ src, alt, className, placeholder }) => {
  const [isLoaded, setIsLoaded] = useState(false);
  const [isInView, setIsInView] = useState(false);
  const imgRef = useRef();

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsInView(true);
          observer.disconnect();
        }
      },
      { threshold: 0.1 }
    );

    if (imgRef.current) {
      observer.observe(imgRef.current);
    }

    return () => observer.disconnect();
  }, []);

  const handleLoad = useCallback(() => {
    setIsLoaded(true);
  }, []);

  return (
    <div ref={imgRef} className={`lazy-image-container ${className || ''}`}>
      {isInView && (
        <img
          src={src}
          alt={alt}
          onLoad={handleLoad}
          style={{
            opacity: isLoaded ? 1 : 0,
            transition: 'opacity 0.3s ease'
          }}
        />
      )}
      {!isLoaded && placeholder && (
        <div className="image-placeholder">
          {placeholder}
        </div>
      )}
    </div>
  );
});

LazyImage.displayName = 'LazyImage';

LazyImage.propTypes = {
  src: PropTypes.string.isRequired,
  alt: PropTypes.string.isRequired,
  className: PropTypes.string,
  placeholder: PropTypes.node
};

/**
 * Cache utility for API responses
 */
class CacheManager {
  constructor(maxSize = 100, ttl = 300000) { // 5 minutes default TTL
    this.cache = new Map();
    this.maxSize = maxSize;
    this.ttl = ttl;
  }

  /**
   * Get cached value
   * @param {string} key - Cache key
   * @returns {any} - Cached value or null
   */
  get(key) {
    const item = this.cache.get(key);
    if (!item) return null;

    if (Date.now() > item.expiry) {
      this.cache.delete(key);
      return null;
    }

    return item.value;
  }

  /**
   * Set cached value
   * @param {string} key - Cache key
   * @param {any} value - Value to cache
   */
  set(key, value) {
    // Remove oldest item if cache is full
    if (this.cache.size >= this.maxSize) {
      const firstKey = this.cache.keys().next().value;
      this.cache.delete(firstKey);
    }

    this.cache.set(key, {
      value,
      expiry: Date.now() + this.ttl
    });
  }

  /**
   * Clear cache
   */
  clear() {
    this.cache.clear();
  }

  /**
   * Get cache statistics
   * @returns {Object} - Cache stats
   */
  getStats() {
    return {
      size: this.cache.size,
      maxSize: this.maxSize,
      hitRate: this.hitCount / (this.hitCount + this.missCount) || 0
    };
  }
}

/**
 * Global cache instances
 */
export const cacheManager = {
  sessions: new CacheManager(50, 600000), // 10 minutes for sessions
  questions: new CacheManager(100, 300000), // 5 minutes for questions
  announcements: new CacheManager(20, 180000), // 3 minutes for announcements
  general: new CacheManager(100, 300000) // 5 minutes for general data
};

/**
 * Performance monitoring utilities
 */
export const performanceMonitor = {
  /**
   * Measure component render time
   * @param {string} componentName - Name of the component
   * @param {Function} renderFunction - Function to measure
   */
  measureRender: (componentName, renderFunction) => {
    const startTime = performance.now();
    const result = renderFunction();
    const endTime = performance.now();

    if (endTime - startTime > 16) { // Longer than one frame (60fps)
      console.warn(`Slow render detected in ${componentName}: ${endTime - startTime}ms`);
    }

    return result;
  },

  /**
   * Measure API call performance
   * @param {string} apiName - Name of the API call
   * @param {Function} apiCall - API function to measure
   */
  measureApiCall: async (apiName, apiCall) => {
    const startTime = performance.now();
    try {
      const result = await apiCall();
      const endTime = performance.now();

      if (endTime - startTime > 1000) { // Longer than 1 second
        console.warn(`Slow API call detected for ${apiName}: ${endTime - startTime}ms`);
      }

      return result;
    } catch (error) {
      const endTime = performance.now();
      console.error(`API call failed for ${apiName} after ${endTime - startTime}ms:`, error);
      throw error;
    }
  },

  /**
   * Monitor memory usage
   */
  checkMemoryUsage: () => {
    if ('memory' in performance) {
      const memory = performance.memory;
      const usedMB = Math.round(memory.usedJSHeapSize / 1048576);
      const totalMB = Math.round(memory.totalJSHeapSize / 1048576);
      const limitMB = Math.round(memory.jsHeapSizeLimit / 1048576);

      if (usedMB > limitMB * 0.8) {
        console.warn(`High memory usage detected: ${usedMB}MB / ${limitMB}MB`);
      }

      return { used: usedMB, total: totalMB, limit: limitMB };
    }
    return null;
  }
};

/**
 * Bundle size optimization utilities
 */
export const bundleOptimization = {
  /**
   * Dynamically import utilities only when needed
   */
  loadUtility: async (utilityName) => {
    switch (utilityName) {
      case 'charts':
        return await import('chart.js');
      case 'pdf':
        return await import('jspdf');
      case 'excel':
        return await import('xlsx');
      default:
        throw new Error(`Unknown utility: ${utilityName}`);
    }
  },

  /**
   * Preload critical resources
   */
  preloadCriticalResources: () => {
    // Preload critical CSS
    const criticalCSS = document.createElement('link');
    criticalCSS.rel = 'preload';
    criticalCSS.as = 'style';
    criticalCSS.href = '/css/critical.css';
    document.head.appendChild(criticalCSS);

    // Preload critical fonts
    const criticalFont = document.createElement('link');
    criticalFont.rel = 'preload';
    criticalFont.as = 'font';
    criticalFont.type = 'font/woff2';
    criticalFont.href = '/fonts/inter-var.woff2';
    criticalFont.crossOrigin = 'anonymous';
    document.head.appendChild(criticalFont);
  }
};

const performanceOptimizations = {
  debounce,
  throttle,
  LazyComponents,
  MemoizedSessionList,
  VirtualScroller,
  LazyImage,
  cacheManager,
  performanceMonitor,
  bundleOptimization
};

export default performanceOptimizations;
