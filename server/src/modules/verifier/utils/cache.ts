import NodeCache from 'node-cache';
import logger from './logger';

export interface CacheEntry<T> {
  result: T;
  timestamp: number;
}

/**
 * Verification result cache
 * Caches successful verification results to avoid redundant API calls
 */
class VerificationCache {
  private cache: NodeCache;
  private defaultTTL: number;

  constructor(ttlSeconds = 300) {
    // Default TTL: 5 minutes
    this.defaultTTL = ttlSeconds;
    this.cache = new NodeCache({
      stdTTL: ttlSeconds,
      checkperiod: 60, // Check for expired entries every minute
      useClones: false, // Don't clone objects for better performance
      deleteOnExpire: true,
    });

    // Log cache statistics periodically
    if (process.env.NODE_ENV === 'development') {
      setInterval(() => {
        const stats = this.cache.getStats();
        logger.debug('Cache stats:', {
          keys: stats.keys,
          hits: stats.hits,
          misses: stats.misses,
          hitRate: stats.hits / (stats.hits + stats.misses) || 0,
        });
      }, 60000); // Every minute
    }
  }

  /**
   * Generate cache key from provider and reference
   */
  getKey(provider: string, reference: string, ...args: any[]): string {
    const argsStr = args.length > 0 ? `:${args.join(':')}` : '';
    return `verify:${provider}:${reference}${argsStr}`.toLowerCase();
  }

  /**
   * Get cached result
   */
  get<T>(key: string): T | undefined {
    const cached = this.cache.get<T>(key);
    if (cached) {
      logger.debug(`Cache hit for key: ${key}`);
    }
    return cached;
  }

  /**
   * Set cache entry
   */
  set<T>(key: string, value: T, ttl?: number): void {
    this.cache.set(key, value, ttl || this.defaultTTL);
    logger.debug(`Cache set for key: ${key} (TTL: ${ttl || this.defaultTTL}s)`);
  }

  /**
   * Check if key exists in cache
   */
  has(key: string): boolean {
    return this.cache.has(key);
  }

  /**
   * Delete specific cache entry
   */
  delete(key: string): void {
    this.cache.del(key);
    logger.debug(`Cache deleted for key: ${key}`);
  }

  /**
   * Clear all cache entries
   */
  clear(): void {
    this.cache.flushAll();
    logger.info('Cache cleared');
  }

  /**
   * Get cache statistics
   */
  getStats() {
    return this.cache.getStats();
  }

  /**
   * Get cache keys matching a pattern
   */
  getKeys(pattern?: string): string[] {
    const keys = this.cache.keys();
    if (!pattern) return keys;
    
    const regex = new RegExp(pattern);
    return keys.filter(key => regex.test(key));
  }

  /**
   * Delete cache entries matching a pattern
   */
  deletePattern(pattern: string): number {
    const keys = this.getKeys(pattern);
    keys.forEach(key => this.delete(key));
    return keys.length;
  }
}

// Singleton instance with 5-minute TTL
export const verificationCache = new VerificationCache(
  parseInt(process.env.VERIFICATION_CACHE_TTL || '300', 10)
);

