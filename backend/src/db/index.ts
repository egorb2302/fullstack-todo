import dotenv from 'dotenv';
import { Pool } from 'pg';
import { drizzle } from 'drizzle-orm/node-postgres';
import * as schema from './schema';
import { env } from '../src/../config/env';

dotenv.config();

const pool = new Pool({
    connectionString: env.DATABASE_URL,
})

pool.on("connect", () => {
    console.log("✅ PostgreSQL connected");
});

pool.on("error", (err) => {
    console.error(err);
});

export const db = drizzle(pool, { schema });
export type DB = typeof db;