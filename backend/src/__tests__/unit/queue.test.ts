import { beforeAll, describe, expect, it, afterAll, vi } from "vitest";
import { testQueue } from "../../queues/seed";
import { Queue } from "bullmq";
import { env } from "../../config/env";
import { createClient } from "redis";
import { app } from "../../server";
import request  from "supertest";
import { getQueueStats } from "../../queues/monitor";

vi.mock('bullmq', () => ({
    Queue: vi.fn().mockImplementation(function() {
        return {
            add: vi.fn().mockResolvedValue({
                id: 'mock-job-id-123',
                data: { test: true, data: 'test data' },
                timestamp: Date.now(),
                name: 'seed'
            }),
            close: vi.fn().mockResolvedValue(undefined),
            obliterate: vi.fn().mockResolvedValue(undefined),
            getJobCounts: vi.fn().mockResolvedValue({
                waiting: 0,
                active: 0,
                completed: 1,
                failed: 0,
                delayed: 0
            }),
            getJobs: vi.fn().mockResolvedValue([]),
            getRepeatableJobs: vi.fn().mockResolvedValue([]),
            removeRepeatable: vi.fn().mockResolvedValue(undefined),
        };
    }),
    Worker: vi.fn().mockImplementation(function() {
        return {
            run: vi.fn(),
            close: vi.fn().mockResolvedValue(undefined),
            on: vi.fn(),
            getJobCounts: vi.fn().mockResolvedValue({ completed: 0 }),
        };
    }),
    QueueEvents: vi.fn().mockImplementation(function() {
        return {
            on: vi.fn(),
            close: vi.fn().mockResolvedValue(undefined),
            getJobCounts: vi.fn().mockResolvedValue({ completed: 0 }),
        };
    }),
}));

vi.mock('redis', () => ({
    createClient: vi.fn().mockReturnValue({
        connect: vi.fn().mockResolvedValue(undefined),
        quit: vi.fn().mockResolvedValue(undefined),
        on: vi.fn(),
        once: vi.fn((event, callback) => {
            if (event === 'ready' && callback) {
                setTimeout(() => callback(), 0);
            }
            return this;
        }),
        get: vi.fn().mockResolvedValue(null),
        set: vi.fn().mockResolvedValue('OK'),
        del: vi.fn().mockResolvedValue(1),
        keys: vi.fn().mockResolvedValue([]),
        ping: vi.fn().mockResolvedValue('PONG'),
    })
}));

vi.mock('@/redis', () => ({
    redisClient: {
        connect: vi.fn().mockResolvedValue(undefined),
        quit: vi.fn().mockResolvedValue(undefined),
        on: vi.fn(),
        once: vi.fn((event, callback) => {
            if (event === 'ready' && callback) {
                setTimeout(() => callback(), 0);
            }
            return this;
        }),
        get: vi.fn().mockResolvedValue(null),
        set: vi.fn().mockResolvedValue('OK'),
        del: vi.fn().mockResolvedValue(1),
    },
    redisReady: Promise.resolve(),
    redisConnected: true
}));

vi.mock('@/db', () => ({
    db: {
        select: vi.fn().mockReturnValue({
            from: vi.fn().mockReturnValue({
                where: vi.fn().mockReturnValue({
                    execute: vi.fn().mockResolvedValue([])
                })
            })
        }),
        $count: vi.fn().mockResolvedValue(42),
        query: vi.fn().mockResolvedValue({ rows: [] }),
        execute: vi.fn().mockResolvedValue({ rows: [] }),
        insert: vi.fn().mockReturnValue({
            values: vi.fn().mockReturnValue({
                returning: vi.fn().mockResolvedValue([{ id: 1 }])
            })
        }),
        update: vi.fn().mockReturnValue({
            set: vi.fn().mockReturnValue({
                where: vi.fn().mockReturnValue({
                    returning: vi.fn().mockResolvedValue([{ id: 1 }])
                })
            })
        }),
        delete: vi.fn().mockReturnValue({
            where: vi.fn().mockReturnValue({
                returning: vi.fn().mockResolvedValue([{ id: 1 }])
            })
        }),
    },
    todos: {},
    users: {},
}));

