import dotenv from 'dotenv'
import express, { Request, Response, Express, NextFunction } from 'express'
import { securityMiddleware } from './middleware/security';
import { ServerTodoType } from './types/types'
import { getDataFromBD, getMe, getTodo, login, logout, queue, register } from './controllers/controllers'
import { validate } from './middleware/validation'
import swaggerUi from 'swagger-ui-express';
import { openApiDocument } from './openapi';
import { createSchema, paramsSchema, taskSchema } from './schemas/todoSchemas';
import logger from './middleware/logger';
import { db } from './db/index';
import { todos } from './db/schema';
import { and, eq } from 'drizzle-orm';
import { authenticate } from './middleware/auth';
import cookieParser from 'cookie-parser';
import { env } from './config/env';
import { cache } from './middleware/cache';
import { invalidateCache } from './utils/invalidate';
import './queues/workers/reportWorker';

export let isShuttingDown = false;

dotenv.config()
export const app: Express = express()

app.use(express.urlencoded({ extended: true }))
app.use(securityMiddleware)
app.use(express.json())

const shutdown = () => {
    logger.info('\n Shutting down...');
    
    server.close(() => {
        logger.info(' Server closed');
        process.exit(0);
    });
    
    setTimeout(() => {
        logger.error(' Force shutdown');
        process.exit(1);
    }, 5000);
};
app.use(cookieParser());
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(openApiDocument))

app.use('/todos', authenticate)
app.get('/', (req: Request, res: Response) => {
    res.json({ 
        message: 'Todo API is running',
        endpoints: {
            getAll: 'GET /todos',
            getOne: 'GET /todos/:id',
            create: 'POST /todos',
            update: 'PATCH /todos/:id',
            delete: 'DELETE /todos/:id'
        }
    });
});

app.get('/todos', cache() , async (req: Request, res: Response): Promise<void | Response> => {
    try {  
        const result = await getDataFromBD(req, res)
        return res.json(result)
    } catch (err) {
        logger.error(err)
        return
    }
})

app.get(`/todos/:id`, cache() ,validate(paramsSchema, "params"), async (req: Request, res: Response): Promise<void | Response> => {
    try {
        const id = Number(req.params.id)
        const userId = req.user.id
        const existing = await db.select().from(todos).where(and(eq(todos.id, id), eq(todos.userId, userId)))
        if (existing.length === 0) {
            return res.status(404).json({ message: "Todo not found" })
        }
        const todo = await getTodo(id)
        if (!todo) {
            return res.status(404).json({ error: "Cant get todo on server" })
        }
        return res.json(todo)
    } catch (err) {
        logger.error(err)
        return res.status(500).json({ error: 'Internal server error' })
    }
})

app.post('/todos', validate(createSchema, "body"), async (req: Request, res: Response): Promise<Response | void> => {
    try {
        console.log('🔍 req.user in POST handler:', req.user); 
        console.log('🔍 req.user.id:', req.user?.id);   
        const { title, description, isCompleted } = req.body
        const newTask: ServerTodoType = {
            title: title,
            description: description || '',
            isCompleted: isCompleted || false,
            userId: req.user.id
        }
        try {
            const result = await db.insert(todos).values(newTask).returning();
            invalidateCache('cache:/todos*')
            return res.status(201).json({ message: 'Task successfully added', task: result[0] })
            console.log('✅ Insert success:', result);
        } catch (insertErr) {
            console.error('❌ Drizzle insert error:', insertErr);
            throw insertErr;
        }
    } catch (err) {
        logger.error(err)
        return res.status(500).json({ error: "Internal server error" })
    }
})

app.delete('/todos/:id', validate(paramsSchema, "params"), async (req: Request, res: Response): Promise<Response | void> => {
    try {
        const id = Number(req.params.id)
        const userId = req.user.id
        const existing = await db.select().from(todos).where(and(eq(todos.id, id), eq(todos.userId, userId)))
        if (existing.length === 0) {
            return res.status(404).json({ message: "Todo not found" })
        }

        const result = await db.delete(todos).where(eq(todos.id, id)).returning()
        if (result.length === 0) {
            return res.status(404).json({ error: 'Todo not found' });
        }
        invalidateCache(`cache:/todos/${id}*`)
        return res.status(200).json({ message: "Task deleting was successfully" })
    } catch (err) {
        logger.error(err)
        return res.status(500).json({ error: "Internal server error"})
    }
})

app.patch('/todos/:id', validate(paramsSchema, "params"), validate(taskSchema, "body"), 
    async (req: Request, res: Response): Promise<void | Response> => {
        
    try {
        const id = Number(req.params.id)
        const userId = req.user.id
        const { title, description, isCompleted } = req.body;
        const existing = await db.select().from(todos).where(and(eq(todos.id, id), eq(todos.userId, userId)))
        if (existing.length === 0) {
            return res.status(404).json({ message: "Todo not found" })
        }

        const result = await db.update(todos).set({title, description, isCompleted}).where(eq(todos.id, id)).returning()
        invalidateCache(`cache:/todos/${id}*`)
        return res.status(200).json({ message: "Task patching was successfully", todo: result[0] })
    } catch (err) {
        logger.error(err)
        return res.status(500).json({ error: "Internal server error"})
    }
})

app.post('/auth/register', register)

app.post('/auth/login', login)

app.get('/auth/me', authenticate, getMe)

app.post('/auth/logout', logout)

app.get('/queue/stats', queue)

const server = app.listen(env.PORT, () => {logger.info(`Server is running on localhost:${env.PORT}`)})

process.on('SIGINT', shutdown);
process.on('SIGTERM', shutdown);
