import { Worker } from "bullmq";
import { redisClient } from "../../config/redis.js";

import { MikrotikService } from "../../modules/mikrotik/services/mikrotik.service.js";
import { accountRepository } from "../../modules/account/container/account.container.js";

const mikrotikService = new MikrotikService();

export const mikrotikProvisionWorker = new Worker(
	"mikrotik-provision",
	async (job) => {
		const { accountId } = job.data;

		const account = await accountRepository.findById(accountId);

		if (!account) throw new Error("Account not found");

		await mikrotikService.createAccount(account);

		console.log(`Provisioned MikroTik account ${account.wsnId}`);
	},
	{
		connection: redisClient,
		concurrency: 5
	}
);