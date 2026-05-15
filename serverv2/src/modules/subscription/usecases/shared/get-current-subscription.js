import { ValidationError } from "../../../../shared/errors/validation-error.js";

export class GetCurrentSubscriptionUseCase {

	constructor({ accountSubscriptionRepository }) {
		this.accountSubscriptionRepository = accountSubscriptionRepository;
	}

	async execute({ accountId }) {

		if (!accountId)
			throw new ValidationError("accountId is required");

		return this.accountSubscriptionRepository
			.findLatestByAccount(accountId);
	}
}