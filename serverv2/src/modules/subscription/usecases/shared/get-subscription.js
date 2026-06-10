import { NotFoundError } from "../../../../shared/errors/not-found-error.js";
import { ValidationError } from "../../../../shared/errors/validation-error.js";

export class GetSubscriptionUseCase {

	constructor({ subscriptionRepository }) {
		this.subscriptionRepository = subscriptionRepository;
	}

	async execute({ subscriptionId }) {

		if (!subscriptionId)
			throw new ValidationError("subscriptionId is required");

		const subscription =
			await this.subscriptionRepository.findById(subscriptionId);

		if (!subscription)
			throw new NotFoundError("Subscription not found");

		return subscription;
	}
}