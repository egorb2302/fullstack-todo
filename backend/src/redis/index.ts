import { createClient } from 'redis';
import { env } from '../config/env';
import logger from '../middleware/logger';

function getRedisPort(): number {
    const url = env.REDIS_URL;
    return Number(new URL(url).port || 6379);
}

const redisClient = createClient({
    socket: {
        host: env.REDIS_HOST,
        port: getRedisPort(),
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
    if (redisClient.isReady) {
        console.error('❌ Redis client error:', err.message);
        logger.error({ err }, 'Redis client error');
    }
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
        return 
    }
}

export { redisClient, connectRedis };