import { Job, Worker } from "bullmq";
import { redisClient } from "../../redis";
import { createConnection } from "../queue";

export const reportWorker = new Worker(
    'report', 
    async (job) => {
        console.log('Generating report ', job.id)

        const { totalTasks, totalUsers, timestamp } = job.data

        await redisClient.set(
            'report:latest',
            JSON.stringify({
                totalTasks,
                totalUsers,
                timestamp,
                generateAt: new Date().toISOString()
            }),
            { EX: 1800 }
        )

        await redisClient.lPush(
            'report:history',
            JSON.stringify({
                totalTasks,
                totalUsers,
                timestamp,
                generatedAt: new Date().toISOString(),
            })
        );

        return { success: true }
    },
    { connection: createConnection() }
)

export function startReportWorker() {
    return new Worker(
        "report",
        async (job: Job) => {
            return true;
        },
        { connection: createConnection() }
    );
}

reportWorker.on('completed', (job) => {
    console.log(`✅ Job ${job.id} completed successfully, data: `, job.data);
});

reportWorker.on('failed', (job, err) => {
    console.error(`❌ Job ${job?.id} failed:`, err);
});

reportWorker.on('active', (job) => {
    console.log(`🔄 Job ${job.id} started processing`);
});

reportWorker.on('progress', (job, progress) => {
    console.log(`📊 Job ${job.id} progress: ${progress}%`);
});