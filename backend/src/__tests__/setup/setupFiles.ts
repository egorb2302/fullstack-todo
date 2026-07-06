import { existsSync, readFileSync } from 'fs';
import path from 'path';
import dotenv from 'dotenv';
import { beforeAll, afterAll } from 'vitest';
import { sql } from 'drizzle-orm';

const backendRoot = path.resolve(__dirname, '../../..');

dotenv.config({ path: path.join(backendRoot, '.env.test') });

const containerEnvFile = path.join(backendRoot, '.vitest-env.json');
if (existsSync(containerEnvFile)) {
    Object.assign(process.env, JSON.parse(readFileSync(containerEnvFile, 'utf-8')));
}

process.env.NODE_ENV = 'test';

beforeAll(async () => {
    try {
        const { connectRedis } = await import('../../redis/index.js');
        await connectRedis();
    } catch (e) {
        console.error(e)
    }

    try {
        const { db } = await import('../../db/index.js');
        await db.execute(sql`TRUNCATE TABLE users, todos RESTART IDENTITY CASCADE`);
    } catch (e) {
        console.error(e)
    }
});

afterAll(async () => {
    try {
        const { db } = await import('../../db/index.js');
        await db.execute(sql`TRUNCATE TABLE users, todos RESTART IDENTITY CASCADE`);
    } catch (e) {
        console.error(e)
    }
});
