export class DeleteAccount {
	constructor({
		accountRepository,
		subscriptionRepository,
		networkService,
		auditService
	}) {
		this.accountRepository = accountRepository;
		this.subscriptionRepository = subscriptionRepository;
		this.networkService = networkService;
		this.auditService = auditService;
	}


	async execute(accountId, context = {}) {

		// ----------------------------
		// Fetch account
		// ----------------------------
		const account =
			await this.accountRepository.findById(accountId);


		if (!account) {
			throw new Error("Account not found");
		}


		// ----------------------------
		// Remove from network
		// ----------------------------
		const subscription =
			await this.subscriptionRepository.findActiveByAccountId(
				accountId
			);


		if (subscription) {
			await this.networkService.remove(
				subscription
			);
		}


		// ----------------------------
		// Delete account from DB
		// ----------------------------
		await this.accountRepository.delete(
			accountId
		);


		// ----------------------------
		// Audit log
		// ----------------------------
		if (this.auditService) {

			await this.auditService.log({
				actorId: context.actorId || "SYSTEM",
				action: "ACCOUNT_DELETED",
				targetId: accountId,
				resource: "Account",
				metadata: {
					wsnId: account.wsnId,
					serviceType: account.serviceType,
					routerId: account.routerId
				},
				ip: context.ip,
				userAgent: context.userAgent
			});
		}


		return {
			success: true,
			message: `Account ${account.wsnId} deleted successfully`
		};
	}
}