// src/redis/index.ts
import { createClient } from 'redis';
import { env } from '../config/env';
import logger from '../middleware/logger';

console.log('🔍 Connecting to Redis at:', env.REDIS_URL);

const redisClient = createClient({
    url: env.REDIS_URL,
    socket: {
        connectTimeout: 5000,
        reconnectStrategy: (retries) => {
            console.log(`🔄 Redis reconnect attempt ${retries}`);
            if (retries > 10) {
                console.error('❌ Redis: too many reconnection attempts');
                return new Error('Too many reconnection attempts');
            }
            return Math.min(retries * 100, 3000);
        }
    }
});

redisClient.on('error', (err) => {
    console.error('❌ Redis client error:', err.message);
    console.error('❌ Redis error stack:', err.stack);
    logger.error({ err }, 'Redis client error');
});

redisClient.on('connect', () => {
    console.log('✅ Redis connecting...');
});

redisClient.on('ready', () => {
    console.log('✅ Redis ready!');
    console.log('🔍 Redis isOpen:', redisClient.isOpen);
    logger.info('Redis connected and ready');
});

redisClient.on('end', () => {
    console.warn('⚠️ Redis connection closed');
    logger.warn('Redis connection closed');
});

export const redisReady = new Promise<void>((resolve, reject) => {
    redisClient.once('ready', () => {
        console.log('✅ Redis is ready for use');
        resolve();
    });
    
    redisClient.once('error', (err) => {
        console.error('❌ Redis failed to connect:', err);
        reject(err);
    });
});

async function connectRedis() {
    try {
        console.log('🔍 Attempting to connect to Redis...');
        await redisClient.connect();
        console.log('✅ Redis connected successfully!');
        return redisClient;
    } catch (err) {
        console.error('❌ Redis connection error:', err);
        console.error('❌ Redis error message:', err);
        logger.error({ err }, 'Redis connection failed');
        throw err;
    }
}

connectRedis().catch((err) => {
    console.warn('⚠️ Redis connection failed, continuing without cache:', err.message);
});

export { redisClient, connectRedis };