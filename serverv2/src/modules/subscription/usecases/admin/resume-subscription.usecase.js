import { NotFoundError, ValidationError } from "../../../../shared/errors/domain.errors.js";
import { SUBSCRIPTION_ERROR_CODES, SUBSCRIPTION_STATUSES } from "../../domain/subscription.enum.js";

export class AdminResumeSubscription {
	constructor({ subscriptionRepository, networkService, auditService }) {
		this.subscriptionRepository = subscriptionRepository;
		this.networkService = networkService;
		this.auditService = auditService;
	}

	async execute({ actorId, subscriptionId, ip = null }) {
		const subscription = await this.subscriptionRepository.findById(subscriptionId);
		if (!subscription) throw new NotFoundError("Subscription not found", SUBSCRIPTION_ERROR_CODES.SUBSCRIPTION_NOT_FOUND);

		if (subscription.status !== SUBSCRIPTION_STATUSES.SUSPENDED) {
			throw new ValidationError("Only a suspended subscription can be resumed");
		}

		subscription.resume();
		const updated = await this.subscriptionRepository.update(subscription.id, subscription);

		await this.networkService.resume(subscription).catch((err) =>
			console.error("[AdminResumeSubscription] Network reactivation failed:", err.message)
		);

		if (this.auditService) {
			await this.auditService.log({ actorId, action: "SUBSCRIPTION_RESUMED", entity: "Subscription", entityId: subscription.id, ip });
		}

		return updated;
	}
}