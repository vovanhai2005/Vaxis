import Redis from 'ioredis';

let redis = null;

export const connectRedis = () => {
  try {
    // Skip if Redis URL is not configured
    if (!process.env.REDIS_URL) {
      console.log('ℹ️  Redis not configured - caching disabled');
      return null;
    }

    const redisUrl = process.env.REDIS_URL;
    
    redis = new Redis(redisUrl, {
      maxRetriesPerRequest: 3,
      retryStrategy: (times) => {
        if (times > 5) {
          console.log('⚠️  Redis connection failed after 5 attempts - caching disabled');
          return null;
        }
        return Math.min(times * 100, 3000);
      }
    });

    redis.on('connect', () => {
      console.log('✅ Redis connected successfully');
    });

    redis.on('ready', () => {
      console.log('✅ Redis is ready to accept commands');
    });

    redis.on('error', (err) => {
      console.error('❌ Redis error:', err.message);
    });

    redis.on('close', () => {
      console.log('🔌 Redis connection closed');
    });

    return redis;
  } catch (error) {
    console.error('❌ Failed to connect to Redis:', error.message);
    return null;
  }
};

export const getRedisClient = () => {
  return redis;
};

export const disconnectRedis = async () => {
  if (redis) {
    await redis.quit();
    redis = null;
  }
};
