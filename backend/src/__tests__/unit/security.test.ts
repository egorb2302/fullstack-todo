import { describe, it, expect } from "vitest";
import securityConfig from "../../config/security.config";

describe('Security config test', () => {
    describe('Config props', () => {
        it('should check initialize of props', () => {
            const config = securityConfig

            expect(config).toBeDefined()
            expect(config).toHaveProperty('corsConfig')
            expect(config).toHaveProperty('helmetConfig')
            expect(config).toHaveProperty('rateLimitConfig')
        })
    })

    describe('CORS config', () => {
        it('should check props of CORS', () => {
            const cors = securityConfig.corsConfig

            expect(cors).toBeDefined()
            expect(cors).toHaveProperty('origin')
            expect(cors).toHaveProperty('methods')
            expect(cors).toHaveProperty('credentials')
            expect(cors.origin.length).toBe(3)
            expect(cors.methods.length).toBe(6)
            expect(cors.credentials).toBe(true)
        })
    })

    describe('Helmet config', () => {
        it('should check props of Helmet', () => {
            const helmet = securityConfig.helmetConfig

            expect(helmet).toBeDefined()
            expect(helmet).toHaveProperty('contentSecurityPolicy')
            expect(helmet).toHaveProperty('crossOriginEmbedderPolicy')
            expect(helmet.contentSecurityPolicy).toBe(false)
            expect(helmet.crossOriginEmbedderPolicy).toBe(false)
        })
    })

    describe('Rate Limitting config', () => {
        it('should check props of Rate Limitting', () => {
            const rl = securityConfig.rateLimitConfig

            expect(rl).toBeDefined()
            expect(rl).toHaveProperty('max')
            expect(rl).toHaveProperty('windowMs')
            expect(rl.max).toBeGreaterThanOrEqual(10000)
            expect(rl.windowMs).toBeGreaterThanOrEqual(100000)
        })
    })
})