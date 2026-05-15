export const mikrotikResumeWorker = new Worker(
	"mikrotik-resume",
	async (job) => {
		const { accountId } = job.data;

		const account = await accountRepository.findById(accountId);

		await mikrotikService.resumeAccount(account);
	},
	{
		connection: redisClient
	}
);