import { describe, it, expect } from 'vitest'
import request from "supertest"
import { app } from '../../app'
import { redisClient } from '../../redis/index'
import { loginHelper } from '../helpers/login';

describe("Redis cache", () => {
    it("stores todos", async () => {
        const { cookie } = await loginHelper();
        await request(app)
            .get("/todos")
            .set("Cookie", cookie);
        const cache =
            await redisClient.get("cache:/todos");
        expect(cache).not.toBeNull();
    });
});
