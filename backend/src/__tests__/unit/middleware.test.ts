import { describe, it, expect, vi } from 'vitest';
import { Request, Response } from 'express';
import { authenticate } from '../../middleware/auth';

describe('Auth Middleware', () => {
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