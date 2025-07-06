/**
 * Performance monitoring utilities for the Communication Matters Conference App
 * Provides tools for measuring and tracking application performance
 */

// Performance metrics storage
const performanceMetrics = {
  pageLoads: [],
  apiCalls: [],
  userInteractions: [],
  errors: [],
  memoryUsage: []
};

/**
 * Initialize performance monitoring
 */
export const initPerformanceMonitoring = () => {

  // Monitor page load performance
  if (typeof window !== 'undefined' && window.performance) {
    window.addEventListener('load', () => {
      measurePageLoadPerformance();
    });

    // Monitor memory usage periodically
    setInterval(measureMemoryUsage, 30000); // Every 30 seconds

    // Monitor long tasks
    if ('PerformanceObserver' in window) {
      observeLongTasks();
      observeLayoutShifts();
      observeLargestContentfulPaint();
    }
  }
};

/**
 * Measure page load performance
 */
const measurePageLoadPerformance = () => {
  if (!window.performance || !window.performance.timing) return;

  const timing = window.performance.timing;
  const navigation = window.performance.navigation;

  const metrics = {
    timestamp: Date.now(),
    url: window.location.pathname,
    loadTime: timing.loadEventEnd - timing.navigationStart,
    domContentLoaded: timing.domContentLoadedEventEnd - timing.navigationStart,
    firstPaint: getFirstPaint(),
    firstContentfulPaint: getFirstContentfulPaint(),
    navigationType: getNavigationType(navigation.type),
    redirectCount: navigation.redirectCount
  };

  performanceMetrics.pageLoads.push(metrics);

  // Log slow page loads
  if (metrics.loadTime > 3000) {
    console.warn('⚠️ Slow page load detected:', metrics.loadTime + 'ms');
  }
};

/**
 * Get First Paint timing
 */
const getFirstPaint = () => {
  if (!window.performance || !window.performance.getEntriesByType) return null;

  const paintEntries = window.performance.getEntriesByType('paint');
  const firstPaint = paintEntries.find(entry => entry.name === 'first-paint');
  return firstPaint ? firstPaint.startTime : null;
};

/**
 * Get First Contentful Paint timing
 */
const getFirstContentfulPaint = () => {
  if (!window.performance || !window.performance.getEntriesByType) return null;

  const paintEntries = window.performance.getEntriesByType('paint');
  const fcp = paintEntries.find(entry => entry.name === 'first-contentful-paint');
  return fcp ? fcp.startTime : null;
};

/**
 * Get navigation type description
 */
const getNavigationType = (type) => {
  const types = {
    0: 'navigate',
    1: 'reload',
    2: 'back_forward',
    255: 'reserved'
  };
  return types[type] || 'unknown';
};

/**
 * Observe long tasks that block the main thread
 */
const observeLongTasks = () => {
  try {
    const observer = new PerformanceObserver((list) => {
      list.getEntries().forEach((entry) => {
        if (entry.duration > 50) { // Tasks longer than 50ms
          console.warn('⚠️ Long task detected:', {
            duration: entry.duration,
            startTime: entry.startTime,
            name: entry.name
          });
        }
      });
    });

    observer.observe({ entryTypes: ['longtask'] });
  } catch (error) {
  }
};

/**
 * Observe layout shifts (CLS - Cumulative Layout Shift)
 */
const observeLayoutShifts = () => {
  try {
    // let clsValue = 0; // Removed unused variable

    const observer = new PerformanceObserver((list) => {
      list.getEntries().forEach((entry) => {
        if (!entry.hadRecentInput) {
          // clsValue += entry.value; // Commented out unused accumulation

          if (entry.value > 0.1) {
            console.warn('⚠️ Layout shift detected:', {
              value: entry.value,
              sources: entry.sources
            });
          }
        }
      });

    });

    observer.observe({ entryTypes: ['layout-shift'] });
  } catch (error) {
  }
};

/**
 * Observe Largest Contentful Paint (LCP)
 */
const observeLargestContentfulPaint = () => {
  try {
    const observer = new PerformanceObserver((list) => {
      list.getEntries().forEach((entry) => {

        if (entry.startTime > 2500) {
          console.warn('⚠️ Slow LCP detected:', entry.startTime + 'ms');
        }
      });
    });

    observer.observe({ entryTypes: ['largest-contentful-paint'] });
  } catch (error) {
  }
};

/**
 * Measure memory usage
 */
const measureMemoryUsage = () => {
  if (!window.performance || !window.performance.memory) return;

  const memory = window.performance.memory;
  const metrics = {
    timestamp: Date.now(),
    usedJSHeapSize: memory.usedJSHeapSize,
    totalJSHeapSize: memory.totalJSHeapSize,
    jsHeapSizeLimit: memory.jsHeapSizeLimit,
    usagePercentage: (memory.usedJSHeapSize / memory.jsHeapSizeLimit) * 100
  };

  performanceMetrics.memoryUsage.push(metrics);

  // Keep only last 20 measurements
  if (performanceMetrics.memoryUsage.length > 20) {
    performanceMetrics.memoryUsage.shift();
  }

  // Warn about high memory usage
  if (metrics.usagePercentage > 80) {
    console.warn('⚠️ High memory usage detected:', metrics.usagePercentage.toFixed(2) + '%');
  }
};

