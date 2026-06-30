import { db } from '../db';
import { todos, users } from '../db/schema';
import { reportQueue } from './queue';

export const testQueue = async () => {
    console.log('📤 Adding test job to queue...');
    
    const job = await reportQueue.add('test-job', {
        totalTasks: await db.$count(db.select().from(todos)),
        totalUsers: await db.$count(db.select().from(users)),
        timestamp: `Recieved at ${new Date()}`,
    });
    
    console.log('✅ Job added:', job.id);
    console.log('📊 Queue stats:', await reportQueue.getJobCounts());
};

testQueue().catch(err => console.error(err));