import { PostgreSqlContainer, StartedPostgreSqlContainer } from '@testcontainers/postgresql';
import { GenericContainer, StartedTestContainer } from 'testcontainers';

export let postgres: StartedPostgreSqlContainer;
export let redis: StartedTestContainer;

export async function startContainers() {
    postgres = await new PostgreSqlContainer('postgres:17-alpine')
        .withDatabase('todo_test')
        .withUsername('postgres')
        .withPassword('postgres')
        .start();

    redis = await new GenericContainer('redis:7-alpine')
        .withExposedPorts(6379)
        .start();

    process.env.DATABASE_URL = postgres.getConnectionUri().replace(
        /^postgres:\/\//,
        'postgresql://',
    );
    process.env.REDIS_URL = `redis://${redis.getHost()}:${redis.getMappedPort(6379)}`;
    process.env.REDIS_HOST = redis.getHost();
    process.env.NODE_ENV = 'test';

    return { postgres, redis };
}

export async function stopContainers() {
    if (postgres) {
        await postgres.stop();
    }
    if (redis) {
        await redis.stop();
    }
}
