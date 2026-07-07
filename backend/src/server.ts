import { Express } from 'express'
import logger from './middleware/logger';
import { env } from './config/env';
import { connectRedis } from './redis/index';
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

    server = app.listen(env.PORT, '0.0.0.0', () => {
        logger.info(`Server is running on 0.0.0.0:${env.PORT}`);
    });
}

void startServer();