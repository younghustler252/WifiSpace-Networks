import { ValidationError } from "../../../../shared/errors/validation-error.js";

export class GetUserSubscriptionsUseCase {

	constructor({
		accountRepository,
		accountSubscriptionRepository
	}) {
		this.accountRepository = accountRepository;
		this.accountSubscriptionRepository = accountSubscriptionRepository;
	}

	async execute({ userId }) {

		if (!userId)
			throw new ValidationError("userId is required");

		const accounts = await this.accountRepository.findByUserId(userId);

		const subscriptions = [];

		for (const account of accounts) {

			const subs =
				await this.accountSubscriptionRepository
					.findByAccountId(account.id);

			subscriptions.push(...subs);
		}

		return subscriptions;
	}
}