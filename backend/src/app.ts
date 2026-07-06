import express, { Express } from 'express'
import todoRouter from './routes/todo.routes';
import authRouter from './routes/auth.routes';
import queueRouter from './routes/queue.routes';
import { authenticate } from './middleware/auth';
import { securityMiddleware } from './middleware/security';
import cookieParser from 'cookie-parser';
import swaggerUi from 'swagger-ui-express';
import { openApiDocument } from './openapi';

export const app: Express = express()

app.use(express.urlencoded({ extended: true }))

app.use(securityMiddleware)

app.use(express.json())

app.use(cookieParser());

app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(openApiDocument))

app.use('/todos', authenticate, todoRouter)

app.use('/auth', authRouter)

app.use('/queue', queueRouter)