// ChangeAccountPassword.js

export class ChangeAccountPassword {

	constructor({
		accountRepository,
		subscriptionRepository,
		networkService
	}) {
		this.accountRepository = accountRepository;
		this.subscriptionRepository = subscriptionRepository;
		this.networkService = networkService;
	}

	async execute(
		accountId,
		password
	) {

		if (!accountId) {
			throw new Error(
				"accountId is required"
			);
		}


		if (!password) {
			throw new Error(
				"password is required"
			);
		}


		const account =
			await this.accountRepository.findById(
				accountId
			);


		if (!account) {
			throw new Error(
				"Account not found"
			);
		}



		// -----------------------------
		// UPDATE ACCOUNT CREDENTIAL
		// -----------------------------

		account.routerPassword = password;


		await this.accountRepository.update(
			account.id,
			account
		);



		// -----------------------------
		// SYNC NETWORK USER IF ACTIVE
		// -----------------------------

		const subscription =
			await this.subscriptionRepository.findByAccount(
				account.id
			);


		let networkResult = null;


		if (
			subscription &&
			subscription.status === "active"
		) {

			networkResult =
				await this.networkService.changePassword(
					subscription,
					password
				);

		}

		return {
			success: true,
			message: "Password changed successfully",
			networkResult
		};
	}
}