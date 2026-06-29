import { createClient } from 'redis'
import { env } from '../config/env';
import logger from '../middleware/logger';

const redisClient = createClient({
    url: env.REDIS_URL
})

redisClient.on('error', (err) => {
    logger.error('Redis client error: ', err)
})

redisClient.on('connect', () => {
    logger.info('✅ Redis connected')
})

async function connectRedis() {
    await redisClient.connect()
}

connectRedis().catch(logger.error)

export { redisClient }