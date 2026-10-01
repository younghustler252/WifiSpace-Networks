import { NotFoundError, ValidationError } from "../../../../shared/errors/domain.errors.js";
import { SUBSCRIPTION_ERROR_CODES } from "../../domain/subscription.enum.js";

export class AdminSuspendSubscription {
	constructor({ subscriptionRepository, networkService, auditService }) {
		this.subscriptionRepository = subscriptionRepository;
		this.networkService = networkService;
		this.auditService = auditService;
	}

	async execute({ actorId, subscriptionId, reason = null, ip = null }) {
		const subscription = await this.subscriptionRepository.findById(subscriptionId);
		if (!subscription) throw new NotFoundError("Subscription not found", SUBSCRIPTION_ERROR_CODES.SUBSCRIPTION_NOT_FOUND);

		if (!subscription.isActive()) {
			throw new ValidationError("Only an active subscription can be suspended", SUBSCRIPTION_ERROR_CODES.CANNOT_SUSPEND_INACTIVE_SUBSCRIPTION);
		}

		subscription.suspend(reason);
		const updated = await this.subscriptionRepository.update(subscription.id, subscription);

		await this.networkService.suspend(subscription).catch((err) =>
			console.error("[AdminSuspendSubscription] Network suspension failed:", err.message)
		);

		if (this.auditService) {
			await this.auditService.log({
				actorId, action: "SUBSCRIPTION_SUSPENDED", entity: "Subscription", entityId: subscription.id,
				newValue: { reason }, ip
			});
		}

		return updated;
	}
}