vi.mock('@/queues/queue', () => ({
    connection: {
        host: 'localhost',
        port: 6379,
        connect: vi.fn().mockResolvedValue(undefined),
        quit: vi.fn().mockResolvedValue(undefined),
        on: vi.fn(),
    },
    reportQueue: {
        add: vi.fn().mockResolvedValue({
            id: 'mock-job-id-123',
            data: { test: true },
            timestamp: Date.now(),
            name: 'seed'
        }),
        close: vi.fn().mockResolvedValue(undefined),
        obliterate: vi.fn().mockResolvedValue(undefined),
        getJobCounts: vi.fn().mockResolvedValue({
            waiting: 0,
            active: 0,
            completed: 1,
            failed: 0,
            delayed: 0
        }),
        getWaitingCount: vi.fn().mockResolvedValue(0),
        getActiveCount: vi.fn().mockResolvedValue(0),
        getCompletedCount: vi.fn().mockResolvedValue(1),
        getFailedCount: vi.fn().mockResolvedValue(0),
        getDelayedCount: vi.fn().mockResolvedValue(0),
        getJobs: vi.fn().mockResolvedValue([]),
        getRepeatableJobs: vi.fn().mockResolvedValue([]),
        removeRepeatable: vi.fn().mockResolvedValue(undefined),
        getWorker: vi.fn().mockReturnValue({
            getJobCounts: vi.fn().mockResolvedValue({ completed: 0 })
        }),
    },
    notificationsQueue: {
        add: vi.fn().mockResolvedValue({ id: 'mock-notification-id' }),
        close: vi.fn().mockResolvedValue(undefined),
        getJobCounts: vi.fn().mockResolvedValue({
            waiting: 0,
            active: 0,
            completed: 0,
            failed: 0,
            delayed: 0
        }),
        getWaitingCount: vi.fn().mockResolvedValue(0),
        getActiveCount: vi.fn().mockResolvedValue(0),
        getCompletedCount: vi.fn().mockResolvedValue(0),
        getFailedCount: vi.fn().mockResolvedValue(0),
        getDelayedCount: vi.fn().mockResolvedValue(0),
    }
}));

describe('Queue tests', () => {
    const port = Number(env.REDIS_URL.slice(-4))
    let queue: Queue
    const redis = createClient({
        socket: {
            host: 'localhost', 
            port: port,
            connectTimeout: 5000
        }
    })

    beforeAll( async () => {
        await redis.connect()
        queue = new Queue('test-queue', {
            connection: {
                host: 'localhost',
                port: port
            }
        })
    })

    afterAll(async () => {
        await queue.close()
        await queue.obliterate({ force: true })
        await redis.quit()
    })

    describe('Seed test', () => {
        it('should create a seed for queue', async () => {
            const job = await testQueue()

            console.log(job)
            expect(job).toBeDefined()
            expect(job.id).not.toBe(null)
            expect(job.data).toBeDefined()
        })
    })

    describe('API test', () => {
        it('should show the data on API', async () => {
            const response = await request(app)
                .get('/queue/stats')

            expect(response.status).not.toBe(500)
            expect(response.body).toHaveProperty('report')
        })
    })

    describe('Monitor test', () => {
        it('should return an object of stats', async () => {
            const report = { totalTasks: 100,
                             totalUsers: 1000, 
                             timestamp: '10126351976' };
            const stats = await getQueueStats(report)

            expect(report).toBeDefined()
            expect(stats.stats).toHaveProperty('completed')
            expect(stats.report.report).toHaveProperty('totalUser')
            expect(stats.report.report.totalTasks).toBe(100)
        })
    })
})