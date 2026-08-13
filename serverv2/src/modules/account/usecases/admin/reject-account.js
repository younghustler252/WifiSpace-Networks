import {
	APPROVAL_STATUSES
} from "../../domain/account.enum.js";

import { NotFoundError } from "../../../../shared/errors/not-found-error.js";
import { ValidationError } from "../../../../shared/errors/validation-error.js";

export class RejectAccount {

	constructor({
		accountRepository
	}) {
		this.accountRepository = accountRepository;
	}

	async execute(accountId, note = null) {
		const account =
			await this.accountRepository.findById(accountId);

		if (!account) {
			throw new NotFoundError(
				"Account not found"
			);
		}

		if (
			account.approvalStatus === APPROVAL_STATUSES.REJECTED
		) {
			throw new ValidationError(
				"Account already rejected"
			);
		}

		account.approvalStatus =
			APPROVAL_STATUSES.REJECTED;

		account.approvalNote = note;

		return this.accountRepository.update(
			account.id,
			account
		);
	}
}