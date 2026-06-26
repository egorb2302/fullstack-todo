import { NextFunction, Request, Response } from "express";
import { verifyAccessToken } from "../utils/auth";
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
        const token = req.cookies.accessToken;
        if (!token) {
            return res.status(401).json({ error: "No access token provided" })
        }

        let decoded: { userId: number }
        try {
            decoded = verifyAccessToken(token)
        } catch (err) {
            if (err instanceof Error && err.name === "TokenExpiredError") {
                return res.status(401).json({ message: "Token was expired" })
            }
            return res.status(401).json({ error: 'Invalid access token' });
        }
        const userId = Number(decoded.userId)
        if (isNaN(userId)) {
            return res.status(401).json({ message: "Invalid user ID in token" });
        }

        const result = await db.select().from(users).where(eq(users.id, userId));
        if (result.length === 0) {
            return res.status(401).json({ message: "User not found" })
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