import logger from '../middleware/logger';
import { server } from '../server';

export let isShuttingDown = false;

const shutdown = () => {
    logger.info('\n Shutting down...');
    
    server.close(() => {
        logger.info(' Server closed');
        process.exit(0);
    });
    
    setTimeout(() => {
        logger.error(' Force shutdown');
        process.exit(1);
    }, 5000);
};

process.on('SIGINT', shutdown);
process.on('SIGTERM', shutdown);