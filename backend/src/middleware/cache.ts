import { Request, Response, NextFunction } from 'express';
import NodeCache from 'node-cache';
import { logger } from '../config/logger';

// Cache configuration
const DEFAULT_TTL = 300; // 5 minutes default
const CHECK_PERIOD = 600; // Check for expired keys every 10 minutes

// Create cache instances for different data types
const cacheInstances = {
  dashboard: new NodeCache({ stdTTL: 60, checkperiod: 120 }), // 1 minute for dashboard
  analytics: new NodeCache({ stdTTL: 300, checkperiod: 600 }), // 5 minutes for analytics
  budgets: new NodeCache({ stdTTL: 180, checkperiod: 360 }), // 3 minutes for budgets
  transactions: new NodeCache({ stdTTL: 120, checkperiod: 240 }), // 2 minutes for transactions
  categories: new NodeCache({ stdTTL: 600, checkperiod: 1200 }), // 10 minutes for categories
  default: new NodeCache({ stdTTL: DEFAULT_TTL, checkperiod: CHECK_PERIOD })
};

// Cache key generator
function generateCacheKey(req: Request): string {
  const baseKey = `${req.method}:${req.originalUrl}`;
  
  // Include query parameters in the key
  const queryKeys = Object.keys(req.query).sort();
  if (queryKeys.length > 0) {
    const queryString = queryKeys
      .map(key => `${key}=${req.query[key]}`)
      .join('&');
    return `${baseKey}?${queryString}`;
  }
  
  return baseKey;
}

// Determine cache instance based on route
function getCacheInstance(path: string): NodeCache {
  if (path.includes('/dashboard')) return cacheInstances.dashboard;
  if (path.includes('/analytics')) return cacheInstances.analytics;
  if (path.includes('/budgets')) return cacheInstances.budgets;
  if (path.includes('/transactions')) return cacheInstances.transactions;
  if (path.includes('/categories')) return cacheInstances.categories;
  return cacheInstances.default;
}

// Cache middleware factory
export function cacheMiddleware(options?: { ttl?: number; cacheType?: keyof typeof cacheInstances }) {
  return (req: Request, res: Response, next: NextFunction) => {
    // Skip caching for non-GET requests
    if (req.method !== 'GET') {
      return next();
    }

    // Skip caching if explicitly requested
    if (req.headers['cache-control'] === 'no-cache' || req.query.nocache === 'true') {
      return next();
    }

    const cacheKey = generateCacheKey(req);
    const cache = options?.cacheType ? cacheInstances[options.cacheType] : getCacheInstance(req.path);

    // Try to get cached response
    const cachedResponse = cache.get(cacheKey);
    if (cachedResponse) {
      logger.debug(`Cache hit for key: ${cacheKey}`);
      res.setHeader('X-Cache', 'HIT');
      res.setHeader('X-Cache-Key', cacheKey);
      return res.json(cachedResponse);
    }

    // Cache miss - store original json method
    const originalJson = res.json;
    
    // Override json method to cache the response
    res.json = function(data: any) {
      // Only cache successful responses
      if (res.statusCode >= 200 && res.statusCode < 300) {
        const ttl = options?.ttl; // Use instance default if not specified
        if (ttl !== undefined) {
          cache.set(cacheKey, data, ttl);
        } else {
          cache.set(cacheKey, data); // Use default TTL
        }
        logger.debug(`Cached response for key: ${cacheKey}`);
      }
      
      res.setHeader('X-Cache', 'MISS');
      res.setHeader('X-Cache-Key', cacheKey);
      
      // Call original json method
      return originalJson.call(this, data);
    };

    next();
  };
}

// Cache invalidation helpers
export const cacheInvalidation = {
  // Invalidate specific cache key
  invalidateKey(cacheType: keyof typeof cacheInstances, key: string) {
    const cache = cacheInstances[cacheType];
    const deleted = cache.del(key);
    logger.debug(`Invalidated cache key: ${key}, deleted: ${deleted}`);
    return deleted;
  },

  // Invalidate all keys matching a pattern
  invalidatePattern(cacheType: keyof typeof cacheInstances, pattern: string) {
    const cache = cacheInstances[cacheType];
    const keys = cache.keys();
    const matchingKeys = keys.filter(key => key.includes(pattern));
    const deleted = cache.del(matchingKeys);
    logger.debug(`Invalidated ${deleted} cache keys matching pattern: ${pattern}`);
    return deleted;
  },

  // Clear entire cache instance
  clearCache(cacheType: keyof typeof cacheInstances) {
    const cache = cacheInstances[cacheType];
    cache.flushAll();
    logger.info(`Cleared all cache for type: ${cacheType}`);
  },

  // Clear all caches
  clearAllCaches() {
    Object.keys(cacheInstances).forEach(cacheType => {
      cacheInstances[cacheType as keyof typeof cacheInstances].flushAll();
    });
    logger.info('Cleared all cache instances');
  },

  // Get cache statistics
  getStats(cacheType?: keyof typeof cacheInstances) {
    if (cacheType) {
      return {
        [cacheType]: cacheInstances[cacheType].getStats()
      };
    }

    const stats: any = {};
    Object.keys(cacheInstances).forEach(type => {
      stats[type] = cacheInstances[type as keyof typeof cacheInstances].getStats();
    });
    return stats;
  }
};

// Middleware to invalidate cache after data modifications
export function invalidateCacheMiddleware(cacheType: keyof typeof cacheInstances, pattern?: string) {
  return (req: Request, res: Response, next: NextFunction) => {
    // Store original methods
    const originalJson = res.json;
    const originalStatus = res.status;
    
    let responseStatus = 200;
    
    // Override status to capture the status code
    res.status = function(code: number) {
      responseStatus = code;
      return originalStatus.call(this, code);
    };
    
    // Override json method to invalidate cache after successful modifications
    res.json = function(data: any) {
      // Only invalidate cache for successful modifications
      if (responseStatus >= 200 && responseStatus < 300 && 
          ['POST', 'PUT', 'PATCH', 'DELETE'].includes(req.method)) {
        
        if (pattern) {
          cacheInvalidation.invalidatePattern(cacheType, pattern);
        } else {
          // Clear entire cache for the data type
          cacheInvalidation.clearCache(cacheType);
        }
        
        logger.debug(`Cache invalidated for ${cacheType} after ${req.method} request`);
      }
      
      // Call original json method
      return originalJson.call(this, data);
    };

    next();
  };
}

// Export cache statistics endpoint handler
export function cacheStatsHandler(req: Request, res: Response) {
  const stats = cacheInvalidation.getStats();
  res.json({
    success: true,
    data: stats,
    timestamp: new Date().toISOString()
  });
}

// Export cache clear endpoint handler
export function cacheClearHandler(req: Request, res: Response) {
  const { type } = req.params;
  
  if (type && type in cacheInstances) {
    cacheInvalidation.clearCache(type as keyof typeof cacheInstances);
    res.json({
      success: true,
      message: `Cache cleared for type: ${type}`,
      timestamp: new Date().toISOString()
    });
  } else if (!type) {
    cacheInvalidation.clearAllCaches();
    res.json({
      success: true,
      message: 'All caches cleared',
      timestamp: new Date().toISOString()
    });
  } else {
    res.status(400).json({
      success: false,
      error: `Invalid cache type: ${type}`,
      validTypes: Object.keys(cacheInstances)
    });
  }
}
