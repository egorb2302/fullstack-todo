const PORT = process.env.PORT || "5000"

const securityConfig = {
    corsConfig : {
        origin: [`http://localhost:${PORT}`, 'http://localhost:5173'],
        // origin: '*', 
        methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS', 'PATCH'],
        allowedHeaders: ['Content-Type']
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