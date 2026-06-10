import { ValidationError } from "../../../../shared/errors/validation-error.js";

export class GetAccountSubscriptionsUseCase {

	constructor({ subscriptionRepository }) {
		this.subscriptionRepository = subscriptionRepository;
	}

	async execute({ accountId }) {

		if (!accountId)
			throw new ValidationError("accountId is required");

		return this.subscriptionRepository.findByAccountId(accountId);
	}
}