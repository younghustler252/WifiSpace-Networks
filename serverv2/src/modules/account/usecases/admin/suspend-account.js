import {
	APPROVAL_STATUSES
} from "../../domain/account.enum.js";

import { NotFoundError } from "../../../../shared/errors/not-found-error.js";
import { ValidationError } from "../../../../shared/errors/validation-error.js";

export class SuspendAccount {

	constructor({
		accountRepository
	}) {
		this.accountRepository = accountRepository;
	}

	async execute(accountId) {
		const account =
			await this.accountRepository.findById(accountId);

		if (!account) {
			throw new NotFoundError("Account not found");
		}

		if (
			account.approvalStatus === APPROVAL_STATUSES.SUSPENDED
		) {
			throw new ValidationError(
				"Account is already suspended"
			);
		}

		account.suspend();

		return this.accountRepository.update(
			account.id,
			account
		);
	}
}