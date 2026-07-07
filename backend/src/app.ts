import express, { Express } from 'express'
import todoRouter from './routes/todo.routes';
import authRouter from './routes/auth.routes';
import queueRouter from './routes/queue.routes';
import { authenticate } from './middleware/auth';
import { securityMiddleware } from './middleware/security';
import cookieParser from 'cookie-parser';
import swaggerUi from 'swagger-ui-express';
import { openApiDocument } from './openapi';
import { routes } from './controllers/controllers';

export const app: Express = express()

app.set('trust proxy', 1)

app.use(securityMiddleware)

app.use(express.json())

app.use(express.urlencoded({ extended: true }))

app.use(cookieParser());

app.get('/health', (req, res) => {
    res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

app.get('/', routes);

app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(openApiDocument))

app.use('/todos', authenticate, todoRouter)

app.use('/auth', authRouter)

app.use('/queue', queueRouter)