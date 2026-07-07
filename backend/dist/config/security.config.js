"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const env_1 = require("../config/env");
const PORT = env_1.env.PORT;
const securityConfig = {
    corsConfig: {
        origin: [`http://localhost:${PORT}`, 'http://localhost:5173', 'redis://localhost:6379'],
        // origin: '*', 
        methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS', 'PATCH'],
        allowedHeaders: ['Content-Type', 'Authorization'],
        credentials: true,
    },
    helmetConfig: {
        contentSecurityPolicy: false,
        crossOriginEmbedderPolicy: false
    },
    rateLimitConfig: {
        windowMs: 15 * 60 * 1000,
        max: 10000,
        message: { error: 'Too many requests, please try again later.' }
    }
};
exports.default = securityConfig;
