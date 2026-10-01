import { NotFoundError } from "../../../../shared/errors/not-found-error.js";
import { ValidationError } from "../../../../shared/errors/validation-error.js";

export class ChangeRouterPassword {

	constructor({
		accountRepository,
		subscriptionRepository,
		networkService
	}) {
		this.accountRepository = accountRepository;
		this.subscriptionRepository = subscriptionRepository;
		this.networkService = networkService;
	}

	async execute(accountId, password) {
		if (!accountId) {
			throw new ValidationError(
				"Account ID is required"
			);
		}

		if (!password) {
			throw new ValidationError(
				"Router password is required"
			);
		}

		const account =
			await this.accountRepository.findById(
				accountId
			);

		if (!account) {
			throw new NotFoundError(
				"Account not found"
			);
		}

		account.routerPassword = password;

		await this.accountRepository.update(
			account.id,
			account
		);

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
			message: "Router password changed successfully",
			networkResult
		};
	}
}