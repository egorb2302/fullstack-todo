import { afterAll, beforeAll } from "vitest";
import { startContainers, stopContainers } from "../__tests__/setup/containers";
import { redisClient } from '../redis/index';

beforeAll(async () => {
    await startContainers();

    await redisClient.connect();
});

afterAll(async () => {
    await stopContainers();
    
    await redisClient.quit();
})