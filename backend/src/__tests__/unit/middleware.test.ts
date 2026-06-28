import { describe, it, expect, vi } from 'vitest';
import { Request, Response } from 'express';
import { authenticate } from '../../middleware/auth';
import { createSchema, paramsSchema } from '../../schemas/todoSchemas';
import { validate } from '../../middleware/validation';

describe('Middleware Tests', () => {
    describe('Auth middleware', () => {
        it('should reject request without token', async () => {
            const req = { cookies: {}, headers: {}, get: vi.fn() } as unknown as Request;
            const res = {
                status: vi.fn().mockReturnThis(),
                json: vi.fn().mockReturnThis(),
            } as unknown as Response;
            const next = vi.fn();

            await authenticate(req, res, next);

            expect(res.status).toHaveBeenCalledWith(401);
            expect(res.json).toHaveBeenCalledWith(
                expect.objectContaining({ error: expect.stringContaining('token') })
            );
            expect(next).not.toHaveBeenCalled();
        });

        it('should pass request with valid token', async () => {
            const req = {
                cookies: { accessToken: 'valid-token' },
            } as unknown as Request;
            const res = {
                status: vi.fn().mockReturnThis(),
                json: vi.fn().mockReturnThis(),
            } as unknown as Response;
            const next = vi.fn();

            vi.mock('../../utils/auth', () => ({
                verifyAccessToken: vi.fn().mockReturnValue({ userId: 1 }),
            }));

            await authenticate(req, res, next);

            expect(next).toHaveBeenCalled();
        });
    });

    describe('Validation middleware', () => {
        it('should validate API requests', async () => {
            const req = {
                body: {
                    title: 'Valid Todo',
                    description: 'Valid Description',
                    isCompleted: false
                }
            } as unknown as Request
            const res = {
                status: vi.fn().mockReturnThis(),
                json: vi.fn().mockReturnThis()
            } as unknown as Response

            const next = vi.fn()

            await validate(createSchema, 'body')(req, res, next)

            expect(next).toHaveBeenCalled();
            expect(res.status).not.toBe(400)
        });

        it('should reject validation with uncorrect body', async () => {
            const req = {
                body: {
                    description: 'Valid Description',
                }
            } as unknown as Request
            const res = {
                status: vi.fn().mockReturnThis(),
                json: vi.fn().mockReturnThis()
            } as unknown as Response

            const next = vi.fn()

            await validate(createSchema, 'body')(req, res, next)

            expect(res.status).toHaveBeenCalledWith(400)
            expect(next).not.toHaveBeenCalled()
        })

        it('should correctly validate params', async () => {
            const req = {
                params: {
                    id: 'not a number'
                }
            } as unknown as Request
            const res = {
                status: vi.fn().mockReturnThis(),
                json: vi.fn().mockReturnThis()
            } as unknown as Response

            const next = vi.fn()

            await validate(paramsSchema, 'params')(req, res, next)

            expect(res.status).toHaveBeenCalledWith(400)
            expect(next).not.toHaveBeenCalled()
        })
    })
});