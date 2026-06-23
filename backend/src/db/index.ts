import dotenv from 'dotenv';
import { Pool } from 'pg';
import { drizzle } from 'drizzle-orm/node-postgres';
import * as schema from './schema';

dotenv.config();

const pool = new Pool({
    connectionString: process.env.DATABASE_URL,
})

pool.connect()
    .then(() => console.log('✅ Connected to PostgreSQL'))
    .catch(err => console.error('❌ Connection failed:', err.message));

export const db = drizzle(pool, { schema });
export type DB = typeof db;