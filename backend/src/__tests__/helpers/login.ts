import request from "supertest";
import bcrypt from "bcrypt";
import { app } from "../../app";
import { db } from "../../db";
import { users } from "../../db/schema";
import { randomUUID } from "crypto";

export async function loginHelper() {
    const password = "123123";
    const email = `${randomUUID()}@test.com`;
    await db.insert(users).values({
        email,
        passwordHash: await bcrypt.hash(password, 10),
        name: "Vitest"
    });

    const res = await request(app)
        .post("/auth/login")
        .send({
            email,
            password
        });

    return {
        cookie: res.headers["set-cookie"]
    };
}