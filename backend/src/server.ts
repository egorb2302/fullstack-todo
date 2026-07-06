import { Express } from 'express'
import logger from './middleware/logger';
import { env } from './config/env';
import { connectRedis, redisReady } from './redis/index';
import { startReportWorker } from './queues/workers/reportWorker';
import { app } from './app';

export let server: ReturnType<Express['listen']>;

async function startServer() {
    try {
        await connectRedis();
        logger.info('Redis ready, cache enabled');
    } catch {
        logger.warn('Redis unavailable, starting without cache');
    }

    startReportWorker()

    server = app.listen(env.PORT, () => {
        logger.info(`Server is running on localhost:${env.PORT}`);
    });
}

void startServer();