import { NotFoundError } from "../../../../shared/errors/not-found-error.js";
import { ValidationError } from "../../../../shared/errors/validation-error.js";

export class SuspendSubscriptionUseCase {

	constructor({ accountSubscriptionRepository }) {
		this.accountSubscriptionRepository = accountSubscriptionRepository;
	}

	async execute({ subscriptionId, reason }) {

		if (!subscriptionId)
			throw new ValidationError("subscriptionId is required");

		const subscription =
			await this.accountSubscriptionRepository.findById(subscriptionId);

		if (!subscription)
			throw new NotFoundError("Subscription not found");

		if (subscription.status === "suspended")
			throw new ValidationError("Subscription already suspended");

		return this.accountSubscriptionRepository.update(
			subscriptionId,
			{
				status: "suspended",
				suspensionReason: reason || "manual"
			}
		);
	}
}