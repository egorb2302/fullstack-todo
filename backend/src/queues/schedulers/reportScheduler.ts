import { reportQueue } from "../queue";

export const startReportScheduler = async () => {
    try {
        await reportQueue.add(
            'my-job',
            {
                type: 'daily',
                format: 'json'
            },
            {
                jobId: 'daily-report',
                repeat: {
                    pattern: '*/30 * * * *',
                },
                priority: 1,
                attempts: 3,
                backoff: {
                    type: 'exponential',
                    delay: 1000,
                },
                removeOnComplete: true,
                removeOnFail: false,
            }
        )
        console.log('Report scheduler started')
    } catch (error) {
        console.error('Failed to start report scheduler: ', error)
        return 
    }
}

