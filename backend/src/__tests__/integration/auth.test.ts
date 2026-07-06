import { describe, it, expect, beforeEach } from 'vitest'
import bcrypt from 'bcrypt'
import { db } from '../../db'
import { sql } from 'drizzle-orm';
import request  from "supertest"
import { app } from '../../app'
import { users } from '../../db/schema'

describe("POST /auth/login", () => {
    beforeEach(async () => {
        await db.execute(sql`TRUNCATE TABLE users, todos RESTART IDENTITY CASCADE`);
    });

    it("logs user in", async () => {
        await db.insert(users).values({
            email: "john@test.com",
            passwordHash: await bcrypt.hash("123123",10)
        });
        const res = await request(app)
            .post("/auth/login")
            .send({
                email:"john@test.com",
                password:"123123"
            });
        expect(res.status).toBe(200);
    });
});