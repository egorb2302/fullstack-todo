import { z } from "zod";
import dotenv from "dotenv";

if (process.env.NODE_ENV !== 'test') {
    dotenv.config();
}

const envSchema = z.object({
    NODE_ENV: z.string().default('development'),
    PORT: z.string().transform(Number).refine(val => val > 0 && val < 65536, {
        message: "PORT must be between 1 and 65536"
    }).default('5000'),
    DATABASE_URL: z.string().url('DATABASE_URL must be a valid URL').refine(
        (url) => url.startsWith('postgresql://') || url.startsWith('postgres://'),
        'DATABASE_URL must be a PostgreSQL connection string'
    ),
    JWT_SECRET: z.string().min(32, "JWT_SECRET must be at least 32 characters"),
    REFRESH_SECRET: z.string().min(32, "REFRESH_SECRET must be at least 32 characters"),
    ACCESS_SECRET: z.string().min(32, "ACCESS_SECRET must be at least 32 characters"),
    REDIS_URL: z.string().url('REDIS_URL must be a valid URL').optional(),
    REDIS_HOST: z.string().optional()
})

let cachedEnv: z.infer<typeof envSchema> | null = null;

export function parseEnv() {
    if (cachedEnv) return cachedEnv;
    
    try {
        cachedEnv = envSchema.parse(process.env);
        return cachedEnv;
    } catch (err) {
        if (err instanceof z.ZodError) {
            console.error('Invalid environment vars');
            err.issues.forEach((issue) => {
                console.error(`  - ${issue.path.join('.')}: ${issue.message}`)
            });
            if (process.env.NODE_ENV === 'test') {
                throw err;
            }
            
            process.exit(1);
        }
        throw err;
    }
}

export const env = process.env.NODE_ENV === 'test' 
    ? new Proxy({} as z.infer<typeof envSchema>, {
        get: (target, prop) => {
            const env = parseEnv();
            return env[prop as keyof typeof env];
        }
    })
    : parseEnv();

export type Env = z.infer<typeof envSchema>;