import { Request, Response, NextFunction } from "express";
import logger from "./logger";
import { redisClient } from "../redis/index";

const DEFAULT_TTL = 60;

export const cache = (ttl: number = DEFAULT_TTL) => {
    return async (req: Request, res: Response, next: NextFunction) => {
        if (req.method !== "GET") {
            return next()
        }

        const cacheKey = `cache:${req.originalUrl || req.url}`;

        try {
            const cachedData = await redisClient.get(cacheKey)
            if (cachedData) {
                return res.json(JSON.stringify(cachedData))
            }

            const originalJson = res.json.bind(res)

            res.json = function(data) {
                redisClient.set(cacheKey, ttl, data)
                    .catch(err => logger.error('Cache set error: ', err))
                return originalJson()
            };

            next()
        } catch (err) {
            logger.error('Cache error')
            return next()
        }
    }
}