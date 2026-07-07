"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.env = void 0;
exports.parseEnv = parseEnv;
const zod_1 = require("zod");
const dotenv_1 = __importDefault(require("dotenv"));
if (process.env.NODE_ENV !== 'test') {
    dotenv_1.default.config();
}
const envSchema = zod_1.z.object({
    NODE_ENV: zod_1.z.string().default('development'),
    PORT: zod_1.z.string().transform(Number).refine(val => val > 0 && val < 65536, {
        message: "PORT must be between 1 and 65536"
    }).default('5000'),
    DATABASE_URL: zod_1.z.string().url('DATABASE_URL must be a valid URL').refine((url) => url.startsWith('postgresql://') || url.startsWith('postgres://'), 'DATABASE_URL must be a PostgreSQL connection string'),
    JWT_SECRET: zod_1.z.string().min(32, "JWT_SECRET must be at least 32 characters"),
    REFRESH_SECRET: zod_1.z.string().min(32, "REFRESH_SECRET must be at least 32 characters"),
    ACCESS_SECRET: zod_1.z.string().min(32, "ACCESS_SECRET must be at least 32 characters"),
    REDIS_URL: zod_1.z.string().url('REDIS_URL must be a valid URL'),
    REDIS_HOST: zod_1.z.string().optional()
});
let cachedEnv = null;
function parseEnv() {
    if (cachedEnv)
        return cachedEnv;
    try {
        cachedEnv = envSchema.parse(process.env);
        return cachedEnv;
    }
    catch (err) {
        if (err instanceof zod_1.z.ZodError) {
            console.error('Invalid environment vars');
            err.issues.forEach((issue) => {
                console.error(`  - ${issue.path.join('.')}: ${issue.message}`);
            });
            if (process.env.NODE_ENV === 'test') {
                throw err;
            }
            process.exit(1);
        }
        throw err;
    }
}
exports.env = process.env.NODE_ENV === 'test'
    ? new Proxy({}, {
        get: (target, prop) => {
            const env = parseEnv();
            return env[prop];
        }
    })
    : parseEnv();
