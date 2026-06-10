import { ValidationError } from "../../../../shared/errors/validation-error.js";

export class GetCurrentSubscriptionUseCase {

	constructor({ subscriptionRepository }) {
		this.subscriptionRepository = subscriptionRepository;
	}

	async execute({ accountId }) {

		if (!accountId)
			throw new ValidationError("accountId is required");

		return this.subscriptionRepository
			.findLatestByAccount(accountId);
	}
}