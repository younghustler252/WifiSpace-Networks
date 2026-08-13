import { ValidationError } from "../../../../shared/errors/validation-error.js";

export class GetMyAccounts {

	constructor({
		accountRepository
	}) {
		this.accountRepository = accountRepository;
	}

	async execute(userId) {
		if (!userId) {
			throw new ValidationError("User ID is required");
		}

		return this.accountRepository.findByUserId(
			userId
		);
	}
}