import jwt from 'jsonwebtoken';
import dotenv from 'dotenv';
import bcrypt from 'bcrypt';
import { env } from '../src/../config/env';

dotenv.config()

const JWT_SECRET = env.JWT_SECRET
const ACCESS_SECRET = env.ACCESS_SECRET
const REFRESH_SECRET = env.REFRESH_SECRET
const JWT_EXPIRES_IN = '7d'

// basic token utils for general work of app
export const hashPassword = async (password: string): Promise<string> => {
    return await bcrypt.hash(password, 10);
}

export const comparePassword = async (password: string, hash: string): Promise<boolean> => {
    return await bcrypt.compare(password, hash)
}

export const generateToken = (userId: number): string => {
    return jwt.sign({ userId }, JWT_SECRET, { expiresIn: JWT_EXPIRES_IN })
}

export const verifyToken = (token: string): { userId: number } => {
    return jwt.verify(token, JWT_SECRET) as { userId: number}
}

// token utils with access-refresh security of app
export const generateAccessToken = (userId: number): string => {
    return jwt.sign(
        { userId },
        ACCESS_SECRET,
        { expiresIn: '15m' }
    );
};

export const generateRefreshToken = (userId: number): string => {
    return jwt.sign(
        { userId },
        REFRESH_SECRET,
        { expiresIn: '7d' }
    );
};

export const verifyAccessToken = (token: string): { userId: number } => {
    return jwt.verify(token, ACCESS_SECRET) as { userId: number };
};

export const verifyRefreshToken = (token: string): { userId: number } => {
    return jwt.verify(token, REFRESH_SECRET) as { userId: number };
};