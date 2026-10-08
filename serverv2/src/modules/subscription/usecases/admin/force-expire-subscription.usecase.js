// usecases/admin/force-expire-subscription.usecase.js
import { NotFoundError, ValidationError } from "../../../../shared/errors/domain.errors.js";
import { SUBSCRIPTION_ERROR_CODES, SUBSCRIPTION_STATUSES } from "../../domain/subscription.enum.js";

export class ForceExpireSubscription {
	constructor({ subscriptionRepository, networkService, auditService }) {
		this.subscriptionRepository = subscriptionRepository;
		this.networkService = networkService;
		this.auditService = auditService;
	}

	async execute({ actorId, subscriptionId, reason = null, ip = null }) {
		const subscription = await this.subscriptionRepository.findById(subscriptionId);
		if (!subscription) throw new NotFoundError("Subscription not found", SUBSCRIPTION_ERROR_CODES.SUBSCRIPTION_NOT_FOUND);

		if (subscription.status === SUBSCRIPTION_STATUSES.EXPIRED) {
			throw new ValidationError("Subscription is already expired");
		}

		subscription.expire();
		const updated = await this.subscriptionRepository.update(subscription.id, subscription);

		await this.networkService.suspend(subscription).catch((err) =>
			console.error("[ForceExpireSubscription] Network disconnect failed:", err.message)
		);

		if (this.auditService) {
			await this.auditService.log({
				actorId, action: "SUBSCRIPTION_FORCE_EXPIRED", entity: "Subscription", entityId: subscription.id, newValue: { reason }, ip
			});
		}

		return updated;
	}
}