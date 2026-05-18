import { Queue } from "bullmq";
import { redisClient } from "../../../config/redis.js";

export const mikrotikSuspendQueue = new Queue("mikrotik-suspend", {
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

export const addSuspendJob = async (accountId) => {
	return mikrotikSuspendQueue.add("suspend-account", { accountId });
};