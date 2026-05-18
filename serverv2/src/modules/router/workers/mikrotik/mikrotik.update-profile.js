export const mikrotikUpdateProfileWorker = new Worker(
	"mikrotik-update-profile",
	async (job) => {
		const { accountId, newProfile } = job.data;

		const account = await accountRepository.findById(accountId);

		await mikrotikService.updateAccountProfile(account, newProfile);
	},
	{
		connection: redisClient
	}
);