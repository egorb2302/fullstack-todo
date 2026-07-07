import type { ServerTodoType } from "../types/types"
import { db } from '../db/index';
import { NewUser, todos, users } from '../db/schema';
import { eq, and } from 'drizzle-orm';
import { Response, Request } from "express";
import logger from '../middleware/logger';
import { getQueueStats } from '../queues/monitor';
import { testQueue } from '../queues/seed';
import { comparePassword, generateAccessToken, generateRefreshToken, hashPassword, verifyRefreshToken } from "../utils/auth";
import { redisClient } from "../redis";
import { invalidateCache } from '../utils/invalidate';

let isTested = false;

export const getDataFromBD = async (req: Request, res: Response): Promise<ServerTodoType[]> => {
    const userId = req.user.id;
    const result = await db.select().from(todos).where(eq(todos.userId, userId))
    return result
}

export const getTodo = async (id: number): Promise<ServerTodoType | undefined> => {
    const current = await db.select().from(todos).where(eq(todos.id, id))
    return current[0]
}

export const routes = async (req: Request, res: Response): Promise<Response> => {
    try {
        return res.json({ 
            message: 'Todo API is running',
            endpoints: {
                getAll: 'GET /todos',
                getOne: 'GET /todos/:id',
                create: 'POST /todos',
                update: 'PATCH /todos/:id',
                delete: 'DELETE /todos/:id'
            }
        });
    } catch (err) {
        console.error(err)
        return res.status(500).json({ error: "Internal Server Error" })
    }
}

export const GETTODOS = async (req: Request, res: Response): Promise<Response> => {
    try {  
        const result = await getDataFromBD(req, res)
        return res.json(result)
    } catch (err) {
        logger.error(err)
        return res.status(500).json({ error: "Internal Server Error" })
    }
}

export const GETTODO = async (req: Request, res: Response): Promise<Response> => {
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
}

export const POSTTODO = async (req: Request, res: Response): Promise<Response> => {
    try {
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
        } catch (insertErr) {
            console.error('❌ Drizzle insert error:', insertErr);
            throw insertErr;
        }
    } catch (err) {
        logger.error(err)
        return res.status(500).json({ error: "Internal server error" })
    }
}

export const DELETETODO = async (req: Request, res: Response): Promise<Response> => {
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
}

export const PATCHTODO = async (req: Request, res: Response): Promise<Response> => {
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
}

export const register = async (req: Request, res: Response): Promise<Response | undefined> => {
    try {
        const { email, password, name } = req.body;
        if (!email || !password) {
            return res.status(400).json({ message: "Email and password are required"})
        }

        const existing = await db.select().from(users).where(eq(users.email, email))
        if (existing.length > 0) {
            return res.status(400).json({ message: "User already exists" })
        }

        const hashed = await hashPassword(password)
        const newUser: NewUser = {
            email,
            passwordHash: hashed,
            name: name || null
        }

        const result = await db.insert(users).values(newUser).returning()
        const user = result[0]
        const accessToken = generateAccessToken(user.id);
        const refreshToken = generateRefreshToken(user.id);

        res.cookie('accessToken', accessToken, {
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production',
            sameSite: 'none',
            maxAge: 15 * 60 * 1000,
            path: '/',
        });

        res.cookie('refreshToken', refreshToken, {
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production',
            sameSite: 'none',
            maxAge: 7 * 24 * 60 * 60 * 1000,
            path: '/',
        });

        logger.info({ userId: users.id, email: users.email }, "User registred")
        return res.status(201).json({ message: "User was successfully registred", user: {
            id: user.id,
            email: user.email,
            name: user.name
        } })

    } catch (err) {
        logger.error(err)
        res.status(500).json({ message: "Internal server error" })
    }
}

export const login = async (req: Request, res: Response): Promise<Response | undefined> => {
    try {
        const { email, password } = req.body;
        if (!email || !password) {
            return res.status(401).json({ message: "Email or Password are required" })
        }

        const result = await db.select().from(users).where(eq(users.email, email))
        if (result.length === 0) {
            return res.status(401).json({ error: "Invalid email or password" })
        }

        const user = result[0]
        const isValid = await comparePassword(password, user.passwordHash);
        if (!isValid) {
            return res.status(401).json({ message: "Invalid email or password" })
        }

        const accessToken = generateAccessToken(user.id);
        const refreshToken = generateRefreshToken(user.id);

        res.cookie('accessToken', accessToken, {
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production',
            sameSite: 'none',
            maxAge: 15 * 60 * 1000,
            path: '/',
        });

        res.cookie('refreshToken', refreshToken, {
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production',
            sameSite: 'none',
            maxAge: 7 * 24 * 60 * 60 * 1000,
            path: '/',
        });

        logger.info({ userId: user.id }, "User logged in");
        return res.status(200).json({ message: "Login successfull", user: {
            id: user.id,
            email: user.email,
            name: user.name
        }})
    } catch (err) {
        logger.error(err)
        res.status(500).json({ message: "Internal server error" })
    }
}

export const refresh = async (req: Request, res: Response): Promise<Response | undefined> => {
    try {
        const refreshToken = req.cookies.refreshToken;
        if (!refreshToken) {
            return res.status(401).json({ error: "No refresh token" })
        }

        let decoded: { userId: number };
        try {
            decoded = verifyRefreshToken(refreshToken)
        } catch (err) {
            return res.status(401).json({ error: "Invalid refresh token" })
        }

        const result = await db.select().from(users).where(eq(users.id, decoded.userId))
        if (result.length === 0) {
            return res.status(401).json({ message: "User not found" })
        }

        const user = result[0]
        const newAccessToken = generateAccessToken(user.id)

        res.cookie('accessToken', newAccessToken, {
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production',
            sameSite: 'none',
            maxAge: 15 * 60 * 1000,
            path: '/',
        });
        res.json({ message: 'Token refreshed successfully' });
    } catch (err) {
        logger.error(err)
        res.status(500).json({ message: "Internal server error" })
    }
}

export const getMe = async (req: Request, res: Response): Promise<Response | undefined> => {
    try {
        const userId = req.user?.id;
        if (!userId) {
            return res.status(401).json({ error: "Unauthorized" })
        }

        const result = await db.select().from(users).where(eq(users.id, userId));
        if (result.length === 0) {
            return res.status(401).json({ message: "User not found" })
        }

        const user = result[0];
        res.json({
            id: user.id,
            email: user.email,
            name: user.name,
        })
    } catch (err) {
        logger.error(err)
        res.status(500).json({ message: "Internal server error" })
    }
}

export const logout = async (req: Request, res: Response): Promise<Response | void> => {
    res.clearCookie('accessToken', {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'none',
        path: '/',
    });

    res.clearCookie('refreshToken', {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'none',
        path: '/',
    });

    res.json({ message: 'Logged out successfully' });
};

export const queue = async (req: Request, res: Response): Promise<Response | void> => {
    try {
        if (!isTested) {
            await testQueue().catch(console.error);
            isTested = true;
        }
        const cached = await redisClient.get('report:latest');
        if (cached) {
            return res.json(JSON.parse(cached))
        }

        const totalTasks = await db.$count(db.select().from(todos));
        const totalUsers = await db.$count(db.select().from(users));
        
        const report = {
            totalTasks,
            totalUsers,
            timestamp: new Date().toISOString(),
        };

        const stats = await getQueueStats(report)
        return res.json(stats)
    } catch (err) {
        console.log(err)
        return res.status(500).json({ error: "internal server error" })
    }
}