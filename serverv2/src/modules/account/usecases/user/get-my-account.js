import { NotFoundError } from "../../../../shared/errors/not-found-error.js";
import { ValidationError } from "../../../../shared/errors/validation-error.js";

export class GetMyAccount {

	constructor({
		accountRepository
	}) {
		this.accountRepository = accountRepository;
	}

	async execute(userId, accountId) {
		if (!userId) {
			throw new ValidationError(
				"User ID is required"
			);
		}

		const account =
			await this.accountRepository.findById(accountId);

		if (!account) {
			throw new NotFoundError(
				"Account not found"
			);
		}

		// if (account.userId !== userId) {
		// 	throw new ValidationError(
		// 		"You do not have access to this account"
		// 	);
		// }

		return account;
	}
}