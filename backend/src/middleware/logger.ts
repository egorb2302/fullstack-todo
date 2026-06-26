import pino from 'pino';
import { env } from '../../config/env';

const isDevelopment = env.NODE_ENV !== 'production'

const logger = pino({
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

export default logger;