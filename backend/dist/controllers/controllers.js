"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.logout = exports.getMe = exports.refresh = exports.login = exports.register = exports.getTodo = exports.getDataFromBD = void 0;
const index_1 = require("../db/index");
const schema_1 = require("../db/schema");
const drizzle_orm_1 = require("drizzle-orm");
const logger_1 = __importDefault(require("../middleware/logger"));
const auth_1 = require("../utils/auth");
const getDataFromBD = async (req, res) => {
    const userId = req.user.id;
    const result = await index_1.db.select().from(schema_1.todos).where((0, drizzle_orm_1.eq)(schema_1.todos.userId, userId));
    return result;
};
exports.getDataFromBD = getDataFromBD;
const getTodo = async (id) => {
    const current = await index_1.db.select().from(schema_1.todos).where((0, drizzle_orm_1.eq)(schema_1.todos.id, id));
    return current[0];
};
exports.getTodo = getTodo;
const register = async (req, res) => {
    try {
        const { email, password, name } = req.body;
        if (!email || !password) {
            return res.status(400).json({ message: "Email and password are required" });
        }
        const existing = await index_1.db.select().from(schema_1.users).where((0, drizzle_orm_1.eq)(schema_1.users.email, email));
        if (existing.length > 0) {
            res.status(400).json({ message: "User already exists" });
        }
        const hashed = await (0, auth_1.hashPassword)(password);
        const newUser = {
            email,
            passwordHash: hashed,
            name: name || null
        };
        const result = await index_1.db.insert(schema_1.users).values(newUser).returning();
        const user = result[0];
        const accessToken = (0, auth_1.generateAccessToken)(user.id);
        const refreshToken = (0, auth_1.generateRefreshToken)(user.id);
        res.cookie('accessToken', accessToken, {
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production',
            sameSite: 'strict',
            maxAge: 15 * 60 * 1000,
            path: '/',
        });
        res.cookie('refreshToken', refreshToken, {
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production',
            sameSite: 'strict',
            maxAge: 7 * 24 * 60 * 60 * 1000,
            path: '/',
        });
        logger_1.default.info({ userId: schema_1.users.id, email: schema_1.users.email }, "User registred");
        res.status(201).json({ message: "User was successfully registred", user: {
                id: user.id,
                email: user.name,
                name: user.name
            } });
    }
    catch (err) {
        logger_1.default.error(err);
        res.status(500).json({ message: "Internal server error" });
    }
};
exports.register = register;
const login = async (req, res) => {
    try {
        const { email, password } = req.body;
        if (!email || !password) {
            return res.status(401).json({ message: "Email or Password are required" });
        }
        const result = await index_1.db.select().from(schema_1.users).where((0, drizzle_orm_1.eq)(schema_1.users.email, email));
        if (result.length === 0) {
            return res.status(401).json({ error: "Invalid email or password" });
        }
        const user = result[0];
        const isValid = await (0, auth_1.comparePassword)(password, user.passwordHash);
        if (!isValid) {
            return res.status(401).json({ message: "Invalid email or password" });
        }
        const accessToken = (0, auth_1.generateAccessToken)(user.id);
        const refreshToken = (0, auth_1.generateRefreshToken)(user.id);
        res.cookie('accessToken', accessToken, {
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production',
            sameSite: 'strict',
            maxAge: 15 * 60 * 1000,
            path: '/',
        });
        res.cookie('refreshToken', refreshToken, {
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production',
            sameSite: 'strict',
            maxAge: 7 * 24 * 60 * 60 * 1000,
            path: '/',
        });
        logger_1.default.info({ userId: user.id }, "User logged in");
        res.status(200).json({ message: "Login successfull", user: {
                id: user.id,
                email: user.name,
                name: user.name
            } });
    }
    catch (err) {
        logger_1.default.error(err);
        res.status(500).json({ message: "Internal server error" });
    }
};
exports.login = login;
const refresh = async (req, res) => {
    try {
        const refreshToken = req.cookies.refreshToken;
        if (!refreshToken) {
            return res.status(401).json({ error: "No refresh token" });
        }
        let decoded;
        try {
            decoded = (0, auth_1.verifyRefreshToken)(refreshToken);
        }
        catch (err) {
            return res.status(401).json({ error: "Invalid refresh token" });
        }
        const result = await index_1.db.select().from(schema_1.users).where((0, drizzle_orm_1.eq)(schema_1.users.id, decoded.userId));
        if (result.length === 0) {
            return res.status(401).json({ message: "User not found" });
        }
        const user = result[0];
        const newAccessToken = (0, auth_1.generateAccessToken)(user.id);
        res.cookie('accessToken', newAccessToken, {
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production',
            sameSite: 'strict',
            maxAge: 15 * 60 * 1000,
            path: '/',
        });
        res.json({ message: 'Token refreshed successfully' });
    }
    catch (err) {
        logger_1.default.error(err);
        res.status(500).json({ message: "Internal server error" });
    }
};
exports.refresh = refresh;
const getMe = async (req, res) => {
    try {
        const user = req.user;
        if (!user) {
            return res.status(401).json({ error: "Unauthorized" });
        }
        res.json({
            id: user.id,
            email: user.email,
            name: user.name,
        });
    }
    catch (err) {
        logger_1.default.error(err);
        res.status(500).json({ message: "Internal server error" });
    }
};
exports.getMe = getMe;
const logout = async (req, res) => {
    res.clearCookie('accessToken', {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'strict',
        path: '/',
    });
    res.clearCookie('refreshToken', {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'strict',
        path: '/',
    });
    res.json({ message: 'Logged out successfully' });
};
exports.logout = logout;
