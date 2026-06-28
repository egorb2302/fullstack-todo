import { beforeEach, beforeAll, afterAll } from 'vitest'
import { db } from '../db';
import { sql } from 'drizzle-orm';
import { env } from '../config/env';

beforeEach(async () => {
    await db.execute(sql`TRUNCATE TABLE todos, users CASCADE;`)
});

beforeAll(async () => {
    if (!env.DATABASE_URL?.includes('test')) {
        console.warn('Using non-test database!')
    }
})

afterAll(async () => {
    await db.$client.end()
})