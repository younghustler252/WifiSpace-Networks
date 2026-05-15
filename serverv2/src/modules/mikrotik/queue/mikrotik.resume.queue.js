import { Queue } from "bullmq";
import { redisClient } from "../../../config/redis.js";

export const mikrotikResumeQueue = new Queue("mikrotik-resume", {
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

export const addResumeJob = async (accountId) => {
	return mikrotikResumeQueue.add("resume-account", { accountId });
};