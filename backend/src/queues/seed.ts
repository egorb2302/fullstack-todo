import { reportQueue } from './queue';

export const testQueue = async () => {
    console.log('📤 Adding test job to queue...');
    
    const job = await reportQueue.add('test-job', {
        test: true,
        message: 'Hello from BullMQ',
        timestamp: new Date().toISOString(),
    });
    
    console.log('✅ Job added:', job.id);
    console.log('📊 Queue stats:', await reportQueue.getJobCounts());
};

testQueue().catch(err => console.error(err));