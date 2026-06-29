import { redisClient } from "../redis";

export const invalidateCache = async (pattern: string): Promise<void> => {
    try {
        if (pattern === 'cache:/todos' || pattern === 'cache:/todos/*') {
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