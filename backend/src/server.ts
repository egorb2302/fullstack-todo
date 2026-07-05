import express, { Express } from 'express'
import { securityMiddleware } from './middleware/security';
import swaggerUi from 'swagger-ui-express';
import { openApiDocument } from './openapi';
import logger from './middleware/logger';
import { authenticate } from './middleware/auth';
import cookieParser from 'cookie-parser';
import { env } from './config/env';
import { redisReady } from './redis/index';
import './queues/workers/reportWorker';
import todoRouter from './routes/todo.routes';
import authRouter from './routes/auth.routes';
import queueRouter from './routes/queue.routes';

export const app: Express = express()

app.use(express.urlencoded({ extended: true }))

app.use(securityMiddleware)

app.use(express.json())

app.use(cookieParser());

app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(openApiDocument))

app.use('/todos', authenticate, todoRouter)

app.use('/auth', authRouter)

app.use('/queue', queueRouter)

export let server: ReturnType<Express['listen']>;

async function startServer() {
    try {
        await redisReady;
        logger.info('Redis ready, cache enabled');
    } catch {
        logger.warn('Redis unavailable, starting without cache');
    }

    server = app.listen(env.PORT, () => {
        logger.info(`Server is running on localhost:${env.PORT}`);
    });
}

void startServer();