import { Queue } from "bullmq";
import { redisClient } from "../../../config/redis.js";

export const mikrotikProvisionQueue = new Queue("mikrotik-provision", {
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

export const addProvisionJob = async (accountId) => {
	return mikrotikProvisionQueue.add("create-account", { accountId });
};