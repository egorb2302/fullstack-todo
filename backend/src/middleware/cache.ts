import { Request, Response, NextFunction } from "express";
import logger from "./logger";
import { redisClient } from "../redis/index";

const DEFAULT_TTL = 10;

export const cache = (ttl: number = DEFAULT_TTL) => {
    return async (req: Request, res: Response, next: NextFunction) => {
        if (req.method !== "GET") {
            console.log("not GET, skipping cache")
            return next()
        }

        const cacheKey = `cache:${req.originalUrl || req.url}`;

        try {
            const cachedData = await redisClient.get(cacheKey)
            if (cachedData) {
                try {
                    return res.json(JSON.parse(cachedData))
                } catch {
                    return res.send(cachedData)
                }
            }

            const originalJson = res.json.bind(res)
            res.json = function(data: any) {
                redisClient.set(cacheKey, JSON.stringify(data), { EX: ttl })
                    .catch(err => logger.error('Cache set error: ', err))
                return originalJson(data)
            };

            next()
        } catch (err) {
            logger.error('Cache error')
            return next()
        }
    }
}