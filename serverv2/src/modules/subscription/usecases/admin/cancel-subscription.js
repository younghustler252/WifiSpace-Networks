import { NotFoundError } from "../../../../shared/errors/not-found-error.js";
import { ValidationError } from "../../../../shared/errors/validation-error.js";

export class CancelSubscriptionUseCase {

	constructor({ accountSubscriptionRepository }) {
		this.accountSubscriptionRepository = accountSubscriptionRepository;
	}

	async execute({ subscriptionId }) {

		if (!subscriptionId)
			throw new ValidationError("subscriptionId is required");

		const subscription =
			await this.accountSubscriptionRepository.findById(subscriptionId);

		if (!subscription)
			throw new NotFoundError("Subscription not found");

		if (subscription.status === "canceled")
			throw new ValidationError("Subscription already canceled");

		return this.accountSubscriptionRepository.update(
			subscriptionId,
			{
				status: "canceled"
			}
		);
	}
}