import { describe, it, expect, beforeAll, afterAll } from 'vitest'
import { reportQueue, createConnection } from "../../queues/queue";
import { Worker, Job } from "bullmq";

describe("BullMQ", () => {
    let worker: Worker;
    beforeAll(() => {
        worker = new Worker(
            "report",
            async (job: Job) => {
                return true;
            },
            { connection: createConnection() }
        );
    });
    afterAll(async () => {
        await worker.close();
    });
    it("creates report job", async () => {
        const job = await reportQueue.add("report", {
            totalUsers: 10
        });

        expect(job.id).toBeDefined();
    });
});