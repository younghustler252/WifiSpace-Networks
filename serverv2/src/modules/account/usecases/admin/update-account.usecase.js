import { NotFoundError } from "../../../../shared/errors/not-found-error.js";
import { ValidationError } from "../../../../shared/errors/validation-error.js";

export class UpdateAccount {

	constructor({
		accountRepository
	}) {
		this.accountRepository = accountRepository;
	}

	async execute(accountId, updateData) {
		const account =
			await this.accountRepository.findById(accountId);

		if (!account) {
			throw new NotFoundError("Account not found");
		}

		const allowedFields = [
			"accountType",
			"businessName",
			"companyRegistrationNumber",
			"taxId",
			"wsnId",
			"routerPassword",
			"routerId",
			"routerProfile",
			"devices",
			"serviceType",
			"approvalStatus",
			"approvalNote",
			"approvedAt",
			"approvedBy",
			"limitUptime"
		];

		const updates = {};

		for (const key of Object.keys(updateData)) {
			if (!allowedFields.includes(key)) {
				throw new ValidationError(
					`Update not allowed for field: ${key}`
				);
			}

			updates[key] = updateData[key];
		}

		Object.assign(account, updates);

		return this.accountRepository.update(
			account.id,
			account
		);
	}
}