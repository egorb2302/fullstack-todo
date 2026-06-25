import type { ServerTodoType } from "../types/types"
import { db } from '../db/index';
import { NewUser, todos, users } from '../db/schema';
import { eq } from 'drizzle-orm';
import { Response, Request } from "express";
import logger from '../middleware/logger';
import { comparePassword, generateToken, hashPassword } from "../utils/auth";

export const getDataFromBD = async (req: Request, res: Response): Promise<ServerTodoType[]> => {
    const userId = req.user.id;
    const result = await db.select().from(todos).where(eq(todos.userId, userId))
    return result
}

export const getTodo = async (id: number): Promise<ServerTodoType | undefined> => {
    const current = await db.select().from(todos).where(eq(todos.id, id))
    return current[0]
}

export const register = async (req: Request, res: Response): Promise<Response | undefined> => {
    try {
        const { email, password, name } = req.body;
        if (!email || !password) {
            return res.status(400).json({ message: "Email and password are required"})
        }

        const existing = await db.select().from(users).where(eq(users.email, email))
        if (existing.length > 0) {
            res.status(400).json({ message: "User already exists" })
        }

        const hashed = await hashPassword(password)
        const newUser: NewUser = {
            email,
            passwordHash: hashed,
            name: name || null
        }

        const result = await db.insert(users).values(newUser).returning()
        const user = result[0]
        const token = generateToken(user.id)
        logger.info({ userId: users.id, email: users.email }, "User registred")
        res.status(201).json({ message: "User was successfully registred", token, user: {
            id: user.id,
            email: user.name,
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

        const token = generateToken(user.id)
        logger.info({ userId: user.id }, "User logged in");
        res.status(200).json({ message: "Login successfull", token, user: {
            id: user.id,
            email: user.name,
            name: user.name
        }})
    } catch (err) {
        logger.error(err)
        res.status(500).json({ message: "Internal server error" })
    }
}

export const getMe = async (req: Request, res: Response): Promise<Response | undefined> => {
    try {
        const user = req.user;
        if (!user) {
            return res.status(401).json({ error: "Unauthorized" })
        }

        res.status(200).json({
            id: user.id,
            email: user.email,
            name: user.name,
        })
    } catch (err) {
        logger.error(err)
        res.status(500).json({ message: "Internal server error" })
    }
}