export class DeleteAccount {

	constructor({
		accountRepository,
		subscriptionRepository,
		networkService
	}) {
		this.accountRepository = accountRepository;
		this.subscriptionRepository = subscriptionRepository;
		this.networkService = networkService;
	}

	async execute(accountId) {
		const account =
			await this.accountRepository.findById(accountId);

		if (!account) {
			throw new Error("Account not found");
		}

		const subscription =
			await this.subscriptionRepository.findActiveByAccountId(
				accountId
			);

		if (subscription) {
			await this.networkService.remove(subscription);
		}

		await this.accountRepository.delete(accountId);

		return {
			success: true,
			message: `Account ${account.wsnId} deleted successfully`
		};
	}
}