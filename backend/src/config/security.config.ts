import { env } from "../config/env";

const PORT = env.PORT

const allowedOrigins = [
    `http://localhost:${PORT}`,
    'http://localhost:5173',
    /\.vercel\.app$/,
    'https://supportive-commitment-production-2930.up.railway.app'
];

const securityConfig = {
    corsConfig: {
        origin: function (origin: string | undefined, callback: (err: Error | null, allow?: boolean) => void) {
            if (!origin) return callback(null, true);
            const isAllowed = allowedOrigins.some(o => 
                typeof o === 'string' ? o === origin : o.test(origin)
            );
            callback(null, isAllowed);
        },
        methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS', 'PATCH'],
        allowedHeaders: ['Content-Type', 'Authorization', 'Cookie'],
        credentials: true,
        exposedHeaders: ['Content-Length', 'X-Total-Count'],
    },
    helmetConfig : {
        contentSecurityPolicy: false,
        crossOriginEmbedderPolicy: false
    },
    rateLimitConfig : {
        windowMs: 15 * 60 * 1000, 
        max: 10000,
        message: { error: 'Too many requests, please try again later.' }
    }
}

export default securityConfig;