// src/modules/subscription/infrastructure/queues/expire-subscription.queue.js

import { Queue } from "bullmq";
import { redisClient } from "../../../../config/redisClient.js"; // Import the redisClient

// Create a queue for expired subscriptions
export const expireSubscriptionQueue = new Queue("expire-subscriptions", {
    connection: redisClient,  // Use the redisClient here
    limiter: {
        groupKey: "expire-subscriptions",
        max: 1000,               // Max number of jobs processed per time window
        duration: 1000 * 60 * 5, // 5 minutes
    },
});