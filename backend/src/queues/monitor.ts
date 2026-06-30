import { reportQueue } from './queue';

export const getQueueStats = async () => {
    const stats = {
        report: {
            waiting: await reportQueue.getWaitingCount(),
            active: await reportQueue.getActiveCount(),
            completed: await reportQueue.getCompletedCount(),
            failed: await reportQueue.getFailedCount(),
            delayed: await reportQueue.getDelayedCount(),
        }
    };
    return stats
}