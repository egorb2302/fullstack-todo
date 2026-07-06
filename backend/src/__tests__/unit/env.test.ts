import { describe, expect, it } from "vitest";
import { env } from "../../config/env";

describe('Environment values tests', () => {
    describe('DATABASE_URL', () => {
        it('should return database_url', () => {
            const url = env.DATABASE_URL

            expect(url).toBeDefined()
            expect(url).not.toBe(null)
            expect(url).toContain('todo_test')
        })
    })

    describe('PORT', () => {
        it('should return database port', () => {
            const port = env.PORT

            expect(port).toBeDefined()
            expect(port).not.toBe(null)
            expect(port.toString().length).toBe(4)
        })
    })

    describe('TOKEN_SECRETS', () => {
        it('should return secret of jwt', () => {
            const secret = env.JWT_SECRET

            expect(secret).toBeDefined()
            expect(secret).not.toBe(null)
            expect(secret.length).greaterThan(50)
        })

        it('should return secret of access token', () => {
            const token = env.ACCESS_SECRET

            expect(token).toBeDefined()
            expect(token).not.toBe(null)
            expect(token.length).greaterThan(50)
        })

        it('should return secret of refresh token', () => {
            const token = env.REFRESH_SECRET

            expect(token).toBeDefined()
            expect(token).not.toBe(null)
            expect(token.length).greaterThan(50)
        })
    })

    describe('REDIS_URL', () => {
        it('should initialize the redis url', () => {
            const url = env.REDIS_URL

            expect(url).toBeDefined()
            expect(url).not.toBe(null)
            expect(url.slice(0, 8)).toBe('redis://')
        })
    })

    describe('REDIS_HOST', () => {
        it('should return host of redis server', () => {
            const host = env.REDIS_HOST

            expect(host).toBeDefined()
            expect(host).not.toBe(null)
            expect(host).toBe('localhost')
        })
    })
})