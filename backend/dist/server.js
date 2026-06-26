"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.isShuttingDown = void 0;
const dotenv_1 = __importDefault(require("dotenv"));
const express_1 = __importDefault(require("express"));
const security_1 = require("./middleware/security");
const controllers_1 = require("./controllers/controllers");
const validation_1 = require("./middleware/validation");
const swagger_ui_express_1 = __importDefault(require("swagger-ui-express"));
const openapi_1 = require("./openapi");
const todoSchemas_1 = require("./schemas/todoSchemas");
const logger_1 = __importDefault(require("./middleware/logger"));
const index_1 = require("../src/db/index");
const schema_1 = require("../src/db/schema");
const drizzle_orm_1 = require("drizzle-orm");
const auth_1 = require("./middleware/auth");
const cookie_parser_1 = __importDefault(require("cookie-parser"));
const env_1 = require("../src/config/env");
exports.isShuttingDown = false;
dotenv_1.default.config();
const app = (0, express_1.default)();
app.use(express_1.default.urlencoded({ extended: true }));
app.use(security_1.securityMiddleware);
app.use(express_1.default.json());
const shutdown = () => {
    logger_1.default.info('\n Shutting down...');
    server.close(() => {
        logger_1.default.info(' Server closed');
        process.exit(0);
    });
    setTimeout(() => {
        logger_1.default.error(' Force shutdown');
        process.exit(1);
    }, 5000);
};
app.use((0, cookie_parser_1.default)());
app.use('/api-docs', swagger_ui_express_1.default.serve, swagger_ui_express_1.default.setup(openapi_1.openApiDocument));
app.use('/todos', auth_1.authenticate);
app.get('/', (req, res) => {
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
app.get('/todos', async (req, res) => {
    try {
        const result = await (0, controllers_1.getDataFromBD)(req, res);
        res.json(result);
    }
    catch (err) {
        logger_1.default.error(err);
        return;
    }
});
app.get(`/todos/:id`, (0, validation_1.validate)(todoSchemas_1.paramsSchema, "params"), async (req, res) => {
    try {
        const id = Number(req.params.id);
        const userId = req.user.id;
        const existing = await index_1.db.select().from(schema_1.todos).where((0, drizzle_orm_1.and)((0, drizzle_orm_1.eq)(schema_1.todos.id, id), (0, drizzle_orm_1.eq)(schema_1.todos.userId, userId)));
        if (existing.length === 0) {
            return res.status(404).json({ message: "Todo not found" });
        }
        const todo = await (0, controllers_1.getTodo)(id);
        if (!todo) {
            return res.status(404).json({ error: "Cant get todo on server" });
        }
        res.json(todo);
    }
    catch (err) {
        logger_1.default.error(err);
        res.status(500).json({ error: 'Internal server error' });
    }
});
app.post('/todos', (0, validation_1.validate)(todoSchemas_1.createSchema, "body"), async (req, res) => {
    try {
        console.log('🔍 req.user in POST handler:', req.user);
        console.log('🔍 req.user.id:', req.user?.id);
        const { title, description, isCompleted } = req.body;
        const newTask = {
            title: title,
            description: description || '',
            isCompleted: isCompleted || false,
            userId: req.user.id
        };
        try {
            const result = await index_1.db.insert(schema_1.todos).values(newTask).returning();
            console.log('✅ Insert success:', result);
        }
        catch (insertErr) {
            console.error('❌ Drizzle insert error:', insertErr);
            throw insertErr;
        }
    }
    catch (err) {
        logger_1.default.error(err);
        res.status(500).json({ error: "Internal server error" });
    }
});
app.delete('/todos/:id', (0, validation_1.validate)(todoSchemas_1.paramsSchema, "params"), async (req, res) => {
    try {
        const id = Number(req.params.id);
        const userId = req.user.id;
        const existing = await index_1.db.select().from(schema_1.todos).where((0, drizzle_orm_1.and)((0, drizzle_orm_1.eq)(schema_1.todos.id, id), (0, drizzle_orm_1.eq)(schema_1.todos.userId, userId)));
        if (existing.length === 0) {
            res.status(404).json({ message: "Todo not found" });
        }
        const result = await index_1.db.delete(schema_1.todos).where((0, drizzle_orm_1.eq)(schema_1.todos.id, id)).returning();
        if (result.length === 0) {
            res.status(404).json({ error: 'Todo not found' });
        }
        res.status(200).json({ message: "Task deleting was successfully" });
    }
    catch (err) {
        logger_1.default.error(err);
        res.status(500).json({ error: "Internal server error" });
    }
});
app.patch('/todos/:id', (0, validation_1.validate)(todoSchemas_1.paramsSchema, "params"), (0, validation_1.validate)(todoSchemas_1.taskSchema, "body"), async (req, res) => {
    try {
        const id = Number(req.params.id);
        const userId = req.user.id;
        const { title, description, isCompleted } = req.body;
        const existing = await index_1.db.select().from(schema_1.todos).where((0, drizzle_orm_1.and)((0, drizzle_orm_1.eq)(schema_1.todos.id, id), (0, drizzle_orm_1.eq)(schema_1.todos.userId, userId)));
        if (existing.length === 0) {
            return res.status(404).json({ message: "Todo not found" });
        }
        const result = await index_1.db.update(schema_1.todos).set({ title, description, isCompleted }).where((0, drizzle_orm_1.eq)(schema_1.todos.id, id)).returning();
        res.status(200).json({ message: "Task patching was successfully", todo: result[0] });
    }
    catch (err) {
        logger_1.default.error(err);
        res.status(500).json({ error: "Internal server error" });
    }
});
app.post('/auth/register', controllers_1.register);
app.post('/auth/login', controllers_1.login);
app.get('/auth/me', auth_1.authenticate, controllers_1.getMe);
app.post('/auth/logout', controllers_1.logout);
const server = app.listen(env_1.env.PORT, () => logger_1.default.info(`Server is running on localhost:${env_1.env.PORT}`));
process.on('SIGINT', shutdown);
process.on('SIGTERM', shutdown);
