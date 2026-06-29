import pino from 'pino';
import { env } from '../config/env';

const isDevelopment = env.NODE_ENV !== 'production'

const logger = console

export default logger;