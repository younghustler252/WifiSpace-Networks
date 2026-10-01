import { NotFoundError, ValidationError } from "../../../../shared/errors/domain.errors.js";
import { SUBSCRIPTION_ERROR_CODES } from "../../domain/subscription.enum.js";
import { PLAN_ERROR_CODES } from "../../../plan/domain/plan.enum.js";

export class AdminRenewSubscription {
	constructor({ subscriptionRepository, planRepository, networkService, auditService }) {
		this.subscriptionRepository = subscriptionRepository;
		this.planRepository = planRepository;
		this.networkService = networkService;
		this.auditService = auditService;
	}

	async execute({ actorId, subscriptionId, bonusDays = 0, reason = null, ip = null }) {
		const subscription = await this.subscriptionRepository.findById(subscriptionId);
		if (!subscription) throw new NotFoundError("Subscription not found", SUBSCRIPTION_ERROR_CODES.SUBSCRIPTION_NOT_FOUND);

		const plan = await this.planRepository.findByIdOrNull(subscription.planId);
		const planBonusDays = plan?.getBonusDaysForCycle(subscription.cycles + 1) ?? 0;

		const previousExpiry = subscription.expiresAt;
		subscription.renew({ bonusDays: bonusDays || planBonusDays });

		const updated = await this.subscriptionRepository.update(subscription.id, subscription);

		await this.networkService.activate(updated, {}).catch((err) =>
			console.error("[AdminRenewSubscription] Network provisioning failed:", err.message)
		);

		if (this.auditService) {
			await this.auditService.log({
				actorId, action: "SUBSCRIPTION_RENEWED_BY_ADMIN", entity: "Subscription", entityId: subscription.id,
				oldValue: { expiresAt: previousExpiry }, newValue: { expiresAt: updated.expiresAt, reason }, ip
			});
		}

		return updated;
	}
}