import { Worker } from "bullmq";
import { redisClient } from "../../config/redis.js";

import { MikrotikService } from "../../modules/mikrotik/services/mikrotik.service.js";
import { accountRepository } from "../../modules/account/container/account.container.js";

const mikrotikService = new MikrotikService();

export const mikrotikDisconnectWorker = new Worker(
	"mikrotik-disconnect",
	async (job) => {
		const { accountId } = job.data;

		const account = await accountRepository.findById(accountId);

		await mikrotikService.disconnectAccount(account);
	},
	{ connection: redisClient }
);