import { NotFoundError } from "../../../../shared/errors/not-found-error.js";
import { ValidationError } from "../../../../shared/errors/validation-error.js";

export class RenewSubscriptionUseCase {

	constructor({
		accountSubscriptionRepository
	}) {
		this.accountSubscriptionRepository = accountSubscriptionRepository;
	}

	async execute({ accountId, monthsPaid }) {

		if (!monthsPaid || monthsPaid < 1)
			throw new ValidationError("monthsPaid must be at least 1");

		const active =
			await this.accountSubscriptionRepository
				.findActiveByAccount(accountId);

		if (!active)
			throw new NotFoundError("No active subscription found");

		const startDate = active.endDate;

		const endDate = new Date(
			startDate.getTime() +
			monthsPaid * 30 * 24 * 60 * 60 * 1000
		);

		return this.accountSubscriptionRepository.update(
			active.id,
			{ endDate }
		);
	}
}