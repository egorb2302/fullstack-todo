import { ReportType } from '../types/types';
import { reportQueue } from './queue';

export const getQueueStats = async (report: ReportType) => {
    const stats = {
        stats: {
            waiting: await reportQueue.getWaitingCount(),
            active: await reportQueue.getActiveCount(),
            completed: await reportQueue.getCompletedCount(),
            failed: await reportQueue.getFailedCount(),
            delayed: await reportQueue.getDelayedCount(),
        },
        report: {
            report: {
                totalTasks: report.totalTasks,
                totalUser: report.totalUsers,
                timestamp: report.timestamp
            }
        }
    };
    return stats
}