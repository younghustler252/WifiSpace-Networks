import { Queue } from "bullmq";
import { redisClient } from "../../../config/redis.js";

export const mikrotikUpdateProfileQueue = new Queue("mikrotik-update-profile", {
	connection: redisClient,
	defaultJobOptions: {
		attempts: 5,
		backoff: {
			type: "exponential",
			delay: 5000
		},
		removeOnComplete: true,
		removeOnFail: false
	}
});

export const addUpdateProfileJob = async (accountId, newProfile) => {
	return mikrotikUpdateProfileQueue.add("update-profile", {
		accountId,
		newProfile
	});
};