/**
 * Track API call performance
 */
export const trackApiCall = (url, method = 'GET') => {
  const startTime = performance.now();

  return {
    end: (success = true, error = null) => {
      const endTime = performance.now();
      const duration = endTime - startTime;

      const metrics = {
        timestamp: Date.now(),
        url,
        method,
        duration,
        success,
        error: error ? error.message : null
      };

      performanceMetrics.apiCalls.push(metrics);

      // Keep only last 50 API calls
      if (performanceMetrics.apiCalls.length > 50) {
        performanceMetrics.apiCalls.shift();
      }

      // Warn about slow API calls
      if (duration > 2000) {
        console.warn('⚠️ Slow API call detected:', duration.toFixed(2) + 'ms');
      }

      return metrics;
    }
  };
};

/**
 * Track user interaction performance
 */
export const trackUserInteraction = (action, element = null) => {
  const startTime = performance.now();

  return {
    end: () => {
      const endTime = performance.now();
      const duration = endTime - startTime;

      const metrics = {
        timestamp: Date.now(),
        action,
        element: element ? element.tagName + (element.id ? '#' + element.id : '') : null,
        duration
      };

      performanceMetrics.userInteractions.push(metrics);

      // Keep only last 30 interactions
      if (performanceMetrics.userInteractions.length > 30) {
        performanceMetrics.userInteractions.shift();
      }

      // Warn about slow interactions
      if (duration > 100) {
        console.warn('⚠️ Slow user interaction detected:', duration.toFixed(2) + 'ms');
      }

      return metrics;
    }
  };
};

/**
 * Track errors
 */
export const trackError = (error, context = null) => {
  const metrics = {
    timestamp: Date.now(),
    message: error.message,
    stack: error.stack,
    context,
    url: window.location.pathname,
    userAgent: navigator.userAgent
  };

  performanceMetrics.errors.push(metrics);

  // Keep only last 20 errors
  if (performanceMetrics.errors.length > 20) {
    performanceMetrics.errors.shift();
  }

  console.error('📊 Error tracked:', metrics);

  return metrics;
};

/**
 * Get performance summary
 */
export const getPerformanceSummary = () => {
  const summary = {
    pageLoads: {
      count: performanceMetrics.pageLoads.length,
      averageLoadTime: calculateAverage(performanceMetrics.pageLoads, 'loadTime'),
      slowestLoad: Math.max(...performanceMetrics.pageLoads.map(p => p.loadTime || 0))
    },
    apiCalls: {
      count: performanceMetrics.apiCalls.length,
      averageDuration: calculateAverage(performanceMetrics.apiCalls, 'duration'),
      successRate: calculateSuccessRate(performanceMetrics.apiCalls),
      slowestCall: Math.max(...performanceMetrics.apiCalls.map(a => a.duration || 0))
    },
    userInteractions: {
      count: performanceMetrics.userInteractions.length,
      averageDuration: calculateAverage(performanceMetrics.userInteractions, 'duration'),
      slowestInteraction: Math.max(...performanceMetrics.userInteractions.map(i => i.duration || 0))
    },
    errors: {
      count: performanceMetrics.errors.length,
      recentErrors: performanceMetrics.errors.slice(-5)
    },
    memory: {
      current: performanceMetrics.memoryUsage[performanceMetrics.memoryUsage.length - 1],
      peak: Math.max(...performanceMetrics.memoryUsage.map(m => m.usagePercentage || 0))
    }
  };
  return summary;
};

/**
 * Calculate average of a numeric property
 */
const calculateAverage = (array, property) => {
  if (array.length === 0) return 0;
  const sum = array.reduce((acc, item) => acc + (item[property] || 0), 0);
  return sum / array.length;
};

/**
 * Calculate success rate for API calls
 */
const calculateSuccessRate = (apiCalls) => {
  if (apiCalls.length === 0) return 100;
  const successCount = apiCalls.filter(call => call.success).length;
  return (successCount / apiCalls.length) * 100;
};

/**
 * Export performance data for analysis
 */
export const exportPerformanceData = () => {
  const data = {
    timestamp: Date.now(),
    url: window.location.href,
    userAgent: navigator.userAgent,
    metrics: performanceMetrics,
    summary: getPerformanceSummary()
  };

  return data;
};

/**
 * Clear performance metrics
 */
export const clearPerformanceMetrics = () => {
  performanceMetrics.pageLoads = [];
  performanceMetrics.apiCalls = [];
  performanceMetrics.userInteractions = [];
  performanceMetrics.errors = [];
  performanceMetrics.memoryUsage = [];
};

// Initialize performance monitoring when module loads
if (typeof window !== 'undefined') {
  initPerformanceMonitoring();
}
