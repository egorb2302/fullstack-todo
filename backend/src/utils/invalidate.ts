import { redisClient } from "../redis";

const isTodosCachePattern = (pattern: string): boolean =>
    pattern === 'cache:/todos'
    || pattern === 'cache:/todos/*'
    || pattern === 'cache:/todos*'
    || pattern.startsWith('cache:/todos/');

export const invalidateCache = async (pattern: string): Promise<void> => {
    try {
        if (!redisClient.isReady) {
            return;
        }

        if (isTodosCachePattern(pattern)) {
            const keys = await redisClient.keys('cache:/todos*');
            if (keys.length > 0) {
                await redisClient.del(keys);
            }
            return;
        }

        const deleted = await redisClient.unlink(pattern);
        if (deleted > 0) {
            console.log(`✅ Cache invalidated: ${pattern}`);
        }

    } catch (error) {
        console.error('Cache invalidation error:', error);
    }
};
