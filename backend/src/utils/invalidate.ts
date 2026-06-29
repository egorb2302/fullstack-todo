import logger from "../middleware/logger";
import { redisClient } from "../redis";

export const invalidateCache = async (pattern: string) => {
    try {
        const keys = await redisClient.keys(pattern)
        if (keys.length) {
            await redisClient.del(keys)
        }
    } catch (error) {
        logger.error(error)
    }
}