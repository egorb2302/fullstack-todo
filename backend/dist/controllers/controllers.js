"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.queue = exports.logout = exports.getMe = exports.refresh = exports.login = exports.register = exports.PATCHTODO = exports.DELETETODO = exports.POSTTODO = exports.GETTODO = exports.GETTODOS = exports.routes = exports.getTodo = exports.getDataFromBD = void 0;
const index_1 = require("../db/index");
const schema_1 = require("../db/schema");
const drizzle_orm_1 = require("drizzle-orm");
const logger_1 = __importDefault(require("../middleware/logger"));
const monitor_1 = require("../queues/monitor");
const seed_1 = require("../queues/seed");
const auth_1 = require("../utils/auth");
const redis_1 = require("../redis");
const invalidate_1 = require("../utils/invalidate");
let isTested = false;
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
const routes = async (req, res) => {
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
    }
    catch (err) {
        console.error(err);
        return res.status(500).json({ error: "Internal Server Error" });
    }
};
exports.routes = routes;
const GETTODOS = async (req, res) => {
    try {
        const result = await (0, exports.getDataFromBD)(req, res);
        return res.json(result);
    }
    catch (err) {
        logger_1.default.error(err);
        return res.status(500).json({ error: "Internal Server Error" });
    }
};
exports.GETTODOS = GETTODOS;
const GETTODO = async (req, res) => {
    try {
        const id = Number(req.params.id);
        const userId = req.user.id;
        const existing = await index_1.db.select().from(schema_1.todos).where((0, drizzle_orm_1.and)((0, drizzle_orm_1.eq)(schema_1.todos.id, id), (0, drizzle_orm_1.eq)(schema_1.todos.userId, userId)));
        if (existing.length === 0) {
            return res.status(404).json({ message: "Todo not found" });
        }
        const todo = await (0, exports.getTodo)(id);
        if (!todo) {
            return res.status(404).json({ error: "Cant get todo on server" });
        }
        return res.json(todo);
    }
    catch (err) {
        logger_1.default.error(err);
        return res.status(500).json({ error: 'Internal server error' });
    }
};
exports.GETTODO = GETTODO;
const POSTTODO = async (req, res) => {
    try {
        const { title, description, isCompleted } = req.body;
        const newTask = {
            title: title,
            description: description || '',
            isCompleted: isCompleted || false,
            userId: req.user.id
        };
        try {
            const result = await index_1.db.insert(schema_1.todos).values(newTask).returning();
            (0, invalidate_1.invalidateCache)('cache:/todos*');
            return res.status(201).json({ message: 'Task successfully added', task: result[0] });
        }
        catch (insertErr) {
            console.error('❌ Drizzle insert error:', insertErr);
            throw insertErr;
        }
    }
    catch (err) {
        logger_1.default.error(err);
        return res.status(500).json({ error: "Internal server error" });
    }
};
exports.POSTTODO = POSTTODO;
const DELETETODO = async (req, res) => {
    try {
        const id = Number(req.params.id);
        const userId = req.user.id;
        const existing = await index_1.db.select().from(schema_1.todos).where((0, drizzle_orm_1.and)((0, drizzle_orm_1.eq)(schema_1.todos.id, id), (0, drizzle_orm_1.eq)(schema_1.todos.userId, userId)));
        if (existing.length === 0) {
            return res.status(404).json({ message: "Todo not found" });
        }
        const result = await index_1.db.delete(schema_1.todos).where((0, drizzle_orm_1.eq)(schema_1.todos.id, id)).returning();
        if (result.length === 0) {
            return res.status(404).json({ error: 'Todo not found' });
        }
        (0, invalidate_1.invalidateCache)(`cache:/todos/${id}*`);
        return res.status(200).json({ message: "Task deleting was successfully" });
    }
    catch (err) {
        logger_1.default.error(err);
        return res.status(500).json({ error: "Internal server error" });
    }
};
exports.DELETETODO = DELETETODO;
const PATCHTODO = async (req, res) => {
    try {
        const id = Number(req.params.id);
        const userId = req.user.id;
        const { title, description, isCompleted } = req.body;
        const existing = await index_1.db.select().from(schema_1.todos).where((0, drizzle_orm_1.and)((0, drizzle_orm_1.eq)(schema_1.todos.id, id), (0, drizzle_orm_1.eq)(schema_1.todos.userId, userId)));
        if (existing.length === 0) {
            return res.status(404).json({ message: "Todo not found" });
        }
        const result = await index_1.db.update(schema_1.todos).set({ title, description, isCompleted }).where((0, drizzle_orm_1.eq)(schema_1.todos.id, id)).returning();
        (0, invalidate_1.invalidateCache)(`cache:/todos/${id}*`);
        return res.status(200).json({ message: "Task patching was successfully", todo: result[0] });
    }
    catch (err) {
        logger_1.default.error(err);
        return res.status(500).json({ error: "Internal server error" });
    }
};
exports.PATCHTODO = PATCHTODO;
const register = async (req, res) => {
    try {
        const { email, password, name } = req.body;
        if (!email || !password) {
            return res.status(400).json({ message: "Email and password are required" });
        }
        const existing = await index_1.db.select().from(schema_1.users).where((0, drizzle_orm_1.eq)(schema_1.users.email, email));
        if (existing.length > 0) {
            return res.status(400).json({ message: "User already exists" });
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
        return res.status(201).json({ message: "User was successfully registred", user: {
                id: user.id,
                email: user.email,
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
        return res.status(200).json({ message: "Login successfull", user: {
                id: user.id,
                email: user.email,
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
        const userId = req.user?.id;
        if (!userId) {
            return res.status(401).json({ error: "Unauthorized" });
        }
        const result = await index_1.db.select().from(schema_1.users).where((0, drizzle_orm_1.eq)(schema_1.users.id, userId));
        if (result.length === 0) {
            return res.status(401).json({ message: "User not found" });
        }
        const user = result[0];
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
const queue = async (req, res) => {
    try {
        if (!isTested) {
            await (0, seed_1.testQueue)().catch(console.error);
            isTested = true;
        }
        const cached = await redis_1.redisClient.get('report:latest');
        if (cached) {
            return res.json(JSON.parse(cached));
        }
        const totalTasks = await index_1.db.$count(index_1.db.select().from(schema_1.todos));
        const totalUsers = await index_1.db.$count(index_1.db.select().from(schema_1.users));
        const report = {
            totalTasks,
            totalUsers,
            timestamp: new Date().toISOString(),
        };
        const stats = await (0, monitor_1.getQueueStats)(report);
        return res.json(stats);
    }
    catch (err) {
        console.log(err);
        return res.status(500).json({ error: "internal server error" });
    }
};
exports.queue = queue;
