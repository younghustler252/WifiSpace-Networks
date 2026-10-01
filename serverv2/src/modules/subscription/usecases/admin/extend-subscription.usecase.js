import { NotFoundError, ValidationError } from "../../../../shared/errors/domain.errors.js";
import { SUBSCRIPTION_ERROR_CODES } from "../../domain/subscription.enum.js";

export class ExtendSubscription {
	constructor({ subscriptionRepository, networkService, auditService }) {
		this.subscriptionRepository = subscriptionRepository;
		this.networkService = networkService;
		this.auditService = auditService;
	}

	async execute({ actorId, subscriptionId, days, reason = null, ip = null }) {
		if (!days || days === 0) throw new ValidationError("Extension days must be non-zero", SUBSCRIPTION_ERROR_CODES.INVALID_EXTENSION_DAYS);

		const subscription = await this.subscriptionRepository.findById(subscriptionId);
		if (!subscription) throw new NotFoundError("Subscription not found", SUBSCRIPTION_ERROR_CODES.SUBSCRIPTION_NOT_FOUND);

		const previousExpiry = subscription.expiresAt;
		const base = subscription.expiresAt ? new Date(subscription.expiresAt) : new Date();

		subscription.manualAdjustmentDays += days;
		subscription.expiresAt = new Date(base.getTime() + days * 86400000);
		subscription.currentPeriodEnd = subscription.expiresAt;
		subscription._recordEvent?.("manual_adjustment", { days, reason }); // entity method is private-ish; safe no-op if absent

		const updated = await this.subscriptionRepository.update(subscription.id, subscription);

		if (this.auditService) {
			await this.auditService.log({
				actorId, action: "SUBSCRIPTION_EXTENDED", entity: "Subscription", entityId: subscription.id,
				oldValue: { expiresAt: previousExpiry }, newValue: { expiresAt: subscription.expiresAt, days, reason }, ip
			});
		}

		return updated;
	}
}