import dotenv from 'dotenv'
import express, { Request, Response, Express } from 'express'
import cors from 'cors'
import path from 'path'
import { ServerTodoType } from './types/types'
import { getDataFromBD, getTodo } from './controllers/controllers'
import { validate } from './middleware/validation'
import swaggerUi from 'swagger-ui-express';
import { openApiDocument } from './openapi';
import { createSchema, paramsSchema, taskSchema } from './schemas/todoSchemas';
import { corsConfig, helmetConfig, rateLimitConfig } from '../config/security.config';
import helmet from 'helmet';
import { rateLimit } from 'express-rate-limit';
import pino from 'pino';
import { db } from '../src/db/index';
import { todos } from '../src/db/schema';
import { eq } from 'drizzle-orm';

const isDevelopment = process.env.NODE_ENV !== 'production'

export const logger = pino({
    level: process.env.LOG_LEVEL || 'info',
    transport: isDevelopment ? {
        target: 'pino-pretty',
        options: {
            colorize: true, 
            translateTime: 'SYS:standard',
            ignore: 'pid,hostname',
            singleLine: false,
            hideObject: false,
            messageKey: 'msg',
            levelFirst: true, 
            messageFormat: '{msg}'
        }
    } : undefined
});

export let isShuttingDown = false;

dotenv.config()
const PORT = process.env.PORT || "5000"
const URL = process.env.URL || "http://localhost:5000"
const app: Express = express()
export const pathToBD = path.resolve(__dirname, "..", "data", "db.json");

app.use(express.urlencoded({ extended: true }))
app.use(helmet(helmetConfig))
app.use(cors(corsConfig))
app.use(rateLimit(rateLimitConfig))
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

app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(openApiDocument))

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

app.get('/todos', async (req: Request, res: Response): Promise<void | Response> => {
    try {
        res.send(await getDataFromBD())
    } catch (err) {
        logger.error(err)
        return
    }
})

app.get(`/todos/:id`, validate(paramsSchema, "params"), async (req: Request, res: Response): Promise<void | Response> => {
    try {
        const id = Number(req.params.id)
        const todo = await getTodo(id)

        if (!todo) {
            return res.status(404).json({ error: "Cant get todo on server" })
        }

        res.json(todo)
    } catch (err) {
        logger.error(err)
        res.status(500).json({ error: 'Internal server error' })
    }
})

app.post('/todos', validate(createSchema, "body"), async (req: Request, res: Response): Promise<void> => {
    try {
        const newTask: ServerTodoType = {
            title: req.body.title,
            description: req.body.description || '',
            isCompleted: req.body.isCompleted || false
        }
        const result = await db.insert(todos).values(newTask).returning()
        res.status(200).json({ message: "Task adding was successfully", task: result[0] })
    } catch (err) {
        logger.error(err)
        res.status(500).json({ error: "Internal server error" })
    }
})

app.delete('/todos/:id', validate(paramsSchema, "params"), async (req: Request, res: Response): Promise<void> => {
    try {
        const id = Number(req.params.id)
        const result = await db.delete(todos).where(eq(todos.id, id)).returning()

        if (result.length === 0) {
            res.status(404).json({ error: 'Todo not found' });
        }

        res.status(200).json({ message: "Task deleting was successfully" })
    } catch (err) {
        logger.error(err)
        res.status(500).json({ error: "Internal server error"})
    }
})

app.patch('/todos/:id', validate(paramsSchema, "params"), validate(taskSchema, "body"), 
    async (req: Request, res: Response): Promise<void | Response> => {
        
    try {
        const id = Number(req.params.id)
        const { title, description, isCompleted } = req.body;
        const result = await db.update(todos).set({title, description, isCompleted}).where(eq(todos.id, id)).returning()

        res.status(200).json({ message: "Task patching was successfully", todo: result[0] })
    } catch (err) {
        logger.error(err)
        res.status(500).json({ error: "Internal server error"})
    }
})

const server = app.listen(PORT, () => logger.info(`Server is running on ${URL}`))

process.on('SIGINT', shutdown);
process.on('SIGTERM', shutdown);
