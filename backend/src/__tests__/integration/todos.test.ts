import { describe, it, expect, beforeEach } from 'vitest'
import request  from "supertest"
import { app } from '../../app'
import { loginHelper } from '../helpers/login';

describe("Todos", () => {

    let cookie: string;

    beforeEach(async () => {
        const login = await loginHelper();
        cookie = login.cookie;
    });

    it("creates todo", async () => {

        const res = await request(app)
            .post("/todos")
            .set("Cookie", cookie)
            .send({
                title: "Hello"
            });

        expect(res.status).toBe(201);
    });

});