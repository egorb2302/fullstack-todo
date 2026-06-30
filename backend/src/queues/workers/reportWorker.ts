import { Worker } from "bullmq";
import { redisClient } from "../../redis";
import { connection } from "../queue";

export const reportWorker = new Worker(
    'report', 
    async (job) => {
        console.log('Generating report ', job.id)

        const { userId, startDate, endDate } = job.data

        const report = {
            userId,
            period: `${startDate} - ${endDate}`,
            taskCompleted: Math.floor(Math.random() * 100),
            totalTasks: Math.floor(Math.random() * 200),
            generatedAt: new Date()
        }

        await redisClient.set(
            `report:${userId}:${Date.now()}`,
            JSON.stringify(report),
            { EX: 3600 }
        )

        return report
    },
    { connection: connection }
)

reportWorker.on('completed', (job) => {
    console.log(`✅ Job ${job.id} completed successfully`);
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