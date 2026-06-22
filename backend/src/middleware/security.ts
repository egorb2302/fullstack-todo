import helmet from 'helmet';
import cors from 'cors';
import { rateLimit } from 'express-rate-limit';
import securityConfig from '../../config/security.config';

export const securityMiddleware = [
    helmet(securityConfig.helmetConfig),
    cors(securityConfig.corsConfig),
    rateLimit(securityConfig.rateLimitConfig),
];