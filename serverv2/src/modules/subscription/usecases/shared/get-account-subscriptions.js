import { ValidationError } from "../../../../shared/errors/validation-error.js";

export class GetAccountSubscriptionsUseCase {

	constructor({ accountSubscriptionRepository }) {
		this.accountSubscriptionRepository = accountSubscriptionRepository;
	}

	async execute({ accountId }) {

		if (!accountId)
			throw new ValidationError("accountId is required");

		return this.accountSubscriptionRepository.findByAccountId(accountId);
	}
}