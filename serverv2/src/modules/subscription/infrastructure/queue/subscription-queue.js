import { Queue } from "bullmq";
import { redisClient } from "../../../../config/redisClient.js";

export class SubscriptionQueueService {
	constructor() {
		// Initialize the primary BullMQ Queue connection instance
		this.queue = new Queue("provision-subscription", {
			connection: redisClient,
			defaultJobOptions: {
				// Prevent Redis memory bloating by cleaning up old historical records
				removeOnComplete: {
					age: 24 * 3600, // Keep completed task logs for up to 24 hours
					count: 1000     // Keep a maximum limit of 1000 historical completions
				},
				removeOnFail: {
					age: 7 * 24 * 3600, // Retain hardware failures for 7 days for staff auditing
					count: 5000         // Cap failure logs at 5000 instances
				}
			}
		});
		
		console.log("📡 BullMQ Queue instance initialized (provision-subscription)");
	}

	/**
	 * Dispatches a background job safely onto the Redis cluster pipeline
	 * @param {string} jobName - Name of the operational task pattern ("provision-network")
	 * @param {Object} data - Payload context containing IDs and tracking metadata
	 */
	async add(jobName, data = {}) {
		try {
			const job = await this.queue.add(jobName, data);
			console.log(`🚀 Job dispatched successfully: [${jobName}] | Generated Job ID: ${job.id}`);
			return job;
		} catch (error) {
			console.error(`🔥 Failed to push job context [${jobName}] onto Redis client thread:`, error.message);
			throw error; // Bubble up error so usecases know if the queue layer drops offline
		}
	}
}
