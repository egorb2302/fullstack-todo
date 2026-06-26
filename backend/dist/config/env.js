"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.env = void 0;
const zod_1 = require("zod");
const dotenv_1 = __importDefault(require("dotenv"));
dotenv_1.default.config();
const envSchma = zod_1.z.object({
    NODE_ENV: zod_1.z.string().default('development'),
    PORT: zod_1.z.string().transform(Number).refine(val => val > 0 && val < 65536, {
        message: "PORT must be between 1 and 65536"
    }).default('5000'),
    DATABASE_URL: zod_1.z.string().url('DATABASE_URL must be a valid URL').refine((url) => url.startsWith('postgresql://'), 'DATABASE_URL must be a PosgreSQL connection string'),
    JWT_SECRET: zod_1.z.string().min(32, "JWT_SECRET must be at least 32 characters"),
    REFRESH_SECRET: zod_1.z.string().min(32, "REFRESH_SECRET must be at least 32 characters"),
    ACCESS_SECRET: zod_1.z.string().min(32, "ACCESS_SECRET must be at least 32 characters")
});
const parseEnv = () => {
    try {
        return envSchma.parse(process.env);
    }
    catch (err) {
        if (err instanceof zod_1.z.ZodError) {
            console.error('Invallid eniroment vars');
            err.issues.forEach((issue) => {
                console.error(`  - ${issue.path.join('.')}: ${issue.message}`);
            });
            process.exit(1);
        }
        throw err;
    }
};
exports.env = parseEnv();
