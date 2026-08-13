import { NotFoundError } from "../../../../shared/errors/not-found-error.js";

export class GetAccount {

	constructor({
		accountRepository
	}) {
		this.accountRepository = accountRepository;
	}

	async execute(accountId) {
		const account =
			await this.accountRepository.findById(accountId);

		if (!account) {
			throw new NotFoundError(
				"Account not found"
			);
		}

		return account;
	}
}