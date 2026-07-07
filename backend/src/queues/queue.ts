import { Queue } from "bullmq";

export function createConnection() {
    if (!process.env.REDIS_URL) {
        throw new Error('REDIS_URL is not set');
    }

    const url = new URL(process.env.REDIS_URL!);

    return {
        host: url.hostname,
        port: Number(url.port),
    };
}

export const reportQueue = new Queue("report", {
    connection: createConnection(),
});

reportQueue.on('error', (err) => {
    console.error('❌ Report queue error:', err);
});
