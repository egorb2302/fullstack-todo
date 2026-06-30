import { Queue } from "bullmq";
import { env } from "../config/env";

export const connection  = {
    host: env.REDIS_HOST,
    port: Number(env.REDIS_URL.slice(-4))
}

export const reportQueue = new Queue('report', { connection })
export const notificationsQueue = new Queue('notifications', { connection })
