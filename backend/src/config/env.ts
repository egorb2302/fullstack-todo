import { z } from "zod";
import dotenv from "dotenv";

dotenv.config()

const envSchma = z.object({
    NODE_ENV: z.string().default('development'),
    PORT: z.string().transform(Number).refine(val => val > 0 && val < 65536, {
        message: "PORT must be between 1 and 65536"
    }).default('5000'),
    DATABASE_URL: z.string().url('DATABASE_URL must be a valid URL').refine(
        (url) => url.startsWith('postgresql://'),
        'DATABASE_URL must be a PosgreSQL connection string'
    ),
    JWT_SECRET: z.string().min(32, "JWT_SECRET must be at least 32 characters"),
    REFRESH_SECRET: z.string().min(32, "REFRESH_SECRET must be at least 32 characters"),
    ACCESS_SECRET: z.string().min(32, "ACCESS_SECRET must be at least 32 characters")
})

const parseEnv = () => {
    try {
        return envSchma.parse(process.env)
    } catch (err) {
        if (err instanceof z.ZodError) {
            console.error('Invallid eniroment vars');
            err.issues.forEach((issue) => {
                console.error(`  - ${issue.path.join('.')}: ${issue.message}`)
            });
            process.exit(1)
        }
        throw err
    }
}

export const env = parseEnv();
export type Env = z.infer<typeof envSchma>