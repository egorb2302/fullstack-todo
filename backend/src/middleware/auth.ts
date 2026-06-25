import { NextFunction, Request, Response } from "express";
import { verifyToken } from "../utils/auth";
import { db } from "../db";
import { users } from "../db/schema";
import { eq } from 'drizzle-orm';

declare global {
    namespace Express {
        interface Request {
            user?: any
        }
    }
}

export const authenticate = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const authHeader = req.headers.authorization;
        if (!authHeader || !authHeader.startsWith('Bearer ')) {
            return res.status(401).json({ 
                message: "No token provided or invalid format" 
            });
        }

        const token = authHeader.split(' ')[1];
        const decoded = verifyToken(token)
        const userId = Number(decoded.userId)
        if (isNaN(userId)) {
            return res.status(401).json({ message: "Invalid user ID in token" });
        }

        const result = await db.select().from(users).where(eq(users.id, userId));
        if (result.length === 0) {
            return res.status(401).json({ message: "Cant get find decoded user in db" })
        }
        req.user = result[0]
        next();

    } catch (err) {
        if (err instanceof Error && err.name === "JsonWebTokenError") {
            return res.status(401).json({ message: "Invalid token" })
        }
        if (err instanceof Error && err.name === "TokenExpiredError") {
            return res.status(401).json({ message: "Token was expired" })
        }
        return res.status(500).json({ message: "Internal Server Error" })
    }
}