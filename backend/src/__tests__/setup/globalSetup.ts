import { existsSync, unlinkSync, writeFileSync } from 'fs';
import path from 'path';
import { startContainers, stopContainers } from './containers';
import { runMigrations } from './database';

const envFile = path.resolve(__dirname, '../../../.vitest-env.json');

export default async function globalSetup() {
    await startContainers();
    await runMigrations(process.env.DATABASE_URL!);

    writeFileSync(
        envFile,
        JSON.stringify({
            DATABASE_URL: process.env.DATABASE_URL,
            REDIS_URL: process.env.REDIS_URL,
            REDIS_HOST: process.env.REDIS_HOST,
        }),
    );

    return async () => {
        await stopContainers();
        if (existsSync(envFile)) {
            unlinkSync(envFile);
        }
    };
}
