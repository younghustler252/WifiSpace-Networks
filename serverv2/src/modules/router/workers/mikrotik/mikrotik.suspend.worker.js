export const mikrotikSuspendWorker = new Worker(
	"mikrotik-suspend",
	async (job) => {
		const { accountId } = job.data;

		const account = await accountRepository.findById(accountId);

		await mikrotikService.suspendAccount(account);
	},
	{
		connection: redisClient
	}
);