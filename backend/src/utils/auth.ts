import jwt from 'jsonwebtoken';
import dotenv from 'dotenv';
import bcrypt from 'bcrypt';

dotenv.config()

const JWT_SECRET = process.env.JWT_SECRET || "a7f3d9e2b8c1a5f4e3d2c1b9a8f7e6d5c4b3a2f1e0d9c8b7a6f5e4d3c2b1a0f9e8d7c6b5a4f3e2d1c0b9a8f7e6d5c4b3a2f1e0";
const ACCESS_SECRET = process.env.ACCESS_TOKEN_SECRET || '';
const REFRESH_SECRET = process.env.REFRESH_TOKEN_SECRET || '';
const JWT_EXPIRES_IN = '7d';

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