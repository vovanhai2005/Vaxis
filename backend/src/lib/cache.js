import { getRedisClient } from '../config/redis.js';
import dotenv from 'dotenv';
dotenv.config();

/**
 * Cache utility functions for Redis
 */

const DEFAULT_TTL = process.env.DEFAULT_TTL; // 5 minutes in seconds

/**
 * Get cached data
 * @param {string} key - Cache key
 * @returns {Promise<any|null>} - Cached data or null
 */
export const getCache = async (key) => {
  try {
    const redis = getRedisClient();
    if (!redis) return null;

    const data = await redis.get(key);
    if (!data) return null;

    return JSON.parse(data);
  } catch (error) {
    console.error('Cache get error:', error.message);
    return null;
  }
};

/**
 * Set cache data
 * @param {string} key - Cache key
 * @param {any} data - Data to cache
 * @param {number} ttl - Time to live in seconds (default: 300)
 * @returns {Promise<boolean>} - Success status
 */
export const setCache = async (key, data, ttl = DEFAULT_TTL) => {
  try {
    const redis = getRedisClient();
    if (!redis) return false;

    await redis.setex(key, ttl, JSON.stringify(data));
    return true;
  } catch (error) {
    console.error('Cache set error:', error.message);
    return false;
  }
};

/**
 * Delete cached data
 * @param {string} key - Cache key
 * @returns {Promise<boolean>} - Success status
 */
export const deleteCache = async (key) => {
  try {
    const redis = getRedisClient();
    if (!redis) return false;

    await redis.del(key);
    return true;
  } catch (error) {
    console.error('Cache delete error:', error.message);
    return false;
  }
};

/**
 * Delete multiple cached keys matching a pattern
 * @param {string} pattern - Pattern to match (e.g., 'user:*')
 * @returns {Promise<number>} - Number of keys deleted
 */
export const deleteCachePattern = async (pattern) => {
  try {
    const redis = getRedisClient();
    if (!redis) return 0;

    const keys = await redis.keys(pattern);
    if (keys.length === 0) return 0;

    const deleted = await redis.del(...keys);
    return deleted;
  } catch (error) {
    console.error('Cache pattern delete error:', error.message);
    return 0;
  }
};

/**
 * Clear all cache
 * @returns {Promise<boolean>} - Success status
 */
export const clearAllCache = async () => {
  try {
    const redis = getRedisClient();
    if (!redis) return false;

    await redis.flushdb();
    return true;
  } catch (error) {
    console.error('Cache clear error:', error.message);
    return false;
  }
};

/**
 * Check if key exists in cache
 * @param {string} key - Cache key
 * @returns {Promise<boolean>} - Exists status
 */
export const cacheExists = async (key) => {
  try {
    const redis = getRedisClient();
    if (!redis) return false;

    const exists = await redis.exists(key);
    return exists === 1;
  } catch (error) {
    console.error('Cache exists error:', error.message);
    return false;
  }
};

/**
 * Wrapper function for caching async operations
 * @param {string} key - Cache key
 * @param {Function} fetchFn - Function to fetch data if not cached
 * @param {number} ttl - Time to live in seconds
 * @returns {Promise<any>} - Cached or fresh data
 */
export const cacheWrapper = async (key, fetchFn, ttl = DEFAULT_TTL) => {
  try {
    // Try to get from cache first
    const cached = await getCache(key);
    if (cached !== null) {
      return cached;
    }

    // If not in cache, fetch the data
    const data = await fetchFn();

    // Store in cache for future requests
    await setCache(key, data, ttl);

    return data;
  } catch (error) {
    console.error('Cache wrapper error:', error.message);
    // If caching fails, just return the fresh data
    return await fetchFn();
  }
};

// Common cache key generators
export const cacheKeys = {
  user: (userId) => `user:${userId}`,
  userProfile: (userId) => `user:${userId}:profile`,
  notifications: (userId, limit = 10) => `notifications:${userId}:${limit}`,
  unreadCount: (userId) => `unread_count:${userId}`,
  vaccines: () => 'vaccines:all',
  vaccine: (vaccineId) => `vaccine:${vaccineId}`,
  vaccineLots: (vaccineId) => `vaccine:${vaccineId}:lots`,
  appointments: (userId) => `appointments:${userId}`,
  stats: (type) => `stats:${type}`,
};
