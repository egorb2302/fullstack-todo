import { describe, expect, it } from "vitest";
import { comparePassword, generateToken, hashPassword, verifyToken } from "../../utils/auth";

describe('Auth Utils', () => {
    describe('hashPassword', () => {
        it('should hash a password', async () => {
            const password = 'qwerty123';
            const hash = await hashPassword(password)

            expect(hash).toBeDefined();
            expect(hash).not.toBe(password);
            expect(hash.length).toBeGreaterThan(20);
        })
    });

    describe('comparePassword', () => {
        it('should return true for correct password', async () => {
            const password = 'qwerty123';
            const hash = await hashPassword(password)
            const result = await comparePassword(password, hash)

            expect(result).toBe(true)
        })
    });

    describe('generateToken', () => {
        it('should generate a valid JWT token', async () => {
            const userId = 1;
            const token = generateToken(userId)

            expect(token).toBeDefined();
            expect(typeof token).toBe('string');
            expect(token.split('.').length).toBe(3);
            expect(token.length).toBeGreaterThan(60);
        })
    });

    describe('verifyToken', () => {
        it('should verify a valid JWT token', async () => {
            const userId = 1;
            const token = generateToken(userId)
            const decoded = verifyToken(token)

            expect(decoded).toHaveProperty('userId');
            expect(decoded.userId).toBe(userId);
            expect(typeof decoded).toBe('object');
        })
    })
})