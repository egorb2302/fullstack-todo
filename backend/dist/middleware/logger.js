"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const pino_1 = __importDefault(require("pino"));
const env_1 = require("../config/env");
const isDevelopment = env_1.env.NODE_ENV !== 'production';
const logger = (0, pino_1.default)({
    level: process.env.LOG_LEVEL || 'info',
    transport: isDevelopment ? {
        target: 'pino-pretty',
        options: {
            colorize: true,
            translateTime: 'SYS:standard',
            ignore: 'pid,hostname',
            singleLine: false,
            hideObject: false,
            messageKey: 'msg',
            levelFirst: true,
            messageFormat: '{msg}'
        }
    } : undefined
});
exports.default = logger;
