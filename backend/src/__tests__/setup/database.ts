import { drizzle } from 'drizzle-orm/node-postgres';
import { migrate } from 'drizzle-orm/node-postgres/migrator';
import { Pool } from 'pg';
import path from 'path';

export async function runMigrations(connectionString: string) {
    const pool = new Pool({ connectionString });
    const db = drizzle(pool);

    await migrate(db, {
        migrationsFolder: path.join(__dirname, '../../db/migrations'),
    });

    await pool.end();
}
