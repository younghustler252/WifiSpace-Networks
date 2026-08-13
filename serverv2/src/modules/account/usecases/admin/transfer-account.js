import { NotFoundError } from "../../../../shared/errors/not-found-error.js";
import { ValidationError } from "../../../../shared/errors/validation-error.js";

export class TransferAccount {

	constructor({
		accountRepository
	}) {
		this.accountRepository = accountRepository;
	}

	async execute(accountId, newOwnerId) {
		const account =
			await this.accountRepository.findById(accountId);

		if (!account) {
			throw new NotFoundError("Account not found");
		}

		if (account.userId === newOwnerId) {
			throw new ValidationError(
				"Account is already owned by this user"
			);
		}

		account.transferOwnership(newOwnerId);

		return this.accountRepository.update(
			account.id,
			account
		);
	}
}