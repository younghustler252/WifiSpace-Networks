// src/modules/subscription/infrastructure/workers/expire-subscription.worker.js

import { Worker } from 'bullmq';
import { ExpireSubscriptionUseCase } from '../../usecases/system/expire-subscriptions.js';
import { redisClient } from '../../../../config/redisClient.js'; // Import the Redis client

// Worker will process jobs for the "expire-subscriptions" queue
const worker = new Worker(
    'expire-subscriptions',  // The name of the queue
    async (job) => {
        try {
            console.log(`Processing job for subscription ID: ${job.id}...`);
            const subscriptionId = job.data.subscriptionId;  // Extract subscriptionId from job data

            // Execute the expiration logic
            await ExpireSubscriptionUseCase.execute({ subscriptionId });

            console.log(`Subscription ID: ${subscriptionId} has been expired successfully.`);
        } catch (err) {
            console.error(`Error processing job ${job.id}:`, err);
            throw err; // BullMQ will retry failed jobs automatically
        }
    },
    {
        connection: redisClient,   // Use redisClient here
        concurrency: 10,            // Control the number of jobs processed concurrently
        
    }
);

// Event listener for when a job completes successfully
worker.on('completed', (job) => {
    console.log(`Job ${job.id} completed successfully.`);
});

// Event listener for when a job fails
worker.on('failed', (job, err) => {
    console.error(`Job ${job.id} failed with error: ${err.message}`);
});

// Optional: You can also listen for the job progress event if you need it.
worker.on('progress', (job, progress) => {
    console.log(`Job ${job.id} is ${progress}% completed.`);
});

console.log('Worker started and listening for jobs...');